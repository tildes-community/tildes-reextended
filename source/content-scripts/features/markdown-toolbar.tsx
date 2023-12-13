import {type Value} from "@holllo/webextension-storage";
import {render} from "preact";
import {log, querySelectorAll} from "../../utilities/exports.js";
import {
  type MarkdownSnippet,
  type ProcessedSnippetShortcut,
  MarkdownSnippetMarker,
  processSnippetShortcut,
} from "../../storage/exports.js";

/** Type shorthand for a snippet with its processed shortcut. */
type ProcessedSnippetTuple = [Value<MarkdownSnippet>, ProcessedSnippetShortcut];

export function runMarkdownToolbarFeature(
  snippets: Array<Value<MarkdownSnippet>>,
) {
  const count = addToolbarsToTextareas(snippets);
  if (count > 0) {
    // Process all the snippet shortcuts outside of the keydown handler so we
    // don't have to process them on every keydown event.
    const snippetsWithProcessedShortcuts: ProcessedSnippetTuple[] = snippets
      // Exclude snippets that don't have shortcuts defined.
      .filter((snippet) => snippet.value.shortcut !== undefined)
      // Map the result as a tuple of the snippet and the processed shortcut.
      .map(
        (snippet) =>
          [
            snippet,
            processSnippetShortcut(snippet.value.shortcut!),
          ] satisfies ProcessedSnippetTuple,
      );

    // Only add the keydown listener if it hasn't already been added and if
    // there are any snippets with shortcuts to listen for.
    if (
      !document.body.dataset.trxMarkdownToolbarKeydownListening &&
      snippetsWithProcessedShortcuts.length > 0
    ) {
      document.addEventListener("keydown", async (event: KeyboardEvent) => {
        await keyDownHandler(event, snippetsWithProcessedShortcuts);
      });

      document.body.dataset.trxMarkdownToolbarKeydownListening = "true";
      log("Markdown Toolbar: Listening for keyboard shortcuts.");
    }

    log(`Markdown Toolbar: Initialized for ${count} textareas.`);
  }
}

function addToolbarsToTextareas(
  snippets: Array<Value<MarkdownSnippet>>,
): number {
  // Grab all Markdown forms that don't have already have a toolbar.
  const markdownForms = querySelectorAll(".form-markdown:not(.trx-toolbar)");
  if (markdownForms.length === 0) {
    return 0;
  }

  for (const form of markdownForms) {
    // Add `trx-toolbar` to indicate this Markdown form already has the toolbar.
    form.classList.add("trx-toolbar");

    const menu = form.querySelector<HTMLElement>(".tab-markdown-mode")!;
    const textarea = form.querySelector<HTMLTextAreaElement>(
      'textarea[name="markdown"]',
    )!;

    const snippetButtons = snippets
      .filter((snippet) => !snippet.value.inDropdown)
      .map((snippet) => (
        <SnippetButton
          allSnippets={snippets}
          snippet={snippet}
          textarea={textarea}
        />
      ));

    const noDropdownSnippets = snippets.length === snippetButtons.length;

    // Render the buttons inside the tab menu so they appear
    // next to the Edit and Preview buttons.
    const menuPlaceholder = document.createElement("div");
    menu.append(menuPlaceholder);
    render(snippetButtons, menu, menuPlaceholder);

    if (!noDropdownSnippets) {
      // And render the dropdown directly after the menu.
      const dropdownPlaceholder = document.createElement("div");
      const menuParent = menu.parentElement!;
      menu.after(dropdownPlaceholder);
      render(
        <>
          <SnippetDropdown allSnippets={snippets} textarea={textarea} />
        </>,
        menuParent,
        dropdownPlaceholder,
      );
    }
  }

  return markdownForms.length;
}

type Props = {
  allSnippets: Array<Value<MarkdownSnippet>>;
  snippet?: Value<MarkdownSnippet>;
  textarea: HTMLTextAreaElement;
};

function SnippetButton(props: Required<Props>) {
  const click = (event: MouseEvent) => {
    event.preventDefault();
    insertSnippet(props);
  };

  return (
    <li class="tab-item">
      <button class="btn btn-link" onClick={click}>
        {props.snippet.value.name}
      </button>
    </li>
  );
}

