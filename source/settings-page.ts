import {html} from 'htm/preact';
import {render} from 'preact';
import {useState} from 'preact/hooks';

import {
  AppContext,
  createReportTemplate,
  features,
  getManifest,
  getSettings,
  initialize,
  Link,
  setSettings,
  Settings,
  TRXManifest
} from '.';

window.addEventListener('load', async () => {
  initialize();

  render(
    html`<${App} manifest=${getManifest()} settings=${await getSettings()} />`,
    document.body
  );
});

type Props = {
  manifest: TRXManifest;
  settings: Settings;
};

function App(props: Props) {
  const {manifest, settings} = props;

  // Create some state to set the active feature tab.
  const [activeFeature, _setActiveFeature] = useState(
    settings.data.latestActiveFeatureTab
  );
  function setActiveFeature(feature: string) {
    // Update the state and save the settings.
    _setActiveFeature(feature);
    settings.data.latestActiveFeatureTab = feature;
    void setSettings(settings);
  }

  // Create some state to set the enabled features.
  const [enabledFeatures, _setFeature] = useState(
    new Set(
      Object.entries(settings.features)
        .filter(([_, value]) => value)
        .map(([key, _]) => key)
    )
  );
  function toggleFeature(feature: string) {
    settings.features[feature] = !settings.features[feature];
    const features = new Set(
      Object.entries(settings.features)
        .filter(([_, value]) => value)
        .map(([key, _]) => key)
    );
    _setFeature(features);
    void setSettings(settings);
  }

  // Create the version link for the header.
  const version = manifest.version;
  const versionURL = encodeURI(
    `https://gitlab.com/tildes-community/tildes-reextended/-/tags/${version}`
  );
  const versionLink = html`<${Link}
    class="version"
    text="v${version}"
    url="${versionURL}"
  />`;

  // Create the GitLab report a bug link for the footer.
  const gitlabTemplate = createReportTemplate('gitlab', version);
  const gitlabURL = encodeURI(
    `https://gitlab.com/tildes-community/tildes-reextended/issues/new?issue[description]=${gitlabTemplate}`
  );
  const gitlabLink = html`<${Link} text="GitLab" url="${gitlabURL}" />`;

  // Create the Tildes report a bug link for the footer.
  const tildesReportTemplate = createReportTemplate('tildes', version);
  const tildesURL = encodeURI(
    `https://tildes.net/user/Community/new_message?subject=Tildes ReExtended Bug&message=${tildesReportTemplate}`
  );
  const tildesLink = html`<${Link} text="Tildes" url="${tildesURL}" />`;

  const asideElements = features.map(
    ({key, value}) =>
      html`<li
        key=${key}
        class="${activeFeature === key ? 'active' : ''}
      ${enabledFeatures.has(key) ? 'enabled' : ''}"
        onClick="${() => setActiveFeature(key)}"
      >
        ${value}
      </li>`
  );

  const mainElements = features.map(
    ({key, value, component}) =>
      html`<${component()}
        class="${activeFeature === key ? '' : 'trx-hidden'}"
        enabled="${enabledFeatures.has(key)}"
        feature=${key}
        key=${key}
        title="${value}"
      />`
  );

  return html`
  <${AppContext.Provider} value=${{
    settings,
    setActiveFeature,
    toggleFeature
  }}>
    <header class="page-header">
      <h1>
        <img src="./assets/tildes-reextended-128.png" />
        Tildes ReExtended
      </h1>

      ${versionLink}
    </header>

    <div class="main-wrapper">
      <aside class="page-aside"><ul>${asideElements}</ul></aside>
      <main class="page-main">${mainElements}</main>
    </div>

    <footer class="page-footer">
      <p>Report a bug via ${gitlabLink} or ${tildesLink}.</p>
      <p>© Tildes Community and Contributors</p>
    </footer>
  </${AppContext.Provider}>
  `;
}

// Do not export anything from this file, otherwise if a content script
// somehow imports anything that is also connected to this file, it will try
// to run on Tildes as well. This file is solely for the extension options page!
