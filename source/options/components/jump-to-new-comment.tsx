import {type JSX} from "preact";
import {Setting, type SettingProps} from "./index.js";

export function JumpToNewCommentSetting(props: SettingProps): JSX.Element {
  return (
    <Setting {...props}>
      <p class="info">
        Adds a hovering button to the bottom-right of pages with new comments
        that, when clicked, will scroll you to the next new comment.
      </p>
    </Setting>
  );
}
