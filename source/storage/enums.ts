/**
 * Keys of feature names used in WebExtension storage.
 */
export enum Feature {
  AnonymizeUsernames = "anonymize-usernames",
  Autocomplete = "autocomplete",
  BackToTop = "back-to-top",
  Debug = "debug",
  HideVotes = "hide-votes",
  JumpToNewComment = "jump-to-new-comment",
  MarkdownToolbar = "markdown-toolbar",
  ThemedLogo = "themed-logo",
  UserLabels = "user-labels",
  UsernameColors = "username-colors",
}

/**
 * Keys of miscellaneous data stored in WebExtension storage.
 */
export enum Data {
  EnabledFeatures = "enabled-features",
  KnownGroups = "known-groups",
  LatestActiveFeatureTab = "latest-active-feature-tab",
  Version = "data-version",
}
