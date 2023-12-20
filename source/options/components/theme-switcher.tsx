import {Component} from "preact";
import {type Value} from "@holllo/webextension-storage";
import {
  Data,
  Feature,
  fromStorage,
  type ThemeSwitcherData,
} from "../../storage/exports.js";
import {Setting, type SettingProps} from "./index.js";

type State = {
  data: Value<ThemeSwitcherData> | undefined;
  hasUnsavedChanges: boolean;
  themesList: Array<[string, string]>;
};

export class ThemeSwitcherSetting extends Component<SettingProps, State> {
  constructor(props: SettingProps) {
    super(props);

    this.state = {
      data: undefined,
      hasUnsavedChanges: false,
      themesList: [],
    };
  }

  async componentDidMount() {
    const themesList = await fromStorage(Data.ThemesList);
    this.setState({
      data: await fromStorage(Feature.ThemeSwitcher),
      themesList: themesList.value,
    });
  }

  onChange = (event: Event, key: keyof ThemeSwitcherData) => {
    const {data} = this.state;
    const target = event.target as HTMLInputElement | HTMLSelectElement;

    if (data === undefined) {
      return;
    }

    data.value[key] = target.value;
    this.setState({data, hasUnsavedChanges: true});
  };

  save = async () => {
    const {data} = this.state;
    if (data === undefined) {
      return;
    }

    await data.save();
    this.setState({hasUnsavedChanges: false});
  };

  render() {
    const {data, hasUnsavedChanges, themesList} = this.state;
    if (data === undefined) {
      return;
    }

    const themeOptions = themesList.map(([value, text]) => (
      <option value={value}>{text}</option>
    ));

    const unsavedChanges = hasUnsavedChanges ? "unsaved-changes" : "";

    return (
      <Setting {...this.props}>
        <p class="info">
          Automatically switch between two themes at certain times of the day.
          <br />
          The expected format for times is <code>HH:MM</code>.
        </p>

        <button
          class={`button margin-bottom-8 has-save-status ${unsavedChanges}`}
          onClick={this.save}
        >
          Save{hasUnsavedChanges ? "*" : ""}
        </button>

        <p>
          Switch to{" "}
          <select
            class="styled-select"
            onChange={(event) => {
              this.onChange(event, "themeA");
            }}
            value={data.value.themeA}
          >
            {themeOptions}
          </select>{" "}
          at{" "}
          <input
            class="styled-text-input"
            onChange={(event) => {
              this.onChange(event, "hourA");
            }}
            type="text"
            value={data.value.hourA}
          />
        </p>

        <p>
          Switch to{" "}
          <select
            class="styled-select"
            onChange={(event) => {
              this.onChange(event, "themeB");
            }}
            value={data.value.themeB}
          >
            {themeOptions}
          </select>{" "}
          at{" "}
          <input
            class="styled-text-input"
            onChange={(event) => {
              this.onChange(event, "hourB");
            }}
            type="text"
            value={data.value.hourB}
          />
        </p>
      </Setting>
    );
  }
}
