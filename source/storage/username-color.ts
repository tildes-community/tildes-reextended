import {type Value, createValue} from "@holllo/webextension-storage";
import browser from "webextension-polyfill";
import {Feature} from "./enums.js";

export type UsernameColor = {
  color: string;
  id: number;
  username: string;
};

export type UsernameColorsData = Array<Value<UsernameColor>>;

/**
 * Create a {@link Value}-wrapped {@link UsernameColor}.
 */
export async function createValueUsernamecolor(
  usernameColor: UsernameColor,
): Promise<UsernameColorsData[number]> {
  return createValue<UsernameColor>({
    deserialize: (input) => JSON.parse(input) as UsernameColor,
    serialize: (input) => JSON.stringify(input),
    key: `${Feature.UsernameColors}-${usernameColor.id}`,
    value: usernameColor,
    storage: browser.storage.sync,
  });
}

/**
 * Get all username colors from storage and combine them into a single array.
 */
export async function collectUsernameColors(): Promise<UsernameColorsData> {
  const storage = await browser.storage.sync.get();
  const userLabels = [];
  for (const [key, value] of Object.entries(storage)) {
    if (!key.startsWith(Feature.UsernameColors)) {
      continue;
    }

    userLabels.push(
      await createValueUsernamecolor(
        JSON.parse(value as string) as UsernameColor,
      ),
    );
  }

  return userLabels;
}

/**
 * Save all username colors to storage under individual keys.
 */
export async function saveUsernameColors(
  usernameColors: UsernameColorsData,
): Promise<void> {
  for (const usernameColor of usernameColors) {
    await usernameColor.save();
  }
}
