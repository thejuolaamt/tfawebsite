import { timingSafeEqual } from "node:crypto";
import { adminClient, sendWelcome } from "@/lib/email/send-welcome";

export const runtime = "nodejs";
export const maxDuration = 60;

function secretMatches(given: string | null) {
  const expected = process.env.WELCOME_WEBHOOK_SECRET;
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Sends the welcome email to members who joined before the welcome system existed.
// Oldest members go first, so member numbers follow the order people joined.
// Safe to run again: anyone already welcomed is skipped.
// Default is a dry run (sends nothing). Send for real with {"dryRun": false, "limit": 5}.
export async function POST(request: Request) {
  if (!secretMatches(request.headers.get("x-webhook-secret"))) {
    return new Response("Unauthorized", { status: 401 });
  }

  let body: { limit?: number; dryRun?: boolean } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const dryRun = body.dryRun !== false;
  const limit = Math.min(Math.max(Math.floor(Number(body.limit) || 10), 1), 30);

  const db = adminClient();

  const { data: profiles, error: profilesError } = await db
    .from("profiles")
    .select("id, full_name")
    .eq("onboarded", true)
    .order("created_at", { ascending: true })
    .limit(5000);
  if (profilesError) {
    return Response.json({ error: profilesError.message }, { status: 500 });
  }

  const { data: sentRows, error: sentError } = await db
    .from("welcome_emails")
    .select("user_id")
    .not("sent_at", "is", null)
    .limit(5000);
  if (sentError) {
    return Response.json({ error: sentError.message }, { status: 500 });
  }

  const done = new Set((sentRows ?? []).map((r) => r.user_id as string));
  const pending = (profiles ?? []).filter((p) => !done.has(p.id as string));

  if (dryRun) {
    return Response.json({
      dryRun: true,
      waiting: pending.length,
      nextBatch: pending
        .slice(0, limit)
        .map((p) => ((p.full_name as string | null) ?? "").trim().split(/\s+/)[0] || "(no name)"),
    });
  }

  const started = Date.now();
  const counts = { sent: 0, skipped: 0, failed: 0 };
  const errors: string[] = [];
  let attempted = 0;

  for (const p of pending.slice(0, limit)) {
    if (Date.now() - started > 50000) break; // stop before the time limit
    attempted++;
    try {
      const r = await sendWelcome(db, p.id as string);
      counts[r.status]++;
      if (r.status === "failed") errors.push(r.detail ?? "Unknown error");
    } catch (e) {
      counts.failed++;
      errors.push(String(e));
    }
    await sleep(700); // stay under Resend's speed limit
  }

  return Response.json({
    dryRun: false,
    attempted,
    ...counts,
    stillWaiting: pending.length - counts.sent - counts.skipped,
    errors: errors.slice(0, 5),
  });
}
