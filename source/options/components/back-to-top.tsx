import {type JSX} from "preact";
import {Setting, type SettingProps} from "./index.js";

export function BackToTopSetting(props: SettingProps): JSX.Element {
  return (
    <Setting {...props}>
      <p class="info">
        Adds a hovering button to the bottom-right of all pages once you've
        scrolled down far enough that, when clicked, will scroll you back to the
        top of the page.
      </p>
    </Setting>
  );
}
