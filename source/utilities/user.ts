/**
 * Checks whether a user is logged in on or not.
 */
export function userIsLoggedIn(): boolean {
  return document.querySelector(".logged-in-user-username") !== null;
}
