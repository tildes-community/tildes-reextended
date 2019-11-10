import {Except} from 'type-fest';
import {
  appendStyleAttribute,
  UserLabel,
  log,
  isColorBright,
  getCurrentThemeKey,
  querySelector,
  isValidTildesUsername
} from '../../utilities';
import {themeColors, ThemeKey} from '../../theme-colors';

const theme: typeof themeColors[ThemeKey] = themeColors[getCurrentThemeKey()];

export function getLabelForm(): HTMLFormElement {
  return querySelector('#trx-user-label-form');
}

export function showLabelForm(label: HTMLSpanElement): HTMLFormElement {
  const labelBounds: DOMRect = label.getBoundingClientRect();
  const labelForm = getLabelForm();
  const horizontalOffset: number = labelBounds.x + window.scrollX;
  const verticalOffset: number =
    labelBounds.y + labelBounds.height + 4 + window.scrollY;
  appendStyleAttribute(
    labelForm,
    `left: ${horizontalOffset}px; top: ${verticalOffset}px;`
  );
  labelForm.classList.remove('trx-hidden');
  return labelForm;
}

export function hideLabelForm(): HTMLFormElement {
  const labelForm = getLabelForm();
  labelForm.classList.add('trx-hidden');
  return labelForm;
}

export function setLabelFormTitle(title: string): void {
  const labelTitle: HTMLLabelElement = querySelector(
    '#trx-user-label-form > div:first-child > label:first-child'
  );
  labelTitle.textContent = title;
}

export function setLabelFormUserID(id: number): void {
  getLabelForm().dataset.trxUserLabelId = String(id);
}

export function setLabelFormUsername(username: string): void {
  const usernameInput: HTMLInputElement = querySelector(
    '#trx-user-label-form-username'
  );
  usernameInput.value = username.toLowerCase();
}

export function setLabelFormPriority(priority: number): void {
  const priorityInput: HTMLInputElement = querySelector(
    '#trx-user-label-priority'
  );
  priorityInput.value = String(priority);
}

export function setLabelFormColor(color: string): void {
  const colorInput: HTMLInputElement = querySelector(
    '#trx-user-label-form-color > input'
  );
  colorInput.value = color;
}

export function setLabelFormText(text: string): void {
  const textInput: HTMLInputElement = querySelector(
    '#trx-user-label-input > input'
  );
  textInput.value = text;
}

export function getLabelFormValues(): Except<UserLabel, 'id'> | undefined {
  const usernameInput: HTMLInputElement = querySelector(
    '#trx-user-label-form-username'
  );
  const priorityInput: HTMLInputElement = querySelector(
    '#trx-user-label-priority'
  );
  const colorInput: HTMLInputElement = querySelector(
    '#trx-user-label-form-color > input'
  );
  const textInput: HTMLInputElement = querySelector(
    '#trx-user-label-input > input'
  );

  const data: Except<UserLabel, 'id'> = {
    color: colorInput.value.toLowerCase(),
    priority: Number(priorityInput.value),
    text: textInput.value,
    username: usernameInput.value.toLowerCase()
  };

  if (!isValidTildesUsername(data.username)) {
    log(`Invalid Tildes username detected: ${data.username}`);
    usernameInput.classList.add('trx-invalid');
    return undefined;
  }

  usernameInput.classList.remove('trx-invalid');
  return data;
}

export function getLabelFormID(): number | undefined {
  const labelForm: HTMLFormElement = getLabelForm();
  const id: string | null = labelForm.getAttribute('data-trx-user-label-id');
  if (id === null) {
    return undefined;
  }

  return Number(id);
}

export function updatePreview(color?: string, text?: string): void {
  if (typeof color === 'undefined') {
    const labelColorInput: HTMLInputElement = querySelector(
      '#trx-user-label-form-color > input'
    );
    color = labelColorInput.value;
  }

  if (typeof text === 'undefined') {
    const labelTextInput: HTMLInputElement = querySelector(
      '#trx-user-label-input > input'
    );
    text = labelTextInput.value;
  }

  const labelPreview: HTMLDivElement = querySelector('#trx-user-label-preview');
  labelPreview.setAttribute(
    'style',
    `background-color: ${color}; border-color: ${theme.foregroundAlt};`
  );
  labelPreview.firstElementChild!.textContent = text;

  if (isColorBright(color)) {
    labelPreview.classList.add('trx-bright');
  } else {
    labelPreview.classList.remove('trx-bright');
  }
}
