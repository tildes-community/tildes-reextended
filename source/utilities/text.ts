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

/** Return a hash for a given username */
export async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashString = hashArray
    .map((b) => b.toString())
    .join("");
  return hashString;
}

/** Return a color hex code based on hash of username string */
export async function getColorFromStringHash(username: string): Promise<string> {
  const usernameHash = parseInt(await hashString(username));
  const color = Math.abs(usernameHash % parseInt("0xFFFFFF")).toString(16)
  return `#${color}`.padEnd(7, "0")
}