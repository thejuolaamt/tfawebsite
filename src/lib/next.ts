// Remembers which item a visitor was looking at, so after they log in or join
// we can send them back to it. It is kept in the browser for one day only.

const KEY = "tfa-next";
const ONE_DAY = 24 * 60 * 60 * 1000;
const ALLOWED = /^\/materials\/[0-9a-f-]{36}$/i;

export function rememberNext(path: string) {
  try {
    if (!ALLOWED.test(path)) return;
    window.localStorage.setItem(KEY, JSON.stringify({ path, at: Date.now() }));
  } catch {
    // Storage is blocked (private mode). The visitor simply lands on the Feed.
  }
}

// Looks at the saved item without removing it.
export function peekNext(fallback = "/feed"): string {
  try {
    if (typeof window === "undefined") return fallback;
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return fallback;
    const saved = JSON.parse(raw) as { path?: string; at?: number };
    if (
      typeof saved.path === "string" &&
      typeof saved.at === "number" &&
      ALLOWED.test(saved.path) &&
      Date.now() - saved.at < ONE_DAY
    ) {
      return saved.path;
    }
  } catch {
    // Ignore a damaged or blocked value.
  }
  return fallback;
}

export function clearNext() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Nothing to clear.
  }
}

// Gets the saved item AND removes it. Use this right after a successful login.
export function takeNext(fallback = "/feed"): string {
  const path = peekNext(fallback);
  clearNext();
  return path;
}