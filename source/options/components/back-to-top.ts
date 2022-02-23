import {html} from 'htm/preact';

import {Setting, SettingProps} from './index.js';

export function BackToTopSetting(props: SettingProps): TRXComponent {
  return html`
    <${Setting} ...${props}>
      <p class="info">
        Adds a hovering button to the bottom-right of all pages once you've
        scrolled down far enough that, when clicked, will scroll you back to the
        top of the page.
      </p>
    <//>
  `;
}
