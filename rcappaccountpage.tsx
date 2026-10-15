"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function JoinPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"register" | "login">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [birthdate, setBirthdate] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const size = 300;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const min = Math.min(img.width, img.height);
          ctx.drawImage(
            img,
            (img.width - min) / 2,
            (img.height - min) / 2,
            min,
            min,
            0,
            0,
            size,
            size
          );
          setAvatar(canvas.toDataURL("image/jpeg", 0.85));
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (mode === "login") {
      setLoading(true);
      try {
        const res = await fetch("/api/artwork", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "login", email, password }),
        });
        const data = await res.json();
        setLoading(false);
        if (!res.ok) {
          setError(data.error || "Login failed.");
          return;
        }
        localStorage.setItem("tfa_member", JSON.stringify(data.member));
        router.push("/account");
      } catch {
        setLoading(false);
        setError("Network error. Please try again.");
      }
      return;
    }

    if (!avatar) {
      setError("Please upload a profile picture to complete your registration.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please recheck your password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          birthdate,
          role,
          bio,
          avatar,
        }),
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || "Could not register.");
        return;
      }

      localStorage.setItem("tfa_member", JSON.stringify(data.member));
      router.push("/account");
    } catch {
      setLoading(false);
      setError("Network error. Please try again.");
    }
  }

  return (
    <>
      <Navbar />
      <main className="bg-cream px-4 pb-20 pt-28 text-ink sm:px-6 md:pt-32">
        <div className="mx-auto max-w-2xl">
          <p className="eyebrow text-crimson">Official Membership</p>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-5xl">
            Become a Member
          </h1>
          <p className="mt-3 text-sm text-muted sm:text-base">
            Set up your official TFA member account. Your profile photo will appear first in our 230+ members showcase, we will celebrate your birthday, send you community emails, and give you a personal portfolio grid.
          </p>

          <div className="mt-8 rounded-[28px] border border-line bg-paper p-6 shadow-sm sm:p-10">
            <div className="mb-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
                className={`rounded-full px-5 py-2 text-sm font-bold transition ${
                  mode === "register"
                    ? "bg-crimson text-cream"
                    : "border border-line text-muted hover:text-ink"
                }`}
              >
                New Member Registration
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
                className={`rounded-full px-5 py-2 text-sm font-bold transition ${
                  mode === "login"
                    ? "bg-crimson text-cream"
                    : "border border-line text-muted hover:text-ink"
                }`}
              >
                Member Login
              </button>
            </div>

            {error && (
              <div className="mb-5 rounded-2xl bg-crimson/10 px-4 py-3 text-sm font-medium text-crimson">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === "register" && (
                <>
                  <div className="flex items-center gap-5">
                    <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-crimson bg-cream">
                      {avatar ? (
                        <img src={avatar} alt="Preview" className="size-full object-cover" />
                      ) : (
                        <span className="text-center text-[11px] font-bold text-muted">
                          Photo *
                        </span>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-ink">
                        Profile Picture (Required)
                      </label>
                      <p className="text-xs text-muted">
                        Appears alongside the 230+ members on the homepage.
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        required
                        onChange={handlePhotoUpload}
                        className="mt-2 block text-xs text-ink file:mr-3 file:rounded-full file:border-0 file:bg-crimson file:px-4 file:py-2 file:text-xs file:font-bold file:text-cream"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold uppercase text-muted">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1.5 w-full rounded-2xl border border-line bg-cream px-4 py-3 text-sm text-ink focus:border-crimson focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-muted">
                        Art Medium / Role *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Pencil Artist, Painter, Sculptor"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="mt-1.5 w-full rounded-2xl border border-line bg-cream px-4 py-3 text-sm text-ink focus:border-crimson focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className={mode === "login" ? "sm:col-span-2" : ""}>
                  <label className="block text-xs font-bold uppercase text-muted">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 w-full rounded-2xl border border-line bg-cream px-4 py-3 text-sm text-ink focus:border-crimson focus:outline-none"
                  />
                </div>

                {mode === "register" && (
                  <div>
                    <label className="block text-xs font-bold uppercase text-muted">
                      Birthdate (For Birthday Celebrations) *
                    </label>
                    <input
                      type="date"
                      required
                      value={birthdate}
                      onChange={(e) => setBirthdate(e.target.value)}
                      className="mt-1.5 w-full rounded-2xl border border-line bg-cream px-4 py-3 text-sm text-ink focus:border-crimson focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className={mode === "register" ? "grid gap-4 sm:grid-cols-2" : ""}>
                <div>
                  <label className="block text-xs font-bold uppercase text-muted">
                    Password *
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full rounded-2xl border border-line bg-cream py-3 pl-4 pr-16 text-sm text-ink focus:border-crimson focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-bold text-crimson hover:bg-crimson/10"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {mode === "register" && (
                  <div>
                    <label className="block text-xs font-bold uppercase text-muted">
                      Confirm Password *
                    </label>
                    <div className="relative mt-1.5">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password"
                        className="w-full rounded-2xl border border-line bg-cream py-3 pl-4 pr-16 text-sm text-ink focus:border-crimson focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={
                          showConfirmPassword
                            ? "Hide confirm password"
                            : "Show confirm password"
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-bold text-crimson hover:bg-crimson/10"
                      >
                        {showConfirmPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                    {confirmPassword.length > 0 && (
                      <p
                        className={`mt-1 text-xs font-semibold ${
                          password === confirmPassword
                            ? "text-green-700"
                            : "text-crimson"
                        }`}
                      >
                        {password === confirmPassword
                          ? "✓ Passwords match"
                          : "✗ Passwords do not match yet"}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {mode === "register" && (
                <div>
                  <label className="block text-xs font-bold uppercase text-muted">
                    Short Artist Bio
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="mt-1.5 w-full rounded-2xl border border-line bg-cream px-4 py-3 text-sm text-ink focus:border-crimson focus:outline-none"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex min-h-13 w-full items-center justify-center rounded-full bg-crimson px-7 text-base font-bold text-cream transition hover:bg-crimson-deep"
              >
                {loading
                  ? "Please wait..."
                  : mode === "register"
                  ? "Create Member Account"
                  : "Log In to My Account"}
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
