"use client";

import { useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

/* ---------- Options ---------- */

const MIN_AGE = 13;

const STEPS = [
  { title: "Account", hint: "Your email and password" },
  { title: "About you", hint: "Who you are and where" },
  { title: "Your art", hint: "What you create" },
  { title: "Final touches", hint: "Photo and goals" },
] as const;

const DISCIPLINES = [
  "Painting",
  "Drawing",
  "Sculpture",
  "Graphic design",
  "Digital art",
  "Illustration",
  "Photography",
  "Ceramics",
  "Textile and fashion",
  "Printmaking",
  "Art history and criticism",
  "Art education",
  "Other",
];

const MEMBER_TYPES = [
  { value: "student", label: "Student", hint: "Studying art or design" },
  { value: "hobbyist", label: "Hobbyist", hint: "I create for the joy of it" },
  { value: "emerging", label: "Emerging artist", hint: "Building my practice" },
  { value: "professional", label: "Professional artist", hint: "Art is my career" },
  { value: "educator", label: "Art educator", hint: "I teach or mentor" },
  { value: "enthusiast", label: "Art enthusiast", hint: "I love and support art" },
];

const GOALS = [
  "Learn new skills",
  "Exhibit my work",
  "Sell my art",
  "Meet other artists",
  "Get feedback",
  "Find collaborators",
  "Find mentorship",
  "Find opportunities",
];

const HEARD_FROM = [
  "TFA WhatsApp group",
  "Instagram",
  "Facebook",
  "A friend or fellow artist",
  "School or campus",
  "A workshop or event",
  "Google search",
  "Other",
];

const COUNTRIES = [
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "Cameroon",
  "United Kingdom",
  "United States",
  "Canada",
  "Mexico",
  "Other",
];

const NIGERIA_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi",
  "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo",
  "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

/* ---------- Types and helpers ---------- */

type FormState = {
  email: string;
  password: string;
  confirm: string;
  fullName: string;
  birthDate: string;
  country: string;
  countryOther: string;
  state: string;
  city: string;
  phone: string;
  disciplines: string[];
  memberType: string;
  instagram: string;
  bio: string;
  goals: string[];
  heardFrom: string;
  consent: boolean;
};

const INITIAL: FormState = {
  email: "",
  password: "",
  confirm: "",
  fullName: "",
  birthDate: "",
  country: "Nigeria",
  countryOther: "",
  state: "",
  city: "",
  phone: "",
  disciplines: [],
  memberType: "",
  instagram: "",
  bio: "",
  goals: [],
  heardFrom: "",
  consent: false,
};

function ageFrom(dateString: string) {
  const born = new Date(dateString);
  const today = new Date();
  let age = today.getFullYear() - born.getFullYear();
  const hadBirthday =
    today.getMonth() > born.getMonth() ||
    (today.getMonth() === born.getMonth() && today.getDate() >= born.getDate());
  if (!hadBirthday) age -= 1;
  return age;
}

function passwordScore(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const SCORE_LABELS = ["Too short", "Weak", "Fair", "Good", "Strong"];
const SCORE_COLORS = [
  "bg-line",
  "bg-crimson",
  "bg-amber-500",
  "bg-lime-600",
  "bg-emerald-600",
];

function cleanInstagram(value: string) {
  return value
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .replace(/[/?].*$/, "");
}

function toggle(list: string[], value: string) {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

// Crops the photo to a centred square and shrinks it, so uploads stay small.
async function cropToSquare(file: File, size = 512): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const min = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(
    bitmap,
    (bitmap.width - min) / 2,
    (bitmap.height - min) / 2,
    min,
    min,
    0,
    0,
    size,
    size
  );
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not process image"))),
      "image/jpeg",
      0.88
    )
  );
}

/* ---------- Small UI pieces ---------- */

