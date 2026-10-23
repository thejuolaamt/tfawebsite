import { createClient } from "@supabase/supabase-js";
import { welcomeEmail } from "@/lib/email/welcome";

const FROM = "Judah from TFA <welcome@thefineartist.org>";
const REPLY_TO = "officialthefineartist@gmail.com";

// Server-only connection with full access. Never import this in browser code.
export function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase environment variables");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type SendResult = {
  status: "sent" | "skipped" | "failed";
  detail?: string;
  memberNumber?: number;
};

function firstNameOf(fullName: string | null | undefined) {
  const first = (fullName ?? "").trim().split(/\s+/)[0] ?? "";
  if (!first) return "friend";
  return first.charAt(0).toUpperCase() + first.slice(1);
}

export async function sendWelcome(
  db: ReturnType<typeof adminClient>,
  userId: string
): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { status: "failed", detail: "Missing RESEND_API_KEY" };

  // Only welcome members who have finished signing up
  const { data: profile } = await db
    .from("profiles")
    .select("full_name, onboarded")
    .eq("id", userId)
    .maybeSingle();
  if (!profile || !profile.onboarded) {
    return { status: "skipped", detail: "Not onboarded yet" };
  }

  // Their number (the same number every time, and never given twice)
  const { data: claim, error: claimError } = await db.rpc("claim_welcome_number", {
    p_user: userId,
  });
  if (claimError) return { status: "failed", detail: claimError.message };
  const row = (claim as { num: number; already_sent: boolean }[] | null)?.[0];
  if (!row) return { status: "failed", detail: "No member number returned" };
  if (row.already_sent) {
    return { status: "skipped", detail: "Already welcomed", memberNumber: row.num };
  }

  // Their email address and signup goals
  const { data: userData, error: userError } = await db.auth.admin.getUserById(userId);
  const email = userData?.user?.email;
  if (userError || !email) {
    return { status: "failed", detail: "No email address found", memberNumber: row.num };
  }
  const { data: priv } = await db
    .from("member_private")
    .select("goals")
    .eq("id", userId)
    .maybeSingle();

  const { subject, html, text } = welcomeEmail({
    firstName: firstNameOf(profile.full_name),
    memberNumber: row.num,
    goals: (priv?.goals as string[] | null) ?? [],
  });

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `tfa-welcome-${userId}`,
    },
    body: JSON.stringify({
      from: FROM,
      to: [email],
      reply_to: REPLY_TO,
      subject,
      html,
      text,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    return {
      status: "failed",
      detail: `Resend ${res.status}: ${detail.slice(0, 200)}`,
      memberNumber: row.num,
    };
  }

  const sent = (await res.json()) as { id?: string };
  await db
    .from("welcome_emails")
    .update({ email_id: sent.id ?? null, sent_at: new Date().toISOString() })
    .eq("user_id", userId);

  return { status: "sent", memberNumber: row.num };
}
