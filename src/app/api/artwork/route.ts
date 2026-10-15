import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "src", "data", "db.json");

function readDb() {
  const raw = fs.readFileSync(dbPath, "utf-8").replace(/^\uFEFF/, "").trim();
  return JSON.parse(raw);
}

function writeDb(data: unknown) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, memberId, email, password, title, medium, image } = body;
    const db = readDb();

    if (action === "login") {
      const member = (db.members || []).find(
        (m: { email: string }) =>
          m.email.toLowerCase() === (email || "").trim().toLowerCase()
      );
      if (!member) {
        return NextResponse.json(
          { error: "No member account found with that email." },
          { status: 404 }
        );
      }
      if (member.password && member.password !== password) {
        return NextResponse.json(
          { error: "Incorrect password. Please try again." },
          { status: 401 }
        );
      }
      const { password: _, ...safeMember } = member;
      return NextResponse.json({ member: safeMember });
    }

    const index = (db.members || []).findIndex((m: { id: string }) => m.id === memberId);
    if (index === -1) {
      return NextResponse.json({ error: "Member not found." }, { status: 404 });
    }

    const artwork = {
      id: `art-${Date.now()}`,
      title: title.trim(),
      medium: medium?.trim() || "Artwork",
      image,
      createdAt: new Date().toISOString(),
    };

    if (!Array.isArray(db.members[index].artworks)) {
      db.members[index].artworks = [];
    }
    db.members[index].artworks.unshift(artwork);
    writeDb(db);

    const { password: _, ...safeMember } = db.members[index];
    return NextResponse.json({ member: safeMember });
  } catch (err) {
    console.error("POST /api/artwork error:", err);
    return NextResponse.json({ error: "Could not process request." }, { status: 500 });
  }
}
