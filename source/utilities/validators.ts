/**
 * Return whether the input is a valid hex color with a starting `#`.
 * @param color The potential hex color.
 */
export function isValidHexColor(color: string): boolean {
  return (
    /^#(?:[a-f\d]{8}|[a-f\d]{6}|[a-f\d]{4}|[a-f\d]{3})$/i.exec(color) !== null
  );
}

/**
 * Return whether the input is a valid Tildes username.
 * @param username The potential username.
 */
export function isValidTildesUsername(username: string): boolean {
  // Validation copied from Tildes source code:
  // https://gitlab.com/tildes/tildes/blob/master/tildes/tildes/schemas/user.py
  return (
    username.length >= 3 &&
    username.length <= 20 &&
    /^[a-z\d]([a-z\d]|[_-](?![_-]))*[a-z\d]$/i.exec(username) !== null
  );
}
