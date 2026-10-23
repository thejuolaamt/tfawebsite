// Welcome email for new TFA members.
// One story: Judah opens the door, and each Steward hands the member to the next.
// A cursive thread (an image) links every Steward's circle to the next.
// The Steward lines are DRAFTS until each person has approved their own section.
// To change words: edit the text in sections() below. Nothing else needs to change.

const SITE = "https://www.thefineartist.org";
const TFA_EMAIL = "officialthefineartist@gmail.com";

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
  title: string;
  detail: string;
};

type Btn = { label: string; href: string };
type Section = { person: Person; topic: string; paras: string[]; buttons: Btn[] };

const JUDAH: Person = { key: "judah", name: "Judah", title: "Founder, TFA", detail: "Art historian · Nigeria" };
const OYIN: Person = { key: "oyin", name: "Oyin", title: "Community Steward", detail: "Sculptor · Nigeria" };
const TAIWO: Person = { key: "taiwo", name: "Taiwo", title: "Community Steward", detail: "Vector illustrator · Nigeria" };
const EMMANUEL: Person = { key: "emmanuel", name: "Emmanuel", title: "Community Steward", detail: "Portrait artist · Nigeria" };
const VALERIA: Person = { key: "valeria", name: "Valeria", title: "Community Steward", detail: "Sculptor · Mexico" };
const PROMISE: Person = { key: "promise", name: "Promise", title: "Community Steward", detail: "Painter · Nigeria" };
const PAMILERIN: Person = { key: "pamilerin", name: "Pamilerin", title: "Community Steward", detail: "Portrait artist · Nigeria" };

const EVERYONE = [JUDAH, OYIN, TAIWO, EMMANUEL, VALERIA, PROMISE, PAMILERIN];

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

function sections(input: WelcomeInput): Section[] {
  const name = input.firstName;
  const goal = goalPhrase(input.goals);

  return [
    {
      person: JUDAH,
      topic: "Welcome",
      paras: [
        `You're member #${input.memberNumber} of The Fine Artist Community.`,
        "Art history is full of artists who grew because they found each other. That's what this house is for.",
        goal
          ? `You told us you want to ${goal}, so let me show you around. I'll walk you from room to room, and first, Oyin will tell you why we built this place.`
          : "Let me show you around. I'll walk you from room to room, and first, Oyin will tell you why we built this place.",
      ],
      buttons: [{ label: "Step inside", href: `${SITE}/feed` }],
    },
    {
      person: OYIN,
      topic: "Why we exist",
      paras: [
        `Hi ${name}, I'm Oyin. We built TFA as a home of creative inclusiveness: free to join and open to artists of every level, because every artist deserves a place to belong.`,
        "Weekly drawing tasks, career guidance for students, artists helping artists. But a home is more than a promise, so let Taiwo show you what we've already built.",
      ],
      buttons: [{ label: "Read our story", href: `${SITE}/#about` }],
    },
    {
      person: TAIWO,
      topic: "What we've built",
      paras: [
        "I'm Taiwo, and here's the proof. We've held an online practical workshop, our first physical meet, and a career guidance seminar at Saint Louis Secondary School in July. Our TFA Art Store is registered with CAC. Now there's this website, with portfolios and materials sharing, and more is on the way.",
        "Next up: a free art studio in Ondo, cheaper materials for members, and a TFA exhibition in 2027. Places like that are where careers begin, so I'll let Emmanuel pick it up from here.",
      ],
      buttons: [{ label: "See what's coming", href: `${SITE}/events#coming-up` }],
    },
    {
      person: EMMANUEL,
      topic: "Your career",
      paras: [
        "I'm Emmanuel. A career in art is never built alone. It grows when your work is seen, when you learn from people a few steps ahead of you, and when you meet the people who open doors. That's exactly what TFA gives you: workshops, meet-ups, and a portfolio that speaks for you when you're not in the room.",
        "Registration for The Fine Artist Workshop opens Monday 26 October at 12:00 AM. Be early. And put your first artwork on your portfolio today, so that when someone goes looking for you, there's something worth finding.",
        "Work that is shown deserves a home that protects it. Valeria will tell you how we do that.",
      ],
      buttons: [
        { label: "Watch the countdown", href: `${SITE}/workshop` },
        { label: "Add your first artwork", href: `${SITE}/account` },
      ],
    },
    {
      person: VALERIA,
      topic: "How we care for you",
      paras: [
        `Hola ${name}, I'm Valeria. Yes, our home reaches all the way to Mexico, and it's still growing: more artists, more countries, more to come.`,
        "As it grows, we keep it well ordered. We have clear rules, careful moderation, and a real passion for your privacy and your security. Your personal details are yours, and we treat them that way.",
        "Order keeps a house safe, but people keep it warm. Promise is the person to look for.",
      ],
      buttons: [{ label: "Read our Privacy Policy", href: `${SITE}/privacy` }],
    },
    {
      person: PROMISE,
      topic: "Your go-to person",
      paras: [
        "I'm Promise. Every house needs someone to knock on. If something feels off, or you have a question about your account or a materials pickup, just reply to this email and it will reach us. Anything that breaks our rules comes down.",
        "And when you want to keep up with us outside this house, Pamilerin has it all.",
      ],
      buttons: [
        {
          label: "Reply to this email",
          href: `mailto:${TFA_EMAIL}?subject=${encodeURIComponent("A question for TFA")}`,
        },
      ],
    },
    {
      person: PAMILERIN,
      topic: "Stay connected",
      paras: [
        `I'm Pamilerin, and I look after what we share with the world. Follow us, join the WhatsApp group, read the community blog, or write to us any time at ${TFA_EMAIL}. Everything we do shows up in those places first.`,
      ],
      buttons: [
        { label: "Instagram", href: "https://instagram.com/thefineartistig" },
        { label: "Facebook", href: "https://facebook.com/thefineartistfacebook" },
        { label: "WhatsApp group", href: "https://chat.whatsapp.com/FXquwaYSgCXLQDmqYPYl8q" },
        { label: "Community blog", href: `${SITE}/blog` },
      ],
    },
  ];
}

