import browser from "webextension-polyfill";
import {createValue, type Value} from "@holllo/webextension-storage";
import {Feature} from "./enums.js";

/**
 * The different matchers for {@link HideTopicPredicate}.
 */
export enum HideTopicMatcher {
  DomainIncludes = "domain-includes",
  TildesUsernameEquals = "tildes-username-equals",
  TitleIncludes = "title-includes",
  UserLabelEquals = "user-label-equals",
}

/**
 * Type guard check to see if a string is a valid {@link HideTopicMatcher}.
 * @param input The string to check.
 */
export function isHideTopicMatcher(input: string): input is HideTopicMatcher {
  return Object.values(HideTopicMatcher).includes(input as HideTopicMatcher);
}

/**
 * The predicate for whether a topic should be hidden or not.
 */
export type HideTopicPredicate = {
  id: number;
  matcher: HideTopicMatcher;
  value: string;
};

/**
 * Shorthand for an array of {@link Value}-wrapped {@link HideTopicPredicate}s.
 */
export type HideTopicsData = Array<Value<HideTopicPredicate>>;

/**
 * Create a {@link Value}-wrapped {@link HideTopicPredicate}.
 */
export async function createValueHideTopicPredicate(
  predicate: HideTopicPredicate,
): Promise<HideTopicsData[number]> {
  return createValue<HideTopicPredicate>({
    deserialize: (input) => JSON.parse(input) as HideTopicPredicate,
    serialize: (input) => JSON.stringify(input),
    key: `${Feature.HideTopics}-${predicate.id}`,
    value: predicate,
    storage: browser.storage.sync,
  });
}

/**
 * Get all hide topic predicates from storage and combine them into a single
 * array.
 */
export async function collectHideTopicsData(): Promise<HideTopicsData> {
  const storage = await browser.storage.sync.get();
  const predicates = [];
  for (const [key, value] of Object.entries(storage)) {
    if (!key.startsWith(Feature.HideTopics)) {
      continue;
    }

    predicates.push(
      await createValueHideTopicPredicate(
        JSON.parse(value as string) as HideTopicPredicate,
      ),
    );
  }

  return predicates;
}
