import {createValue} from "@holllo/webextension-storage";
import browser from "webextension-polyfill";
import {Data, Feature} from "./enums.js";
import {collectUsernameColors} from "./username-color.js";
import {collectUserLabels} from "./user-label.js";

export * from "./enums.js";
export * from "./username-color.js";
export * from "./user-label.js";

export type HideVotesData = {
  otherComments: boolean;
  otherTopics: boolean;
  ownComments: boolean;
  ownTopics: boolean;
};

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
    value: new Set([]),
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

type StorageValues = typeof storageValues;

export async function fromStorage<K extends keyof StorageValues>(
  key: K,
): Promise<StorageValues[K]> {
  return storageValues[key];
}
