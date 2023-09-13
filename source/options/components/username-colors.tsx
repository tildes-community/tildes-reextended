import {type Value} from "@holllo/webextension-storage";
import {Component} from "preact";
import {log} from "../../utilities/exports.js";
import {
  type UsernameColorsData,
  type UsernameColor,
  Feature,
  Data,
  createValueUsernamecolor,
  fromStorage,
} from "../../storage/exports.js";
import {Setting, type SettingProps} from "./index.js";

type State = {
  previewChecked: "off" | "foreground" | "background";
  usernameColors: UsernameColorsData;
  usernameColorsToRemove: UsernameColorsData;
  randomizeChecked: Value<boolean>;
};

export class UsernameColorsSetting extends Component<SettingProps, State> {
  constructor(props: SettingProps) {
    super(props);

    this.state = {
      previewChecked: "off",
      usernameColors: undefined!,
      usernameColorsToRemove: [],
      randomizeChecked: undefined!,
    };
  }

  async componentDidMount() {
    this.setState({
      randomizeChecked: await fromStorage(Data.RandomizeUsernameColors),
      usernameColors: await fromStorage(Feature.UsernameColors),
    });
  }

  addNewColor = async () => {
    let id = 1;
    if (this.state.usernameColors.length > 0) {
      id =
        this.state.usernameColors.sort((a, b) => b.value.id - a.value.id)[0]
          .value.id + 1;
    }

    const newColor = await createValueUsernamecolor({
      color: "",
      id,
      username: "",
    });

    this.state.usernameColors.push(newColor);
    this.setState({
      usernameColors: this.state.usernameColors,
    });
  };

  removeColor = async (targetId: number) => {
    const targetIndex = this.state.usernameColors.findIndex(
      ({value}) => value.id === targetId,
    );
    const usernameColorsToRemove = this.state.usernameColorsToRemove;
    usernameColorsToRemove.push(
      ...this.state.usernameColors.splice(targetIndex, 1),
    );
    this.setState({
      usernameColors: this.state.usernameColors,
      usernameColorsToRemove,
    });
  };

  saveChanges = async () => {
    for (const usernameColor of this.state.usernameColorsToRemove) {
      await usernameColor.remove();
    }

    for (const usernameColor of this.state.usernameColors) {
      await usernameColor.save();
    }

    this.setState({usernameColorsToRemove: []});
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

  toggleRandomized = async () => {
    const randomizeChecked = this.state.randomizeChecked;
    randomizeChecked.value = !randomizeChecked.value;
    await randomizeChecked.save();
    this.setState({randomizeChecked});
  };

  onInput = (event: Event, id: number, key: "color" | "username") => {
    const colorIndex = this.state.usernameColors.findIndex(
      ({value}) => value.id === id,
    );
    if (colorIndex === -1) {
      log(`Tried to edit unknown UsernameColor ID: ${id}`);
      return;
    }

    const newValue = (event.target as HTMLInputElement).value;
    this.state.usernameColors[colorIndex].value[key] = newValue;
    this.setState({usernameColors: this.state.usernameColors});
  };

  render() {
    const {previewChecked, usernameColors, randomizeChecked} = this.state;
    if (usernameColors === undefined) {
      return;
    }

    usernameColors.sort((a, b) => a.value.id - b.value.id);

    const editors = usernameColors.map(({value: {color, id, username}}) => {
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

      const removeHandler = async () => {
        await this.removeColor(id);
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
          <br />
          If randomize is enabled then all usernames will be given a random
          background color based on a hash of the username. Manually assigned
          colors will be applied normally.
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

          <ul class="checkbox-list">
            <li>
              <label class="styled-checkbox">
                <input
                  type="checkbox"
                  checked={randomizeChecked.value}
                  onClick={this.toggleRandomized}
                />
                Randomize Username Colors
              </label>
            </li>
          </ul>
        </div>

        {editors}
      </Setting>
    );
  }
}
