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
  createValueUserLabel,
  saveUserLabels,
  newUserLabelId,
} from "../storage/exports.js";
import "../scss/index.scss";
import "../scss/user-label-editor.scss";

window.addEventListener("load", async () => {
  initializeGlobals();
  const userLabels = await fromStorage(Feature.UserLabels);
  render(<App userLabels={userLabels} />, document.body);
});

type Props = {
  userLabels: UserLabelsData;
};

type State = {
  newLabelUsername: string;
  unsavedUserLabelIds: Set<number>;
  userLabels: UserLabelsData;
  userLabelsToRemove: UserLabelsData;
};

class App extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      newLabelUsername: "",
      unsavedUserLabelIds: new Set(),
      userLabels: props.userLabels,
      userLabelsToRemove: [],
    };
  }

  addNewLabel = async () => {
    const {newLabelUsername, unsavedUserLabelIds, userLabels} = this.state;
    if (!isValidTildesUsername(newLabelUsername)) {
      return;
    }

    const existingUserLabel = userLabels.find(
      ({value: {username}}) =>
        username.toLowerCase() === newLabelUsername.toLowerCase(),
    );

    const id = await newUserLabelId();
    const userLabel = await createValueUserLabel({
      color: "#ff00ff",
      id,
      priority: 0,
      text: "New Label",
      username: existingUserLabel?.value.username ?? newLabelUsername,
    });
    await userLabel.save();
    userLabels.push(userLabel);
    unsavedUserLabelIds.add(id);
    this.setState({unsavedUserLabelIds, userLabels});
  };

  onNewUsernameInput = (event: Event) => {
    const username = (event.target as HTMLInputElement).value;
    this.setState({newLabelUsername: username});
  };

  editUserLabel = (event: Event, targetId: number, key: keyof UserLabel) => {
    const {unsavedUserLabelIds} = this.state;
    const index = this.state.userLabels.findIndex(
      ({value: {id}}) => id === targetId,
    );
    if (index === -1) {
      log(`Tried to edit UserLabel with unknown ID: ${targetId}`);
      return;
    }

    const newValue = (event.target as HTMLInputElement).value;
    // eslint-disable-next-line unicorn/prefer-ternary
    if (key === "id" || key === "priority") {
      this.state.userLabels[index].value[key] = Number(newValue);
    } else {
      this.state.userLabels[index].value[key] = newValue;
    }

    unsavedUserLabelIds.add(targetId);
    this.setState({
      unsavedUserLabelIds,
      userLabels: this.state.userLabels,
    });
  };

  removeUserLabel = async (targetId: number) => {
    const {unsavedUserLabelIds, userLabels, userLabelsToRemove} = this.state;
    const index = userLabels.findIndex(({value}) => value.id === targetId);
    userLabelsToRemove.push(...userLabels.splice(index, 1));
    unsavedUserLabelIds.add(targetId);

    this.setState({
      unsavedUserLabelIds,
      userLabels,
      userLabelsToRemove,
    });
  };

  saveUserLabels = async () => {
    for (const userLabel of this.state.userLabelsToRemove) {
      await userLabel.remove();
    }

    this.props.userLabels = this.state.userLabels;
    void saveUserLabels(this.props.userLabels);
    this.setState({unsavedUserLabelIds: new Set(), userLabelsToRemove: []});
  };

  render() {
    const {newLabelUsername, unsavedUserLabelIds, userLabels} = this.state;
    userLabels.sort((a, b) => a.value.username.localeCompare(b.value.username));

    const labelGroups = new Map<string, UserLabel[]>();
    for (const label of userLabels) {
      const username = label.value.username.toLowerCase();
      const group = labelGroups.get(username) ?? [];
      group.push(label.value);
      labelGroups.set(username, group);
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

        const removeHandler = async () => {
          await this.removeUserLabel(label.id);
        };

        const hasUnsavedChanges = unsavedUserLabelIds.has(label.id);
        userLabels.push(
          <li class={hasUnsavedChanges ? "unsaved-changes" : ""} key={label.id}>
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

    const anyUnsavedChanges = unsavedUserLabelIds.size > 0;
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

            <button
              class={`save-button button ${
                anyUnsavedChanges ? "unsaved-changes" : ""
              }`}
              onClick={this.saveUserLabels}
            >
              Save All Changes{anyUnsavedChanges ? "*" : ""}
            </button>
          </div>
          <div class="groups">{labels}</div>
        </main>
      </>
    );
  }
}
