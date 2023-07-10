import {type UsernameColorsData} from "../../storage/exports.js";
import {
  log,
  querySelectorAll,
  getColorFromStringHash,
  isColorBright,
} from "../../utilities/exports.js";

export async function runUsernameColorsFeature(
  data: UsernameColorsData,
  anonymizeUsernamesEnabled: boolean,
  randomizeUsernameColorsEnabled: boolean,
) {
  const count = await usernameColors(
    data,
    anonymizeUsernamesEnabled,
    randomizeUsernameColorsEnabled,
  );
  log(`Username Colors: Applied ${count} colors.`);
}

async function usernameColors(
  data: UsernameColorsData,
  anonymizeUsernamesEnabled: boolean,
  randomizeUsernameColorsEnabled: boolean,
): Promise<number> {
  const usernameColors = new Map<string, string>();
  for (const {
    value: {color, username: usernames},
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
    const color = usernameColors.get(target);
    if (color !== undefined) {
      element.style.color = color;
    } else if (randomizeUsernameColorsEnabled) {
      element.classList.add("trx-random-username-color");
      const randomColor = await getColorFromStringHash(target);
      const fontColor = isColorBright(randomColor) ? "#000" : "#FFF";
      element.style.setProperty("--background-color", randomColor);
      // Specifically use "--link-color" here so Tildes's link color doesn't
      // override ours.
      element.style.setProperty("--link-color", fontColor);
    } else {
      continue;
    }

    count += 1;
  }

  return count;
}
