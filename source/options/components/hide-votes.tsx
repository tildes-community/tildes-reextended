import {Component} from "preact";
import {type Value} from "@holllo/webextension-storage";
import {
  fromStorage,
  Feature,
  type HideVotesData,
} from "../../storage/common.js";
import {Setting, type SettingProps} from "./index.js";

type State = {
  hideVotes: Value<HideVotesData>;
};

type HideVotesKey = keyof State["hideVotes"]["value"];

export class HideVotesSetting extends Component<SettingProps, State> {
  constructor(props: SettingProps) {
    super(props);

    this.state = {
      hideVotes: undefined!,
    };
  }

  async componentDidMount() {
    this.setState({hideVotes: await fromStorage(Feature.HideVotes)});
  }

  toggle(target: HideVotesKey): void {
    const hideVotes = this.state.hideVotes;
    hideVotes.value[target] = !hideVotes.value[target];
    void hideVotes.save();
    this.setState({hideVotes});
  }

  render() {
    const {hideVotes} = this.state;
    if (hideVotes === undefined) {
      return;
    }

    const checkboxesData: Array<{label: string; target: HideVotesKey}> = [
      {label: "Your comments", target: "ownComments"},
      {label: "Your topics", target: "ownTopics"},
      {label: "Other's comments", target: "otherComments"},
      {label: "Other's topics", target: "otherTopics"},
    ];

    const checkboxes = checkboxesData.map(({label, target}) => (
      <li>
        <label>
          <input
            type="checkbox"
            checked={hideVotes.value[target]}
            onClick={() => {
              this.toggle(target);
            }}
          />
          {label}
        </label>
      </li>
    ));

    return (
      <Setting {...this.props}>
        <p class="info">
          Hides vote counts from topics and comments of yourself or other
          people.
        </p>

        <ul class="checkbox-list">{checkboxes}</ul>
      </Setting>
    );
  }
}
