/**
 * Keys of feature names used in WebExtension storage.
 */
export enum Feature {
  AnonymizeUsernames = "anonymize-usernames",
  Autocomplete = "autocomplete",
  BackToTop = "back-to-top",
  Debug = "debug",
  HideTopics = "hide-topics",
  HideVotes = "hide-votes",
  JumpToNewComment = "jump-to-new-comment",
  MarkdownToolbar = "markdown-toolbar",
  Miscellaneous = "miscellaneous-features",
  ThemedLogo = "themed-logo",
  UserLabels = "user-labels",
  UsernameColors = "username-colors",
}

/**
 * Keys of miscellaneous feature names.
 */
export enum MiscellaneousFeature {
  CommentAnchorFix = "comment-anchor-fix",
  GroupListSubscribeButtons = "group-list-subscribe-buttons",
  TopicInfoIgnore = "topic-info-ignore",
}

/**
 * Keys of data stored in WebExtension storage.
 */
export enum Data {
  EnabledFeatures = "enabled-features",
  KnownGroups = "known-groups",
  LatestActiveFeatureTab = "latest-active-feature-tab",
  MiscellaneousEnabledFeatures = "miscellaneous-enabled-features",
  RandomizeUsernameColors = "randomize-username-colors",
  Version = "data-version",
}
