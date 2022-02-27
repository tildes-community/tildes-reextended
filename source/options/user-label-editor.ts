import {html} from 'htm/preact';
import {Component, render} from 'preact';

import Settings from '../settings.js';
import {
  initializeGlobals,
  isValidTildesUsername,
  log,
} from '../utilities/exports.js';

window.addEventListener('load', async () => {
  initializeGlobals();
  const settings = await Settings.fromSyncStorage();

  render(html`<${App} settings=${settings} />`, document.body);
});

type Props = {
  settings: Settings;
};

type State = {
  hasUnsavedChanges: boolean;
  newLabelUsername: string;
  userLabels: UserLabel[];
};

class App extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      hasUnsavedChanges: false,
      newLabelUsername: '',
      userLabels: props.settings.data.userLabels,
    };
  }

  addNewLabel = () => {
    const {newLabelUsername, userLabels} = this.state;
    if (!isValidTildesUsername(newLabelUsername)) {
      return;
    }

    const existingUserLabel = userLabels.find(
      ({username}) => username.toLowerCase() === newLabelUsername.toLowerCase(),
    );

    let id = 1;
    if (userLabels.length > 0) {
      id = userLabels.sort((a, b) => b.id - a.id)[0].id + 1;
    }

    userLabels.push({
      color: '#ff00ff',
      id,
      priority: 0,
      text: 'New Label',
      username: existingUserLabel?.username ?? newLabelUsername,
    });
    this.setState({userLabels});
  };

  onNewUsernameInput = (event: Event) => {
    const username = (event.target as HTMLInputElement).value;
    this.setState({newLabelUsername: username});
  };

  editUserLabel = (event: Event, targetId: number, key: keyof UserLabel) => {
    const index = this.state.userLabels.findIndex(({id}) => id === targetId);
    if (index === -1) {
      log(`Tried to edit UserLabel with unknown ID: ${targetId}`);
      return;
    }

    const newValue = (event.target as HTMLInputElement).value;
    if (key === 'id' || key === 'priority') {
      this.state.userLabels[index][key] = Number(newValue);
    } else {
      this.state.userLabels[index][key] = newValue;
    }

    this.setState({
      hasUnsavedChanges: true,
      userLabels: this.state.userLabels,
    });
  };

  removeUserLabel = (targetId: number) => {
    const userLabels = this.state.userLabels.filter(({id}) => id !== targetId);
    this.setState({
      hasUnsavedChanges: true,
      userLabels,
    });
  };

  saveUserLabels = () => {
    const {settings} = this.props;
    const {userLabels} = this.state;
    settings.data.userLabels = userLabels;
    void settings.save();
    this.setState({hasUnsavedChanges: false});
  };

  render() {
    const {hasUnsavedChanges, newLabelUsername, userLabels} = this.state;
    userLabels.sort((a, b) => a.username.localeCompare(b.username));

    const labelGroups: Map<string, UserLabel[]> = new Map();
    for (const label of userLabels) {
      const group = labelGroups.get(label.username) ?? [];
      group.push(label);
      labelGroups.set(label.username, group);
    }

    const labels: TRXComponent[] = [];
    for (const [username, group] of labelGroups) {
      group.sort((a, b) =>
        a.priority === b.priority
          ? a.text.localeCompare(b.text)
          : b.priority - a.priority,
      );
      const labelPreviews: TRXComponent[] = group.map(
        ({color, text}) => html`
          <span style=${{background: color}} class="label-preview">
            ${text}
          </span>
        `,
      );

      group.sort((a, b) => a.id - b.id);
      const userLabels: TRXComponent[] = [];
      for (const [index, label] of group.entries()) {
        const textHandler = (event: Event) => {
          this.editUserLabel(event, label.id, 'text');
        };

        const colorHandler = (event: Event) => {
          this.editUserLabel(event, label.id, 'color');
        };

        const priorityHandler = (event: Event) => {
          this.editUserLabel(event, label.id, 'priority');
        };

        const removeHandler = () => {
          this.removeUserLabel(label.id);
        };

        userLabels.push(
          html`
            <li key=${label.id}>
              <div>
                ${index === 0 ? html`<label>Text</label>` : undefined}
                <input
                  onInput=${textHandler}
                  placeholder="Text"
                  value=${label.text}
                />
              </div>

              <div>
                ${index === 0 ? html`<label>Color</label>` : undefined}
                <input
                  onInput=${colorHandler}
                  placeholder="Color"
                  value=${label.color}
                />
              </div>

              <div>
                ${index === 0 ? html`<label>Priority</label>` : undefined}
                <input
                  onInput=${priorityHandler}
                  placeholder="Priority"
                  type="number"
                  value=${label.priority}
                />
              </div>

              <div>
                ${index === 0 ? html`<label>Controls</label>` : undefined}
                <button class="button destructive" onClick=${removeHandler}>
                  Remove
                </button>
              </div>
            </li>
          `,
        );
      }

      labels.push(html`
        <div class="group">
          <h2>${username} ${labelPreviews}</h2>
          <ul>
            ${userLabels}
          </ul>
        </div>
      `);
    }

    return html`
      <header class="page-header">
        <h1>
          <img src="/assets/tildes-reextended-128.png" />
          User Label Editor
        </h1>
      </header>

      <main class="page-main user-label-editor">
        <p class="info">
          To add a new label, enter the username for who you'd like to add the
          label for, then press the Add New Label button.
          <br />
          <b>Changes are not automatically saved!</b>
          <br />
          If there are any unsaved changes an asterisk will appear in the Save
          All Changes button. To undo all unsaved changes simply refresh the
          page.
        </p>

        <div class="main-controls">
          <input
            onInput=${this.onNewUsernameInput}
            placeholder="Username"
            value=${newLabelUsername}
          />

          <button class="button" onClick=${this.addNewLabel}>
            Add New Label
          </button>

          <button class="button" onClick=${this.saveUserLabels}>
            Save All Changes${hasUnsavedChanges ? '*' : ''}
          </button>
        </div>
        <div class="groups">${labels}</div>
      </main>
    `;
  }
}
