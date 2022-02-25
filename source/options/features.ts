import {
  AboutSetting,
  AnonymizeUsernamesSetting,
  AutocompleteSetting,
  BackToTopSetting,
  HideVotesSetting,
  JumpToNewCommentSetting,
  MarkdownToolbarSetting,
  UserLabelsSetting,
  UsernameColorsSetting,
} from './components/exports.js';

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
    key: 'anonymizeUsernames',
    value: 'Anonymize Usernames',
    component: () => AnonymizeUsernamesSetting,
  },
  {
    index: 0,
    key: 'autocomplete',
    value: 'Autocomplete',
    component: () => AutocompleteSetting,
  },
  {
    index: 0,
    key: 'backToTop',
    value: 'Back To Top',
    component: () => BackToTopSetting,
  },
  {
    index: 0,
    key: 'hideVotes',
    value: 'Hide Votes',
    component: () => HideVotesSetting,
  },
  {
    index: 0,
    key: 'jumpToNewComment',
    value: 'Jump To New Comment',
    component: () => JumpToNewCommentSetting,
  },
  {
    index: 0,
    key: 'markdownToolbar',
    value: 'Markdown Toolbar',
    component: () => MarkdownToolbarSetting,
  },
  {
    index: 0,
    key: 'userLabels',
    value: 'User Labels',
    component: () => UserLabelsSetting,
  },
  {
    index: 0,
    key: 'usernameColors',
    value: 'Username Colors',
    component: () => UsernameColorsSetting,
  },
  {
    index: 1,
    key: 'debug',
    value: 'About & Info',
    component: () => AboutSetting,
  },
].sort((a, b) => a.index - b.index);
