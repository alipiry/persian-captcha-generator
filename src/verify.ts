import { timingSafeEqual } from "crypto";

// Characters that render identically to what the captcha shows but come
// from Arabic keyboard layouts or ASCII input.
const EQUIVALENTS: Record<string, string> = {
  ي: "ی", // Arabic yeh
  ى: "ی", // Arabic alef maksura
  ك: "ک", // Arabic kaf
};
for (let d = 0; d <= 9; d++) {
  const persian = String.fromCharCode(0x06f0 + d);
  EQUIVALENTS[String(d)] = persian;
  EQUIVALENTS[String.fromCharCode(0x0660 + d)] = persian; // Arabic-Indic
}

const normalize = (value: string) =>
  value
    // Whitespace and zero-width (non-)joiners are invisible in the answer.
    .replace(/[\s‌‍]/g, "")
    .replace(/./g, (char) => EQUIVALENTS[char] ?? char);

/**
 * Compares a user's answer against the generated captcha text, accepting
 * visually identical characters and comparing in constant time.
 * Non-string input (e.g. a missing form field) is rejected, not thrown.
 */
export function verifyCaptcha(expected: string, input: unknown): boolean {
  if (typeof input !== "string") return false;

  const a = Buffer.from(normalize(expected));
  const b = Buffer.from(normalize(input));
  // Length leaks nothing: the image already shows how many characters there are.
  return a.length > 0 && a.length === b.length && timingSafeEqual(a, b);
}
