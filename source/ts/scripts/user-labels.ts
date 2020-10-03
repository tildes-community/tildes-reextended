import {Except} from 'type-fest';
import debounce from 'debounce';
import {ColorKey, themeColors} from '../theme-colors';
import {
  getSettings,
  Settings,
  log,
  createElementFromString,
  UserLabel,
  isInTopicListing,
  getCSSCustomPropertyValue,
  isColorBright,
  setSettings,
  appendStyleAttribute,
  querySelector
} from '../utilities';
import {
  getLabelForm,
  getLabelFormValues,
  hideLabelForm,
  getLabelFormID
} from './user-labels/label-form';
import {
  editLabelHandler,
  addLabelHandler,
  labelTextInputHandler,
  presetColorSelectHandler,
  labelColorInputHandler
} from './user-labels/handlers';

(async (): Promise<void> => {
  const settings: Settings = await getSettings();
  if (!settings.features.userLabels) {
    return;
  }

  addLabelsToUsernames(settings);
  const existingLabelForm: HTMLElement | null = document.querySelector(
    '#trx-user-label-form'
  );
  if (existingLabelForm !== null) {
    existingLabelForm.remove();
  }

  const themeSelectOptions: string[] = [];
  for (const color in themeColors) {
    if (Object.hasOwnProperty.call(themeColors, color)) {
      const colorValue = getCSSCustomPropertyValue(
        themeColors[color as ColorKey]
      );
      themeSelectOptions.push(
        `<option value="${colorValue}">${color}</option>`
      );
    }
  }

  const labelFormTemplate = `<form id="trx-user-label-form" class="trx-hidden">
  <div>
    <label for="trx-user-label-form-username">Add New Label</label>
    <label for="trx-user-label-priority">Priority</label>
  </div>
  <div>
    <input type="text" id="trx-user-label-form-username" class="form-input" placeholder="Username">
    <input id="trx-user-label-priority" type="number" class="form-input" value="0">
  </div>
  <label>Pick A Color</label>
  <div id="trx-user-label-form-color">
    <input type="text" class="form-input" placeholder="Color">
    <select class="form-select">
      ${themeSelectOptions.join('\n')}
    </select>
  </div>
  <label>Label</label>
  <div id="trx-user-label-input">
    <input type="text" class="form-input" placeholder="Label">
    <div id="trx-user-label-preview">
      <p></p>
    </div>
  </div>
  <div id="trx-user-label-actions">
    <a id="trx-user-label-save" class="btn-post-action">Save</a>
    <a id="trx-user-label-close" class="btn-post-action">Close</a>
    <a id="trx-user-label-remove" class="btn-post-action">Remove</a>
  </div>
</form>`;
  const labelForm: HTMLFormElement = createElementFromString(labelFormTemplate);
  document.body.append(labelForm);
  labelForm.setAttribute(
    'style',
    `background-color: var(${themeColors.backgroundPrimary});` +
      `border-color: var(${themeColors.foregroundSecondary});`
  );

  const labelColorInput: HTMLInputElement = querySelector(
    '#trx-user-label-form-color > input'
  );
  labelColorInput.addEventListener(
    'keyup',
    debounce(labelColorInputHandler, 250)
  );

  const presetColorSelect: HTMLSelectElement = querySelector(
    '#trx-user-label-form-color > select'
  );
  presetColorSelect.addEventListener('change', presetColorSelectHandler);
  presetColorSelect.value = getCSSCustomPropertyValue(
    themeColors.backgroundSecondary
  );

  const labelTextInput: HTMLInputElement = querySelector(
    '#trx-user-label-input > input'
  );
  labelTextInput.addEventListener('keyup', labelTextInputHandler);

  const labelPreview: HTMLDivElement = querySelector('#trx-user-label-preview');
  labelPreview.setAttribute(
    'style',
    `background-color: var(${themeColors.backgroundPrimary});` +
      `border-color: var(${themeColors.foregroundSecondary});`
  );

  const formSaveButton: HTMLAnchorElement = querySelector(
    '#trx-user-label-save'
  );
  formSaveButton.addEventListener('click', saveUserLabel);

  const formCloseButton: HTMLAnchorElement = querySelector(
    '#trx-user-label-close'
  );
  formCloseButton.addEventListener('click', hideLabelForm);

  const formRemoveButton: HTMLAnchorElement = querySelector(
    '#trx-user-label-remove'
  );
  formRemoveButton.addEventListener('click', removeUserLabel);

  const commentObserver = new window.MutationObserver(
    async (mutations: MutationRecord[]): Promise<void> => {
      const commentElements: HTMLElement[] = mutations
        .map((value) => value.target as HTMLElement)
        .filter(
          (value) =>
            value.classList.contains('comment-itself') ||
            value.classList.contains('comment')
        );
      if (commentElements.length === 0) {
        return;
      }

      commentObserver.disconnect();
      addLabelsToUsernames(await getSettings());
      startObserver();
    }
  );

  function startObserver(): void {
    const topicComments: HTMLElement | null = document.querySelector(
      '.topic-comments'
    );
    if (topicComments !== null) {
      commentObserver.observe(topicComments, {
        childList: true,
        subtree: true
      });
      return;
    }

    const postListing: HTMLElement | null = document.querySelector(
      '.post-listing'
    );
    if (postListing !== null) {
      commentObserver.observe(postListing, {
        childList: true,
        subtree: true
      });
    }
  }

  startObserver();
})();

