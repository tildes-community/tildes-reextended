import {Component, type JSX} from "preact";
import {
  type StorageValues,
  fromStorage,
  Data,
  MiscellaneousFeature,
} from "../../storage/exports.js";
import {Setting, type SettingProps} from "./index.js";

type State = {
  enabledFeatures: Awaited<StorageValues[Data.MiscellaneousEnabledFeatures]>;
};

function FeatureDescription({
  feature,
}: {
  feature: MiscellaneousFeature;
}): JSX.Element {
  if (feature === MiscellaneousFeature.CommentAnchorFix) {
    return (
      <p class="description">
        Uncollapses the linked-to comment if it is collapsed,{" "}
        <a href="https://gitlab.com/tildes/tildes/-/issues/256">#256</a>.
      </p>
    );
  }

  if (feature === MiscellaneousFeature.GroupListSubscribeButtons) {
    return (
      <p class="description">
        Add Subscribe and Unsubscribe buttons to the group list.
      </p>
    );
  }

  if (feature === MiscellaneousFeature.TopicInfoIgnore) {
    return (
      <p class="description">
        Moves the topic ignore button to be in the info section next to the
        posted date.
      </p>
    );
  }

  if (feature === MiscellaneousFeature.UnignoreAllButton) {
    return (
      <p class="description">
        Add an "Unignore All" button to your list of ignored topics.
      </p>
    );
  }

  return <></>;
}

export class MiscellaneousSetting extends Component<SettingProps, State> {
  constructor(props: SettingProps) {
    super(props);

    this.state = {
      enabledFeatures: undefined!,
    };
  }

  async componentDidMount() {
    this.setState({
      enabledFeatures: await fromStorage(Data.MiscellaneousEnabledFeatures),
    });
  }

  toggleFeature = async (feature: MiscellaneousFeature) => {
    const {enabledFeatures} = this.state;
    if (enabledFeatures.value.has(feature)) {
      enabledFeatures.value.delete(feature);
    } else {
      enabledFeatures.value.add(feature);
    }

    this.setState({enabledFeatures});
    await enabledFeatures.save();
  };

  render() {
    const {enabledFeatures} = this.state;
    if (enabledFeatures === undefined) {
      return <></>;
    }

    const checkboxes = Object.values(MiscellaneousFeature).map((feature) => {
      const enabled = enabledFeatures.value.has(feature);
      const clickHandler = async () => {
        await this.toggleFeature(feature);
      };

      return (
        <li class={enabled ? "enabled" : ""}>
          <label for={feature}>
            <input
              type="checkbox"
              id={feature}
              name={feature}
              checked={enabled}
              onClick={clickHandler}
            />
            {feature
              .replace(/-/g, " ")
              .replace(/(\b[a-z])/gi, (character) => character.toUpperCase())}
          </label>
          <FeatureDescription feature={feature} />
        </li>
      );
    });

    return (
      <Setting {...this.props}>
        <p class="info">
          Miscellaneous features and fixes, each one can be toggled individually
          by checking their respective checkbox.
        </p>

        <ul class="miscellaneous-features-list">{checkboxes}</ul>
      </Setting>
    );
  }
}
