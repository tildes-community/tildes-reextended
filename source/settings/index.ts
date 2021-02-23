import {browser, Manifest} from 'webextension-polyfill-ts';
import {defaultSettings, log} from '..';

/**
 * UserLabel type definition.
 */
export type UserLabel = {
  color: string;
  id: number;
  priority: number;
  text: string;
  username: string;
};

/**
 * User extension settings.
 */
export type Settings = {
  data: {
    hideVotes: {
      [index: string]: boolean;
      comments: boolean;
      topics: boolean;
      ownComments: boolean;
      ownTopics: boolean;
    };
    knownGroups: string[];
    latestActiveFeatureTab: string;
    userLabels: UserLabel[];
    version?: string;
  };
  features: {
    [index: string]: boolean;
    autocomplete: boolean;
    backToTop: boolean;
    debug: boolean;
    hideVotes: boolean;
    jumpToNewComment: boolean;
    markdownToolbar: boolean;
    userLabels: boolean;
  };
};

/**
 * Fetches and returns the user extension settings.
 */
export async function getSettings(): Promise<Settings> {
  const syncSettings: any = await browser.storage.sync.get(defaultSettings);
  const settings: Settings = {
    data: {...defaultSettings.data, ...syncSettings.data},
    features: {...defaultSettings.features, ...syncSettings.features}
  };

  if (window?.TildesReExtended !== undefined) {
    window.TildesReExtended.debug = settings.features.debug;
    // If we're in development, force debug output.
    if (getManifest().nodeEnv === 'development') {
      window.TildesReExtended.debug = true;
    }
  }

  return settings;
}

/**
 * Saves the user extension settings.
 * @param newSettings The new settings to save.
 */
export async function setSettings(newSettings: Settings): Promise<void> {
  return browser.storage.sync.set(newSettings);
}

/**
 * Tildes ReExtended WebExtension manifest type definition.
 */
export type TRXManifest = {nodeEnv?: string} & Manifest.ManifestBase;

/**
 * Fetch the WebExtension manifest.
 */
export function getManifest(): TRXManifest {
  const manifest: Manifest.ManifestBase = browser.runtime.getManifest();
  return {...manifest};
}

/**
 * Removes all user extension settings and reloads the page.
 * @param event The mouse click event.
 */
export async function removeAllData(event: MouseEvent): Promise<void> {
  event.preventDefault();
  if (
    // eslint-disable-next-line no-alert
    !window.confirm(
      'Are you sure you want to delete your data? There is no way to ' +
        'recover it once it has been deleted.'
    )
  ) {
    return;
  }

  await browser.storage.sync.clear();
  log(
    'Data removed, reloading this page to reinitialize default settings.',
    true
  );
  setTimeout(() => {
    window.location.reload();
  }, 1000);
}

export * from './components';
export * from './defaults';
export * from './export';
export * from './import';
