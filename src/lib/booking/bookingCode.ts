/** Crockford's base32 alphabet — no I/L/O/U so codes are unambiguous when read aloud. */
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/**
 * Short, unambiguous confirmation code for emails / phone support.
 * Format: B-XXXXX (e.g. "B-7K9F2"). 5 chars of base32 => ~33M combinations.
 * Collisions are checked at insert time (the column is UNIQUE).
 */
export function generateConfirmationCode(): string {
  const bytes = new Uint8Array(5);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return `B-${code}`;
}
