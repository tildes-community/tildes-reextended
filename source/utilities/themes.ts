/**
 * Try to extract the list of themes from a theme selector on the page. This
 * will return undefined when no theme selector is available. The returned array
 * will be tuples where the first item is the theme value from the `<option>`
 * element and the second item being the theme display name.
 */
export function extractThemes(): Array<[string, string]> | undefined {
  const themes = document.querySelectorAll<HTMLOptionElement>(
    "select#theme option",
  );
  if (themes.length === 0) {
    return;
  }

  return Array.from(themes).map((theme) => [
    theme.value,
    (theme.textContent ?? "<unknown>").trim(),
  ]);
}

/**
 * Set the theme class on the `<body>` element and remove any other existing
 * theme classes.
 */
export function setBodyThemeClass(theme: string): void {
  for (const value of Array.from(document.body.classList)) {
    if (!value.startsWith("theme-")) {
      continue;
    }

    document.body.classList.remove(value);
  }

  document.body.classList.add(`theme-${theme}`);
}
