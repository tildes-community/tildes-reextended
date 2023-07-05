import {Component, render} from "preact";
import browser from "webextension-polyfill";
import {type Value} from "@holllo/webextension-storage";
import "../scss/index.scss";
import {
  Link,
  createReportTemplate,
  initializeGlobals,
} from "../utilities/exports.js";
import {type Feature, Data, fromStorage} from "../storage/exports.js";
import {AppContext} from "./context.js";
import {features} from "./features.js";

window.addEventListener("DOMContentLoaded", async () => {
  if ($test) {
    await import("../storage/migrations/migrations.test.js");
  }

  initializeGlobals();
  const manifest = browser.runtime.getManifest();

  render(<App manifest={manifest} />, document.body);
});

type Props = {
  manifest: browser.Manifest.WebExtensionManifest;
};

type State = {
  activeFeature: Value<Feature>;
  enabledFeatures: Value<Set<Feature>>;
};

class App extends Component<Props, State> {
  state: State;

  // Duration for how long the "NEW" indicator should appear next to a feature,
  // currently 14 days.
  readonly newFeatureDuration = 14 * 24 * 60 * 60 * 1000;

  constructor(props: Props) {
    super(props);

    this.state = {
      activeFeature: undefined!,
      enabledFeatures: undefined!,
    };
  }

  async componentDidMount() {
    this.setState({
      activeFeature: await fromStorage(Data.LatestActiveFeatureTab),
      enabledFeatures: await fromStorage(Data.EnabledFeatures),
    });
  }

  setActiveFeature = (feature: Feature) => {
    const {activeFeature} = this.state;
    activeFeature.value = feature;
    void activeFeature.save();
    this.setState({activeFeature});
  };

  toggleFeature = (feature: Feature) => {
    const {enabledFeatures} = this.state;
    if (enabledFeatures.value.has(feature)) {
      enabledFeatures.value.delete(feature);
    } else {
      enabledFeatures.value.add(feature);
    }

    void enabledFeatures.save();
    this.setState({enabledFeatures});
  };

  render() {
    const {manifest} = this.props;
    const {activeFeature, enabledFeatures} = this.state;
    if (activeFeature === undefined || enabledFeatures === undefined) {
      return;
    }

    // Create the version link for the header.
    const version = manifest.version;
    const versionUrl = encodeURI(
      `https://gitlab.com/tildes-community/tildes-reextended/-/releases/${version}`,
    );
    const versionLink = (
      <Link class="version" text={`v${version}`} url={versionUrl} />
    );
    // Create the GitLab report a bug link for the footer.
    const gitlabTemplate = createReportTemplate("gitlab", version);
    const gitlabUrl = encodeURI(
      `https://gitlab.com/tildes-community/tildes-reextended/issues/new?issue[description]=${gitlabTemplate}`,
    );
    const gitlabLink = <Link text="GitLab" url={gitlabUrl} />;

    // Create the Tildes report a bug link for the footer.
    const tildesReportTemplate = createReportTemplate("tildes", version);
    const tildesUrl = encodeURI(
      `https://tildes.net/user/Community/new_message?subject=Tildes ReExtended Bug&message=${tildesReportTemplate}`,
    );
    const tildesLink = <Link text="Tildes" url={tildesUrl} />;

    const asideElements = features.map(({availableSince, key, title}) => {
      const isNew =
        Date.now() - availableSince.getTime() < this.newFeatureDuration ? (
          <span class="is-new">NEW</span>
        ) : undefined;

      return (
        <li
          key={key}
          class={`${activeFeature.value === key ? "active" : ""}
                ${enabledFeatures.value.has(key) ? "enabled" : ""}`}
          onClick={() => {
            this.setActiveFeature(key);
          }}
        >
          {title}
          {isNew}
        </li>
      );
    });

    const mainElements = features.map(({key, title, component: Setting}) => {
      return (
        <Setting
          class={activeFeature.value === key ? "" : "trx-hidden"}
          enabled={enabledFeatures.value.has(key)}
          feature={key}
          key={key}
          title={title}
        />
      );
    });

    return (
      <AppContext.Provider
        value={{
          setActiveFeature: this.setActiveFeature,
          toggleFeature: this.toggleFeature,
        }}
      >
        <header class="page-header">
          <h1>
            <img src="/tildes-reextended.png" />
            Tildes ReExtended
          </h1>
          {versionLink}
        </header>

        <div class="main-wrapper">
          <aside class="page-aside">
            <ul>{asideElements}</ul>
          </aside>
          <main class="page-main">{mainElements}</main>
        </div>

        <footer class="page-footer">
          <p>
            Report a bug via {gitlabLink} or {tildesLink}.
          </p>
          <p>© Tildes Community and Contributors</p>
        </footer>
      </AppContext.Provider>
    );
  }
}
