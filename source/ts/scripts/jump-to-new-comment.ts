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

function clickHandler(): void {
  // Scroll to the first new comment and remove the `.is-comment-new` class
  // from it.
  const newestComment: HTMLElement = querySelector('.comment.is-comment-new');
  if (newestComment.offsetParent === null) {
    // TODO: Instead of expanding all comments, only expand the ones necessary
    // to make the comment visible.
    const expandAllButton: HTMLButtonElement = querySelector(
      '[data-js-comment-expand-all-button]'
    );
    expandAllButton.click();
  }

  newestComment.scrollIntoView({behavior: 'smooth'});
  // TODO: Don't immediately remove the class after scrolling to it. But remove
  // it when scrolling to the next new comment after this one. I've decided to
  // leave this as a TODO as it complicates the code a little bit and it's only
  // a QOL feature.
  newestComment.classList.remove('is-comment-new');

  // If there's no new comments left, remove the button.
  if (document.querySelectorAll('.comment.is-comment-new').length === 0) {
    const jumpToNewCommentButton: HTMLAnchorElement = querySelector(
      '#trx-jump-to-new-comment'
    );
    jumpToNewCommentButton.remove();
  }
}