/* ---------- HTML pieces ---------- */

function avatar(person: Person, size: number) {
  return `<img src="${SITE}/images/email/${person.key}.png" width="${size}" height="${size}" alt="${esc(person.name)}" style="display:block;margin:0 auto;width:${size}px;height:${size}px;border:0;border-radius:50%;">`;
}

function button(btn: Btn, filled: boolean) {
  const style = filled
    ? `background:${C.crimson};color:${C.cream};border:1.5px solid ${C.crimson};`
    : `background:transparent;color:${C.crimson};border:1.5px solid ${C.crimson};`;
  return `<a class="btn" href="${esc(btn.href)}" style="display:inline-block;margin:0 4px 10px 4px;padding:13px 24px;border-radius:999px;font-family:${SANS};font-size:15px;font-weight:700;text-decoration:none;${style}">${esc(btn.label)}</a>`;
}

function sectionHtml(s: Section, index: number) {
  const thread =
    index === 0
      ? ""
      : `<tr><td class="px" style="padding:0 32px;line-height:0;font-size:0;"><img src="${SITE}/images/email/${index % 2 === 1 ? "thread-a" : "thread-b"}.png" width="536" alt="" style="display:block;width:100%;max-width:536px;height:auto;border:0;"></td></tr>`;

  const paras = s.paras
    .map(
      (p) =>
        `<p class="body" style="margin:0 0 15px 0;font-family:${SERIF};font-size:17px;line-height:1.7;color:${C.ink};">${esc(p)}</p>`
    )
    .join("");
  const buttons = s.buttons.map((b, i) => button(b, i === 0)).join("");

  return `
${thread}
<tr><td class="px" align="center" style="padding:${index === 0 ? 36 : 0}px 32px 0 32px;">
  ${avatar(s.person, 88)}
  <div class="name" style="margin-top:12px;font-family:${SERIF};font-size:26px;font-weight:700;color:${C.ink};">${esc(s.person.name)}</div>
  <div style="margin-top:4px;font-family:${SANS};font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${C.crimson};">${esc(s.person.title)}</div>
  <div style="margin-top:3px;font-family:${SANS};font-size:13px;color:${C.muted};">${esc(s.person.detail)}</div>
</td></tr>
<tr><td class="px" style="padding:22px 32px 0 32px;">
  <div style="margin-bottom:12px;text-align:center;font-family:${SANS};font-size:12px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${C.muted};">&mdash; ${esc(s.topic)} &mdash;</div>
  ${paras}
  <div style="padding:6px 0 24px 0;text-align:center;">${buttons}</div>
</td></tr>`;
}

export function welcomeEmail(input: WelcomeInput) {
  const name = input.firstName.trim() || "friend";
  const list = sections({ ...input, firstName: name });
  const subject = `Welcome home, ${name}`;
  const preheader = `You're member #${input.memberNumber}. Come in, we'll show you around.`;

  const circles = EVERYONE.map(
    (p) => `<td style="padding:0 2px;">${avatar(p, 34)}</td>`
  ).join("");

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
    .name { font-size: 23px !important; }
    .body { font-size: 16px !important; }
    .btn { display: block !important; margin: 0 0 10px 0 !important; text-align: center !important; }
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
    </td></tr>

    ${list.map(sectionHtml).join("")}

    <tr><td class="px" style="padding:0 32px;line-height:0;font-size:0;"><img src="${SITE}/images/email/thread-end.png" width="536" alt="" style="display:block;width:100%;max-width:536px;height:auto;border:0;"></td></tr>

    <tr><td class="px" align="center" style="background:${C.crimson};padding:34px 16px 38px 16px;">
      <div class="h1" style="font-family:${SERIF};font-size:30px;line-height:1.15;font-weight:700;color:${C.cream};">That's the house, ${esc(name)}.</div>
      <div style="margin-top:8px;font-family:${SERIF};font-size:17px;font-style:italic;color:${C.blush};">The door is always open.</div>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px auto 0 auto;"><tr>${circles}</tr></table>
      <div style="margin-top:22px;font-family:${SERIF};font-size:16px;line-height:1.6;color:${C.cream};">With love from Judah, your Stewards,<br>and the whole TFA community.</div>
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

  const text = [
    `Welcome home, ${name}.`,
    "",
    ...list.flatMap((s) => [
      `${s.person.name} (${s.person.title}, ${s.person.detail})`,
      ...s.paras,
      ...s.buttons.map((b) => `${b.label}: ${b.href}`),
      "",
    ]),
    `That's the house, ${name}. The door is always open.`,
    "With love from Judah, your Stewards, and the whole TFA community.",
    "",
    "Questions, or want fewer community emails? Just reply to this message.",
    `Privacy Policy: ${SITE}/privacy`,
  ].join("\n");

  return { subject, html, text };
}
