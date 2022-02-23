import Settings from '../settings.js';
import {log, querySelectorAll} from '../utilities/exports.js';

export function runHideVotesFeature(settings: Settings) {
  const counts = hideVotes(settings);
  log(`Hide Votes: Initialized for ${counts} votes.`);
}

function hideVotes(settings: Settings): number {
  let count = 0;

  if (settings.data.hideVotes.comments) {
    const commentVotes = querySelectorAll(
      '.btn-post-action[data-ic-put-to*="/vote"]:not(.trx-votes-hidden)',
      '.btn-post-action[data-ic-delete-from*="/vote"]:not(.trx-votes-hidden)',
    );
    count += commentVotes.length;

    for (const vote of commentVotes) {
      vote.classList.add('trx-votes-hidden');
      if (!vote.textContent!.includes(' ')) {
        continue;
      }

      vote.textContent = vote.textContent!.slice(
        0,
        vote.textContent!.indexOf(' '),
      );
    }
  }

  if (settings.data.hideVotes.ownComments) {
    const ownComments = querySelectorAll('.comment-votes');
    count += ownComments.length;
    for (const vote of ownComments) {
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

    const topicVotes = querySelectorAll(...selectors);
    count += topicVotes.length;
    for (const vote of topicVotes) {
      vote.classList.add('trx-votes-hidden');
      vote.textContent = '-';
    }
  }

  return count;
}
