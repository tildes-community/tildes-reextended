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
