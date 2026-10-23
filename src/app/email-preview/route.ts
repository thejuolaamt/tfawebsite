import { welcomeEmail } from "@/lib/email/welcome";

// Private preview of the welcome email. Works only on your own computer.
// Try: http://localhost:3000/email-preview?name=Amaka&n=231&goals=Exhibit my work,Meet other artists
export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return new Response("Not found", { status: 404 });
  }

  const url = new URL(request.url);
  const name = url.searchParams.get("name") || "Amaka";
  const number = Number(url.searchParams.get("n")) || 231;
  const goals = (url.searchParams.get("goals") || "Exhibit my work,Meet other artists")
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean);

  const { html } = welcomeEmail({ firstName: name, memberNumber: number, goals });

  // Use the photos on your computer instead of the live site
  const local = html.replaceAll("https://www.thefineartist.org/images/", "/images/");

  return new Response(local, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
