import Settings from '../settings.js';
import {
  AboutSetting,
  AnonymizeUsernamesSetting,
  AutocompleteSetting,
  BackToTopSetting,
  HideVotesSetting,
  JumpToNewCommentSetting,
  MarkdownToolbarSetting,
  ThemedLogoSetting,
  UserLabelsSetting,
  UsernameColorsSetting,
} from './components/exports.js';

type Feature = {
  availableSince: Date;
  index: number;
  key: keyof RemoveIndexSignature<Settings['features']>;
  title: string;
  component: () => any;
};

export const features: Feature[] = [
  {
    availableSince: new Date('2022-02-23'),
    index: 0,
    key: 'anonymizeUsernames',
    title: 'Anonymize Usernames',
    component: () => AnonymizeUsernamesSetting,
  },
  {
    availableSince: new Date('2020-10-03'),
    index: 0,
    key: 'autocomplete',
    title: 'Autocomplete',
    component: () => AutocompleteSetting,
  },
  {
    availableSince: new Date('2019-11-10'),
    index: 0,
    key: 'backToTop',
    title: 'Back To Top',
    component: () => BackToTopSetting,
  },
  {
    availableSince: new Date('2019-11-12'),
    index: 0,
    key: 'hideVotes',
    title: 'Hide Votes',
    component: () => HideVotesSetting,
  },
  {
    availableSince: new Date('2019-11-10'),
    index: 0,
    key: 'jumpToNewComment',
    title: 'Jump To New Comment',
    component: () => JumpToNewCommentSetting,
  },
  {
    availableSince: new Date('2019-11-12'),
    index: 0,
    key: 'markdownToolbar',
    title: 'Markdown Toolbar',
    component: () => MarkdownToolbarSetting,
  },
  {
    availableSince: new Date('2022-02-27'),
    index: 0,
    key: 'themedLogo',
    title: 'Themed Logo',
    component: () => ThemedLogoSetting,
  },
  {
    availableSince: new Date('2019-11-10'),
    index: 0,
    key: 'userLabels',
    title: 'User Labels',
    component: () => UserLabelsSetting,
  },
  {
    availableSince: new Date('2022-02-25'),
    index: 0,
    key: 'usernameColors',
    title: 'Username Colors',
    component: () => UsernameColorsSetting,
  },
  {
    availableSince: new Date('2019-11-10'),
    index: 1,
    key: 'debug',
    title: 'About & Info',
    component: () => AboutSetting,
  },
];

features.sort((a, b) => a.index - b.index);
