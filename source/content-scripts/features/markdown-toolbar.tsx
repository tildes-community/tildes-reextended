import {type Value} from "@holllo/webextension-storage";
import {render} from "preact";
import {log, querySelectorAll} from "../../utilities/exports.js";
import {
  type MarkdownSnippet,
  MarkdownSnippetMarker,
} from "../../storage/exports.js";

export function runMarkdownToolbarFeature(
  snippets: Array<Value<MarkdownSnippet>>,
) {
  const count = addToolbarsToTextareas(snippets);
  log(`Markdown Toolbar: Initialized for ${count} textareas.`);
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

function insertSnippet(props: Required<Props>) {
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

  let cursorPosition = cursorIndex;

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

  textarea.selectionEnd = selectionEnd + cursorPosition;
}
