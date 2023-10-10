import {createValue, type Value} from "@holllo/webextension-storage";
import browser from "webextension-polyfill";
import {Feature} from "./enums.js";

/**
 * The data structure for a user label.
 */
export type UserLabel = {
  color: string;
  id: number;
  priority: number;
  text: string;
  username: string;
};

/**
 * Shorthand for an array of {@link Value}-wrapped {@link UserLabel}s.
 */
export type UserLabelsData = Array<Value<UserLabel>>;

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

export async function newUserLabelId(): Promise<number> {
  const userLabels = await collectUserLabels();
  let newId = 1;
  if (userLabels.length > 0) {
    newId = userLabels.sort((a, b) => b.value.id - a.value.id)[0].value.id + 1;
  }

  return newId;
}
