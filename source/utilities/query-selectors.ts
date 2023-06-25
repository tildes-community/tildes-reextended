// These utility functions mainly exist so it's easier to work with TypeScript's
// typing and so we don't have to write `document.query...` all the time.

/**
 * Get the first element found that matches the selector. Only use this when you
 * know for certain that the target element exists.
 */
export function querySelector<T extends Element>(selector: string): T {
  return document.querySelector(selector)!;
}

/**
 * Get all elements found from all the given selectors.
 */
export function querySelectorAll<T extends Element>(
  ...selectors: string[]
): T[] {
  return selectors.flatMap((selector) =>
    Array.from(document.querySelectorAll(selector)),
  );
}
