import {
  createElementFromString,
  log,
  pluralize,
  querySelectorAll,
} from "../../../utilities/exports.js";

export function runShowTopicAuthorFeature(): void {
  const count = showTopicAuthor();
  if (count > 0) {
    const pluralized = `${count} ${pluralize(count, "topic")}`;
    log(`Show Topic Author applied to ${pluralized}.`);
  }
}

/**
 * Add topic author links to topics that don't already have a user linked in
 * their topic info source.
 */
function showTopicAuthor(): number {
  const topics = querySelectorAll<HTMLElement>(
    ".topic-listing .topic:not([data-trx-show-topic-author])",
  );

  let count = 0;
  for (const topic of topics) {
    const topicInfoSource =
      topic.querySelector<HTMLElement>(".topic-info-source");

    if (topicInfoSource?.querySelector(".link-user") !== null) {
      continue;
    }

    const author = topic.dataset.topicPostedBy;
    if (author === undefined) {
      // Technically this should never happen since deleted or removed topics
      // don't show in the topic listing.
      continue;
    }

    topicInfoSource.insertAdjacentElement(
      "afterbegin",
      createElementFromString(
        `<a class="link-user" href="/user/${author}">${author}</a>`,
      ),
    );
    topic.dataset.trxShowTopicAuthor = "true";
    count++;
  }

  return count;
}
