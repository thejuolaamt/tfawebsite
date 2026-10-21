import { WORKSHOP_URL } from "@/lib/links";

// Edit this file to change what the Events page and the homepage show.
// Anything left empty ("") shows "Coming soon" on the workshop card.

export const WORKSHOP = {
  title: "The Fine Artist Workshop",
  summary: "Another hands-on session for our members.",
  details: [
    { label: "Date", value: "" },
    { label: "Time", value: "" },
    { label: "Format", value: "" },
    { label: "Price", value: "" },
  ],
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

export const COMING_UP: EventItem[] = [
  { tag: "Planned", title: "Free art studio", text: "A free place to work for artists in Ondo." },
  { tag: "Members", title: "Cheaper art materials", text: "Art materials at lower prices for TFA members." },
  { tag: "2027", title: "Artist meets", text: "In-person gatherings for artists to connect." },
  { tag: "2027", title: "TFA exhibition", text: "A public showcase of our members' work." },
];

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
