import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "src", "data", "db.json");

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function formatMonthDay(birthdate: string) {
  if (!birthdate) return "";
  const parts = birthdate.split("-");
  if (parts.length === 3) {
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (MONTHS[monthIndex] && !isNaN(day)) {
      return `${MONTHS[monthIndex]} ${day}`;
    }
  }
  return birthdate;
}

const DEFAULT_DB = {
  members: [
    {
      id: "m-1",
      name: "Olayinka Judah",
      email: "olayinka@thefineartist.org",
      password: "",
      birthdate: "2003-08-30",
      role: "Art Historian & Curator",
      bio: "Art historian, curator and founder of TFA. Passionate about making art accessible to all.",
      avatar: "/images/team/olayinka-judah.jpeg",
      joinedAt: "2026-10-01T10:00:00.000Z",
      artworks: [],
    },
    {
      id: "m-2",
      name: "Oyinloluwa Akindele",
      email: "oyinloluwa@thefineartist.org",
      password: "",
      birthdate: "1999-05-14",
      role: "Sculptor & Design Expert",
      bio: "Professional sculptor, design expert and teacher.",
      avatar: "/images/team/oyinloluwa-akindele.jpeg",
      joinedAt: "2026-10-02T10:00:00.000Z",
      artworks: [],
    },
    {
      id: "m-3",
      name: "Emmanuel Okolieze",
      email: "emmanuel@thefineartist.org",
      password: "",
      birthdate: "1998-09-12",
      role: "Pencil Portrait Artist",
      bio: "Professional pencil portrait artist.",
      avatar: "/images/team/emmanuel-okolieze.jpeg",
      joinedAt: "2026-10-03T10:00:00.000Z",
      artworks: [],
    },
    {
      id: "m-4",
      name: "Promise Oloruntobi",
      email: "promise@thefineartist.org",
      password: "",
      birthdate: "2000-03-22",
      role: "Professional Artist",
      bio: "Professional visual artist.",
      avatar: "/images/team/promise-oloruntobi.jpeg",
      joinedAt: "2026-10-04T10:00:00.000Z",
      artworks: [],
    },
    {
      id: "m-5",
      name: "Taiwo Oladele",
      email: "taiwo@thefineartist.org",
      password: "",
      birthdate: "2001-07-19",
      role: "Community Storyteller",
      bio: "Community storyteller, shaping the voice and message behind TFA.",
      avatar: "/images/team/taiwo-oladele.jpeg",
      joinedAt: "2026-10-05T10:00:00.000Z",
      artworks: [],
    },
    {
      id: "m-6",
      name: "Pamilerin Oluwasanmi",
      email: "pamilerin@thefineartist.org",
      password: "",
      birthdate: "2002-11-08",
      role: "Assistant Content Manager",
      bio: "Creative content manager and social media expert.",
      avatar: "/images/team/pamilerin-oluwasanmi.jpeg",
      joinedAt: "2026-10-06T10:00:00.000Z",
      artworks: [],
    },
  ],
  blogs: [
    {
      id: "blog-1",
      title: "Welcome to The Fine Artist Community: Home of Creative Inclusiveness",
      excerpt: "Why we are building a safe space where every artist feels included and creativity never depends on what you can afford.",
      author: "Olayinka Judah",
      role: "Founder, TFA",
      date: "October 12, 2026",
      readTime: "4 min read",
      image: "/images/story/our-story.png",
      content: "The Fine Artist Community was born from a simple conviction: no artist should ever have to create in isolation or give up on their gift because materials and studio space are out of reach.\n\nThrough our shared studio initiative, affordable materials drive, public exhibitions, and school outreach seminars, we are building a home where every visual artist can thrive, document their portfolio, and grow alongside 230+ fellow creatives.",
    },
    {
      id: "blog-2",
      title: "Highlights From Our School Outreach & Career Guidance Seminar",
      excerpt: "Guiding art-inclined students toward sustainable creative careers through annual workshops and mentorship.",
      author: "Taiwo Oladele",
      role: "Community Steward, TFA",
      date: "October 14, 2026",
      readTime: "3 min read",
      image: "/images/story/students-at-seminar.jpeg",
      content: "When young artists see working professionals taking their craft seriously, everything changes. Our school outreach sessions bring practical career counselling, portfolio reviews, and encouragement directly to students discovering their artistic voice.",
    },
  ],
};

function readDb() {
  try {
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(path.dirname(dbPath), { recursive: true });
      fs.writeFileSync(dbPath, JSON.stringify(DEFAULT_DB, null, 2), "utf-8");
      return DEFAULT_DB;
    }
    const raw = fs.readFileSync(dbPath, "utf-8").replace(/^\uFEFF/, "").trim();
    if (!raw) {
      fs.writeFileSync(dbPath, JSON.stringify(DEFAULT_DB, null, 2), "utf-8");
      return DEFAULT_DB;
    }
    return JSON.parse(raw);
  } catch {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    fs.writeFileSync(dbPath, JSON.stringify(DEFAULT_DB, null, 2), "utf-8");
    return DEFAULT_DB;
  }
}

function writeDb(data: unknown) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET() {
  try {
    const db = readDb();
    const sorted = [...(db.members || [])].sort(
      (a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
    );

    // Strip password and birth year from public member objects (only month & day shown publicly)
    const publicMembers = sorted.map(
      ({ password: _, birthdate, email: __, ...m }) => ({
        ...m,
        birthMonthDay: formatMonthDay(birthdate),
      })
    );

    return NextResponse.json({
      members: publicMembers,
      newestTen: publicMembers.slice(0, 10),
      blogs: db.blogs || [],
    });
  } catch (err) {
    console.error("GET /api/members error:", err);
    return NextResponse.json({ error: "Failed to read database" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, birthdate, role, bio, avatar } = body;

    if (!name || !email || !birthdate || !avatar || !password) {
      return NextResponse.json(
        { error: "Name, email, password, birthdate, and profile picture are required." },
        { status: 400 }
      );
    }

    const db = readDb();
    const exists = (db.members || []).find(
      (m: { email: string }) => m.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (exists) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please switch to Member Login." },
        { status: 409 }
      );
    }

    const newMember = {
      id: `m-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      birthdate,
      role: role?.trim() || "Community Member",
      bio: bio?.trim() || "",
      avatar,
      joinedAt: new Date().toISOString(),
      artworks: [],
    };

    db.members.unshift(newMember);
    writeDb(db);

    const { password: _, ...ownerMember } = newMember;
    return NextResponse.json({ member: ownerMember }, { status: 201 });
  } catch (err) {
    console.error("POST /api/members error:", err);
    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }
}
