import {html} from 'htm/preact';
import {useContext, useState} from 'preact/hooks';
import {
  AppContext,
  setSettings,
  Setting,
  SettingProps,
  TRXComponent
} from '../..';

export function HideVotesSetting(props: SettingProps): TRXComponent {
  const {settings} = useContext(AppContext);

  const [checked, setChecked] = useState(settings.data.hideVotes);
  function toggle(target: string) {
    checked[target] = !checked[target];
    setChecked(checked);

    settings.data.hideVotes = checked;
    void setSettings(settings);
  }

  // Checkbox labels and "targets". The targets should match the keys as defined
  // in the user extension settings.
  const checkboxes = [
    {label: 'Your comments', target: 'ownComments'},
    {label: 'Your topics', target: 'ownTopics'},
    {label: "Other's comments", target: 'comments'},
    {label: "Other's topics", target: 'topics'}
  ].map(
    ({label, target}) =>
      html`
        <li>
          <label>
            <input
              type="checkbox"
              checked=${checked[target]}
              onClick=${() => toggle(target)}
            />
            ${label}
          </label>
        </li>
      `
  );

  return html`<${Setting} ...${props}>
    <p class="info">
      Hides vote counts from topics and comments of yourself or other people.
    </p>

    <ul class="checkbox-list">
      ${checkboxes}
    </ul>
  <//>`;
}
