import {html} from 'htm/preact';
import {render} from 'preact';

import {log, querySelectorAll} from '../utilities/exports.js';

type MarkdownSnippet = {
  dropdown: boolean;
  index: number;
  markdown: string;
  name: string;
};

const snippets: MarkdownSnippet[] = [
  {
    dropdown: false,
    markdown: '[<>]()',
    name: 'Link',
  },
  {
    dropdown: false,
    markdown: '```\n<>\n```',
    name: 'Code',
  },
  {
    dropdown: false,
    markdown: '~~<>~~',
    name: 'Strikethrough',
  },
  {
    dropdown: false,
    markdown:
      '<details>\n<summary>Click to expand spoiler.</summary>\n\n<>\n</details>',
    name: 'Spoilerbox',
  },
  {
    dropdown: true,
    markdown: '**<>**',
    name: 'Bold',
  },
  {
    dropdown: true,
    markdown: '\n\n---\n\n<>',
    name: 'Horizontal Divider',
  },
  {
    dropdown: true,
    markdown: '`<>`',
    name: 'Inline Code',
  },
  {
    dropdown: true,
    markdown: '*<>*',
    name: 'Italic',
  },
  {
    dropdown: true,
    markdown: '1. <>',
    name: 'Ordered List',
  },
  {
    dropdown: true,
    markdown: '<small><></small>',
    name: 'Small',
  },
  {
    dropdown: true,
    markdown: '* <>',
    name: 'Unordered List',
  },
].map(({dropdown, markdown, name}) => ({
  dropdown,
  name,
  index: markdown.indexOf('<>'),
  markdown: markdown.replace(/<>/, ''),
}));

export function runMarkdownToolbarFeature() {
  const count = addToolbarsToTextareas();
  log(`Markdown Toolbar: Initialized for ${count} textareas.`);
}

function addToolbarsToTextareas(): number {
  // Grab all Markdown forms that don't have already have a toolbar.
  const markdownForms = querySelectorAll('.form-markdown:not(.trx-toolbar)');
  if (markdownForms.length === 0) {
    return 0;
  }

  for (const form of markdownForms) {
    // Add `trx-toolbar` to indicate this Markdown form already has the toolbar.
    form.classList.add('trx-toolbar');

    const menu = form.querySelector<HTMLElement>('.tab-markdown-mode')!;
    const textarea = form.querySelector<HTMLElement>(
      'textarea[name="markdown"]',
    )!;

    const snippetButtons = snippets
      .filter((snippet) => !snippet.dropdown)
      .map(
        (snippet) =>
          html`<${snippetButton} snippet=${snippet} textarea=${textarea} />`,
      );

    // Render the buttons inside the tab menu so they appear
    // next to the Edit and Preview buttons.
    const menuPlaceholder = document.createElement('div');
    menu.append(menuPlaceholder);
    render(snippetButtons, menu, menuPlaceholder);

    // And render the dropdown directly after the menu.
    const dropdownPlaceholder = document.createElement('div');
    const menuParent = menu.parentElement!;
    menu.after(dropdownPlaceholder);
    render(
      html`<${snippetDropdown} textarea=${textarea} />`,
      menuParent,
      dropdownPlaceholder,
    );
  }

  return markdownForms.length;
}

type Props = {
  snippet?: MarkdownSnippet;
  textarea: HTMLTextAreaElement;
};

function snippetButton(props: Required<Props>): TRXComponent {
  const click = (event: MouseEvent) => {
    event.preventDefault();
    insertSnippet(props);
  };

  return html`
    <li class="tab-item">
      <button class="btn btn-link" onClick="${click}">
        ${props.snippet.name}
      </button>
    </li>
  `;
}

function snippetDropdown(props: Props): TRXComponent {
  const options = snippets.map(
    (snippet) => html`<option value="${snippet.name}">${snippet.name}</option>`,
  );

  const change = (event: Event) => {
    event.preventDefault();

    const snippet = snippets.find(
      (value) => value.name === (event.target as HTMLSelectElement).value,
    )!;

    insertSnippet({
      ...props,
      snippet,
    });

    (event.target as HTMLSelectElement).selectedIndex = 0;
  };

  return html`
    <select class="form-select" onChange=${change}>
      <option>More…</option>
      ${options}
    </select>
  `;
}

function insertSnippet(props: Required<Props>) {
  const {textarea, snippet} = props;
  const {selectionStart, selectionEnd} = textarea;

  // Since you have to press a button or go into a dropdown to click on a
  // snippet, the textarea won't be focused anymore. So focus it again.
  textarea.focus();

  let {index, markdown} = snippet;

  // If any text has been selected, include it.
  if (selectionStart !== selectionEnd) {
    markdown =
      markdown.slice(0, index) +
      textarea.value.slice(selectionStart, selectionEnd) +
      markdown.slice(index);

    // Change the index when the Link snippet is used so the cursor ends up
    // in the URL part of the Markdown: "[existing text](cursor here)".
    if (snippet.name === 'Link') {
      index += 2;
    }
  }

  textarea.value =
    textarea.value.slice(0, selectionStart) +
    markdown +
    textarea.value.slice(selectionEnd);

  textarea.selectionEnd = selectionEnd + index;
}
