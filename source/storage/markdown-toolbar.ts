import browser from "webextension-polyfill";
import {createValue, type Value} from "@holllo/webextension-storage";
import {Data} from "./enums.js";

/**
 * Definition of a Markdown snippet to be used with the Markdown Toolbar feature.
 */
export type MarkdownSnippet = {
  /** Whether the snippet is enabled and should show in the toolbar. */
  enabled: boolean;

  /** A unique identifier for the snippet. */
  id: number;

  /** Whether the snippet should be placed in the "More..." dropdown. */
  inDropdown: boolean;

  /** The Markdown content of the snippet. */
  markdown: string;

  /** The name of the snippet to be shown in the toolbar. */
  name: string;

  /** The position of the snippet in the toolbar. */
  position: number;

  /** The keyboard shortcut for this snippet. */
  shortcut?: string;
};

/**
 * Markers used to specify where the cursor should be placed after the snippet
 * is inserted.
 */
export enum MarkdownSnippetMarker {
  /**
   * The marker for the default position the cursor should be placed at.
   */
  Cursor = "<cursor>",

  /**
   * If text was selected before the snippet was inserted, the cursor will first
   * attempt to be placed at the `SelectedCursor` position, if there is no
   * `SelectedCursor` in the snippet then `Cursor` is used instead. The selected
   * text will be inserted at the `Cursor` position.
   */
  SelectedCursor = "<selected-cursor>",
}

/* eslint-disable-next-line @typescript-eslint/naming-convention */
const {Cursor, SelectedCursor} = MarkdownSnippetMarker;

export const builtinSnippets: MarkdownSnippet[] = [
  {
    enabled: true,
    inDropdown: false,
    markdown: `[${Cursor}](${SelectedCursor})`,
    name: "Link",
  },
  {
    enabled: true,
    inDropdown: false,
    markdown: `\`\`\`${SelectedCursor}\n${Cursor}\n\`\`\``,
    name: "Code",
  },
  {
    enabled: true,
    inDropdown: false,
    markdown: `~~${Cursor}~~`,
    name: "Strikethrough",
  },
  {
    enabled: true,
    inDropdown: false,
    markdown: `<details>\n<summary>Click to expand spoiler.</summary>\n\n${Cursor}\n</details>`,
    name: "Spoilerbox",
  },
  {
    enabled: true,
    inDropdown: true,
    markdown: `**${Cursor}**`,
    name: "Bold",
  },
  {
    enabled: true,
    inDropdown: true,
    markdown: `\n\n---\n\n${Cursor}`,
    name: "Horizontal Divider",
  },
  {
    enabled: true,
    inDropdown: true,
    markdown: `\`${Cursor}\``,
    name: "Inline Code",
  },
  {
    enabled: true,
    inDropdown: true,
    markdown: `*${Cursor}*`,
    name: "Italic",
  },
  {
    enabled: true,
    inDropdown: true,
    markdown: `1. ${Cursor}`,
    name: "Ordered List",
  },
  {
    enabled: true,
    inDropdown: true,
    markdown: `<small>${Cursor}</small>`,
    name: "Small",
  },
  {
    enabled: true,
    inDropdown: true,
    markdown: `* ${Cursor}`,
    name: "Unordered List",
  },
].map((snippet, index) => {
  return {
    ...snippet,
    // Make the builtin snippets use a negative ID so there will never be a
    // conflict with user-created snippets if for some reason they need to be
    // reinserted into storage.
    id: index - 100,
    position: index + 1,
  } satisfies MarkdownSnippet;
});

/**
 * Create a {@link Value}-wrapped {@link MarkdownSnippet}.
 */
export async function createValueMarkdownSnippet(
  snippet: MarkdownSnippet,
): Promise<Value<MarkdownSnippet>> {
  return createValue<MarkdownSnippet>({
    deserialize: (input) => JSON.parse(input) as MarkdownSnippet,
    serialize: (input) => JSON.stringify(input),
    key: `${Data.MarkdownSnippet}-${snippet.id}`,
    value: snippet,
    storage: browser.storage.sync,
  });
}

/**
 * Get all Markdown snippets from storage and combine them into a single array.
 */
export async function collectMarkdownSnippets(): Promise<
  Array<Value<MarkdownSnippet>>
> {
  const storage = await browser.storage.sync.get();
  const snippets: Array<Value<MarkdownSnippet>> = [];
  for (const [key, value] of Object.entries(storage)) {
    if (!key.startsWith(Data.MarkdownSnippet)) {
      continue;
    }

    snippets.push(
      await createValueMarkdownSnippet(
        JSON.parse(value as string) as MarkdownSnippet,
      ),
    );
  }

  if (snippets.length === 0) {
    // If no snippets are in storage, grab all the builtin ones and save them.
    snippets.push(
      ...(await Promise.all(
        builtinSnippets.map(async (snippet) =>
          createValueMarkdownSnippet(snippet),
        ),
      )),
    );

    for (const snippet of snippets) {
      await snippet.save();
    }
  }

  return sortSnippets(snippets);
}

/**
 * Create a new Markdown snippet ID by getting the current highest existing ID
 * in storage and adding 1 to it. Defaults to 1 when no there are no existing
 * snippets.
 */
export async function newMarkdownSnippetId(): Promise<number> {
  const snippets = await collectMarkdownSnippets();
  let newId = 1;
  if (snippets.length > 0) {
    newId = snippets.sort((a, b) => b.value.id - a.value.id)[0].value.id + 1;
  }

  // Builtin snippets will have a negative ID so reset back to 1 if only builtin
  // snippets are in storage.
  if (newId < 0) {
    newId = 1;
  }

  return newId;
}

/**
 * Sort the snippets by their position first and their name second.
 */
export function sortSnippets(
  snippets: Array<Value<MarkdownSnippet>>,
): Array<Value<MarkdownSnippet>> {
  return snippets.sort((a, b) => {
    const position = a.value.position - b.value.position;
    if (position === 0) {
      return a.value.name.localeCompare(b.value.name);
    }

    return position;
  });
}

/** A processed {@linkcode MarkdownSnippet} shortcut string. */
export type ProcessedSnippetShortcut = {
  /** Whether the ALT key is required for this shortcut. */
  alt: boolean;

  /** Whether the CTRL key is required for this shortcut. */
  ctrl: boolean;

  /** Whether the SHIFT key is required for this shortcut. */
  shift: boolean;

  /** The main key to trigger the shortcut. */
  key: string;
};

/**
 * Process a {@linkcode MarkdownSnippet} shortcut string.
 *
 * The expected structure of a shortcut string is modifier keys in any order
 * separated by a `+` and the main key on the end. For example `ALT+CTRL+B` is
 * valid but `ALT+B+CTRL` is not. The casing of the letters is not relevant.
 *
 * This function performs no validation on the string and simply returns any
 * input as-is. In the `ALT+B+CTRL` example, `CTRL` is what would be returned as
 * the main key.
 */
export function processSnippetShortcut(
  shortcut: string,
): ProcessedSnippetShortcut {
  const components = shortcut.toLowerCase().split("+");

  return {
    alt: components.includes("alt"),
    ctrl: components.includes("ctrl"),
    shift: components.includes("shift"),
    key: components[components.length - 1].toLowerCase(),
  } satisfies ProcessedSnippetShortcut;
}
