import {
  Feature,
  type ThemeSwitcherData,
  fromStorage,
} from "../../storage/exports.js";
import {log, setBodyThemeClass, sleep} from "../../utilities/exports.js";

export async function runThemeSwitcherFeature(): Promise<void> {
  const data = await fromStorage(Feature.ThemeSwitcher);
  const switchedTheme = await themeSwitcher(data.value);
  if (switchedTheme !== undefined) {
    log(`Theme Switcher: Switched to ${switchedTheme}`);
  }
}

async function themeSwitcher(
  data: ThemeSwitcherData,
): Promise<string | undefined> {
  // Get the millisecond Unix times of each date for easier comparison.
  const [now, dateA, dateB] = [
    new Date(),
    getDateWithSpecificTime(data.hourA),
    getDateWithSpecificTime(data.hourB),
  ].map((date) => date.getTime());

  // If we're in the range between date A and B then set it to theme A,
  // otherwise set it to theme B as we'll be in the other range.
  const theme = now > dateA && now <= dateB ? data.themeA : data.themeB;
  const themeSelector =
    document.querySelector<HTMLSelectElement>("select#theme") ?? undefined;

  if (themeSelector === undefined) {
    // If there is no theme selector on the page only change the body class.
    setBodyThemeClass(theme);
    return theme;
  }

  if (themeSelector.value === theme) {
    // If the theme is already set to the one we want to change to, do nothing.
    return;
  }

  themeSelector.value = theme;
  setBodyThemeClass(theme);

  // After 2 seconds dispatch a synthetic change event on the theme selector so
  // it changes the user's theme cookie. This isn't ideal because if it takes
  // longer than 2 seconds to initialize the Tildes JS handler for the theme
  // selector it won't do anything, but for now it's better than trying to set
  // the cookie ourselves which would require extra WebExtension permissions.
  void sleep(2000).then(() => {
    themeSelector.dispatchEvent(new Event("change"));
  });

  return theme;
}

/**
 * Create a date of today with the hours and minutes set to the given `HH:MM`
 * string, and the seconds and milliseconds set to 0.
 */
function getDateWithSpecificTime(time: string): Date {
  const components = time
    .split(":")
    .map(Number)
    // Make sure any conversions don't return `NaN`.
    .map((value) => (Number.isNaN(value) ? 0 : value));

  const date = new Date();
  date.setHours(components[0]);
  date.setMinutes(components[1]);
  date.setSeconds(0, 0);

  return date;
}
