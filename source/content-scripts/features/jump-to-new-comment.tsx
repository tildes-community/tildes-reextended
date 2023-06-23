import {Component} from "preact";
import {log, querySelector, querySelectorAll} from "../../utilities/exports.js";

type Props = Record<string, unknown>;

type State = {
  hidden: boolean;
  newCommentCount: number;
  previousComment: HTMLElement | undefined;
};

export class JumpToNewCommentFeature extends Component<Props, State> {
  constructor() {
    super();

    const newCommentCount = querySelectorAll(".comment.is-comment-new").length;

    this.state = {
      hidden: false,
      newCommentCount,
      previousComment: undefined,
    };

    if (newCommentCount === 0) {
      log("Jump To New Comment: 0 new comments found, not doing anything.");
    } else {
      log(
        `Jump To New Comment: Initialized for ${newCommentCount} new comments.`,
      );
    }
  }

  jump = () => {
    // Remove the new comment style from the previous
    // jumped comment if there is one.
    this.state.previousComment?.classList.remove("is-comment-new");

    const newestComment = document.querySelector<HTMLElement>(
      ".comment.is-comment-new",
    );

    // If there are no new comments left, hide the button.
    if (newestComment === null) {
      log("Jump To New Comment: Final comment reached, hiding the button.");
      this.setState({hidden: true});
      return;
    }

    // If the newest comment is invisible, expand all comments to make it visible.
    if (newestComment.offsetParent === null) {
      querySelector<HTMLElement>("[data-js-comment-expand-all-button]").click();
    }

    newestComment.scrollIntoView({behavior: "smooth"});
    this.setState({previousComment: newestComment});
  };

  render() {
    const newCommentCount = this.state.newCommentCount;

    // If there are no new comments, don't render anything.
    if (newCommentCount === 0) {
      return;
    }

    const commentsLeft = querySelectorAll(".comment.is-comment-new").length;
    const hidden = this.state.hidden ? "trx-hidden" : "";

    return (
      <a
        id="trx-jump-to-new-comment"
        class={`btn btn-primary ${hidden}`}
        onClick={this.jump}
      >
        Jump To New Comment ({commentsLeft}/{this.state.newCommentCount})
      </a>
    );
  }
}
