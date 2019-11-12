import {Settings, getSettings} from '../utilities';

(async (): Promise<void> => {
  const settings: Settings = await getSettings();
  if (!settings.features.hideVotes) {
    return;
  }

  const observer: MutationObserver = new window.MutationObserver(
    async (): Promise<void> => {
      observer.disconnect();
      await hideVotes();
      startObserver();
    }
  );

  function startObserver(): void {
    observer.observe(document, {
      childList: true,
      subtree: true
    });
  }

  await hideVotes();
  startObserver();
})();

async function hideVotes(): Promise<void> {
  const settings: Settings = await getSettings();
  if (settings.data.hideVotes.comments) {
    const commentVotes: HTMLButtonElement[] = [
      ...document.querySelectorAll(
        '.btn-post-action[name="vote"]:not(.trx-votes-hidden)'
      ),
      ...document.querySelectorAll(
        '.btn-post-action[name="unvote"]:not(.trx-votes-hidden)'
      )
    ] as HTMLButtonElement[];
    for (const vote of commentVotes) {
      vote.classList.add('trx-votes-hidden');
      vote.textContent = vote.textContent!.slice(
        0,
        vote.textContent!.indexOf(' ')
      );
    }
  }

  if (settings.data.hideVotes.ownComments) {
    const commentVotes: NodeListOf<HTMLDivElement> = document.querySelectorAll(
      '.comment-votes'
    );
    for (const vote of commentVotes) {
      vote.classList.add('trx-hidden');
    }
  }

  if (settings.data.hideVotes.topics || settings.data.hideVotes.ownTopics) {
    // Topics by other people will be encapsulated with a `<button>`.
    const topicVotes: Element[] = [];
    if (settings.data.hideVotes.topics) {
      topicVotes.push(
        ...document.querySelectorAll(
          'button > .topic-voting-votes:not(.trx-votes-hidden)'
        )
      );
    }

    // Topics by yourself will be encapsulated with a `<div>`.
    if (settings.data.hideVotes.ownTopics) {
      topicVotes.push(
        ...document.querySelectorAll(
          'div > .topic-voting-votes:not(.trx-votes-hidden)'
        )
      );
    }

    for (const vote of topicVotes) {
      vote.classList.add('trx-votes-hidden');
      vote.textContent = '-';
    }
  }
}
