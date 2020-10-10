import {html} from 'htm/preact';
import {Setting, SettingProps, TRXComponent} from '../..';

export function AutocompleteSetting(props: SettingProps): TRXComponent {
  return html`<${Setting} ...${props}>
    <p class="info">
      Adds autocompletion in textareas for user mentions (starting with${' '}
      <code>@</code>) and groups (starting with <code>~</code>).
    </p>
  <//>`;
}
