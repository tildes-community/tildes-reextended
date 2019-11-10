import {
  log,
  isValidHexColor,
  UserLabel,
  getCurrentThemeKey,
  querySelector
} from '../../utilities';
import {findLabelByID} from '../user-labels';
import {themeColors, ThemeKey} from '../../theme-colors';
import {
  getLabelForm,
  setLabelFormColor,
  setLabelFormPriority,
  setLabelFormUserID,
  setLabelFormUsername,
  setLabelFormText,
  setLabelFormTitle,
  showLabelForm,
  updatePreview
} from './label-form';

const theme: typeof themeColors[ThemeKey] = themeColors[getCurrentThemeKey()];

export function addLabelHandler(
  event: MouseEvent,
  element: HTMLSpanElement
): void {
  const labelForm = getLabelForm();
  labelForm.removeAttribute('data-trx-user-label-id');
  setLabelFormTitle('Add New Label');
  setLabelFormUsername(element.getAttribute('data-trx-username')!);
  setLabelFormPriority(0);
  setLabelFormColor(theme.backgroundAlt);
  setLabelFormText('');
  showLabelForm(element);
  updatePreview();
}

export async function editLabelHandler(
  event: MouseEvent,
  element: HTMLSpanElement
): Promise<void> {
  setLabelFormTitle('Edit Existing Label');
  const labelID = Number(element.getAttribute('data-trx-user-label-id')!);
  const label: UserLabel | undefined = await findLabelByID(labelID);
  if (typeof label === 'undefined') {
    log(`Tried to find label with ID that doesn't exist: ${labelID}`, true);
    return;
  }

  setLabelFormUserID(label.id);
  setLabelFormUsername(label.username.toLowerCase());
  setLabelFormPriority(label.priority);
  setLabelFormColor(label.color);
  setLabelFormText(label.text);
  showLabelForm(element);
  updatePreview();
}

export function labelColorInputHandler(): void {
  const labelColorInput: HTMLInputElement = querySelector(
    '#trx-user-label-form-color > input'
  );
  let color: string = labelColorInput.value.toLowerCase();
  if (!color.startsWith('#') && !color.startsWith('t') && color.length > 0) {
    color = `#${color}`;
    labelColorInput.value = color;
  }

  if (color !== 'transparent' && !isValidHexColor(color)) {
    log('Invalid color input, must be a valid 3/4/6/8-character hex color.');
    labelColorInput.classList.add('trx-invalid');
    return;
  }

  labelColorInput.classList.remove('trx-invalid');
  updatePreview(color);
}

export function labelTextInputHandler(): void {
  const labelTextInput: HTMLInputElement = querySelector(
    '#trx-user-label-input > input'
  );
  updatePreview(undefined, labelTextInput.value);
}

export function presetColorSelectHandler(): void {
  const labelColorInput: HTMLInputElement = querySelector(
    '#trx-user-label-form-color > input'
  );
  const presetColorSelect: HTMLSelectElement = querySelector(
    '#trx-user-label-form-color > select'
  );
  labelColorInput.value = presetColorSelect.value;
  updatePreview(presetColorSelect.value);
}
