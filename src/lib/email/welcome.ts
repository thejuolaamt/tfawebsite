// Welcome email for new TFA members.
// One story: Judah opens the door, then hands the member from one pair of
// Stewards to the next. A cursive thread (an image) links each step.
// To change words: edit the text in welcomeEmail() at the bottom of this file.

import { WORKSHOP } from "@/lib/events";

const SITE = "https://www.thefineartist.org";

const C = {
  crimson: "#9C0001",
  cream: "#F8F6DF",
  paper: "#FFFDF6",
  ink: "#3B2E29",
  muted: "#7A6B62",
  blush: "#F2C9B8",
};
const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "'Trebuchet MS', 'Segoe UI', Helvetica, Arial, sans-serif";

export type WelcomeInput = {
  firstName: string;
  memberNumber: number;
  goals?: string[];
};

type Person = {
  key: string; // photo file: /images/email/<key>.png
  name: string;
  detail: string;
};

const JUDAH: Person = { key: "judah", name: "Judah", detail: "Art historian \u00B7 Nigeria" };
const OYIN: Person = { key: "oyin", name: "Oyin", detail: "Sculptor \u00B7 Nigeria" };
const TAIWO: Person = { key: "taiwo", name: "Taiwo", detail: "Vector illustrator \u00B7 Nigeria" };
const EMMANUEL: Person = { key: "emmanuel", name: "Emmanuel", detail: "Portrait artist \u00B7 Nigeria" };
const PAMILERIN: Person = { key: "pamilerin", name: "Pamilerin", detail: "Portrait artist \u00B7 Nigeria" };
const VALERIA: Person = { key: "valeria", name: "Valeria", detail: "Sculptor \u00B7 Mexico" };
const PROMISE: Person = { key: "promise", name: "Promise", detail: "Painter \u00B7 Nigeria" };

const EVERYONE = [JUDAH, OYIN, TAIWO, EMMANUEL, PAMILERIN, VALERIA, PROMISE];

const SOCIAL = [
  { label: "Instagram", href: "https://instagram.com/thefineartistig" },
  { label: "Facebook", href: "https://facebook.com/thefineartistfacebook" },
  { label: "WhatsApp group", href: "https://chat.whatsapp.com/FXquwaYSgCXLQDmqYPYl8q" },
  { label: "Community blog", href: `${SITE}/blog` },
];

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&rsquo;");
}

// "Exhibit my work" becomes "exhibit your work"
function goalPhrase(goals?: string[]) {
  const picked = (goals ?? []).slice(0, 2).map((g) => g.toLowerCase().replace(/\bmy\b/g, "your"));
  return picked.join(" and ");
}

/* ---------- HTML pieces ---------- */

function avatar(person: Person, size: number) {
  return `<img src="${SITE}/images/email/${person.key}.png" width="${size}" height="${size}" alt="${esc(person.name)}" style="display:block;margin:0 auto;width:${size}px;height:${size}px;border:0;border-radius:50%;">`;
}

function button(label: string, href: string) {
  return `<a class="btn" href="${esc(href)}" style="display:inline-block;padding:13px 28px;border-radius:999px;font-family:${SANS};font-size:15px;font-weight:700;text-decoration:none;background:${C.crimson};color:${C.cream};border:1.5px solid ${C.crimson};">${esc(label)}</a>`;
}

function para(text: string) {
  return `<p class="body" style="margin:0 0 15px 0;font-family:${SERIF};font-size:17px;line-height:1.7;color:${C.ink};">${esc(text)}</p>`;
}

// A closing line that hands the reader to the next people: before + names + after
function handoff(before: string, names: string, after: string) {
  return `<p class="body" style="margin:0 0 15px 0;font-family:${SERIF};font-size:17px;line-height:1.7;color:${C.ink};">${esc(before)}<strong style="color:${C.crimson};">${esc(names)}</strong>${esc(after)}</p>`;
}

function textLinks(items: { label: string; href: string }[]) {
  const list = items
    .map((l) => `<a href="${esc(l.href)}" style="color:${C.crimson};font-weight:700;text-decoration:underline;">${esc(l.label)}</a>`)
    .join(" &nbsp;&middot;&nbsp; ");
  return `<div style="margin:0 0 20px 0;text-align:center;font-family:${SANS};font-size:14px;line-height:1.9;">${list}</div>`;
}

function thread(kind: "a" | "b" | "end") {
  const file = kind === "end" ? "thread-end" : `thread-${kind}`;
  return `<tr><td class="px" style="padding:0 32px;line-height:0;font-size:0;"><img src="${SITE}/images/email/${file}.png" width="536" alt="" style="display:block;width:100%;max-width:536px;height:auto;border:0;"></td></tr>`;
}

