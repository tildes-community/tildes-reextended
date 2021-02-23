/**
 * Returns a version string as a number by removing the periods.
 * @param version
 */
export function versionAsNumber(version: string): number {
  return Number(version.replace(/\./g, ''));
}
