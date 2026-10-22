"use client";

import { useState } from "react";

type Props = {
  id: string;
  title: string;
};

// A "Share" button for a donor's live donation.
// On a phone it opens the normal share menu (WhatsApp, Telegram, Instagram...).
// On a computer it shows WhatsApp, Telegram and Copy link buttons instead.
export default function ShareMaterial({ id, title }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const link = () => `${window.location.origin}/materials/${id}`;
  const message = () =>
    `I'm giving away "${title}" for free on The Fine Artist Community. Collect it here:`;

  async function share() {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: `Free: ${title}`, text: message(), url: link() });
        return;
      } catch (error) {
        // The person closed the share menu on purpose: do nothing.
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    setOpen((value) => !value);
  }

  async function copy() {
    const text = `${message()} ${link()}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this message and send it:", text);
    }
  }

  const whatsapp = () =>
    `https://wa.me/?text=${encodeURIComponent(`${message()} ${link()}`)}`;
  const telegram = () =>
    `https://t.me/share/url?url=${encodeURIComponent(link())}&text=${encodeURIComponent(message())}`;

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={share}
        className="rounded-full border-[1.5px] border-crimson px-4 py-2 text-xs font-bold text-crimson transition hover:bg-crimson hover:text-cream"
      >
        Share this donation
      </button>

      {open && (
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={whatsapp()}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-ink px-4 py-2 text-xs font-bold text-cream"
          >
            WhatsApp
          </a>
          <a
            href={telegram()}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-ink px-4 py-2 text-xs font-bold text-cream"
          >
            Telegram
          </a>
          <button
            type="button"
            onClick={copy}
            className="rounded-full border border-ink px-4 py-2 text-xs font-bold"
          >
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>
      )}
    </div>
  );
}