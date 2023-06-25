import {type HideVotesData} from "../../storage/common.js";
import {log, querySelectorAll} from "../../utilities/exports.js";

export function runHideVotesFeature(data: HideVotesData) {
  const counts = hideVotes(data);
  log(`Hide Votes: Initialized for ${counts} votes.`);
}

function hideVotes(data: HideVotesData): number {
  let count = 0;

  // Get the username of the currently logged in user. When not logged in, set
  // it to "<logged out>" which isn't a valid username, so matching against it
  // will always return false. Meaning all comments are never the current user's.
  const currentUser =
    document.querySelector(".logged-in-user-username")?.textContent?.trim() ??
    "<logged out>";

  if (data.otherComments || data.ownComments) {
    count += hideCommentVotes(data, currentUser);
  }

  if (data.otherTopics || data.ownTopics) {
    count += hideTopicVotes(data, currentUser);
  }

  return count;
}

/**
 * Hide vote displays from comments.
 * @param data The {@link HideVotesData}.
 * @param currentUser The username of the currently logged in user.
 * @returns The amount of vote displays that have been hidden.
 */
function hideCommentVotes(data: HideVotesData, currentUser: string): number {
  let count = 0;
  for (const comment of querySelectorAll(".comment-itself")) {
    const postedBySelf =
      comment.querySelector("header .link-user")?.textContent?.trim() ===
      currentUser;

    if (data.otherComments && !postedBySelf) {
      // The vote element can be a "Vote" button, an "Unvote" button or a
      // regular text display when you can't vote anymore.
      const vote =
        comment.querySelector(
          '.btn-post-action[data-ic-put-to*="/vote"]:not(.trx-votes-hidden)',
        ) ??
        comment.querySelector(
          '.btn-post-action[data-ic-delete-from*="/vote"]:not(.trx-votes-hidden)',
        ) ??
        comment.querySelector(".comment-votes:not(.trx-votes-hidden)");

      if (vote === null) {
        continue;
      }

      count++;
      vote.classList.add("trx-votes-hidden");

      if (vote.tagName === "BUTTON") {
        // If the vote element is a button, only remove the number from the text.
        if (!vote.textContent!.includes(" ")) {
          // If there is no space in the text, it means there are no votes on
          // this comment yet.
          continue;
        }

        vote.textContent = vote.textContent!.slice(
          0,
          vote.textContent!.indexOf(" "),
        );
      } else {
        // Otherwise if it's the regular text display, hide it entirely.
        vote.classList.add("trx-hidden");
      }
    } else if (data.ownComments && postedBySelf) {
      // Votes from our own comments are always the regular text display.
      const vote = comment.querySelector(
        ".comment-votes:not(.trx-votes-hidden)",
      );
      if (vote === null) {
        continue;
      }

      count++;
      vote.classList.add("trx-votes-hidden", "trx-hidden");
    }
  }

  return count;
}

/**
 * Hide vote displays from topics.
 * @param data The {@link HideVotesData}.
 * @param currentUser The username of the currently logged in user.
 * @returns The amount of vote displays that have been hidden.
 */
function hideTopicVotes(data: HideVotesData, currentUser: string): number {
  let count = 0;
  for (const topic of querySelectorAll<HTMLElement>(".topic")) {
    const postedBySelf = topic.dataset.topicPostedBy === currentUser;

    let vote: Element | undefined;

    // Select the vote number from the topic if we want to hide other's topics
    // and it's not posted by the current user. Or if we want to hide our own
    // topics and it *is* posted by the current user.
    if (
      (data.otherTopics && !postedBySelf) ||
      (data.ownTopics && postedBySelf)
    ) {
      vote = topic.querySelector(".topic-voting-votes") ?? undefined;
    }

    if (vote !== undefined) {
      vote.classList.add("trx-votes-hidden");
      vote.textContent = "-";
      count++;
    }
  }

  return count;
}
