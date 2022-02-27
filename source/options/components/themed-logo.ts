import {html} from 'htm/preact';

import {Setting, SettingProps} from './index.js';

export function ThemedLogoSetting(props: SettingProps): TRXComponent {
  return html`
    <${Setting} ...${props}>
      <p class="info">
        Replaces the Tildes logo in the site header with a dynamic one that uses
        the colors of your chosen Tildes theme.
      </p>
    <//>
  `;
}
