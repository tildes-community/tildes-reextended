import {createValue, type Value} from "@holllo/webextension-storage";
import browser from "webextension-polyfill";

export enum Feature {
  AnonymizeUsernames = "anonymize-usernames",
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
  Version = "data-version",
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

export type UserLabelsData = Array<Value<UserLabel>>;

export type UsernameColor = {
  color: string;
  id: number;
  username: string;
};

export type UsernameColorsData = UsernameColor[];

/**
 * Create a {@link Value}-wrapped {@link UserLabel}.
 */
export async function createValueUserLabel(
  userLabel: UserLabel,
): Promise<UserLabelsData[number]> {
  return createValue<UserLabel>({
    deserialize: (input) => JSON.parse(input) as UserLabel,
    serialize: (input) => JSON.stringify(input),
    key: `${Feature.UserLabels}-${userLabel.id}`,
    value: userLabel,
    storage: browser.storage.sync,
  });
}

/**
 * Get all user labels from storage and combine them into a single array.
 */
export async function collectUserLabels(): Promise<UserLabelsData> {
  const storage = await browser.storage.sync.get();
  const userLabels = [];
  for (const [key, value] of Object.entries(storage)) {
    if (!key.startsWith(Feature.UserLabels)) {
      continue;
    }

    userLabels.push(
      await createValueUserLabel(JSON.parse(value as string) as UserLabel),
    );
  }

  return userLabels;
}

/**
 * Save all user labels to storage under individual keys.
 *
 * They are stored under individual keys so that we don't run into storage quota
 * limits. If it was stored under a single key we would only be able to fit
 * around 80-100 labels before hitting the limit.
 * @param userLabels The user labels array to save.
 */
export async function saveUserLabels(
  userLabels: UserLabelsData,
): Promise<void> {
  for (const label of userLabels) {
    await label.save();
  }
}

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
  // eslint-disable-next-line unicorn/prefer-top-level-await
  [Feature.UserLabels]: collectUserLabels(),
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
