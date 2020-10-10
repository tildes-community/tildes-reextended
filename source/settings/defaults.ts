import {
  AboutSetting,
  AutocompleteSetting,
  BackToTopSetting,
  HideVotesSetting,
  JumpToNewCommentSetting,
  MarkdownToolbarSetting,
  Settings,
  UserLabelsSetting
} from '..';

export const defaultSettings: Settings = {
  data: {
    hideVotes: {
      comments: true,
      topics: true,
      ownComments: true,
      ownTopics: true
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
      '~tv'
    ],
    latestActiveFeatureTab: 'debug',
    userLabels: []
  },
  features: {
    autocomplete: true,
    backToTop: true,
    debug: false,
    hideVotes: false,
    jumpToNewComment: true,
    markdownToolbar: true,
    userLabels: true
  }
};

export const defaultActiveFeature = defaultSettings.data.latestActiveFeatureTab;

/**
 * The array of features available in TRX.
 * * The index exists to sort the sidebar listing.
 * * The key should match the corresponding key from `Settings.features`.
 * * The value should be the header title for display.
 * * The component function should return the corresponding settings components.
 */
export const features = [
  {
    index: 0,
    key: 'autocomplete',
    value: 'Autocomplete',
    component: () => AutocompleteSetting
  },
  {
    index: 0,
    key: 'backToTop',
    value: 'Back To Top',
    component: () => BackToTopSetting
  },
  {
    index: 0,
    key: 'hideVotes',
    value: 'Hide Votes',
    component: () => HideVotesSetting
  },
  {
    index: 0,
    key: 'jumpToNewComment',
    value: 'Jump To New Comment',
    component: () => JumpToNewCommentSetting
  },
  {
    index: 0,
    key: 'markdownToolbar',
    value: 'Markdown Toolbar',
    component: () => MarkdownToolbarSetting
  },
  {
    index: 0,
    key: 'userLabels',
    value: 'User Labels',
    component: () => UserLabelsSetting
  },
  {
    index: 1,
    key: 'debug',
    value: 'About & Info',
    component: () => AboutSetting
  }
].sort((a, b) => a.index - b.index);
