import {browser, Manifest} from 'webextension-polyfill-ts';
import {themeColors, ThemeKey} from './theme-colors';

export interface UserLabel {
  color: string;
  id: number;
  text: string;
  priority: number;
  username: string;
}

export interface Settings {
  data: {
    hideVotes: {
      comments: boolean;
      topics: boolean;
      ownComments: boolean;
      ownTopics: boolean;
      [index: string]: boolean;
    };
    latestActiveFeatureTab: string;
    userLabels: UserLabel[];
    version?: string;
  };
  features: {
    backToTop: boolean;
    debug: boolean;
    hideVotes: boolean;
    jumpToNewComment: boolean;
    markdownToolbar: boolean;
    userLabels: boolean;
    [index: string]: boolean;
  };
}

export const defaultSettings: Settings = {
  data: {
    hideVotes: {
      comments: true,
      topics: true,
      ownComments: true,
      ownTopics: true
    },
    latestActiveFeatureTab: 'debug',
    userLabels: []
  },
  features: {
    backToTop: true,
    debug: false,
    hideVotes: false,
    jumpToNewComment: true,
    markdownToolbar: true,
    userLabels: true
  }
};

// Keep a local variable here for the debug logging, this way we don't have to
// call `getSettings()` each time we potentially want to log something. It gets
// set each time `getSettings()` is called so it's always accurate.
let debug = true;

export async function getSettings(): Promise<Settings> {
  const syncSettings: any = await browser.storage.sync.get(defaultSettings);
  const settings: Settings = {
    data: {...defaultSettings.data, ...syncSettings.data},
    features: {...defaultSettings.features, ...syncSettings.features}
  };
  debug = syncSettings.features.debug;
  // If we're in development, force debug output.
  if (getManifest().nodeEnv === 'development') {
    debug = true;
  }

  return settings;
}

export async function setSettings(
  newSettings: Partial<Settings>
): Promise<void> {
  return browser.storage.sync.set(newSettings);
}

export function log(message: any, override = false): void {
  let overrideStyle = '';
  let prefix = '[TRX]';
  if (override) {
    prefix = '%c' + prefix;
    overrideStyle = 'background-color: #dc322f; margin-right: 9px;';
  }

  if (debug || override) {
    console.debug(prefix, overrideStyle, message);
  }
}

// Helper function to convert kebab-case strings to camelCase ones.
// Primarily for converting element IDs to Object keys.
export function kebabToCamel(input: string): string {
  let output = '';
  for (const part of input.split('-')) {
    output += part[0].toUpperCase();
    output += part.slice(1);
  }

  return output[0].toLowerCase() + output.slice(1);
}

// The opposite of `kebabToCamel()`.
export function camelToKebab(input: string): string {
  const uppercaseMatches: RegExpMatchArray | null = input.match(/[A-Z]/g);
  // If there are no uppercase letters in the input, just return it.
  if (uppercaseMatches === null) {
    return input;
  }

  // Find all the indexes of where uppercase letters are.
  const uppercaseIndexes: number[] = [];
  for (const match of uppercaseMatches) {
    const latestIndex: number =
      typeof uppercaseIndexes[uppercaseIndexes.length - 1] === 'undefined'
        ? 0
        : uppercaseIndexes[uppercaseIndexes.length - 1];
    uppercaseIndexes.push(input.indexOf(match, latestIndex + 1));
  }

  // Convert each section up to the next uppercase letter to lowercase with
  // a dash between each section.
  let output = '';
  let previousIndex = 0;
  for (const index of uppercaseIndexes) {
    output += input.slice(previousIndex, index).toLowerCase();
    output += '-';
    previousIndex = index;
  }

  output += input.slice(previousIndex).toLowerCase();
  return output;
}

// This utility function should only be used in cases where we know for certain
// that the wanted element is going to exist.
export function querySelector<T extends Element>(selector: string): T {
  return document.querySelector<T>(selector)!;
}

