import {Settings, getSettings, createElementFromString} from '../utilities';

const markdownSnippets: MarkdownSnippet[] = [
  {
    dropdown: false,
    index: -1,
    markdown: '[$]()',
    name: 'Link'
  },
  {
    dropdown: false,
    index: -1,
    markdown: '```\n$\n```',
    name: 'Code'
  },
  {
    dropdown: false,
    index: -1,
    markdown: '~~$~~',
    name: 'Strikethrough'
  },
  {
    dropdown: false,
    index: -1,
    markdown:
      '<details>\n<summary>Click to expand spoiler.</summary>\n\n$\n</details>',
    name: 'Spoilerbox'
  },
  {
    dropdown: true,
    index: -1,
    markdown: '**$**',
    name: 'Bold'
  },
  {
    dropdown: true,
    index: -1,
    markdown: '\n\n---\n\n$',
    name: 'Horizontal Divider'
  },
  {
    dropdown: true,
    index: -1,
    markdown: '`$`',
    name: 'Inline Code'
  },
  {
    dropdown: true,
    index: -1,
    markdown: '*$*',
    name: 'Italic'
  },
  {
    dropdown: true,
    index: -1,
    markdown: '1. $',
    name: 'Ordered List'
  },
  {
    dropdown: true,
    index: -1,
    markdown: '<small>$</small>',
    name: 'Small'
  },
  {
    dropdown: true,
    index: -1,
    markdown: '* $',
    name: 'Unordered List'
  }
];

(async (): Promise<void> => {
  const settings: Settings = await getSettings();
  if (!settings.features.markdownToolbar) {
    return;
  }

  calculateSnippetIndexes();
  // Create an observer that will add toolbars whenever something changes.
  const observer: MutationObserver = new window.MutationObserver((): void => {
    observer.disconnect();
    addToolbarToTextareas();
    startObserver();
  });

  function startObserver(): void {
    observer.observe(document, {
      childList: true,
      subtree: true
    });
  }

  // Run once when the page loads.
  addToolbarToTextareas();
  startObserver();
})();

interface MarkdownSnippet {
  dropdown: boolean;
  index: number;
  markdown: string;
  name: string;
}

function addToolbarToTextareas(): void {
  // Grab all Markdown forms that don't have already have a toolbar (see below).
  const markdownForms: NodeListOf<HTMLDivElement> = document.querySelectorAll(
    '.form-markdown:not(.trx-toolbar)'
  );
  if (markdownForms.length === 0) {
    return;
  }

  for (const form of markdownForms) {
    // Add `trx-toolbar` to indicate this Markdown form already has the toolbar.
    form.classList.add('trx-toolbar');
    const tabMenu: HTMLMenuElement = form.querySelector(
      '.tab-markdown-mode'
    ) as HTMLMenuElement;
    const textarea: HTMLTextAreaElement = form.querySelector(
      'textarea[name="markdown"]'
    ) as HTMLTextAreaElement;
    const markdownSelect: HTMLSelectElement = createElementFromString(
      '<select class="form-select"><option>More…</option></select>'
    );
    for (const snippet of markdownSnippets) {
      // If the snippet should go in the dropdown, add the `<option>` for it.
      if (snippet.dropdown) {
        const snippetOption: HTMLOptionElement = createElementFromString(
          `<option value="${snippet.name}">${snippet.name}</option>`
        );
        markdownSelect.insertAdjacentElement('beforeend', snippetOption);
        continue;
      }

      // Otherwise, add it the tab menu as a tab item.
      const tabItem: HTMLLIElement = createElementFromString(
        `<li class="tab-item"><button class="btn btn-link">${snippet.name}</button></li>`
      );
      tabItem.addEventListener('click', (event: MouseEvent): void =>
        insertSnippet(snippet, textarea, event)
      );
      tabMenu.insertAdjacentElement('beforeend', tabItem);
    }

    // When the dropdown value changes, add the snippet.
    markdownSelect.addEventListener('change', (): void => {
      const snippet: MarkdownSnippet | undefined = markdownSnippets.find(
        val => val.name === markdownSelect.value
      );
      if (typeof snippet === 'undefined') {
        return;
      }

      insertSnippet(snippet, textarea);
      // Reset the dropdown index so it always displays "More..." and so it's
      // possible to select the same snippet multiple times.
      markdownSelect.selectedIndex = 0;
    });

    // Insert the dropdown after the tab menu.
    tabMenu.insertAdjacentElement('afterend', markdownSelect);
  }
}

function insertSnippet(
  snippet: MarkdownSnippet,
  textarea: HTMLTextAreaElement,
  event?: MouseEvent
): void {
  // If insertSnippet is called from a button it will pass through event.
  // So preventDefault() that when it's defined.
  if (typeof event !== 'undefined') {
    event.preventDefault();
  }

  // Since you have to press a button or go into a dropdown to click on a
  // snippet, the textarea won't be focused anymore. So focus it again.
  textarea.focus();
  const currentSelectionStart: number = textarea.selectionStart;
  const currentSelectionEnd: number = textarea.selectionEnd;
  let {markdown} = snippet;
  let snippetIndex: number = snippet.index;
  // If text has been selected, change the markdown so it includes what's
  // been selected.
  if (currentSelectionStart !== currentSelectionEnd) {
    markdown =
      snippet.markdown.slice(0, snippetIndex) +
      textarea.value.slice(currentSelectionStart, currentSelectionEnd) +
      snippet.markdown.slice(snippetIndex);

    // A special behavior for the Link snippet so it places the cursor in the
    // URL part of a Markdown link instead of the text part: "[](here)".
    if (snippet.name === 'Link') {
      snippetIndex += 2;
    }
  }

  textarea.value =
    textarea.value.slice(0, currentSelectionStart) +
    markdown +
    textarea.value.slice(currentSelectionEnd);
  textarea.selectionEnd = currentSelectionEnd + snippetIndex;
}

// This function gets called at the beginning of the script to set the snippet
// indexes where the dollar sign is and to remove the dollar sign from it.
// This could be manually done but I figure it's easier to write snippets and
// have a placeholder for where the cursor is intended to go than to count
// where the index is manually and figure it out yourself.
function calculateSnippetIndexes(): void {
  for (const snippet of markdownSnippets) {
    const insertIndex: number = snippet.markdown.indexOf('$');
    const newMarkdown: string = snippet.markdown.replace('$', '');
    snippet.index = insertIndex;
    snippet.markdown = newMarkdown;
  }
}
