import {log} from "./logging.js";
import {querySelectorAll} from "./query-selectors.js";

/**
 * Tries to extract and save the groups. Returns the current saved groups when
 * the user is not in `/groups` and the new ones when they are in `/groups`.
 */
export function extractGroups(): string[] | undefined {
  if (window.location.pathname !== "/groups") {
    log('Not in "/groups", returning early.');
    return;
  }

  return querySelectorAll(".link-group").map(
    (value) => value.textContent ?? "<unknown group>",
  );
}
