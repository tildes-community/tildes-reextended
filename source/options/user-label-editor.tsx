import {Component, render, type JSX} from "preact";
import {type Value} from "@holllo/webextension-storage";
import {
  initializeGlobals,
  isValidTildesUsername,
  log,
} from "../utilities/exports.js";
import {
  type UserLabelsData,
  type UserLabel,
  fromStorage,
  Feature,
} from "../storage/common.js";
import "../scss/index.scss";
import "../scss/user-label-editor.scss";

window.addEventListener("load", async () => {
  initializeGlobals();
  const userLabels = await fromStorage(Feature.UserLabels);
  render(<App userLabels={userLabels} />, document.body);
});

type Props = {
  userLabels: Value<UserLabelsData>;
};

type State = {
  hasUnsavedChanges: boolean;
  newLabelUsername: string;
  userLabels: UserLabelsData;
};

class App extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      hasUnsavedChanges: false,
      newLabelUsername: "",
      userLabels: props.userLabels.value,
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
      color: "#ff00ff",
      id,
      priority: 0,
      text: "New Label",
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
    // eslint-disable-next-line unicorn/prefer-ternary
    if (key === "id" || key === "priority") {
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
    this.props.userLabels.value = this.state.userLabels;
    void this.props.userLabels.save();
    this.setState({hasUnsavedChanges: false});
  };

  render() {
    const {hasUnsavedChanges, newLabelUsername, userLabels} = this.state;
    userLabels.sort((a, b) => a.username.localeCompare(b.username));

    const labelGroups = new Map<string, UserLabel[]>();
    for (const label of userLabels) {
      const group = labelGroups.get(label.username) ?? [];
      group.push(label);
      labelGroups.set(label.username, group);
    }

    const labels: JSX.Element[] = [];
    for (const [username, group] of labelGroups) {
      group.sort((a, b) =>
        a.priority === b.priority
          ? a.text.localeCompare(b.text)
          : b.priority - a.priority,
      );
      const labelPreviews: JSX.Element[] = group.map(({color, text}) => (
        <span style={{background: color}} class="label-preview">
          {text}
        </span>
      ));

      group.sort((a, b) => a.id - b.id);
      const userLabels: JSX.Element[] = [];
      for (const [index, label] of group.entries()) {
        const textHandler = (event: Event) => {
          this.editUserLabel(event, label.id, "text");
        };

        const colorHandler = (event: Event) => {
          this.editUserLabel(event, label.id, "color");
        };

        const priorityHandler = (event: Event) => {
          this.editUserLabel(event, label.id, "priority");
        };

        const removeHandler = () => {
          this.removeUserLabel(label.id);
        };

        userLabels.push(
          <li key={label.id}>
            <div>
              {index === 0 ? <label>Text</label> : undefined}
              <input
                onInput={textHandler}
                placeholder="Text"
                value={label.text}
              />
            </div>

            <div>
              {index === 0 ? <label>Color</label> : undefined}
              <input
                onInput={colorHandler}
                placeholder="Color"
                value={label.color}
              />
            </div>

            <div>
              {index === 0 ? <label>Priority</label> : undefined}
              <input
                onInput={priorityHandler}
                placeholder="Priority"
                type="number"
                value={label.priority}
              />
            </div>

            <div>
              {index === 0 ? <label>Controls</label> : undefined}
              <button class="button destructive" onClick={removeHandler}>
                Remove
              </button>
            </div>
          </li>,
        );
      }

      labels.push(
        <div class="group">
          <h2>
            {username} {labelPreviews}
          </h2>
          <ul>{userLabels}</ul>
        </div>,
      );
    }

    return (
      <>
        <header class="page-header">
          <h1>
            <img src="/tildes-reextended.png" />
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
              onInput={this.onNewUsernameInput}
              placeholder="Username"
              value={newLabelUsername}
            />

            <button class="button" onClick={this.addNewLabel}>
              Add New Label
            </button>

            <button class="button" onClick={this.saveUserLabels}>
              Save All Changes{hasUnsavedChanges ? "*" : ""}
            </button>
          </div>
          <div class="groups">{labels}</div>
        </main>
      </>
    );
  }
}
