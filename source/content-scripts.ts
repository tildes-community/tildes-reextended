import {html} from 'htm/preact';
import {render} from 'preact';
import {
  AutocompleteFeature,
  BackToTopFeature,
  extractAndSaveGroups,
  getSettings,
  initialize,
  JumpToNewCommentFeature,
  log,
  runHideVotesFeature,
  runMarkdownToolbarFeature,
  TRXComponent,
  UserLabelsFeature
} from '.';

window.addEventListener('load', async () => {
  const start = window.performance.now();
  initialize();
  const settings = await getSettings();

  // Any features that will use `settings.data.knownGroups` should be added to
  // this array so that when groups are changed on Tildes, TRX can still update
  // them without having to change the hardcoded values.
  const usesKnownGroups = [settings.features.autocomplete];
  // Only when any of the features that uses this data try to save the groups.
  if (usesKnownGroups.some((value) => value)) {
    settings.data.knownGroups = await extractAndSaveGroups(settings);
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

  if (settings.features.hideVotes) {
    runHideVotesFeature(settings);
  }

  if (settings.features.jumpToNewComment) {
    components.jumpToNewComment = html`<${JumpToNewCommentFeature} />`;
  }

  if (settings.features.markdownToolbar) {
    runMarkdownToolbarFeature();
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
    html`<div id="trx-container">
      ${components.jumpToNewComment} ${components.backToTop}
      ${components.autocomplete} ${components.userLabels}
    </div>`,
    document.body,
    replacement
  );

  const initializedIn = window.performance.now() - start;
  log(`Initialized in approximately ${initializedIn} milliseconds.`);
});
