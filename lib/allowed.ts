// The studio is private: only emails listed in ALLOWED_EMAILS may use it.
// Leave ALLOWED_EMAILS empty to allow any account that can sign in.
export function isAllowedEmail(email: string | undefined | null): boolean {
  const list = (process.env.ALLOWED_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (list.length === 0) return true;
  return !!email && list.includes(email.toLowerCase());
}
