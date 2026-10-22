"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

type Status = "loading" | "in" | "out";

// A light check of "is someone logged in?" (no profile lookup needed here).
function useLoginStatus(): Status {
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      setStatus(data.session ? "in" : "out");
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setStatus(session ? "in" : "out");
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return status;
}

// Shows its content only to people who are NOT logged in
// (for example, "Become a Member" buttons).
// While we check, the space is kept but hidden, so the page does not jump.
export function VisitorOnly({ children }: { children: ReactNode }) {
  const status = useLoginStatus();
  if (status === "in") return null;
  return (
    <span className={status === "loading" ? "invisible contents" : "contents"}>
      {children}
    </span>
  );
}

// Shows its content only to logged-in members.
export function MemberOnly({ children }: { children: ReactNode }) {
  const status = useLoginStatus();
  if (status !== "in") return null;
  return <>{children}</>;
}
