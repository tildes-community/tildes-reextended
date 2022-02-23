import Settings from '../settings.js';
import {log, querySelectorAll} from '../utilities/exports.js';

export function runHideVotesFeature(settings: Settings) {
  const observer = new window.MutationObserver(() => {
    observer.disconnect();
    hideVotes(settings);
    startObserver();
  });

  function startObserver() {
    observer.observe(document, {
      childList: true,
      subtree: true,
    });
  }

  hideVotes(settings);
  startObserver();

  log('Hide Votes: Initialized.');
}

function hideVotes(settings: Settings) {
  if (settings.data.hideVotes.comments) {
    const commentVotes = querySelectorAll(
      '.btn-post-action[data-ic-put-to*="/vote"]:not(.trx-votes-hidden)',
      '.btn-post-action[data-ic-delete-from*="/vote"]:not(.trx-votes-hidden)',
    );

    for (const vote of commentVotes) {
      vote.classList.add('trx-votes-hidden');
      vote.textContent = vote.textContent!.slice(
        0,
        vote.textContent!.indexOf(' '),
      );
    }
  }

  if (settings.data.hideVotes.ownComments) {
    for (const vote of querySelectorAll('.comment-votes')) {
      vote.classList.add('trx-hidden');
    }
  }

  if (settings.data.hideVotes.topics || settings.data.hideVotes.ownTopics) {
    const selectors: string[] = [];

    // Topics by other people will be encapsulated with a `<button>`.
    if (settings.data.hideVotes.topics) {
      selectors.push('button > .topic-voting-votes:not(.trx-votes-hidden)');
    }

    // Topics by yourself will be encapsulated with a `<div>`.
    if (settings.data.hideVotes.ownTopics) {
      selectors.push('div > .topic-voting-votes:not(.trx-votes-hidden)');
    }

    for (const vote of querySelectorAll(...selectors)) {
      vote.classList.add('trx-votes-hidden');
      vote.textContent = '-';
    }
  }
}
