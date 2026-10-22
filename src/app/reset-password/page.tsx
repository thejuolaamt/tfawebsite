"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "w-full rounded-xl border border-line bg-paper px-4 py-3 text-[15px] text-ink placeholder:text-muted/60 focus:border-crimson focus:outline-none focus:ring-2 focus:ring-crimson/20";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [state, setState] = useState<"checking" | "ready" | "invalid" | "done">("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // The email link brings the member here. Supabase turns the link into a
  // short login session, and we wait for it before showing the form.
  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN")) {
        if (!cancelled) setState("ready");
      }
    });

    async function check() {
      for (let i = 0; i < 8; i++) {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          if (!cancelled) setState("ready");
          return;
        }
        await new Promise((r) => setTimeout(r, 500));
      }
      if (!cancelled) setState((s) => (s === "checking" ? "invalid" : s));
    }
    check();

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setError("Your password needs at least 8 characters, with letters and a number.");
      return;
    }
    if (password !== confirm) {
      setError("The two passwords do not match. Please check them.");
      return;
    }

    setBusy(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      const message = updateError.message.toLowerCase();
      if (message.includes("same")) {
        setError("Please choose a password you have not used before.");
      } else if (message.includes("weak") || message.includes("password")) {
        setError("That password is too weak. Try a longer one with letters and numbers.");
      } else {
        setError("We could not change your password. Please try again.");
      }
      setBusy(false);
      return;
    }

    setState("done");
    setBusy(false);
    setTimeout(() => {
      router.replace("/account");
      router.refresh();
    }, 1800);
  }

  return (
    <>
      <Navbar />
      <main className="min-h-dvh bg-cream px-4 pb-20 pt-28 text-ink sm:px-6 md:pt-36">
        <div className="mx-auto max-w-md">
          <p className="eyebrow text-crimson">Reset password</p>
          <h1 className="mt-3 text-[2.1rem] font-extrabold leading-[1.05] sm:text-4xl">
            Set a new password.
          </h1>

          {state === "checking" && (
            <p className="mt-6 text-[15px] text-muted">Checking your link...</p>
          )}

          {state === "invalid" && (
            <div className="mt-6 rounded-2xl border border-line bg-paper p-5">
              <p className="font-bold">This link is not working.</p>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">
                It may have expired or already been used. Open the link in the same
                browser where you asked for it, or request a new one.
              </p>
              <Link
                href="/forgot-password"
                className="mt-4 inline-block rounded-full bg-crimson px-6 py-3 text-[15px] font-bold text-cream transition hover:bg-crimson-deep"
              >
                Request a new link
              </Link>
            </div>
          )}

          {state === "done" && (
            <div className="mt-6 rounded-2xl border border-line bg-paper p-5">
              <p className="font-bold">Password changed.</p>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">
                Taking you to your account...
              </p>
            </div>
          )}

          {state === "ready" && (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-semibold">
                  New password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={show ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
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

              <div>
                <label htmlFor="confirm" className="mb-1.5 block text-sm font-semibold">
                  Confirm new password
                </label>
                <input
                  id="confirm"
                  type={show ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Type it again"
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
                {busy ? "Saving..." : "Save new password"}
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
