import {Component, type ComponentChildren, type JSX} from "preact";
// eslint-disable-next-line n/file-extension-in-import
import {useContext} from "preact/hooks";
import {AppContext} from "../context.js";
import {type Feature} from "../../storage/exports.js";

export type SettingProps = {
  children: ComponentChildren;
  class: string;
  enabled: boolean;
  feature: Feature;
  title: string;
};

class Header extends Component<SettingProps> {
  render() {
    const {props} = this;
    const context = useContext(AppContext);
    const enabled = props.enabled ? "Enabled" : "Disabled";

    return (
      <header>
        <h2>{props.title}</h2>
        <button
          onClick={() => {
            context.toggleFeature(props.feature);
          }}
        >
          {enabled}
        </button>
      </header>
    );
  }
}

// A base component for all the settings, this adds the header and the
// enable/disable buttons. This can also be used as a placeholder for new
// settings when you're still developing them.
export function Setting(props: SettingProps): JSX.Element {
  const children = props.children ?? (
    <p class="info">This setting still needs a component!</p>
  );

  const enabled = (props.enabled ? "Enabled" : "Disabled").toLowerCase();

  return (
    <section class={`setting ${props.class} ${enabled}`}>
      <Header {...props} />
      <div class="content">{children}</div>
    </section>
  );
}
