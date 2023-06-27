import {log, querySelectorAll} from "../../utilities/exports.js";
import {type UsernameColorsData} from "../../storage/exports.js";

export function runUsernameColorsFeature(
  data: UsernameColorsData,
  anonymizeUsernamesEnabled: boolean,
) {
  const count = usernameColors(data, anonymizeUsernamesEnabled);
  log(`Username Colors: Applied ${count} colors.`);
}

function usernameColors(
  data: UsernameColorsData,
  anonymizeUsernamesEnabled: boolean,
): number {
  const usernameColors = new Map<string, string>();
  for (const {color, username: usernames} of data) {
    for (const username of usernames.split(",")) {
      usernameColors.set(username.trim().toLowerCase(), color);
    }
  }

  let count = 0;
  const usernameElements = querySelectorAll<HTMLElement>(
    ".link-user:not(.trx-username-colors)",
  );

  for (const element of usernameElements) {
    if (element.classList.contains("trx-username-colors")) {
      continue;
    }

    let target =
      element.textContent?.replace(/@/g, "").trim().toLowerCase() ??
      "<unknown>";
    if (anonymizeUsernamesEnabled) {
      target = element.dataset.trxUsername?.toLowerCase() ?? target;
    }

    element.classList.add("trx-username-colors");
    const color = usernameColors.get(target);
    if (color === undefined) {
      continue;
    }

    element.style.color = color;
    count += 1;
  }

  return count;
}
