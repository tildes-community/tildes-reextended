/**
 * Pluralize a word based on a count.
 * @param count The number of things.
 * @param singular The word in its singular form.
 * @param plural Optionally the word in its plural form. If left undefined the
 * returned string will be the singular form plus the letter "s".
 */
export function pluralize(
  count: number,
  singular: string,
  plural?: string,
): string {
  if (count === 1) {
    return singular;
  }

  return plural ?? singular + "s";
}

/** Return the SHA-256 hash for a given string. */
export async function hashSha256(input: string): Promise<string> {
  const uint8Input = new window.TextEncoder().encode(input);
  const digest = await window.crypto.subtle.digest("SHA-256", uint8Input);
  return Array.from(new window.Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
