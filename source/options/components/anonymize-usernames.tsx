import {Component} from "preact";
import {fromStorage, Feature} from "../../storage/exports.js";
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
    if (data === undefined) {
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

    return (
      <Setting {...this.props}>
        <p class="info">
          Anonymizes usernames by replacing them with "Anonymous #".
          <br />
          Note that User Labels and Username Colors will still be applied to any
          usernames as normal.
        </p>

        <ul class="checkbox-list">
          <li>
            <select onChange={this.replacementTypeChanged}>
              <option
                selected={replacementType === "numerical"}
                value="numerical"
              >
                Numerical
              </option>
              <option selected={replacementType === "hashed"} value="hashed">
                Hashed
              </option>
            </select>
          </li>
        </ul>
      </Setting>
    );
  }
}
