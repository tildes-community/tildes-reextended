import {log, pluralize} from "../../../utilities/exports.js";

export function runCommentAnchorFixFeature(): void {
  const count = commentAnchorFix();
  if (count > 0) {
    const pluralized = `${count} ${pluralize(count, "comment")}`;
    log(`Comment Anchor Fix applied, uncollapsed ${pluralized}.`);
  }
}

/**
 * Apply the comment anchor fix, uncollapsing any collapsed comments and
 * scrolling the linked comment into view.
 */
function commentAnchorFix(): number {
  const anchor = window.location.hash;

  // Linked comments follow the `#comment-<base 36 ID>` pattern.
  if (!/^#comment-[a-z\d]+$/i.test(anchor)) {
    return 0;
  }

  // Conveniently, the anchor including the leading hash is a valid CSS selector
  // for the target comment, so we can directly select it.
  const targetComment =
    document.querySelector<HTMLElement>(anchor) ?? undefined;
  if (targetComment === undefined) {
    return 0;
  }

  const count = recursiveUncollapseParent(
    // Start from the comment's first child so the target comment also has the
    // collapse classes removed. The collapse styling accomodates for `:target`
    // so this isn't technically necessary, but this way we make sure it stays
    // uncollapsed even if the `:target` changes. It also makes the returned
    // count correct as otherwise this comment wouldn't be included.
    targetComment.firstElementChild ?? targetComment,
    0,
  );
  if (count > 0) {
    targetComment.scrollIntoView({behavior: "smooth"});
  }

  return count;
}

/**
 * Recursively go up the chain of comments uncollapsing each one until it
 * reaches the `ol#comments` list or no parents remain, returning how many
 * comments have been uncollapsed.
 * @param target The current target to select its parent from.
 */
function recursiveUncollapseParent(target: Element, count: number): number {
  const parent = target.parentElement ?? undefined;
  if (parent === undefined || parent.id === "comments") {
    return count;
  }

  for (const collapsedClass of [
    "is-comment-collapsed",
    "is-comment-collapsed-individual",
  ]) {
    if (parent.classList.contains(collapsedClass)) {
      parent.classList.remove(collapsedClass);
      count++;
    }
  }

  return recursiveUncollapseParent(parent, count);
}
