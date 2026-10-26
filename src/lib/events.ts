import { WORKSHOP_URL } from "@/lib/links";

// Edit this file to change what the Events page and the homepage show.
// Anything left empty ("") shows "Coming soon" on the workshop card.

export const WORKSHOP = {
  title: "Community Workshop",
  summary: "An online, hands-on drawing session for artists, taught by Emmanuel Okolieze.",
  details: [
    { label: "Date", value: "Saturday, 14 November 2026" },
    { label: "Time", value: "4:00 PM, Nigeria time" },
    { label: "Format", value: "Online" },
    { label: "Price", value: "\u20A625,000" },
  ],
  // Shown under the Price row for visitors who are not members yet
  memberNote: "Free for members",
  tutor: {
    name: "Emmanuel Okolieze",
    role: "Tutor",
    bio: "Professional artist and Community Steward at TFA.",
    image: "/images/team/emmanuel-okolieze.jpeg",
  },
  learn: [] as string[],
  registerUrl: WORKSHOP_URL,
  // true = show the "Register for Workshop" buttons. false = registration closed.
  open: true,
};

export type EventItem = {
  tag: string;
  title: string;
  text: string;
  image?: string;
  href?: string;
  linkLabel?: string;
};

export const ACTIVITIES: EventItem[] = [
  {
    tag: "Every week",
    title: "Weekly drawing tasks",
    text: "Creative challenges with up to 15 artists taking part.",
  },
  {
    tag: "Series",
    title: "Artist interviews",
    text: "Conversations with artists, starting with Kenny Daniel Art. More to come.",
  },
  {
    tag: "Members",
    title: "Materials sharing",
    text: "Give art materials you no longer need, or collect what other members share. It is always free.",
    href: "/materials",
    linkLabel: "Open materials sharing",
  },
];

// The first item is the big card. The rest sit in a row under it.
export const PAST: EventItem[] = [
  {
    tag: "23 July 2026",
    title: "Career guidance seminar",
    text: "At Saint Louis Secondary School, Ondo, guiding art-inclined students toward careers in the arts.",
    image: "/images/story/students-at-seminar.jpeg",
  },
  {
    tag: "Registered",
    title: "TFA Art Store",
    text: "Our art store is now registered with CAC, bringing art materials within reach.",
  },
  {
    tag: "2025",
    title: "Online practical workshop",
    text: "A hands-on practical session for artists, held entirely online.",
  },
  {
    tag: "In person",
    title: "Meet-ups",
    text: "Our first physical meet, and members connecting face to face at exhibitions.",
  },
];