export function createElementFromString<T extends Element>(input: string): T {
  const template: HTMLTemplateElement = document.createElement('template');
  template.innerHTML = input.trim();
  return template.content.firstElementChild! as T;
}

export function isInTopicListing(): boolean {
  return document.querySelector('.topic-listing') !== null;
}

export function getManifest(): {nodeEnv?: string} & Manifest.ManifestBase {
  const manifest: Manifest.ManifestBase = browser.runtime.getManifest();
  return {...manifest};
}

export function getCurrentThemeKey(): ThemeKey {
  const body: HTMLBodyElement = querySelector('body');
  const classes: string | null = body.getAttribute('class');
  if (classes === null || !classes.includes('theme-')) {
    return 'white';
  }

  const themeIndex: number = classes.indexOf('theme-');
  const themeKey: ThemeKey = kebabToCamel(
    classes.slice(
      themeIndex + 'theme-'.length,
      classes.includes(' ', themeIndex)
        ? classes.indexOf(' ', themeIndex)
        : classes.length
    )
  ) as ThemeKey;
  if (typeof themeColors[themeKey] === 'undefined') {
    log(
      `Attempted to retrieve theme key that's not defined: "${themeKey}" Using the white theme as fallback.`,
      true
    );
    return 'white';
  }

  return themeKey;
}

// Adapted from https://stackoverflow.com/a/12043228/12251171.
export function isColorBright(color: string): boolean {
  if (color.startsWith('#')) {
    color = color.slice(1);
  }

  if (color.length === 4) {
    color = color.slice(0, 3);
  }

  if (color.length === 8) {
    color = color.slice(0, 6);
  }

  if (color.length === 3) {
    color = color
      .split('')
      .map(val => val.repeat(2))
      .join('');
  }

  const red: number = parseInt(color.slice(0, 2), 16);
  const green: number = parseInt(color.slice(2, 4), 16);
  const blue: number = parseInt(color.slice(4, 6), 16);
  const brightness: number = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  return brightness > 128;
}

export function appendStyleAttribute(element: Element, styles: string): void {
  const existingStyles: string | null = element.getAttribute('style');
  if (existingStyles === null) {
    element.setAttribute('style', styles);
  } else {
    element.setAttribute('style', `${existingStyles} ${styles}`);
  }
}

export function isValidHexColor(color: string): boolean {
  // Overly verbose validation for 3/4/6/8-character hex colors.
  if (
    /^#[a-f0-9]{6}$/i.exec(color) === null &&
    /^#[a-f0-9]{3}$/i.exec(color) === null &&
    /^#[a-f0-9]{8}$/i.exec(color) === null &&
    /^#[a-f0-9]{4}$/i.exec(color) === null
  ) {
    return false;
  }

  return true;
}

export function flashMessage(message: string, error = false): void {
  if (document.querySelector('.trx-flash-message') !== null) {
    log(
      `A flash message already exists, skipping requested one with message:\n${message}`
    );
    return;
  }

  const messageElement: HTMLDivElement = createElementFromString(
    `<div class="trx-flash-message">${message}</div>`
  );
  if (error) {
    messageElement.classList.add('trx-flash-error');
  }

  let isRemoved = false;
  messageElement.addEventListener('click', (): void => {
    messageElement.remove();
    isRemoved = true;
  });
  document.body.append(messageElement);
  setTimeout(() => {
    messageElement.classList.add('trx-opaque');
  }, 50);
  setTimeout(() => {
    if (!isRemoved) {
      messageElement.classList.remove('trx-opaque');
      setTimeout(() => {
        messageElement.remove();
      }, 500);
    }
  }, 5000);
}

// Validation copied from Tildes source code:
// https://gitlab.com/tildes/tildes/blob/master/tildes/tildes/schemas/user.py
export function isValidTildesUsername(username: string): boolean {
  return (
    username.length > 2 &&
    username.length < 20 &&
    /^[a-z0-9]([a-z0-9]|[_-](?![_-]))*[a-z0-9]$/i.exec(username) !== null
  );
}
