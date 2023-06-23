import {Component} from "preact";
import {type Value} from "@holllo/webextension-storage";
import {log} from "../../utilities/exports.js";
import {
  type UsernameColorsData,
  type UsernameColor,
  Feature,
  fromStorage,
} from "../../storage/common.js";
import {Setting, type SettingProps} from "./index.js";

type State = {
  previewChecked: "off" | "foreground" | "background";
  usernameColors: Value<UsernameColorsData>;
};

export class UsernameColorsSetting extends Component<SettingProps, State> {
  constructor(props: SettingProps) {
    super(props);

    this.state = {
      previewChecked: "off",
      usernameColors: undefined!,
    };
  }

  async componentDidMount() {
    this.setState({usernameColors: await fromStorage(Feature.UsernameColors)});
  }

  addNewColor = () => {
    let id = 1;
    if (this.state.usernameColors.value.length > 0) {
      id =
        this.state.usernameColors.value.sort((a, b) => b.id - a.id)[0].id + 1;
    }

    const newColor: UsernameColor = {
      color: "",
      id,
      username: "",
    };

    this.state.usernameColors.value.push(newColor);
    this.setState({
      usernameColors: this.state.usernameColors,
    });
  };

  removeColor = (targetId: number) => {
    const targetIndex = this.state.usernameColors.value.findIndex(
      ({id}) => id === targetId,
    );
    this.state.usernameColors.value.splice(targetIndex, 1);
    this.setState({usernameColors: this.state.usernameColors});
  };

  saveChanges = async () => {
    await this.state.usernameColors.save();
  };

  togglePreview = async () => {
    let {previewChecked} = this.state;

    // eslint-disable-next-line default-case
    switch (previewChecked) {
      case "off": {
        previewChecked = "foreground";
        break;
      }

      case "foreground": {
        previewChecked = "background";
        break;
      }

      case "background": {
        previewChecked = "off";
        break;
      }
    }

    this.setState({previewChecked});
  };

  onInput = (event: Event, id: number, key: "color" | "username") => {
    const colorIndex = this.state.usernameColors.value.findIndex(
      (color) => color.id === id,
    );
    if (colorIndex === -1) {
      log(`Tried to edit unknown UsernameColor ID: ${id}`);
      return;
    }

    const newValue = (event.target as HTMLInputElement).value;
    this.state.usernameColors.value[colorIndex][key] = newValue;
    this.setState({usernameColors: this.state.usernameColors});
  };

  render() {
    const {previewChecked, usernameColors} = this.state;
    if (usernameColors === undefined) {
      return;
    }

    usernameColors.value.sort((a, b) => a.id - b.id);

    const editors = usernameColors.value.map(({color, id, username}) => {
      const style: Record<string, string> = {};
      if (previewChecked === "background") {
        style.backgroundColor = color;
      } else if (previewChecked === "foreground") {
        style.color = color;
      }

      const usernameHandler = (event: Event) => {
        this.onInput(event, id, "username");
      };

      const colorHandler = (event: Event) => {
        this.onInput(event, id, "color");
      };

      const removeHandler = () => {
        this.removeColor(id);
      };

      return (
        <div class="username-colors-editor" key={id}>
          <input
            style={style}
            placeholder="Username(s)"
            value={username}
            onInput={usernameHandler}
          />
          <input
            style={style}
            placeholder="Color"
            value={color}
            onInput={colorHandler}
          />
          <button class="button destructive" onClick={removeHandler}>
            Remove
          </button>
        </div>
      );
    });

    return (
      <Setting {...this.props}>
        <p class="info">
          Assign custom colors to usernames.
          <br />
          You can enter multiple usernames separated by a comma if you want them
          to use the same color.
        </p>

        <div class="username-colors-controls">
          <button class="button" onClick={this.addNewColor}>
            Add New Color
          </button>

          <button class="button" onClick={this.togglePreview}>
            Toggle Preview
          </button>

          <button class="button" onClick={this.saveChanges}>
            Save Changes
          </button>
        </div>

        {editors}
      </Setting>
    );
  }
}
