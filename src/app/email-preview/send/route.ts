import { welcomeEmail } from "@/lib/email/welcome";

// Test send of the welcome email. Works only on your own computer.
// It does not touch the member list or member numbers.
// Try: http://localhost:3000/email-preview/send?to=you@example.com&name=Judah&n=1
export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return new Response("Not found", { status: 404 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return new Response("Missing RESEND_API_KEY. Add it to .env.local and restart npm run dev.", { status: 500 });
  }

  const url = new URL(request.url);
  const to = url.searchParams.get("to") || "olayinkajudah252@gmail.com";
  const name = url.searchParams.get("name") || "Judah";
  const number = Number(url.searchParams.get("n")) || 1;
  const goals = (url.searchParams.get("goals") ?? "Exhibit my work,Meet other artists")
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean);

  const { subject, html, text } = welcomeEmail({ firstName: name, memberNumber: number, goals });

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Judah from TFA <welcome@thefineartist.org>",
      to: [to],
      reply_to: "officialthefineartist@gmail.com",
      subject: `[TEST] ${subject}`,
      html,
      text,
    }),
  });

  const body = await res.text();
  return new Response(res.ok ? `Sent to ${to}. ${body}` : `Resend ${res.status}: ${body}`, {
    status: res.ok ? 200 : 500,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
