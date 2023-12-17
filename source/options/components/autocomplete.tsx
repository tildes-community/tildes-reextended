import {type JSX} from "preact";
import {Setting, type SettingProps} from "./index.js";

export function AutocompleteSetting(props: SettingProps): JSX.Element {
  return (
    <Setting {...props}>
      <p class="info">
        Adds autocompletion in textareas for user mentions (starting with{" "}
        <code>@</code>) and groups (starting with <code>~</code>).
        <br />
        When an autocompletion list is shown you can press <code>Tab</code> to
        move down the list and <code>Shift+Tab</code> to move up the list. To
        fill in your highlighted match press <code>Enter</code>.
      </p>
    </Setting>
  );
}
