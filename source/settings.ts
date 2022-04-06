import {migrate} from 'migration-helper';
import browser from 'webextension-polyfill';

import {migrations, deserializeData} from './migrations.js';
import {log} from './utilities/exports.js';

export default class Settings {
  public static async fromSyncStorage(): Promise<Settings> {
    const settings = new Settings();

    const sync = {
      ...settings,
      ...(await browser.storage.sync.get(null)),
    };

    const migrated = (await migrate(
      sync,
      sync.version ?? settings.version,
      migrations,
    )) as Record<string, any>;

    const deserialized = deserializeData(migrated);

    settings.data = migrated.data as Settings['data'];
    settings.data.userLabels = deserialized.userLabels;
    settings.data.usernameColors = deserialized.usernameColors;
    settings.features = migrated.features as Settings['features'];
    settings.version = migrated.version as Settings['version'];

    if (sync.version !== settings.version) {
      await settings.save();
    }

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
    usernameColors: UsernameColor[];
  };

  public features: {
    [index: string]: boolean;
    anonymizeUsernames: boolean;
    autocomplete: boolean;
    backToTop: boolean;
    debug: boolean;
    hideVotes: boolean;
    jumpToNewComment: boolean;
    markdownToolbar: boolean;
    themedLogo: boolean;
    userLabels: boolean;
    usernameColors: boolean;
  };

  public version: string;

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
      usernameColors: [],
    };

    this.features = {
      anonymizeUsernames: false,
      autocomplete: true,
      backToTop: true,
      debug: false,
      hideVotes: false,
      jumpToNewComment: true,
      markdownToolbar: true,
      themedLogo: false,
      userLabels: true,
      usernameColors: false,
    };

    this.version = '0.0.0';
  }

  public manifest(): TRXManifest {
    return Settings.manifest();
  }

  public async nuke(event?: MouseEvent): Promise<void> {
    await Settings.nuke(event);
  }

  public async save(): Promise<void> {
    const sync: Record<string, any> = {
      data: {
        hideVotes: this.data.hideVotes,
        knownGroups: this.data.knownGroups,
        latestActiveFeatureTab: this.data.latestActiveFeatureTab,
      },
      features: this.features,
      version: this.version,
    };

    for (const label of this.data.userLabels) {
      sync[`userLabel${label.id}`] = {...label};
    }

    for (const color of this.data.usernameColors) {
      sync[`usernameColor${color.id}`] = {...color};
    }

    await browser.storage.sync.set(sync);
  }
}
