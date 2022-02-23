import browser from 'webextension-polyfill';

import {log} from './utilities/exports.js';

export default class Settings {
  public static async fromSyncStorage(): Promise<Settings> {
    const settings = new Settings();
    const defaultsObject = {
      data: settings.data,
      features: settings.features,
    };

    const sync = (await browser.storage.sync.get(
      defaultsObject,
    )) as typeof defaultsObject;
    settings.data = sync.data;
    settings.features = sync.features;

    return settings;
  }

  public static manifest(): TRXManifest {
    return browser.runtime.getManifest();
  }

  public static async nuke(event?: MouseEvent): Promise<void> {
    if (event !== undefined) {
      event.preventDefault();
    }

    if (
      // eslint-disable-next-line no-alert
      window.confirm(
        'Are you sure you want to delete your data? There is no way to recover it once it has been deleted.',
      )
    ) {
      await browser.storage.sync.clear();
      log(
        'Data removed, reloading this page to reinitialize default settings.',
        true,
      );
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }

  public data: {
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
  };

  public features: {
    [index: string]: boolean;
    autocomplete: boolean;
    backToTop: boolean;
    debug: boolean;
    hideVotes: boolean;
    jumpToNewComment: boolean;
    markdownToolbar: boolean;
    userLabels: boolean;
  };

  private constructor() {
    this.data = {
      hideVotes: {
        comments: true,
        topics: true,
        ownComments: true,
        ownTopics: true,
      },
      // If groups are added or removed from Tildes this does not necessarily need
      // to be updated. There is a helper function available to update it whenever
      // the user goes to "/groups", where all the groups are easily available.
      // Features that use this data should be added to the `usesKnownGroups`
      // array that is near the top of `content-scripts.ts`.
      knownGroups: [
        '~anime',
        '~arts',
        '~books',
        '~comp',
        '~creative',
        '~design',
        '~enviro',
        '~finance',
        '~food',
        '~games',
        '~games.game_design',
        '~games.tabletop',
        '~health',
        '~health.coronavirus',
        '~hobbies',
        '~humanities',
        '~lgbt',
        '~life',
        '~misc',
        '~movies',
        '~music',
        '~news',
        '~science',
        '~space',
        '~sports',
        '~talk',
        '~tech',
        '~test',
        '~tildes',
        '~tildes.official',
        '~tv',
      ],
      latestActiveFeatureTab: 'debug',
      userLabels: [],
    };

    this.features = {
      autocomplete: true,
      backToTop: true,
      debug: false,
      hideVotes: false,
      jumpToNewComment: true,
      markdownToolbar: true,
      userLabels: true,
    };
  }

  public manifest(): TRXManifest {
    return Settings.manifest();
  }

  public async nuke(event?: MouseEvent): Promise<void> {
    await Settings.nuke(event);
  }

  public async save(): Promise<void> {
    await browser.storage.sync.set(this);
  }
}
