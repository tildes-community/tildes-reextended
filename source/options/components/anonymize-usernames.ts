import {html} from 'htm/preact';

import {Setting, SettingProps} from './index.js';

export function AnonymizeUsernamesSetting(props: SettingProps): TRXComponent {
  return html`
    <${Setting} ...${props}>
      <p class="info">
        Anonymizes usernames by replacing them with "Anonymous #".
        <br />
        Note that User Labels and Username Colors will still be applied to any
        usernames as normal.
      </p>
    <//>
  `;
}
