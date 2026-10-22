"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "w-full rounded-xl border border-line bg-paper px-4 py-3 text-[15px] text-ink placeholder:text-muted/60 focus:border-crimson focus:outline-none focus:ring-2 focus:ring-crimson/20";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    setBusy(true);
    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: `${window.location.origin}/reset-password` }
    );
    setBusy(false);

    if (resetError) {
      const message = resetError.message.toLowerCase();
      if (message.includes("rate") || message.includes("seconds")) {
        setError("Too many requests. Please wait a few minutes and try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      return;
    }

    // Same message whether or not the email has an account, so nobody can
    // use this page to find out who is a member.
    setSent(true);
  }

  return (
    <>
      <Navbar />
      <main className="min-h-dvh bg-cream px-4 pb-20 pt-28 text-ink sm:px-6 md:pt-36">
        <div className="mx-auto max-w-md">
          <p className="eyebrow text-crimson">Reset password</p>
          <h1 className="mt-3 text-[2.1rem] font-extrabold leading-[1.05] sm:text-4xl">
            Forgot your password?
          </h1>

          {sent ? (
            <div className="mt-6 rounded-2xl border border-line bg-paper p-5">
              <p className="font-bold">Check your email.</p>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">
                If an account exists for {email.trim()}, we have sent a link to
                set a new password. It can take a minute or two. Check your spam
                folder if you do not see it.
              </p>
            </div>
          ) : (
            <>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                Enter the email you joined with and we will send you a link to
                set a new password.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                </div>

                {error && (
                  <p role="alert" className="text-sm font-medium text-crimson">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-full bg-crimson px-8 py-3.5 text-[15px] font-bold text-cream transition hover:bg-crimson-deep disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy ? "Sending..." : "Send reset link"}
                </button>
              </form>
            </>
          )}

          <p className="mt-6 text-sm text-muted">
            Remembered it?{" "}
            <Link href="/login" className="font-bold text-crimson">
              Back to log in
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
