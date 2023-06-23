import {type HideVotesData} from "../../storage/common.js";
import {log, querySelectorAll} from "../../utilities/exports.js";

export function runHideVotesFeature(data: HideVotesData) {
  const counts = hideVotes(data);
  log(`Hide Votes: Initialized for ${counts} votes.`);
}

function hideVotes(data: HideVotesData): number {
  let count = 0;

  if (data.otherComments) {
    const commentVotes = querySelectorAll(
      '.btn-post-action[data-ic-put-to*="/vote"]:not(.trx-votes-hidden)',
      '.btn-post-action[data-ic-delete-from*="/vote"]:not(.trx-votes-hidden)',
    );
    count += commentVotes.length;

    for (const vote of commentVotes) {
      vote.classList.add("trx-votes-hidden");
      if (!vote.textContent!.includes(" ")) {
        continue;
      }

      vote.textContent = vote.textContent!.slice(
        0,
        vote.textContent!.indexOf(" "),
      );
    }
  }

  if (data.ownComments) {
    const ownComments = querySelectorAll(".comment-votes");
    count += ownComments.length;
    for (const vote of ownComments) {
      vote.classList.add("trx-hidden");
    }
  }

  if (data.otherTopics || data.ownTopics) {
    const selectors: string[] = [];

    // Topics by other people will be encapsulated with a `<button>`.
    if (data.otherTopics) {
      selectors.push("button > .topic-voting-votes:not(.trx-votes-hidden)");
    }

    // Topics by yourself will be encapsulated with a `<div>`.
    if (data.ownTopics) {
      selectors.push("div > .topic-voting-votes:not(.trx-votes-hidden)");
    }

    const topicVotes = querySelectorAll(...selectors);
    count += topicVotes.length;
    for (const vote of topicVotes) {
      vote.classList.add("trx-votes-hidden");
      vote.textContent = "-";
    }
  }

  return count;
}
