import './scss/scripts.scss';

import {html} from 'htm/preact';
import {render} from 'preact';

import {
  AutocompleteFeature,
  BackToTopFeature,
  JumpToNewCommentFeature,
  UserLabelsFeature,
  runAnonymizeUsernamesFeature,
  runHideVotesFeature,
  runMarkdownToolbarFeature,
  runThemedLogoFeature,
  runUsernameColorsFeature,
} from './scripts/exports.js';
import Settings from './settings.js';
import {extractGroups, initializeGlobals, log} from './utilities/exports.js';

async function initialize() {
  const start = window.performance.now();
  initializeGlobals();
  const settings = await Settings.fromSyncStorage();
  window.TildesReExtended.debug = settings.features.debug;

  // Any features that will use `settings.data.knownGroups` should be added to
  // this array so that when groups are changed on Tildes, TRX can still update
  // them without having to change the hardcoded values.
  const usesKnownGroups = [settings.features.autocomplete];
  // Only when any of the features that uses this data try to save the groups.
  if (usesKnownGroups.some((value) => value)) {
    const knownGroups = extractGroups();
    if (knownGroups !== undefined) {
      settings.data.knownGroups = knownGroups;
      await settings.save();
    }
  }

  const observerFeatures: Array<() => any> = [];
  const observer = new window.MutationObserver(() => {
    log('Page mutation detected, rerunning features.');
    observer.disconnect();
    for (const feature of observerFeatures) {
      feature();
    }

    startObserver();
  });

  function startObserver() {
    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
    });
  }

  if (settings.features.anonymizeUsernames) {
    observerFeatures.push(() => {
      runAnonymizeUsernamesFeature();
    });
  }

  if (settings.features.hideVotes) {
    observerFeatures.push(() => {
      runHideVotesFeature(settings);
    });
  }

  if (settings.features.markdownToolbar) {
    observerFeatures.push(() => {
      runMarkdownToolbarFeature();
    });
  }

  if (settings.features.themedLogo) {
    observerFeatures.push(() => {
      runThemedLogoFeature();
    });
  }

  if (settings.features.usernameColors) {
    observerFeatures.push(() => {
      runUsernameColorsFeature(settings);
    });
  }

  // Initialize all the observer-dependent features first.
  for (const feature of observerFeatures) {
    feature();
  }

  // Object to hold the active components we are going to render.
  const components: Record<string, TRXComponent | undefined> = {};

  if (settings.features.autocomplete) {
    components.autocomplete = html`
      <${AutocompleteFeature} settings=${settings} />
    `;
  }

  if (settings.features.backToTop) {
    components.backToTop = html`<${BackToTopFeature} />`;
  }

  if (settings.features.jumpToNewComment) {
    components.jumpToNewComment = html`<${JumpToNewCommentFeature} />`;
  }

  if (settings.features.userLabels) {
    components.userLabels = html`
      <${UserLabelsFeature} settings=${settings} />
    `;
  }

  // Insert a placeholder at the end of the body first, then render the rest
  // and use that as the replacement element. Otherwise render() would put it
  // at the beginning of the body which causes a bunch of different issues.
  const replacement = document.createElement('div');
  document.body.append(replacement);

  // The jump to new comment button must come right before
  // the back to top button. The CSS depends on them being in this order.
  render(
    html`
      <div id="trx-container">
        ${components.jumpToNewComment} ${components.backToTop}
        ${components.autocomplete} ${components.userLabels}
      </div>
    `,
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

void initialize();
