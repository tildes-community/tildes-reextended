import { log, querySelectorAll, getColorFromStringHash, isColorBright } from "../../utilities/exports.js";
import { type UsernameColorsData } from "../../storage/exports.js";

export async function runUsernameColorsFeature(
  data: UsernameColorsData,
  anonymizeUsernamesEnabled: boolean,
  randomizeUsernameColorsEnabled: boolean,
) {
  const count = await usernameColors(data, anonymizeUsernamesEnabled, randomizeUsernameColorsEnabled);
  log(`Username Colors: Applied ${count} colors.`);
}

async function usernameColors(
  data: UsernameColorsData,
  anonymizeUsernamesEnabled: boolean,
  randomizeUsernameColorsEnabled: boolean,
): Promise<number> {
  const usernameColors = new Map<string, string>();
  for (const {
    value: { color, username: usernames },
  } of data) {
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
    let color = usernameColors.get(target);
    if (color) {
      element.style.color = color;
    } else if (randomizeUsernameColorsEnabled) {
      const randomColor = await getColorFromStringHash(target);
      const fontColor = isColorBright(randomColor) ? "#000" : "#FFF"
      element.style.setProperty("--background-color", randomColor);
      element.style.setProperty("--text-color", fontColor);
      element.classList.add("trx-colored-username")
    } else {
      continue;
    }
    count += 1;
  }

  return count;
}
