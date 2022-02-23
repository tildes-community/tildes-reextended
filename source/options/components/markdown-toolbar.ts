import {html} from 'htm/preact';

import {Link} from '../../utilities/exports.js';
import {Setting, SettingProps} from './index.js';

export function MarkdownToolbarSetting(props: SettingProps): TRXComponent {
  return html`
    <${Setting} ...${props}>
      <p class="info">
        Adds a toolbar with a selection of Markdown snippets that when used will
        insert the according Markdown where your cursor is. Particularly useful
        for the${' '}
        <${Link}
          url="https://docs.tildes.net/instructions/text-formatting#expandable-sections"
          text="expandable section"
        />
        /spoilerbox syntax. If you have text selected, the Markdown will be
        inserted around your text.

        <br />

        A full list of the snippets is available${' '}
        <${Link}
          url="https://gitlab.com/tildes-community/tildes-reextended/-/issues/12"
          text="on GitLab"
        />
        .
      </p>
    <//>
  `;
}
