// These utility functions mainly exist so it's easier to work with TypeScript's
// typing and so we don't have to write `document.query...` all the time.

// The first function should only ever be used when we know for certain that
// the target element is going to exist.

/**
 * Returns the first element found that matches the selector.
 * @param selector The selector.
 */
export function querySelector<T extends Element>(selector: string): T {
  return document.querySelector<T>(selector)!;
}

/**
 * Returns all elements found from all the selectors.
 * @param selectors The selectors.
 */
export function querySelectorAll<T extends Element>(
  ...selectors: string[]
): T[] {
  return selectors.flatMap((selector) =>
    Array.from(document.querySelectorAll(selector))
  );
}
