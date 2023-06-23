import {Setting, type SettingProps} from "./index.js";

export function AnonymizeUsernamesSetting(props: SettingProps) {
  return (
    <Setting {...props}>
      <p class="info">
        Anonymizes usernames by replacing them with "Anonymous #".
        <br />
        Note that User Labels and Username Colors will still be applied to any
        usernames as normal.
      </p>
    </Setting>
  );
}
