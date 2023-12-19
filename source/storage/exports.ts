import {createValue, type Value} from "@holllo/webextension-storage";
import browser from "webextension-polyfill";
import {
  type AnonymizeUsernamesData,
  ReplacementType,
} from "./anonymize-usernames.js";
import {Data, Feature, MiscellaneousFeature} from "./enums.js";
import {collectHideTopicsData} from "./hide-topics.js";
import {defaultKnownGroups} from "./known-groups.js";
import {collectUsernameColors} from "./username-color.js";
import {collectUserLabels} from "./user-label.js";

export * from "./anonymize-usernames.js";
export * from "./enums.js";
export * from "./hide-topics.js";
export * from "./markdown-toolbar.js";
export * from "./username-color.js";
export * from "./user-label.js";

/**
 * The data stored for the Hide Votes feature.
 */
export type HideVotesData = {
  otherComments: boolean;
  otherTopics: boolean;
  ownComments: boolean;
  ownTopics: boolean;
};

/**
 * The data stored for the Theme Switcher feature.
 */
export type ThemeSwitcherData = {
  /** The hour to switch to theme A. */
  hourA: string;

  /** The hour to switch to theme B. */
  hourB: string;

  /** The value of the theme from the theme selector for the first theme. */
  themeA: string;

  /** The value of the theme from the theme selector for the second theme. */
  themeB: string;
};

/**
 * All storage {@link Value}s stored in WebExtension storage.
 */
export const storageValues = {
  [Data.EnabledFeatures]: createValue({
    deserialize: (input) => new Set(JSON.parse(input) as Feature[]),
    serialize: (input) => JSON.stringify(Array.from(input)),
    key: Data.EnabledFeatures,
    value: new Set([
      Feature.BackToTop,
      Feature.JumpToNewComment,
      Feature.MarkdownToolbar,
      Feature.UserLabels,
    ]),
    storage: browser.storage.sync,
  }),
  [Data.KnownGroups]: createValue({
    deserialize: (input) => new Set(JSON.parse(input) as string[]),
    serialize: (input) => JSON.stringify(Array.from(input)),
    key: Data.KnownGroups,
    value: new Set(defaultKnownGroups),
    storage: browser.storage.sync,
  }),
  [Data.LatestActiveFeatureTab]: createValue({
    deserialize: (input) => JSON.parse(input) as Feature,
    serialize: (input) => JSON.stringify(input),
    key: Data.LatestActiveFeatureTab,
    value: Feature.Debug,
    storage: browser.storage.sync,
  }),
  [Data.MiscellaneousEnabledFeatures]: createValue({
    deserialize: (input) =>
      new Set(JSON.parse(input) as MiscellaneousFeature[]),
    serialize: (input) => JSON.stringify(Array.from(input)),
    key: Data.MiscellaneousEnabledFeatures,
    value: new Set([MiscellaneousFeature.CommentAnchorFix]),
    storage: browser.storage.sync,
  }),
  [Data.OnSiteNewLabel]: createValue({
    deserialize: (input) => JSON.parse(input) as boolean,
    serialize: (input) => JSON.stringify(input),
    key: Data.OnSiteNewLabel,
    value: true,
    storage: browser.storage.sync,
  }),
  [Data.Version]: createValue({
    deserialize: (input) => JSON.parse(input) as string,
    serialize: (input) => JSON.stringify(input),
    key: Data.Version,
    value: "2.0.0",
    storage: browser.storage.sync,
  }),
  [Data.RandomizeUsernameColors]: createValue({
    deserialize: (input) => JSON.parse(input) as boolean,
    serialize: (input) => JSON.stringify(input),
    key: Data.RandomizeUsernameColors,
    value: false,
    storage: browser.storage.sync,
  }),
  [Data.ThemesList]: createValue<Array<[string, string]>>({
    deserialize: (input) => JSON.parse(input) as Array<[string, string]>,
    serialize: (input) => JSON.stringify(input),
    key: Data.ThemesList,
    value: [
      ["white", "White"],
      ["solarized-light", "Solarized Light"],
      ["solarized-dark", "Solarized Dark"],
      ["dracula", "Dracula"],
      ["atom-one-dark", "Atom One Dark"],
      ["black", "Black"],
      ["zenburn", "Zenburn"],
      ["gruvbox-light", "Gruvbox Light"],
      ["gruvbox-dark", "Gruvbox Dark"],
      ["love-dark", "Love Dark"],
      ["love-light", "Love Light"],
    ],
    storage: browser.storage.local,
  }),
  [Data.ThemesListUpdatedDate]: createValue<Date>({
    deserialize: (input) => new Date(input),
    serialize: (input) => input.toISOString(),
    key: Data.ThemesListUpdatedDate,
    value: new Date("2023-01-01"),
    storage: browser.storage.local,
  }),
  [Feature.AnonymizeUsernames]: createValue<AnonymizeUsernamesData>({
    deserialize: (input) => JSON.parse(input) as AnonymizeUsernamesData,
    serialize: (input) => JSON.stringify(input),
    key: Feature.AnonymizeUsernames,
    value: {
      replacementType: ReplacementType.Numerical,
    },
    storage: browser.storage.sync,
  }),
  [Feature.HideTopics]: collectHideTopicsData(),
  [Feature.HideVotes]: createValue({
    deserialize: (input) => JSON.parse(input) as HideVotesData,
    serialize: (input) => JSON.stringify(input),
    key: Feature.HideVotes,
    value: {
      otherComments: false,
      otherTopics: false,
      ownComments: true,
      ownTopics: true,
    },
    storage: browser.storage.sync,
  }),
  [Feature.ThemeSwitcher]: createValue<ThemeSwitcherData>({
    deserialize: (input) => JSON.parse(input) as ThemeSwitcherData,
    serialize: (input) => JSON.stringify(input),
    key: Feature.ThemeSwitcher,
    value: {
      hourA: "09:00",
      hourB: "21:00",
      themeA: "white",
      themeB: "black",
    },
    storage: browser.storage.sync,
  }),
  [Feature.UserLabels]: collectUserLabels(),
  [Feature.UsernameColors]: collectUsernameColors(),
};

/**
 * Shorthand for the inferred shape of {@link storageValues}.
 */
export type StorageValues = typeof storageValues;

/**
 * Return the {@link Value}-wrapped data associated with a particular key.
 * @param key The key of the value to get from {@link storageValues}.
 */
export async function fromStorage<K extends keyof StorageValues>(
  key: K,
): Promise<StorageValues[K]> {
  return storageValues[key];
}
