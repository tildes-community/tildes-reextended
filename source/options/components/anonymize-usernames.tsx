import {Component} from "preact";
import {
  fromStorage,
  isReplacementType,
  Feature,
  ReplacementType,
} from "../../storage/exports.js";
import {Setting, type SettingProps} from "./index.js";

type State = {
  data?: Awaited<ReturnType<typeof fromStorage<Feature.AnonymizeUsernames>>>;
};

export class AnonymizeUsernamesSetting extends Component<SettingProps, State> {
  constructor(props: SettingProps) {
    super(props);

    this.state = {
      data: undefined,
    };
  }

  async componentDidMount(): Promise<void> {
    const data = await fromStorage(Feature.AnonymizeUsernames);
    this.setState({data});
  }

  replacementTypeChanged = async (event: Event) => {
    const newValue = (event.target as HTMLInputElement)!.value;
    const {data} = this.state;
    if (data === undefined || !isReplacementType(newValue)) {
      return;
    }

    data.value.replacementType = newValue;
    await data.save();
    this.setState({data});
  };

  render() {
    const {data} = this.state;
    if (data === undefined) {
      return;
    }

    const replacementType = data.value.replacementType;
    const replacementTypeOptions = Object.values(ReplacementType).map((key) => (
      <option selected={key === replacementType} value={key}>
        {key
          .replaceAll("-", " ")
          .replaceAll(/(\b[a-z])/gi, (character) => character.toUpperCase())}
      </option>
    ));

    return (
      <Setting {...this.props}>
        <p class="info">
          Anonymizes usernames by replacing them with an incrementing "Anonymous
          #" or a SHA-256 hash of the username.
          <br />
          Note that User Labels and Username Colors will still be applied to any
          usernames as normal.
        </p>

        <ul class="checkbox-list">
          <li>
            <label for="anonymize-usernames-replacement-type">
              Replacement type:
            </label>{" "}
            <select
              class="styled-select"
              name="anonymize-usernames-replacement-type"
              id="anonymize-usernames-replacement-type"
              onChange={this.replacementTypeChanged}
            >
              {replacementTypeOptions}
            </select>
          </li>
        </ul>
      </Setting>
    );
  }
}
