"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "w-full rounded-xl border border-line bg-paper px-4 py-3 text-[15px] text-ink placeholder:text-muted/60 focus:border-crimson focus:outline-none focus:ring-2 focus:ring-crimson/20";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setBusy(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      const message = signInError.message.toLowerCase();
      if (message.includes("confirm")) {
        setError("Please confirm your email first. Check your inbox for our message.");
      } else if (message.includes("invalid")) {
        setError("That email or password is not correct. Please try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setBusy(false);
      return;
    }

    router.replace("/account");
    router.refresh();
  }

  return (
    <>
      <Navbar />
      <main className="min-h-dvh bg-cream px-4 pb-20 pt-28 text-ink sm:px-6 md:pt-36">
        <div className="mx-auto max-w-md">
          <p className="eyebrow text-crimson">Member login</p>
          <h1 className="mt-3 text-[2.1rem] font-extrabold leading-[1.05] sm:text-4xl">
            Welcome back.
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            Log in to see your profile and your portfolio.
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

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-semibold">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className={`${inputClass} pr-16`}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute inset-y-0 right-4 text-xs font-bold text-crimson"
                >
                  {show ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <p className="text-right text-sm">
              <Link href="/forgot-password" className="font-bold text-crimson">
                Forgot password?
              </Link>
            </p>

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
              {busy ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="mt-6 text-sm text-muted">
            New here?{" "}
            <Link href="/join" className="font-bold text-crimson">
              Become a member
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
