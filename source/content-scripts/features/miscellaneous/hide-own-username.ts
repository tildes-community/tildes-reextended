import {log, querySelector} from "../../../utilities/exports.js";

export function runHideOwnUsernameFeature(): void {
  hideOwnUsername();
  log("Username has been hidden.");
}

function hideOwnUsername(): void {
  const loggedInUsername = querySelector<HTMLElement>(
    ".logged-in-user-username",
  );

  loggedInUsername.dataset.trxHideOwnUsername = loggedInUsername.textContent!;
  loggedInUsername.textContent = "Username";
}