// TODO: Refactor this function to be able to only add labels to specific
// elements. At the moment it goes through all `.link-user` elements which is
// inefficient.
function addLabelsToUsernames(settings: Settings): void {
  for (const element of [
    ...document.querySelectorAll('.trx-user-label'),
    ...document.querySelectorAll('.trx-user-label-add')
  ]) {
    element.remove();
  }

  for (const element of document.querySelectorAll('.link-user')) {
    const username: string = element
      .textContent!.replace(/@/g, '')
      .toLowerCase();

    const addLabelSpan: HTMLSpanElement = createElementFromString(
      `<span class="trx-user-label-add" data-trx-username="${username}">[+]</span>`
    );
    addLabelSpan.addEventListener('click', (event: MouseEvent): void =>
      addLabelHandler(event, addLabelSpan)
    );
    if (!isInTopicListing()) {
      element.insertAdjacentElement('afterend', addLabelSpan);
      appendStyleAttribute(
        addLabelSpan,
        `color: var(${themeColors.foregroundPrimary});`
      );
    }

    const userLabels: UserLabel[] = settings.data.userLabels.filter(
      (value) => value.username === username
    );
    if (userLabels.length === 0) {
      if (
        isInTopicListing() &&
        (element.nextElementSibling === null ||
          !element.nextElementSibling.className.includes('trx-user-label'))
      ) {
        element.insertAdjacentElement('afterend', addLabelSpan);
        appendStyleAttribute(
          addLabelSpan,
          `color: var(${themeColors.foregroundPrimary});`
        );
      }

      continue;
    }

    if (isInTopicListing()) {
      userLabels.sort((a, b) => b.priority - a.priority);
    } else {
      userLabels.sort((a, b): number => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }

        return b.text.localeCompare(a.text);
      });
    }

    for (const userLabel of userLabels) {
      const userLabelSpan: HTMLSpanElement = createElementFromString(
        `<span class="trx-user-label" data-trx-user-label-id="${userLabel.id}">${userLabel.text}</span>`
      );
      userLabelSpan.addEventListener(
        'click',
        async (event: MouseEvent): Promise<void> =>
          editLabelHandler(event, userLabelSpan)
      );
      element.insertAdjacentElement('afterend', userLabelSpan);
      // Set the inline-style after the element gets added to the DOM, this
      // will prevent a CSP error saying inline-styles aren't permitted.
      userLabelSpan.setAttribute(
        'style',
        `background-color: ${userLabel.color};`
      );
      if (isColorBright(userLabel.color.trim())) {
        userLabelSpan.classList.add('trx-bright');
      } else {
        userLabelSpan.classList.remove('trx-bright');
      }

      if (isInTopicListing()) {
        break;
      }
    }
  }
}

async function saveUserLabel(): Promise<void> {
  const settings: Settings = await getSettings();
  const labelForm: HTMLFormElement = getLabelForm();
  const labelNoID: Except<UserLabel, 'id'> | undefined = getLabelFormValues();
  if (typeof labelNoID === 'undefined') {
    return;
  }

  const existingIDString: string | null = labelForm.getAttribute(
    'data-trx-user-label-id'
  );
  if (existingIDString === null) {
    settings.data.userLabels.push({
      id: (await getHighestLabelID(settings)) + 1,
      ...labelNoID
    });
    await setSettings(settings);
    hideLabelForm();
    addLabelsToUsernames(settings);
    return;
  }

  const existingID = Number(existingIDString);
  const existingLabel: UserLabel | undefined = settings.data.userLabels.find(
    (value) => value.id === existingID
  );
  if (typeof existingLabel === 'undefined') {
    log(`Tried to find label with ID that doesn't exist: ${existingID}`, true);
    return;
  }

  const existingLabelIndex: number = settings.data.userLabels.findIndex(
    (value) => value.id === existingID
  );
  settings.data.userLabels.splice(existingLabelIndex, 1);
  settings.data.userLabels.push({
    id: existingID,
    ...labelNoID
  });
  await setSettings(settings);
  hideLabelForm();
  addLabelsToUsernames(settings);
}

async function removeUserLabel(): Promise<void> {
  const labelNoID: Except<UserLabel, 'id'> | undefined = getLabelFormValues();
  if (typeof labelNoID === 'undefined') {
    return;
  }

  const id: number | undefined = getLabelFormID();
  if (typeof id === 'undefined') {
    log('Attempted to remove user label without an ID.');
    hideLabelForm();
    return;
  }

  const settings: Settings = await getSettings();
  const labelIndex: number = settings.data.userLabels.findIndex(
    (value) => value.id === id
  );
  if (typeof findLabelByID(id) === 'undefined') {
    log(
      `Attempted to remove user label with an ID that doesn't exist ${id}.`,
      true
    );
    hideLabelForm();
    return;
  }

  settings.data.userLabels.splice(labelIndex, 1);
  await setSettings(settings);
  hideLabelForm();
  addLabelsToUsernames(settings);
}

export async function findLabelByID(
  id: number,
  settings?: Settings
): Promise<UserLabel | undefined> {
  if (typeof settings === 'undefined') {
    settings = await getSettings();
  }

  return settings.data.userLabels.find((value) => value.id === id);
}

async function getHighestLabelID(settings?: Settings): Promise<number> {
  if (typeof settings === 'undefined') {
    settings = await getSettings();
  }

  if (settings.data.userLabels.length === 0) {
    return 0;
  }

  return Math.max(...settings.data.userLabels.map((value) => value.id));
}
