import {type JSX} from "preact";
import {Setting, type SettingProps} from "./index.js";

export function AutocompleteSetting(props: SettingProps): JSX.Element {
  return (
    <Setting {...props}>
      <p class="info">
        Adds autocompletion in textareas for user mentions (starting with{" "}
        <code>@</code>) and groups (starting with <code>~</code>).
      </p>
    </Setting>
  );
}
