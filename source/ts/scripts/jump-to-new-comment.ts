import {
  getSettings,
  Settings,
  createElementFromString,
  querySelector
} from '../utilities';

(async (): Promise<void> => {
  const settings: Settings = await getSettings();
  if (
    !settings.features.jumpToNewComment ||
    !window.location.pathname.startsWith('/~') ||
    document.querySelectorAll('.comment.is-comment-new').length === 0
  ) {
    return;
  }

  // Create the Jump To New Comment button.
  const jumpToNewCommentButton: HTMLAnchorElement = createElementFromString(
    '<a id="trx-jump-to-new-comment" class="btn btn-primary">Jump To New Comment</a>'
  );
  jumpToNewCommentButton.addEventListener('click', clickHandler);
  document.body.append(jumpToNewCommentButton);
})();

let previousComment: HTMLElement | null = null;

function clickHandler(): void {
  if (previousComment !== null) {
    previousComment.classList.remove('is-comment-new');
  }

  // If there's no new comments left, remove the button.
  if (document.querySelectorAll('.comment.is-comment-new').length === 0) {
    const jumpToNewCommentButton: HTMLAnchorElement = querySelector(
      '#trx-jump-to-new-comment'
    );
    jumpToNewCommentButton.remove();
  }

  const newestComment: HTMLElement | null = document.querySelector(
    '.comment.is-comment-new'
  );

  if (newestComment === null) {
    return;
  }

  // If the newest comment is invisible, expand all comments to make it visible.
  if (newestComment.offsetParent === null) {
    // TODO: Instead of expanding all comments, only expand the ones necessary
    // to make the comment visible.
    const expandAllButton: HTMLButtonElement = querySelector(
      '[data-js-comment-expand-all-button]'
    );
    expandAllButton.click();
  }

  newestComment.scrollIntoView({behavior: 'smooth'});
  previousComment = newestComment;
}
