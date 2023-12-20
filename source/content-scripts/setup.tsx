import {type JSX, render} from "preact";
import {
  extractGroups,
  extractThemes,
  initializeGlobals,
  log,
  userIsLoggedIn,
} from "../utilities/exports.js";
import {
  Data,
  Feature,
  MiscellaneousFeature,
  collectMarkdownSnippets,
  fromStorage,
} from "../storage/exports.js";
import {
  AutocompleteFeature,
  BackToTopFeature,
  JumpToNewCommentFeature,
  UserLabelsFeature,
  runAnonymizeUsernamesFeature,
  runCommentAnchorFixFeature,
  runGroupListSubscribeButtonFeature,
  runHideOwnUsernameFeature,
  runHideTopicsFeature,
  runHideVotesFeature,
  runMarkdownToolbarFeature,
  runThemedLogoFeature,
  runShowTopicAuthorFeature,
  runTopicInfoIgnore,
  runUnignoreAllButtonFeature,
  runUsernameColorsFeature,
  runThemeSwitcherFeature,
} from "./features/exports.js";

async function initialize() {
  const start = window.performance.now();
  initializeGlobals();
  const enabledFeatures = await fromStorage(Data.EnabledFeatures);
  const miscEnabled = await fromStorage(Data.MiscellaneousEnabledFeatures);
  window.TildesReExtended.debug = enabledFeatures.value.has(Feature.Debug);

  // Any features that will use the knownGroups data should be added to this
  // array so that when groups are changed on Tildes, TRX can still update
  // them without having to change the hardcoded values.
  const usesKnownGroups = new Set<Feature>([Feature.Autocomplete]);
  const knownGroups = await fromStorage(Data.KnownGroups);

  // Similarly to the known groups, any features that use the list of themes
  // should be added here.
  const usesThemesList = new Set<Feature>([Feature.ThemeSwitcher]);
  const themesList = await fromStorage(Data.ThemesList);
  const themesListUpdatedDate = await fromStorage(Data.ThemesListUpdatedDate);

  const userLabels = await fromStorage(Feature.UserLabels);

  const isLoggedIn = userIsLoggedIn();
  if (!isLoggedIn) {
    log("User is not logged in, running with limited features enabled.", true);
  }

  // Only when any of the features that uses this data are enabled, try to save
  // the groups.
  if (
    Array.from(usesKnownGroups).some((feature) =>
      enabledFeatures.value.has(feature),
    )
  ) {
    const extractedGroups = extractGroups();
    if (extractedGroups !== undefined) {
      knownGroups.value = new Set(extractedGroups);
      await knownGroups.save();
    }
  }

  // Only update the list of themes when it has been more than 24 hours since we
  // last updated and any of the features that use it are enabled.
  if (
    Date.now() - themesListUpdatedDate.value.getTime() > 24 * 60 * 60 * 1000 &&
    Array.from(usesThemesList).some((feature) =>
      enabledFeatures.value.has(feature),
    )
  ) {
    const themes = extractThemes();
    if (themes !== undefined) {
      themesList.value = themes;
      await themesList.save();
      themesListUpdatedDate.value = new Date();
      await themesListUpdatedDate.save();
      log("Updated locally saved themes list.");
    }
  }

  const anonymizeUsernamesEnabled = enabledFeatures.value.has(
    Feature.AnonymizeUsernames,
  );

  const observerFeatures: Array<() => void | Promise<void>> = [];
  const observer = new window.MutationObserver(async () => {
    log("Page mutation detected, rerunning features.");
    observer.disconnect();
    await Promise.all(observerFeatures.map(async (feature) => feature()));
    startObserver();
  });

  function startObserver() {
    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
    });
  }

  if (anonymizeUsernamesEnabled) {
    const anonymizeUsernamesData = await fromStorage(
      Feature.AnonymizeUsernames,
    );
    observerFeatures.push(async () => {
      await runAnonymizeUsernamesFeature(anonymizeUsernamesData.value);
    });
  }

  if (enabledFeatures.value.has(Feature.HideTopics)) {
    observerFeatures.push(async () => {
      await runHideTopicsFeature(userLabels);
    });
  }

  if (enabledFeatures.value.has(Feature.HideVotes)) {
    observerFeatures.push(async () => {
      const data = await fromStorage(Feature.HideVotes);
      runHideVotesFeature(data.value);
    });
  }

  if (enabledFeatures.value.has(Feature.MarkdownToolbar) && isLoggedIn) {
    observerFeatures.push(async () => {
      const snippets = await collectMarkdownSnippets();
      runMarkdownToolbarFeature(snippets);
    });
  }

  if (enabledFeatures.value.has(Feature.ThemeSwitcher)) {
    await runThemeSwitcherFeature();
  }

  if (enabledFeatures.value.has(Feature.ThemedLogo)) {
    observerFeatures.push(() => {
      runThemedLogoFeature();
    });
  }

  if (enabledFeatures.value.has(Feature.UsernameColors)) {
    observerFeatures.push(async () => {
      const data = await fromStorage(Feature.UsernameColors);
      const randomizeUsernameColors = await fromStorage(
        Data.RandomizeUsernameColors,
      );
      await runUsernameColorsFeature(
        data,
        anonymizeUsernamesEnabled,
        randomizeUsernameColors.value,
      );
    });
  }

  // Initialize all the observer-dependent features first.
  await Promise.all(observerFeatures.map(async (feature) => feature()));

  // Object to hold the active components we are going to render.
  const components: Record<string, JSX.Element | undefined> = {};

  if (enabledFeatures.value.has(Feature.Autocomplete) && isLoggedIn) {
    components.autocomplete = (
      <AutocompleteFeature
        anonymizeUsernamesEnabled={anonymizeUsernamesEnabled}
        knownGroups={knownGroups.value}
        userLabels={userLabels}
      />
    );
  }

  if (enabledFeatures.value.has(Feature.BackToTop)) {
    components.backToTop = <BackToTopFeature />;
  }

  if (enabledFeatures.value.has(Feature.JumpToNewComment) && isLoggedIn) {
    components.jumpToNewComment = <JumpToNewCommentFeature />;
  }

  if (enabledFeatures.value.has(Feature.UserLabels)) {
    const onSiteNewLabelEnabled = await fromStorage(Data.OnSiteNewLabel);
    components.userLabels = (
      <UserLabelsFeature
        anonymizeUsernamesEnabled={anonymizeUsernamesEnabled}
        onSiteNewLabelEnabled={onSiteNewLabelEnabled.value}
        userLabels={userLabels}
      />
    );
  }

  if (enabledFeatures.value.has(Feature.Miscellaneous)) {
    if (miscEnabled.value.has(MiscellaneousFeature.CommentAnchorFix)) {
      runCommentAnchorFixFeature();
    }

    if (
      miscEnabled.value.has(MiscellaneousFeature.GroupListSubscribeButtons) &&
      isLoggedIn
    ) {
      runGroupListSubscribeButtonFeature();
    }

    if (
      miscEnabled.value.has(MiscellaneousFeature.HideOwnUsername) &&
      isLoggedIn
    ) {
      runHideOwnUsernameFeature();
    }

    if (miscEnabled.value.has(MiscellaneousFeature.ShowTopicAuthor)) {
      runShowTopicAuthorFeature();
    }

    if (
      miscEnabled.value.has(MiscellaneousFeature.TopicInfoIgnore) &&
      isLoggedIn
    ) {
      runTopicInfoIgnore();
    }

    if (
      miscEnabled.value.has(MiscellaneousFeature.UnignoreAllButton) &&
      isLoggedIn
    ) {
      runUnignoreAllButtonFeature();
    }
  }

  // Insert a placeholder at the end of the body first, then render the rest
  // and use that as the replacement element. Otherwise render() would put it
  // at the beginning of the body which causes a bunch of different issues.
  const replacement = document.createElement("div");
  document.body.append(replacement);

  // The jump to new comment button must come right before
  // the back to top button. The CSS depends on them being in this order.
  render(
    <div id="trx-container">
      {components.jumpToNewComment} {components.backToTop}
      {components.autocomplete} {components.userLabels}
    </div>,
    document.body,
    replacement,
  );

  // Start the mutation observer only when some features depend on it are enabled.
  if (observerFeatures.length > 0) {
    startObserver();
  }

  const initializedIn = window.performance.now() - start;
  log(`Initialized in approximately ${initializedIn} milliseconds.`);
}

document.addEventListener("DOMContentLoaded", initialize);
