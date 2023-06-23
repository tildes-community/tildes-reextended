import {type JSX} from "preact";
import {Setting, type SettingProps} from "./index.js";

export function ThemedLogoSetting(props: SettingProps): JSX.Element {
  return (
    <Setting {...props}>
      <p class="info">
        Replaces the Tildes logo in the site header with a dynamic one that uses
        the colors of your chosen Tildes theme.
      </p>
    </Setting>
  );
}
