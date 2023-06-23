import {type Value, createValue} from "@holllo/webextension-storage";
import browser from "webextension-polyfill";

export enum Feature {
  AnonymizeUsernames = "anonymize-users",
  Autocomplete = "autocomplete",
  BackToTop = "back-to-top",
  Debug = "debug",
  HideVotes = "hide-votes",
  JumpToNewComment = "jump-to-new-comment",
  MarkdownToolbar = "markdown-toolbar",
  ThemedLogo = "themed-logo",
  UserLabels = "user-labels",
  UsernameColors = "username-colors",
}

export enum Data {
  EnabledFeatures = "enabled-features",
  KnownGroups = "known-groups",
  LatestActiveFeatureTab = "latest-active-feature-tab",
}

export type HideVotesData = {
  otherComments: boolean;
  otherTopics: boolean;
  ownComments: boolean;
  ownTopics: boolean;
};

export type UserLabel = {
  color: string;
  id: number;
  priority: number;
  text: string;
  username: string;
};

export type UserLabelsData = UserLabel[];

export type UsernameColor = {
  color: string;
  id: number;
  username: string;
};

export type UsernameColorsData = UsernameColor[];

export const storageValues = {
  [Data.EnabledFeatures]: createValue({
    deserialize: (input) => new Set(JSON.parse(input) as Feature[]),
    serialize: (input) => JSON.stringify(Array.from(input)),
    key: Data.EnabledFeatures,
    value: new Set([]),
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
  [Feature.UserLabels]: createValue({
    deserialize: (input) => JSON.parse(input) as UserLabelsData,
    serialize: (input) => JSON.stringify(Array.from(input)),
    key: Feature.UserLabels,
    value: [],
    storage: browser.storage.sync,
  }),
  [Feature.UsernameColors]: createValue({
    deserialize: (input) => JSON.parse(input) as UsernameColorsData,
    serialize: (input) => JSON.stringify(Array.from(input)),
    key: Feature.UsernameColors,
    value: [],
    storage: browser.storage.sync,
  }),
};

type StorageValues = typeof storageValues;

export async function fromStorage<K extends keyof StorageValues>(
  key: K,
): Promise<StorageValues[K]> {
  return storageValues[key];
}