function SnippetDropdown(props: Props) {
  const snippets = props.allSnippets;
  const options = snippets
    ?.filter((snippet) => snippet.value.inDropdown)
    .map((snippet) => (
      <option value={snippet.value.name}>{snippet.value.name}</option>
    ));

  if (options.length === 0) {
    return null;
  }

  const change = (event: Event) => {
    event.preventDefault();

    const snippet = snippets.find(
      (value) => value.value.name === (event.target as HTMLSelectElement).value,
    )!;

    insertSnippet({
      ...props,
      snippet,
    });

    (event.target as HTMLSelectElement).selectedIndex = 0;
  };

  return (
    <select class="form-select" onChange={change}>
      <option>More…</option>
      {options}
    </select>
  );
}

function insertSnippet(props: Omit<Required<Props>, "allSnippets">) {
  const {textarea, snippet} = props;
  const {selectionStart, selectionEnd} = textarea;

  // Since you have to press a button or go into a dropdown to click on a
  // snippet, the textarea won't be focused anymore. So focus it again.
  textarea.focus();

  let {markdown} = snippet.value;

  // Get the marker positions and remove them from the snippet.
  let cursorIndex = markdown.indexOf(MarkdownSnippetMarker.Cursor);
  markdown = markdown.replace(MarkdownSnippetMarker.Cursor, "");
  const selectedCursorIndex = markdown.indexOf(
    MarkdownSnippetMarker.SelectedCursor,
  );
  markdown = markdown.replace(MarkdownSnippetMarker.SelectedCursor, "");

  // If we have a Cursor and SelectedCursor in the snippet, and the Cursor is
  // placed after the SelectedCursor we have to account for the marker string
  // length.
  // We don't have to do it in reverse because the Cursor index is taken first
  // and the marker string for that is removed before the SelectedCursor index
  // is taken.
  if (
    cursorIndex !== -1 &&
    selectedCursorIndex !== -1 &&
    cursorIndex > selectedCursorIndex
  ) {
    cursorIndex -= MarkdownSnippetMarker.SelectedCursor.length;
  }

  if (cursorIndex === -1) {
    cursorIndex = 0;
  }

  let cursorPosition = cursorIndex;
  const snippetLength = markdown.length;

  // If any text has been selected, include it.
  if (selectionStart !== selectionEnd) {
    markdown =
      markdown.slice(0, cursorIndex) +
      textarea.value.slice(selectionStart, selectionEnd) +
      markdown.slice(cursorIndex);

    cursorPosition =
      selectedCursorIndex === -1 ? cursorIndex : selectedCursorIndex;
  }

  textarea.value =
    textarea.value.slice(0, selectionStart) +
    markdown +
    textarea.value.slice(selectionEnd);

  if (cursorPosition === 0) {
    // If no <cursor> marker was used in the snippet, then put the cursor at the
    // end of the snippet.
    cursorPosition = snippetLength;
  }

  textarea.selectionEnd = selectionEnd + cursorPosition;
}

/**
 * The global handler for the `keydown` event.
 *
 * Keydown is chosen over keypress or keyup because it can be used to prevent
 * the browser's keyboard shortcuts using `event.preventDefault()`.
 */
async function keyDownHandler(
  event: KeyboardEvent,
  snippets: ProcessedSnippetTuple[],
): Promise<void> {
  const textarea = event.target;

  // Markdown toolbars are only ever added for `<textarea>` elements, if the
  // user is typing in a different input field we don't want to check for
  // anything.
  if (!(textarea instanceof HTMLTextAreaElement)) {
    return;
  }

  const [key, alt, ctrl, shift] = [
    event.key.toLowerCase(),
    event.altKey,
    event.ctrlKey,
    event.shiftKey,
  ];

  for (const [snippet, shortcut] of snippets) {
    if (
      shortcut.key === key &&
      shortcut.alt === alt &&
      shortcut.ctrl === ctrl &&
      shortcut.shift === shift
    ) {
      // Prevent browser keyboard shortcuts like `CTRL+S` from triggering.
      event.preventDefault();

      insertSnippet({
        snippet,
        textarea,
      });
      break;
    }
  }
}
