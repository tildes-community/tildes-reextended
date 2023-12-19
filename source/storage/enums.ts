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
  ThemeSwitcher = "theme-switcher",
  UserLabels = "user-labels",
  UsernameColors = "username-colors",
}

/**
 * Keys of miscellaneous feature names.
 */
export enum MiscellaneousFeature {
  CommentAnchorFix = "comment-anchor-fix",
  GroupListSubscribeButtons = "group-list-subscribe-buttons",
  HideOwnUsername = "hide-own-username",
  ShowTopicAuthor = "show-topic-author",
  TopicInfoIgnore = "topic-info-ignore",
  UnignoreAllButton = "unignore-all-button",
}

/**
 * Keys of data stored in WebExtension storage.
 */
export enum Data {
  EnabledFeatures = "enabled-features",
  KnownGroups = "known-groups",
  LatestActiveFeatureTab = "latest-active-feature-tab",
  MarkdownSnippet = "markdown-snippet",
  MiscellaneousEnabledFeatures = "miscellaneous-enabled-features",
  OnSiteNewLabel = "on-site-new-label",
  RandomizeUsernameColors = "randomize-username-colors",
  ThemesList = "themes-list",
  ThemesListUpdatedDate = "themes-list-updated-date",
  Version = "data-version",
}
