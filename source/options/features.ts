import {Feature} from "../storage/common.js";
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
} from "./components/exports.js";

type FeatureData = {
  availableSince: Date;
  index: number;
  key: Feature;
  title: string;
  component: any;
};

export const features: FeatureData[] = [
  {
    availableSince: new Date("2022-02-23"),
    index: 0,
    key: Feature.AnonymizeUsernames,
    title: "Anonymize Usernames",
    component: AnonymizeUsernamesSetting,
  },
  {
    availableSince: new Date("2020-10-03"),
    index: 0,
    key: Feature.Autocomplete,
    title: "Autocomplete",
    component: AutocompleteSetting,
  },
  {
    availableSince: new Date("2019-11-10"),
    index: 0,
    key: Feature.BackToTop,
    title: "Back To Top",
    component: BackToTopSetting,
  },
  {
    availableSince: new Date("2019-11-12"),
    index: 0,
    key: Feature.HideVotes,
    title: "Hide Votes",
    component: HideVotesSetting,
  },
  {
    availableSince: new Date("2019-11-10"),
    index: 0,
    key: Feature.JumpToNewComment,
    title: "Jump To New Comment",
    component: JumpToNewCommentSetting,
  },
  {
    availableSince: new Date("2019-11-12"),
    index: 0,
    key: Feature.MarkdownToolbar,
    title: "Markdown Toolbar",
    component: MarkdownToolbarSetting,
  },
  {
    availableSince: new Date("2022-02-27"),
    index: 0,
    key: Feature.ThemedLogo,
    title: "Themed Logo",
    component: ThemedLogoSetting,
  },
  {
    availableSince: new Date("2019-11-10"),
    index: 0,
    key: Feature.UserLabels,
    title: "User Labels",
    component: UserLabelsSetting,
  },
  {
    availableSince: new Date("2022-02-25"),
    index: 0,
    key: Feature.UsernameColors,
    title: "Username Colors",
    component: UsernameColorsSetting,
  },
  {
    availableSince: new Date("2019-11-10"),
    index: 1,
    key: Feature.Debug,
    title: "About & Info",
    component: AboutSetting,
  },
];

features.sort((a, b) => a.index - b.index);
