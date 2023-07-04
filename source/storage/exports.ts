import {createValue, type Value} from "@holllo/webextension-storage";
import browser from "webextension-polyfill";
import {Data, Feature} from "./enums.js";
import {collectHideTopicsData} from "./hide-topics.js";
import {defaultKnownGroups} from "./known-groups.js";
import {collectUsernameColors} from "./username-color.js";
import {collectUserLabels} from "./user-label.js";

export * from "./enums.js";
export * from "./hide-topics.js";
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
  [Data.Version]: createValue({
    deserialize: (input) => JSON.parse(input) as string,
    serialize: (input) => JSON.stringify(input),
    key: Data.Version,
    value: "2.0.0",
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
  [Feature.UserLabels]: collectUserLabels(),
  [Feature.UsernameColors]: collectUsernameColors(),
};

/**
 * Shorthand for the inferred shape of {@link storageValues}.
 */
type StorageValues = typeof storageValues;

/**
 * Return the {@link Value}-wrapped data associated with a particular key.
 * @param key The key of the value to get from {@link storageValues}.
 */
export async function fromStorage<K extends keyof StorageValues>(
  key: K,
): Promise<StorageValues[K]> {
  return storageValues[key];
}
