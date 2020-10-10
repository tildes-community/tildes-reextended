import {html} from 'htm/preact';
import {Setting, SettingProps, TRXComponent} from '../..';

export function UserLabelsSetting(props: SettingProps): TRXComponent {
  return html`<${Setting} ...${props}>
    <p class="info">
      Adds a way to create customizable labels to users. Wherever a link to a
      person's profile is available, a <code>[+]</code> will be put next to it.
      Clicking on that will bring up a dialog to add a new label and clicking on
      existing labels will bring up the same dialog to edit them.
    </p>

    <details>
      <summary>View Customizable Values</summary>
      <ul class="user-label-values">
        <li><b>Username</b>: who to apply the label to.</li>
        <li>
          <b>Priority</b>: determines the order of labels. If multiple labels
          have the same priority they will be sorted alphabetically. In the
          topic listing only the highest priority label will be shown.
        </li>
        <li>
          <b>Color</b>: will set the background color of the label. The
          foreground color is calculated to be black or white depending on the
          brightness of the background color.
          <br />
          Valid values are hex colors or <code>transparent</code>.
          <br />
          Colors based on your current Tildes theme are also available in the
          dropdown menu.
        </li>
        <li>
          <b>Text</b>: the text to go in the label. If left empty the label will
          show as a 12 by 12 pixel square instead.
        </li>
      </ul>
    </details>
  <//>`;
}