const inputClass =
  "w-full rounded-xl border border-line bg-paper px-4 py-3 text-[15px] text-ink placeholder:text-muted/60 focus:border-crimson focus:outline-none focus:ring-2 focus:ring-crimson/20";

function Field({
  label,
  htmlFor,
  hint,
  optional,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 flex items-baseline gap-2 text-sm font-bold">
        {label}
        {optional && (
          <span className="text-xs font-normal text-muted">Optional</span>
        )}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs leading-relaxed text-muted">{hint}</p>}
    </div>
  );
}

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
        selected
          ? "border-crimson bg-crimson text-cream"
          : "border-line bg-paper text-ink hover:border-crimson/50"
      }`}
    >
      {children}
    </button>
  );
}

function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputClass} pr-16`}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-crimson"
      >
        {show ? "Hide" : "Show"}
      </button>
    </div>
  );
}

function CheckIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M4.5 10.5l3.5 3.5 7.5-8"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------- Page ---------- */

export default function JoinPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const [done, setDone] = useState(false);
  const [createdUserId, setCreatedUserId] = useState<string | null>(null);
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [today] = useState(() => new Date().toISOString().slice(0, 10));
  const scrollRef = useRef<HTMLDivElement>(null);

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));
  const score = passwordScore(form.password);
  const firstName = form.fullName.trim().split(/\s+/)[0] || "friend";

  function validate(index: number): string {
    if (index === 0) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
        return "Please enter a valid email address.";
      if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/\d/.test(form.password))
        return "Your password needs at least 8 characters, with letters and a number.";
      if (form.confirm !== form.password)
        return "The two passwords do not match. Please check them.";
    }
    if (index === 1) {
      if (form.fullName.trim().length < 2) return "Please enter your full name.";
      if (!form.birthDate || Number.isNaN(new Date(form.birthDate).getTime()))
        return "Please enter your date of birth.";
      if (form.birthDate > today || ageFrom(form.birthDate) < MIN_AGE)
        return `You must be at least ${MIN_AGE} years old to join.`;
      if (form.country === "Other" && form.countryOther.trim().length < 2)
        return "Please type your country.";
      if (!form.state.trim()) return "Please tell us your state or region.";
      if (form.phone.trim()) {
        const digits = form.phone.replace(/\D/g, "");
        if (!/^[0-9+\s()-]+$/.test(form.phone.trim()) || digits.length < 7 || digits.length > 15)
          return "That phone number does not look right. Use digits only, e.g. +234 801 234 5678.";
      }
    }
    if (index === 2) {
      if (form.disciplines.length === 0) return "Please pick at least one art area.";
      if (!form.memberType) return "Please choose what describes you best.";
      const handle = cleanInstagram(form.instagram);
      if (handle && !/^[A-Za-z0-9._]{1,30}$/.test(handle))
        return "That Instagram handle does not look right. Use letters, numbers, dots or underscores.";
    }
    if (index === 3) {
      if (!photoBlob && !createdUserId) return "Please add your profile photo.";
      if (form.goals.length === 0) return "Please pick at least one thing you hope to get from TFA.";
      if (!form.consent) return "Please tick the box to agree before creating your account.";
    }
    return "";
  }

  function goTo(next: number) {
    setError("");
    setStep(next);
    scrollRef.current?.scrollTo({ top: 0 });
  }

  async function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (JPG or PNG).");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("That photo is too large. Please choose one under 20 MB.");
      return;
    }
    try {
      const blob = await cropToSquare(file);
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      setPhotoBlob(blob);
      setPhotoPreview(URL.createObjectURL(blob));
    } catch {
      setError("We could not read that photo. Please try a JPG or PNG image.");
    }
  }

  async function saveProfile(userId: string) {
    const supabase = createClient();
    if (!photoBlob) throw new Error("No photo");

    const path = `${userId}/avatar-${Date.now()}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, photoBlob, { contentType: "image/jpeg" });
    if (uploadError) throw uploadError;

    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    const { data: rows, error: updateError } = await supabase
      .from("profiles")
      .update({
        avatar_url: pub.publicUrl,
        bio: form.bio.trim() || null,
        onboarded: true,
      })
      .eq("id", userId)
      .select("id");
    if (updateError || !rows || rows.length === 0)
      throw updateError ?? new Error("Profile not updated");
  }

  async function createAccount() {
    setBusy(true);
    setError("");
    const supabase = createClient();

    try {
      let userId = createdUserId;

      if (!userId) {
        const country =
          form.country === "Other" ? form.countryOther.trim() : form.country;

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            data: {
              full_name: form.fullName.trim(),
              birth_date: form.birthDate,
              consent: "true",
              country,
              state: form.state.trim(),
              city: form.city.trim(),
              phone: form.phone.trim(),
              disciplines: form.disciplines,
              member_type: form.memberType,
              goals: form.goals,
              heard_from: form.heardFrom,
              instagram: cleanInstagram(form.instagram),
            },
          },
        });

        if (signUpError) {
          const message = signUpError.message.toLowerCase();
          if (message.includes("already")) {
            goTo(0);
            setError("This email already has an account. Please log in instead.");
          } else if (message.includes("password")) {
            goTo(0);
            setError("That password is too weak. Try a longer one with letters and numbers.");
          } else if (message.includes("rate") || message.includes("limit")) {
            setError("Too many attempts. Please wait a few minutes and try again.");
          } else {
            setError("Something went wrong creating your account. Please try again.");
          }
          return;
        }

        // Email confirmation switched on: there is no session yet.
        if (!data.session || !data.user) {
          setCheckEmail(true);
          return;
        }

        userId = data.user.id;
        setCreatedUserId(userId);
      }

      await saveProfile(userId);
      setDone(true);
    } catch {
      setError(
        createdUserId
          ? "Your account is created, but we could not save your photo. Please tap the button to try again."
          : "Your account was created, but we could not save your photo. Please tap the button to try again."
      );
    } finally {
      setBusy(false);
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const problem = validate(step);
    if (problem) {
      setError(problem);
      return;
    }
    if (step < STEPS.length - 1) {
      goTo(step + 1);
    } else {
      createAccount();
    }
  }

  /* ---------- Layout ---------- */

  return (
    <div className="h-dvh overflow-hidden bg-cream text-ink lg:grid lg:grid-cols-[5fr_7fr]">
      {/* Brand panel (desktop) */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-crimson p-12 text-cream lg:flex">
        <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full border border-cream/15" />
        <div className="pointer-events-none absolute -right-8 -top-8 size-48 rounded-full border border-cream/15" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 size-96 rounded-full border border-cream/10" />
        <div className="pointer-events-none absolute -bottom-12 -left-8 size-56 rounded-full bg-cream/5" />

        <div className="relative">
          <Link
            href="/"
            aria-label="The Fine Artist Community, home"
            className="inline-flex rounded-2xl bg-cream px-4 py-2.5"
          >
            <Image
              src="/images/tfa-logo-mark.png"
              alt="The Fine Artist Community logo"
              width={240}
              height={133}
              priority
              className="h-9 w-auto"
            />
          </Link>
        </div>

        <div className="relative">
          <h1 className="max-w-md text-5xl font-extrabold leading-[1.02]">
            A home for artists to create, exhibit and grow together.
          </h1>

          <ol className="mt-12 space-y-5">
            {STEPS.map((s, i) => {
              const complete = done || i < step;
              const current = !done && i === step;
              return (
                <li key={s.title} className="flex items-center gap-4">
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
                      complete
                        ? "border-cream bg-cream text-crimson"
                        : current
                          ? "border-cream bg-cream/15 text-cream"
                          : "border-cream/30 text-cream/50"
                    }`}
                  >
                    {complete ? <CheckIcon /> : i + 1}
                  </span>
                  <span>
                    <span
                      className={`block font-bold ${current || complete ? "text-cream" : "text-cream/55"}`}
                    >
                      {s.title}
                    </span>
                    <span className="block text-sm text-cream/60">{s.hint}</span>
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        <p className="relative max-w-sm text-sm leading-relaxed text-cream/70">
          Free to join. Your date of birth and city stay private. Your email and WhatsApp number are only shared with a member you exchange art materials with.
        </p>
      </aside>

      {/* Form panel */}
      <div className="flex h-dvh min-h-0 flex-col">
        <header className="flex shrink-0 items-center justify-between border-b border-line px-5 py-3 sm:px-10">
          <Link href="/" aria-label="The Fine Artist Community, home" className="lg:hidden">
            <Image
              src="/images/tfa-logo-mark.png"
              alt="The Fine Artist Community logo"
              width={240}
              height={133}
              className="h-8 w-auto"
            />
          </Link>
          <Link
            href="/"
            className="hidden text-sm font-medium text-muted transition hover:text-crimson lg:block"
          >
            &larr; Back to home
          </Link>
          <p className="text-sm text-muted">
            <span className="hidden sm:inline">Already a member? </span>
            <Link href="/login" className="font-bold text-crimson hover:underline">
              Log in
            </Link>
          </p>
        </header>

        {done ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-10 text-center">
            {photoPreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoPreview}
                alt=""
                className="size-32 rounded-full border-4 border-crimson object-cover"
              />
            )}
            <p className="eyebrow mt-8 text-crimson">You are in</p>
            <h2 className="mt-3 max-w-md text-4xl font-extrabold leading-tight sm:text-5xl">
              Welcome to TFA, {firstName}.
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted">
              Your profile is ready, and your photo will now appear among our
              members. We are glad you are here.
            </p>
            <Link
              href="/"
              className="mt-8 rounded-full bg-crimson px-8 py-3.5 text-[15px] font-bold text-cream transition hover:bg-crimson-deep"
            >
              Go to the homepage
            </Link>
          </div>
        ) : checkEmail ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-10 text-center">
            <p className="eyebrow text-crimson">Almost there</p>
            <h2 className="mt-3 text-4xl font-extrabold leading-tight">Check your email.</h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted">
              We sent a confirmation link to <strong>{form.email}</strong>. Click
              it to finish creating your account.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
            <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-5 py-8 sm:px-10 lg:px-16 lg:py-12">
              <div className="mx-auto max-w-xl">
                {/* Progress */}
                <p className="eyebrow text-crimson">
                  Step {step + 1} of {STEPS.length} &middot; {STEPS[step].title}
                </p>
                <div className="mt-3 flex gap-1.5" aria-hidden="true">
                  {STEPS.map((s, i) => (
                    <div
                      key={s.title}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-crimson" : "bg-line"}`}
                    />
                  ))}
                </div>

                {/* Step 1: Account */}
                {step === 0 && (
                  <section className="mt-8">
                    <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">
                      Create your account.
                    </h2>
                    <p className="mt-3 text-[15px] leading-relaxed text-muted">
                      Your email and password are how you will log in to TFA.
                    </p>
                    <div className="mt-8 space-y-5">
                      <Field label="Email" htmlFor="email">
                        <input
                          id="email"
                          type="email"
                          autoComplete="email"
                          value={form.email}
                          onChange={(e) => set({ email: e.target.value })}
                          placeholder="you@example.com"
                          className={inputClass}
                        />
                      </Field>

                      <Field label="Password" htmlFor="password">
                        <PasswordInput
                          id="password"
                          value={form.password}
                          onChange={(v) => set({ password: v })}
                          placeholder="At least 8 characters, with a number"
                          autoComplete="new-password"
                        />
                        {form.password && (
                          <div className="mt-2.5" aria-live="polite">
                            <div className="flex gap-1.5">
                              {[1, 2, 3, 4].map((n) => (
                                <div
                                  key={n}
                                  className={`h-1.5 flex-1 rounded-full transition-colors ${n <= score ? SCORE_COLORS[score] : "bg-line"}`}
                                />
                              ))}
                            </div>
                            <p className="mt-1.5 text-xs text-muted">
                              Strength: <strong>{SCORE_LABELS[score]}</strong>
                            </p>
                          </div>
                        )}
                      </Field>

                      <Field label="Confirm password" htmlFor="confirm">
                        <PasswordInput
                          id="confirm"
                          value={form.confirm}
                          onChange={(v) => set({ confirm: v })}
                          placeholder="Type your password again"
                          autoComplete="new-password"
                        />
                        {form.confirm && (
                          <p
                            aria-live="polite"
                            className={`mt-1.5 flex items-center gap-1.5 text-xs font-medium ${
                              form.confirm === form.password
                                ? "text-emerald-700"
                                : "text-crimson"
                            }`}
                          >
                            {form.confirm === form.password ? (
                              <>
                                <CheckIcon className="size-3.5" /> Passwords match
                              </>
                            ) : (
                              "Passwords do not match yet"
                            )}
                          </p>
                        )}
                      </Field>
                    </div>
                  </section>
                )}

                {/* Step 2: About you */}
                {step === 1 && (
                  <section className="mt-8">
                    <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">
                      Tell us about you.
                    </h2>
                    <p className="mt-3 text-[15px] leading-relaxed text-muted">
                      This helps us welcome you properly and connect you with
                      artists near you.
                    </p>
                    <div className="mt-8 space-y-5">
                      <Field label="Full name" htmlFor="fullName">
                        <input
                          id="fullName"
                          type="text"
                          autoComplete="name"
                          value={form.fullName}
                          onChange={(e) => set({ fullName: e.target.value })}
                          placeholder="e.g. Ada Okafor"
                          className={inputClass}
                        />
                      </Field>

                      <Field
                        label="Date of birth"
                        htmlFor="birthDate"
                        hint="So we can celebrate your birthday. This stays private."
                      >
                        <input
                          id="birthDate"
                          type="date"
                          autoComplete="bday"
                          min="1900-01-01"
                          max={today}
                          value={form.birthDate}
                          onChange={(e) => set({ birthDate: e.target.value })}
                          className={inputClass}
                        />
                      </Field>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field label="Country" htmlFor="country">
                          <select
                            id="country"
                            autoComplete="country-name"
                            value={form.country}
                            onChange={(e) => set({ country: e.target.value, state: "" })}
                            className={inputClass}
                          >
                            {COUNTRIES.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </Field>

                        <Field
                          label={form.country === "Nigeria" ? "State" : "State or region"}
                          htmlFor="state"
                        >
                          {form.country === "Nigeria" ? (
                            <select
                              id="state"
                              autoComplete="address-level1"
                              value={form.state}
                              onChange={(e) => set({ state: e.target.value })}
                              className={inputClass}
                            >
                              <option value="">Select your state</option>
                              {NIGERIA_STATES.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              id="state"
                              type="text"
                              autoComplete="address-level1"
                              value={form.state}
                              onChange={(e) => set({ state: e.target.value })}
                              placeholder="Your state or region"
                              className={inputClass}
                            />
                          )}
                        </Field>
                      </div>

                      {form.country === "Other" && (
                        <Field label="Your country" htmlFor="countryOther">
                          <input
                            id="countryOther"
                            type="text"
                            value={form.countryOther}
                            onChange={(e) => set({ countryOther: e.target.value })}
                            placeholder="Type your country"
                            className={inputClass}
                          />
                        </Field>
                      )}

                      <Field
                        label="City or town"
                        htmlFor="city"
                        optional
                        hint="Helps us plan meet-ups near you. This stays private."
                      >
                        <input
                          id="city"
                          type="text"
                          autoComplete="address-level2"
                          value={form.city}
                          onChange={(e) => set({ city: e.target.value })}
                          placeholder="e.g. Ondo"
                          className={inputClass}
                        />
                      </Field>

                      <Field
                        label="WhatsApp number"
                        htmlFor="phone"
                        optional
                        hint="So we can add you to the right community groups. Only shared with a member you exchange materials with."
                      >
                        <input
                          id="phone"
                          type="tel"
                          autoComplete="tel"
                          value={form.phone}
                          onChange={(e) => set({ phone: e.target.value })}
                          placeholder="+234 801 234 5678"
                          className={inputClass}
                        />
                      </Field>
                    </div>
                  </section>
                )}

                {/* Step 3: Your art */}
                {step === 2 && (
                  <section className="mt-8">
                    <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">
                      Show us your art.
                    </h2>
                    <p className="mt-3 text-[15px] leading-relaxed text-muted">
                      Pick everything that fits. This appears on your public
                      profile.
                    </p>
                    <div className="mt-8 space-y-7">
                      <fieldset>
                        <legend className="mb-2.5 text-sm font-bold">
                          What do you create or love? <span className="font-normal text-muted">Pick one or more</span>
                        </legend>
                        <div className="flex flex-wrap gap-2">
                          {DISCIPLINES.map((d) => (
                            <Chip
                              key={d}
                              selected={form.disciplines.includes(d)}
                              onClick={() => set({ disciplines: toggle(form.disciplines, d) })}
                            >
                              {d}
                            </Chip>
                          ))}
                        </div>
                      </fieldset>

                      <fieldset>
                        <legend className="mb-2.5 text-sm font-bold">
                          Which describes you best?
                        </legend>
                        <div role="radiogroup" className="grid gap-2.5 sm:grid-cols-2">
                          {MEMBER_TYPES.map((t) => {
                            const selected = form.memberType === t.value;
                            return (
                              <button
                                key={t.value}
                                type="button"
                                role="radio"
                                aria-checked={selected}
                                onClick={() => set({ memberType: t.value })}
                                className={`rounded-2xl border p-4 text-left transition ${
                                  selected
                                    ? "border-crimson bg-crimson text-cream"
                                    : "border-line bg-paper hover:border-crimson/50"
                                }`}
                              >
                                <span className="block text-[15px] font-bold">{t.label}</span>
                                <span
                                  className={`mt-0.5 block text-xs ${selected ? "text-cream/80" : "text-muted"}`}
                                >
                                  {t.hint}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </fieldset>

                      <Field
                        label="Instagram"
                        htmlFor="instagram"
                        optional
                        hint="Just your handle, so other members can find your work."
                      >
                        <div className="relative">
                          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">
                            @
                          </span>
                          <input
                            id="instagram"
                            type="text"
                            autoCapitalize="none"
                            value={form.instagram}
                            onChange={(e) => set({ instagram: e.target.value })}
                            placeholder="yourhandle"
                            className={`${inputClass} pl-9`}
                          />
                        </div>
                      </Field>

                      <Field label="Short bio" htmlFor="bio" optional>
                        <textarea
                          id="bio"
                          rows={3}
                          maxLength={280}
                          value={form.bio}
                          onChange={(e) => set({ bio: e.target.value })}
                          placeholder="A line or two about you and your art."
                          className={`${inputClass} resize-none`}
                        />
                        <p className="mt-1.5 text-right text-xs text-muted">
                          {form.bio.length}/280
                        </p>
                      </Field>
                    </div>
                  </section>
                )}

                {/* Step 4: Final touches */}
                {step === 3 && (
                  <section className="mt-8">
                    <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">
                      Final touches.
                    </h2>
                    <p className="mt-3 text-[15px] leading-relaxed text-muted">
                      Add your photo and tell us what you hope to get from TFA.
                    </p>
                    <div className="mt-8 space-y-8">
                      <div className="flex flex-col items-center gap-4 rounded-[24px] border border-line bg-paper p-6 text-center sm:flex-row sm:text-left">
                        <div className="flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-crimson/50 bg-cream">
                          {photoPreview ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={photoPreview} alt="Your profile photo" className="size-full object-cover" />
                          ) : (
                            <span className="px-3 text-xs font-medium text-muted">No photo yet</span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold">Profile photo</p>
                          <p className="mt-1 text-xs leading-relaxed text-muted">
                            A clear picture of you. It shows on your profile and
                            among our newest members. We crop it to a square.
                          </p>
                          <label className="mt-3 inline-block cursor-pointer rounded-full border-[1.5px] border-crimson px-5 py-2 text-sm font-bold text-crimson transition hover:bg-crimson hover:text-cream">
                            {photoPreview ? "Change photo" : "Choose photo"}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={onPhotoChange}
                              className="sr-only"
                            />
                          </label>
                        </div>
                      </div>

                      <fieldset>
                        <legend className="mb-2.5 text-sm font-bold">
                          What do you hope to get from TFA?{" "}
                          <span className="font-normal text-muted">Pick one or more</span>
                        </legend>
                        <div className="flex flex-wrap gap-2">
                          {GOALS.map((g) => (
                            <Chip
                              key={g}
                              selected={form.goals.includes(g)}
                              onClick={() => set({ goals: toggle(form.goals, g) })}
                            >
                              {g}
                            </Chip>
                          ))}
                        </div>
                      </fieldset>

                      <Field label="How did you hear about TFA?" htmlFor="heardFrom" optional>
                        <select
                          id="heardFrom"
                          value={form.heardFrom}
                          onChange={(e) => set({ heardFrom: e.target.value })}
                          className={inputClass}
                        >
                          <option value="">Select one</option>
                          {HEARD_FROM.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </Field>

                      <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-paper p-4 text-[13px] leading-relaxed text-muted">
                        <input
                          type="checkbox"
                          checked={form.consent}
                          onChange={(e) => set({ consent: e.target.checked })}
                          className="mt-0.5 size-4 shrink-0 accent-crimson"
                        />
                        <span>
                          I agree that TFA may keep my details, including my
                          email, date of birth and phone number, to manage my
                          membership, send me community emails and celebrate my
                          birthday. Other logged-in members can see my profile
                          (name, photo, bio, art interests, state, country and
                          Instagram), and my profile photo may also appear on
                          the homepage. I have read the{" "}
                          <Link
                            href="/privacy"
                            target="_blank"
                            className="font-bold text-crimson underline underline-offset-2"
                          >
                            Privacy Policy
                          </Link>
                          .
                        </span>
                      </label>
                    </div>
                  </section>
                )}

                {error && (
                  <p
                    role="alert"
                    className="mt-6 rounded-xl bg-crimson/10 px-4 py-3 text-sm font-medium text-crimson-deep"
                  >
                    {error}{" "}
                    {error.includes("log in") && (
                      <Link href="/login" className="font-bold underline">
                        Go to login
                      </Link>
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Action bar */}
            <div className="shrink-0 border-t border-line bg-cream px-5 py-4 sm:px-10 lg:px-16">
              <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
                {step > 0 && !createdUserId ? (
                  <button
                    type="button"
                    onClick={() => goTo(step - 1)}
                    disabled={busy}
                    className="rounded-full px-5 py-3 text-[15px] font-bold text-muted transition hover:text-ink disabled:opacity-50"
                  >
                    Back
                  </button>
                ) : (
                  <span />
                )}
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-full bg-crimson px-8 py-3 text-[15px] font-bold text-cream transition hover:bg-crimson-deep disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {step < STEPS.length - 1
                    ? "Continue"
                    : busy
                      ? "Creating your account..."
                      : createdUserId
                        ? "Try saving my photo again"
                        : "Create my account"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
