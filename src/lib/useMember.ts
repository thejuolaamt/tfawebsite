"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type MemberState = {
  status: "loading" | "in" | "out";
  userId: string | null;
  name: string | null;
  avatar: string | null;
};

// Tells any page or component whether a member is logged in right now,
// and who they are. Use it like:  const member = useMember();
export function useMember(): MemberState {
  const [status, setStatus] = useState<MemberState["status"]>("loading");
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      const id = data.session?.user.id ?? null;
      setUserId(id);
      setStatus(id ? "in" : "out");
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const id = session?.user.id ?? null;
      setUserId(id);
      setStatus(id ? "in" : "out");
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    createClient()
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setName(data?.full_name ?? null);
        setAvatar(data?.avatar_url ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return {
    status,
    userId,
    name: userId ? name : null,
    avatar: userId ? avatar : null,
  };
}
