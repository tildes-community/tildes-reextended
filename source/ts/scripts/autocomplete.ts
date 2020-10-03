import {offset, Offset} from 'caret-pos';
import {
  Settings,
  getSettings,
  createElementFromString,
  extractAndSaveGroups
} from '../utilities';

const knownGroups: Set<string> = new Set();
const knownUsers: Set<string> = new Set();

(async (): Promise<void> => {
  let settings: Settings = await getSettings();
  if (!settings.features.autocomplete) {
    return;
  }

  try {
    settings = await extractAndSaveGroups(settings);
  } catch {
    // This will intentionally error when we're not in "/groups".
  }

  for (const group of settings.data.knownGroups) {
    if (group.startsWith('~')) {
      knownGroups.add(group.slice(1));
    } else {
      knownGroups.add(group);
    }
  }

  // Add usernames from all linked users on the page.
  const userLinks = document.querySelectorAll('.link-user');
  for (const link of userLinks) {
    const username: string = link.textContent!.replace(/@/g, '').toLowerCase();
    knownUsers.add(username);
  }

  // Add usernames we have saved in the user labels.
  for (const label of settings.data.userLabels) {
    knownUsers.add(label.username);
  }

  document.addEventListener('keydown', globalInputHandler);
})();

function globalInputHandler(event: KeyboardEvent) {
  const activeElement: HTMLElement = document.activeElement as HTMLElement;
  // Only add the autocompletes to textareas.
  if (activeElement.tagName !== 'TEXTAREA') {
    return;
  }

  // If a ~ is entered in a textarea and that textarea doesn't already have
  // the group input handler running, add it.
  if (
    event.key === '~' &&
    !activeElement.getAttribute('data-trx-autocomplete-group')
  ) {
    activeElement.setAttribute('data-trx-autocomplete-group', 'true');

    // Sort the groups alphabetically.
    const groups: string[] = [...knownGroups];
    groups.sort((a, b) => a.localeCompare(b));

    if (!document.querySelector('#trx-autocomplete-group-form')) {
      const form: HTMLFormElement = createOrGetAutocompleteForm(
        'group',
        groups
      );
      document.body.append(form);
    }

    textareaInputHandler(event, '~', 'group', groups);
    activeElement.addEventListener('keyup', (event) =>
      textareaInputHandler(event, '~', 'group', groups)
    );
  }

  // If an @ is entered in a textarea and that textarea doesn't already have
  // the user input handler running, add it.
  if (
    event.key === '@' &&
    !activeElement.getAttribute('data-trx-autocomplete-user')
  ) {
    activeElement.setAttribute('data-trx-autocomplete-user', 'true');

    // Sort the usernames alphabetically.
    const users: string[] = [...knownUsers];
    users.sort((a, b) => a.localeCompare(b));

    if (!document.querySelector('#trx-autocomplete-user-form')) {
      const form: HTMLFormElement = createOrGetAutocompleteForm('user', users);
      document.body.append(form);
    }

    textareaInputHandler(event, '@', 'user', users);
    activeElement.addEventListener('keyup', (event) =>
      textareaInputHandler(event, '@', 'user', users)
    );
  }
}

function textareaInputHandler(
  event: KeyboardEvent,
  prefix: string,
  id: string,
  values: string[]
) {
  const textarea: HTMLTextAreaElement = event.target as HTMLTextAreaElement;
  const text: string = textarea.value;

  // If the prefix isn't in the textarea, return early.
  if (!text.includes(prefix)) {
    hideAutocompleteForm(id);
    return;
  }

  // Grab the starting position of the caret (text cursor).
  const position: number = textarea.selectionStart;

  // Grab the last index of the prefix inside the beginning of the textarea and
  // the starting position of the caret. Basically doing a reversed index of.
  const prefixIndex: number = text.slice(0, position).lastIndexOf(prefix);

  // Grab the input between the prefix and the caret position, which will be
  // what the user is currently typing.
  const input = text.slice(prefixIndex + prefix.length, position);

  // If there is any whitespace in the input or there is no input at all, return
  // early.
  if (/\s/.exec(input) || input === '') {
    hideAutocompleteForm(id);
    return;
  }

  // Find all the values that match the input.
  const matches: string[] = [];
  for (const value of values) {
    if (value.includes(input.toLocaleLowerCase())) {
      matches.push(value);
    }
  }

  // If there are no matches, return early.
  if (matches.length === 0) {
    hideAutocompleteForm(id);
    return;
  }

  // If the autocomplete form is hidden, unhide it.
  if (document.querySelector(`#trx-autocomplete-${id}-form.trx-hidden`)) {
    showAutocompleteForm(id, offset(textarea));
  }

  // And finally update the values in the autocomplete form.
  updateAutocompleteFormValues(id, matches);
}

function createOrGetAutocompleteForm(
  id: string,
  values: string[]
): HTMLFormElement {
  const existing: Element | null = document.querySelector(
    `#trx-autocomplete-${id}-form`
  );
  if (existing !== null) {
    return existing as HTMLFormElement;
  }

  const options: string[] = [];
  for (const value of values) {
    options.push(`<li>${value}</li>`);
  }

  const autocompleteFormTemplate = `<form id="trx-autocomplete-${id}-form"
class="trx-autocomplete-form trx-hidden">
<ul>${options.join('\n')}</ul>
</form>`;
  const form: HTMLFormElement = createElementFromString(
    autocompleteFormTemplate
  );

  return form;
}

function hideAutocompleteForm(id: string): HTMLFormElement {
  const form: HTMLFormElement = createOrGetAutocompleteForm(id, []);
  form.classList.add('trx-hidden');
  return form;
}

function showAutocompleteForm(id: string, offset: Offset): HTMLFormElement {
  const form: HTMLFormElement = createOrGetAutocompleteForm(id, []);
  form.classList.remove('trx-hidden');

  form.setAttribute(
    'style',
    `left: ${offset.left}px; top: ${offset.top + offset.height}px;`
  );
  return form;
}

function updateAutocompleteFormValues(
  id: string,
  values: string[]
): HTMLFormElement {
  const form: HTMLFormElement = createOrGetAutocompleteForm(id, []);
  form.firstElementChild!.remove();

  const options: string[] = [];
  for (const value of values) {
    options.push(`<li>${value}</li>`);
  }

  const list: HTMLUListElement = createElementFromString(
    `<ul>${options.join('\n')}</ul>`
  );

  form.append(list);
  return form;
}
