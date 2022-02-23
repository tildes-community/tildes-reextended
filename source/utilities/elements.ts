/**
 * Creates an HTML Element from a given string. Only use this when using
 * `htm/preact` isn't practical.
 */
export function createElementFromString<T extends Element>(input: string): T {
  const template = document.createElement('template');
  template.innerHTML = input.trim();
  return template.content.firstElementChild as T;
}
