import {log} from "./logging.js";
import {querySelectorAll} from "./query-selectors.js";

/**
 * Try to extract the groups when in the group listing page at `/groups`.
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
