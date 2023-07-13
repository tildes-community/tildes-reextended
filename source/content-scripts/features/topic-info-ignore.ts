import {log, pluralize, querySelectorAll} from "../../utilities/exports.js";

export function runTopicInfoIgnore(): void {
  const count = moveIgnoreButtons();
  if (count > 0) {
    const pluralized = `${count} ${pluralize(count, "ignore button")}`;
    log(`Moved ${pluralized}`);
  }
}

function moveIgnoreButtons(): number {
  let count = 0;

  for (const topic of querySelectorAll(
    "article.topic:not(.trx-topic-info-ignore)",
  )) {
    const topicInfo = topic.querySelector(".topic-info") ?? undefined;
    if (topicInfo === undefined) {
      continue;
    }

    const button =
      topic.querySelector<HTMLButtonElement>('[name="topic-actions-ignore"]') ??
      undefined;
    if (button === undefined) {
      continue;
    }

    topic.classList.add("trx-topic-info-ignore");
    topicInfo.append(button);
    count++;
  }

  return count;
}
