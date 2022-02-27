import {html} from 'htm/preact';
import {Component} from 'preact';

import Settings from '../../settings.js';
import {log} from '../../utilities/exports.js';
import {Setting, SettingProps} from './index.js';

type State = {
  previewChecked: 'off' | 'foreground' | 'background';
  usernameColors: UsernameColor[];
};

export class UsernameColorsSetting extends Component<SettingProps, State> {
  constructor(props: SettingProps) {
    super(props);

    this.state = {
      previewChecked: 'off',
      usernameColors: [],
    };
  }

  async componentDidMount() {
    const settings = await Settings.fromSyncStorage();
    this.setState({usernameColors: settings.data.usernameColors});
  }

  addNewColor = () => {
    let id = 1;
    if (this.state.usernameColors.length > 0) {
      id = this.state.usernameColors.sort((a, b) => b.id - a.id)[0].id + 1;
    }

    const newColor: UsernameColor = {
      color: '',
      id,
      username: '',
    };

    this.setState({
      usernameColors: [...this.state.usernameColors, newColor],
    });
  };

  removeColor = (targetId: number) => {
    const usernameColors = this.state.usernameColors.filter(
      ({id}) => id !== targetId,
    );
    this.setState({usernameColors});
  };

  saveChanges = async () => {
    const settings = await Settings.fromSyncStorage();
    settings.data.usernameColors = this.state.usernameColors;
    await settings.save();
  };

  togglePreview = async () => {
    let {previewChecked} = this.state;

    // eslint-disable-next-line default-case
    switch (previewChecked) {
      case 'off':
        previewChecked = 'foreground';
        break;
      case 'foreground':
        previewChecked = 'background';
        break;
      case 'background':
        previewChecked = 'off';
        break;
    }

    this.setState({previewChecked});
  };

  onInput = (event: Event, id: number, key: 'color' | 'username') => {
    const colorIndex = this.state.usernameColors.findIndex(
      (color) => color.id === id,
    );
    if (colorIndex === -1) {
      log(`Tried to edit unknown UsernameColor ID: ${id}`);
      return;
    }

    const newValue = (event.target as HTMLInputElement).value;
    this.state.usernameColors[colorIndex][key] = newValue;
    this.setState({usernameColors: this.state.usernameColors});
  };

  render() {
    const {previewChecked, usernameColors} = this.state;
    usernameColors.sort((a, b) => a.id - b.id);

    const editors = usernameColors.map(({color, id, username}) => {
      const style: Record<string, string> = {};
      if (previewChecked === 'background') {
        style.backgroundColor = color;
      } else if (previewChecked === 'foreground') {
        style.color = color;
      }

      const usernameHandler = (event: Event) => {
        this.onInput(event, id, 'username');
      };

      const colorHandler = (event: Event) => {
        this.onInput(event, id, 'color');
      };

      const removeHandler = () => {
        this.removeColor(id);
      };

      return html`
        <div class="username-colors-editor" key=${id}>
          <input
            style=${style}
            placeholder="Username(s)"
            value=${username}
            onInput=${usernameHandler}
          />
          <input
            style=${style}
            placeholder="Color"
            value=${color}
            onInput=${colorHandler}
          />
          <button class="button destructive" onClick=${removeHandler}>
            Remove
          </button>
        </div>
      `;
    });

    return html`
      <${Setting} ...${this.props}>
        <p class="info">
          Assign custom colors to usernames.
          <br />
          You can enter multiple usernames separated by a comma if you want them
          to use the same color.
        </p>

        <div class="username-colors-controls">
          <button class="button" onClick=${this.addNewColor}>
            Add New Color
          </button>

          <button class="button" onClick=${this.togglePreview}>
            Toggle Preview
          </button>

          <button class="button" onClick=${this.saveChanges}>
            Save Changes
          </button>
        </div>

        ${editors}
      <//>
    `;
  }
}