function pair(a: Person, b: Person) {
  const cell = (p: Person) => `<td width="50%" align="center" valign="top" style="padding:0 6px;">
    ${avatar(p, 76)}
    <div style="margin-top:10px;font-family:${SERIF};font-size:22px;font-weight:700;color:${C.ink};">${esc(p.name)}</div>
    <div style="margin-top:3px;font-family:${SANS};font-size:13px;color:${C.muted};">${esc(p.detail)}</div>
  </td>`;
  return `<div style="margin-bottom:14px;text-align:center;font-family:${SANS};font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${C.crimson};">Community Stewards</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${cell(a)}${cell(b)}</tr></table>`;
}

// Two people, then what they say to the member
function team(a: Person, b: Person, content: string) {
  return `<tr><td class="px" align="center" style="padding:0 32px;">${pair(a, b)}</td></tr>
<tr><td class="px" style="padding:20px 32px 6px 32px;">${content}</td></tr>`;
}

// Shown only while workshop registration is open (WORKSHOP.open in src/lib/events.ts)
function workshopStrip() {
  if (!WORKSHOP.open) return "";
  const when = WORKSHOP.details
    .filter((d) => ["Date", "Time", "Format"].includes(d.label) && d.value)
    .map((d) => d.value)
    .join(" | ");
  return `<div style="margin:4px 0 24px 0;padding:22px 18px;border:1.5px solid ${C.crimson};border-radius:20px;text-align:center;">
    <div style="font-family:${SANS};font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${C.crimson};">Happening soon</div>
    <div style="margin-top:8px;font-family:${SERIF};font-size:24px;font-weight:700;color:${C.ink};">${esc(WORKSHOP.title)}</div>
    ${when ? `<div style="margin-top:6px;font-family:${SANS};font-size:14px;color:${C.muted};">${esc(when)}</div>` : ""}
    <div style="margin-top:10px;font-family:${SERIF};font-size:16px;color:${C.ink};">${esc(WORKSHOP.memberNote ? WORKSHOP.memberNote + ". " : "")}Your seat is waiting.</div>
    <div style="margin-top:16px;">${button("Reserve your seat", `${SITE}/workshop`)}</div>
  </div>`;
}

