import Settings from '../settings.js';
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

type Feature = {
  index: number;
  key: keyof RemoveIndexSignature<Settings['features']>;
  title: string;
  component: () => any;
};

export const features: Feature[] = [
  {
    index: 0,
    key: 'anonymizeUsernames',
    title: 'Anonymize Usernames',
    component: () => AnonymizeUsernamesSetting,
  },
  {
    index: 0,
    key: 'autocomplete',
    title: 'Autocomplete',
    component: () => AutocompleteSetting,
  },
  {
    index: 0,
    key: 'backToTop',
    title: 'Back To Top',
    component: () => BackToTopSetting,
  },
  {
    index: 0,
    key: 'hideVotes',
    title: 'Hide Votes',
    component: () => HideVotesSetting,
  },
  {
    index: 0,
    key: 'jumpToNewComment',
    title: 'Jump To New Comment',
    component: () => JumpToNewCommentSetting,
  },
  {
    index: 0,
    key: 'markdownToolbar',
    title: 'Markdown Toolbar',
    component: () => MarkdownToolbarSetting,
  },
  {
    index: 0,
    key: 'userLabels',
    title: 'User Labels',
    component: () => UserLabelsSetting,
  },
  {
    index: 0,
    key: 'usernameColors',
    title: 'Username Colors',
    component: () => UsernameColorsSetting,
  },
  {
    index: 1,
    key: 'debug',
    title: 'About & Info',
    component: () => AboutSetting,
  },
];

features.sort((a, b) => a.index - b.index);
