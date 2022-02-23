import {html} from 'htm/preact';

import {Setting, SettingProps} from './index.js';

export function JumpToNewCommentSetting(props: SettingProps): TRXComponent {
  return html`
    <${Setting} ...${props}>
      <p class="info">
        Adds a hovering button to the bottom-right of pages with new comments
        that, when clicked, will scroll you to the next new comment.
      </p>
    <//>
  `;
}
