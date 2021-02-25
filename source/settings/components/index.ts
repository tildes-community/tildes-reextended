import {html} from 'htm/preact';
import {useContext} from 'preact/hooks';
import {AppContext, TRXComponent} from '../..';

export type SettingProps = {
  children: TRXComponent | undefined;
  class: string;
  enabled: boolean;
  feature: string;
  title: string;
};

function Header(props: SettingProps): TRXComponent {
  const context = useContext(AppContext);
  const enabled = props.enabled ? 'Enabled' : 'Disabled';

  return html`<header>
    <h2>${props.title}</h2>
    <button
      onClick="${() => {
        context.toggleFeature(props.feature);
      }}"
    >
      ${enabled}
    </button>
  </header>`;
}

// A base component for all the settings, this adds the header and the
// enable/disable buttons. This can also be used as a placeholder for new
// settings when you're still developing them.
export function Setting(props: SettingProps): TRXComponent {
  const children =
    props.children === undefined
      ? html`<p class="info">This setting still needs a component!</p>`
      : props.children;

  const enabled = (props.enabled ? 'Enabled' : 'Disabled').toLowerCase();

  return html`
    <section class="setting ${props.class} ${enabled}">
      <${Header} ...${props} />
      <div class="content">${children}</div>
    </section>
  `;
}

export * from './about';
export * from './autocomplete';
export * from './back-to-top';
export * from './hide-votes';
export * from './jump-to-new-comment';
export * from './markdown-toolbar';
export * from './user-labels';
