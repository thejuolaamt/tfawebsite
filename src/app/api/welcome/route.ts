import { timingSafeEqual } from "node:crypto";
import { adminClient, sendWelcome } from "@/lib/email/send-welcome";

export const runtime = "nodejs";
export const maxDuration = 30;

function secretMatches(given: string | null) {
  const expected = process.env.WELCOME_WEBHOOK_SECRET;
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

type Payload = {
  type?: string;
  table?: string;
  record?: { id?: string; onboarded?: boolean } | null;
  old_record?: { onboarded?: boolean } | null;
  userId?: string; // for manual tests
};

// Supabase calls this when a profile changes. A member who has just finished
// signing up (onboarded false -> true) gets their welcome email.
export async function POST(request: Request) {
  if (!secretMatches(request.headers.get("x-webhook-secret"))) {
    return new Response("Unauthorized", { status: 401 });
  }

  let body: Payload;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }

  let userId = body.userId;
  if (!userId) {
    const rec = body.record;
    if (body.table !== "profiles" || !rec?.id || rec.onboarded !== true) {
      return Response.json({ status: "ignored" });
    }
    if (body.type === "UPDATE" && body.old_record?.onboarded === true) {
      return Response.json({ status: "ignored" });
    }
    userId = rec.id;
  }

  const result = await sendWelcome(adminClient(), userId);
  return Response.json(result, { status: result.status === "failed" ? 500 : 200 });
}
