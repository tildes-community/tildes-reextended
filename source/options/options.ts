import {html} from 'htm/preact';
import {Component, render} from 'preact';

import Settings from '../settings.js';
import {
  Link,
  createReportTemplate,
  initializeGlobals,
} from '../utilities/exports.js';
import {AppContext} from './context.js';
import {features} from './features.js';

window.addEventListener('load', async () => {
  initializeGlobals();
  const settings = await Settings.fromSyncStorage();

  render(
    html`<${App} manifest=${settings.manifest()} settings=${settings} />`,
    document.body,
  );
});

type Props = {
  manifest: TRXManifest;
  settings: Settings;
};

type State = {
  activeFeature: string;
  enabledFeatures: Set<string>;
};

class App extends Component<Props, State> {
  state: State;

  constructor(props: Props) {
    super(props);

    const {settings} = props;

    this.state = {
      activeFeature: settings.data.latestActiveFeatureTab,
      enabledFeatures: this.getEnabledFeatures(),
    };
  }

  getEnabledFeatures = (): Set<string> => {
    return new Set(
      Object.entries(this.props.settings.features)
        .filter(([_, value]) => value)
        .map(([key, _]) => key),
    );
  };

  setActiveFeature = (feature: string) => {
    const {settings} = this.props;
    settings.data.latestActiveFeatureTab = feature;
    void settings.save();

    this.setState({activeFeature: feature});
  };

  toggleFeature = (feature: string) => {
    const {settings} = this.props;
    settings.features[feature] = !settings.features[feature];
    void settings.save();

    const features = this.getEnabledFeatures();
    this.setState({enabledFeatures: features});
  };

  render() {
    const {manifest, settings} = this.props;
    const {activeFeature, enabledFeatures} = this.state;

    // Create the version link for the header.
    const version = manifest.version;
    const versionURL = encodeURI(
      `https://gitlab.com/tildes-community/tildes-reextended/-/tags/${version}`,
    );
    const versionLink = html`
      <${Link} class="version" text="v${version}" url="${versionURL}" />
    `;

    // Create the GitLab report a bug link for the footer.
    const gitlabTemplate = createReportTemplate('gitlab', version);
    const gitlabURL = encodeURI(
      `https://gitlab.com/tildes-community/tildes-reextended/issues/new?issue[description]=${gitlabTemplate}`,
    );
    const gitlabLink = html`<${Link} text="GitLab" url="${gitlabURL}" />`;

    // Create the Tildes report a bug link for the footer.
    const tildesReportTemplate = createReportTemplate('tildes', version);
    const tildesURL = encodeURI(
      `https://tildes.net/user/Community/new_message?subject=Tildes ReExtended Bug&message=${tildesReportTemplate}`,
    );
    const tildesLink = html`<${Link} text="Tildes" url="${tildesURL}" />`;

    const asideElements = features.map(
      ({key, title}) =>
        html`
          <li
            key=${key}
            class="${activeFeature === key ? 'active' : ''}
                ${enabledFeatures.has(key) ? 'enabled' : ''}"
            onClick="${() => {
              this.setActiveFeature(key);
            }}"
          >
            ${title}
          </li>
        `,
    );

    const mainElements = features.map(
      ({key, title, component}) =>
        html`
          <${component()}
            class="${activeFeature === key ? '' : 'trx-hidden'}"
            enabled="${enabledFeatures.has(key)}"
            feature=${key}
            key=${key}
            title="${title}"
          />
        `,
    );

    return html`
      <${AppContext.Provider}
        value=${{
          settings,
          setActiveFeature: this.setActiveFeature,
          toggleFeature: this.toggleFeature,
        }}
      >
        <header class="page-header">
          <h1>
            <img src="../assets/tildes-reextended-128.png" />
            Tildes ReExtended
          </h1>

          ${versionLink}
        </header>

        <div class="main-wrapper">
          <aside class="page-aside">
            <ul>
              ${asideElements}
            </ul>
          </aside>
          <main class="page-main">${mainElements}</main>
        </div>

        <footer class="page-footer">
          <p>Report a bug via ${gitlabLink} or ${tildesLink}.</p>
          <p>© Tildes Community and Contributors</p>
        </footer>
      <//>
    `;
  }
}
