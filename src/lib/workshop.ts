// The moment workshop registration opens.
// Monday 26 October 2026, 12:00 AM Nigeria time (WAT = UTC+1).
export const REGISTRATION_OPENS_AT = "2026-10-25T23:00:00Z";

export function registrationIsOpen(now: number = Date.now()): boolean {
  return now >= new Date(REGISTRATION_OPENS_AT).getTime();
}
