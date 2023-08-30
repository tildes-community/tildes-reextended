/**
 * Checks whether a user is logged in on or not.
 */
export function userIsLoggedIn(): boolean {
  return document.querySelector(".logged-in-user-username") !== null;
}

/**
 * Get the currently logged in user's username, if they are logged in.
 */
export function getLoggedInUsername(): string | undefined {
  const loggedInUsername =
    document.querySelector<HTMLElement>(".logged-in-user-username") ??
    undefined;
  return (
    loggedInUsername?.dataset.trxHideOwnUsername ??
    loggedInUsername?.textContent ??
    undefined
  );
}