export function welcomeEmail(input: WelcomeInput) {
  const name = input.firstName.trim() || "friend";
  const goal = goalPhrase(input.goals);
  const subject = `Welcome home, ${name}`;
  const preheader = `You're member #${input.memberNumber}. You're not visiting anymore.`;

  /* ----- The words. Edit here. ----- */

  const letter = [
    `${name}, welcome. Before anything else, you should know why this place exists.`,
    "Maybe you've stood in a room full of artists and still felt like a stranger, as if everyone else already belonged and you were only visiting. Some circles run on class and cliques, on who you know and where you started. Not everyone gets a seat.",
    "TFA is different. We didn't build a club. We built a home, so that every artist, at every level, can walk in and feel they belong.",
    goal
      ? `You told us you want to ${goal}. Start here, ${name}. You're not visiting anymore.`
      : `Start here, ${name}. You're not visiting anymore.`,
  ];

  const oyinTaiwo = [
    "We built TFA to be free and open to artists of every level, because every artist deserves a place to belong. And we've already started: a workshop, our first physical meet, and a career seminar in July. Next comes a free studio in Ondo, cheaper materials and a 2027 exhibition.",
  ];

  const emmanuelPamilerin = [
    "A career in art is never built alone, and it only grows when your work is seen. Put your first artwork on your portfolio today, so that when someone goes looking for you, there's something worth finding.",
  ];
  const stayClose =
    "Then stay close. Everything we do shows up first on Instagram, Facebook, the WhatsApp group and the community blog.";

  const valeriaPromise = [
    "Hola! Yes, our home reaches all the way to Mexico, and it keeps growing. We keep it safe with clear rules, careful moderation and real care for your privacy.",
    "Every house needs someone to knock on. If you have a question, or something feels off, just reply to this email. It reaches us.",
  ];

  /* ----- The layout ----- */

  const circles = EVERYONE.map((p) => `<td style="padding:0 2px;">${avatar(p, 34)}</td>`).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${esc(subject)}</title>
<style>
  @media only screen and (max-width: 480px) {
    .wrap { padding: 0 !important; }
    .box { border-radius: 0 !important; }
    .px { padding-left: 20px !important; padding-right: 20px !important; }
    .h1 { font-size: 32px !important; line-height: 1.12 !important; }
    .body { font-size: 16px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${C.cream};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.cream};">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.cream};">
<tr><td class="wrap" align="center" style="padding:24px 12px;">
  <table class="box" role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:${C.paper};border-radius:24px;overflow:hidden;">

    <tr><td class="px" align="center" style="background:${C.crimson};padding:46px 32px 42px 32px;">
      <img src="${SITE}/images/email/logo-circle.png" width="96" height="96" alt="TFA" style="display:block;margin:0 auto;width:96px;height:96px;border:0;border-radius:50%;">
      <div style="margin-top:24px;font-family:${SANS};font-size:12px;font-weight:700;letter-spacing:0.26em;text-transform:uppercase;color:${C.blush};">The Fine Artist Community</div>
      <div class="h1" style="margin-top:12px;font-family:${SERIF};font-size:42px;line-height:1.08;font-weight:700;color:${C.cream};">Welcome home, ${esc(name)}.</div>
      <div style="margin-top:12px;font-family:${SANS};font-size:14px;color:${C.blush};">You're member #${input.memberNumber}.</div>
    </td></tr>

    <tr><td class="px" align="center" style="padding:36px 32px 0 32px;">
      ${avatar(JUDAH, 88)}
      <div style="margin-top:12px;font-family:${SERIF};font-size:26px;font-weight:700;color:${C.ink};">Judah</div>
      <div style="margin-top:4px;font-family:${SANS};font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${C.crimson};">Founder, TFA</div>
      <div style="margin-top:3px;font-family:${SANS};font-size:13px;color:${C.muted};">${esc(JUDAH.detail)}</div>
    </td></tr>
    <tr><td class="px" style="padding:22px 32px 0 32px;">
      ${letter.map(para).join("")}
      ${handoff("", "Oyin and Taiwo", " will show you how it all began.")}
      <div style="padding:6px 0 24px 0;text-align:center;">${button("Step inside", `${SITE}/feed`)}</div>
    </td></tr>

    ${thread("a")}
    ${team(OYIN, TAIWO, `${oyinTaiwo.map(para).join("")}${handoff("A home is about where you're going, so ", "Emmanuel and Pamilerin", " will show you how to get your work seen.")}`)}

    ${thread("b")}
    ${team(
      EMMANUEL,
      PAMILERIN,
      `${emmanuelPamilerin.map(para).join("")}${textLinks([{ label: "Add your first artwork", href: `${SITE}/account` }])}${para(stayClose)}${textLinks(SOCIAL)}${workshopStrip()}${handoff("And while you grow, ", "Valeria and Promise", " will make sure you're looked after.")}`
    )}

    ${thread("a")}
    ${team(VALERIA, PROMISE, valeriaPromise.map(para).join(""))}

    ${thread("end")}

    <tr><td class="px" align="center" style="background:${C.crimson};padding:34px 16px 38px 16px;">
      <div class="h1" style="font-family:${SERIF};font-size:30px;line-height:1.15;font-weight:700;color:${C.cream};">That's the house, ${esc(name)}.</div>
      <div style="margin-top:8px;font-family:${SERIF};font-size:17px;font-style:italic;color:${C.blush};">The door is always open.</div>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px auto 0 auto;"><tr>${circles}</tr></table>
      <div style="margin-top:22px;font-family:${SERIF};font-size:16px;line-height:1.6;color:${C.cream};">With love, Judah and your Stewards.</div>
    </td></tr>

    <tr><td class="px" align="center" style="padding:26px 32px 30px 32px;">
      <div style="font-family:${SANS};font-size:12px;line-height:1.8;color:${C.muted};">
        You're receiving this because you joined The Fine Artist Community at thefineartist.org.<br>
        Questions, or want fewer community emails? Just reply to this message.<br>
        <a href="${SITE}/privacy" style="color:${C.crimson};">Privacy Policy</a>
        &nbsp;&middot;&nbsp;
        <a href="${SITE}" style="color:${C.crimson};">thefineartist.org</a>
      </div>
    </td></tr>

  </table>
</td></tr>
</table>
</body>
</html>`;

  const when = WORKSHOP.details
    .filter((d) => ["Date", "Time", "Format"].includes(d.label) && d.value)
    .map((d) => d.value)
    .join(" | ");

  const text = [
    `Welcome home, ${name}.`,
    `You're member #${input.memberNumber}.`,
    "",
    "JUDAH (Founder, TFA)",
    ...letter,
    "Oyin and Taiwo will show you how it all began.",
    `Step inside: ${SITE}/feed`,
    "",
    "OYIN AND TAIWO (Community Stewards)",
    ...oyinTaiwo,
    "A home is about where you're going, so Emmanuel and Pamilerin will show you how to get your work seen.",
    "",
    "EMMANUEL AND PAMILERIN (Community Stewards)",
    ...emmanuelPamilerin,
    `Add your first artwork: ${SITE}/account`,
    stayClose,
    ...SOCIAL.map((l) => `${l.label}: ${l.href}`),
    ...(WORKSHOP.open
      ? ["", `${WORKSHOP.title}: ${when}`, `${WORKSHOP.memberNote || "Your seat is waiting"}. Reserve your seat: ${SITE}/workshop`, ""]
      : [""]),
    "And while you grow, Valeria and Promise will make sure you're looked after.",
    "",
    "VALERIA AND PROMISE (Community Stewards)",
    ...valeriaPromise,
    "",
    `That's the house, ${name}. The door is always open.`,
    "With love, Judah and your Stewards.",
    "",
    "Questions, or want fewer community emails? Just reply to this message.",
    `Privacy Policy: ${SITE}/privacy`,
  ].join("\n");

  return { subject, html, text };
}
