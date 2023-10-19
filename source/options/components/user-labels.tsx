import {Component} from "preact";
import {Data, fromStorage, type StorageValues} from "../../storage/exports.js";
import {Setting, type SettingProps} from "./index.js";

type State = {
  onSiteNewLabelEnabled:
    | Awaited<StorageValues[Data.OnSiteNewLabel]>
    | undefined;
};

export class UserLabelsSetting extends Component<SettingProps, State> {
  constructor(props: SettingProps) {
    super(props);

    this.state = {
      onSiteNewLabelEnabled: undefined,
    };
  }

  async componentDidMount() {
    this.setState({
      onSiteNewLabelEnabled: await fromStorage(Data.OnSiteNewLabel),
    });
  }

  toggleOnSiteNewLabelEnabled = async () => {
    const onSiteNewLabelEnabled = this.state.onSiteNewLabelEnabled!;
    onSiteNewLabelEnabled.value = !onSiteNewLabelEnabled.value;
    await onSiteNewLabelEnabled.save();
    this.setState({onSiteNewLabelEnabled});
  };

  render() {
    const {onSiteNewLabelEnabled} = this.state;
    if (onSiteNewLabelEnabled === undefined) {
      return;
    }

    return (
      <Setting {...this.props}>
        <p class="info">
          Adds a way to create customizable labels to users. Wherever a link to
          a person's profile is available, a <code>[+]</code> will be put next
          to it. Clicking on that will bring up a dialog to add a new label and
          clicking on existing labels will bring up the same dialog to edit
          them.
          <br />
          Or you can use the dedicated{" "}
          <a href="/options/user-label-editor.html">User Label Editor</a> to
          add, edit, or remove user labels.
        </p>

        <ul class="checkbox-list">
          <li>
            <label class="styled-checkbox">
              <input
                type="checkbox"
                checked={onSiteNewLabelEnabled.value}
                onClick={this.toggleOnSiteNewLabelEnabled}
              />
              Show new label editor next to usernames
            </label>
          </li>
        </ul>

        <details>
          <summary>View Customizable Values</summary>
          <ul class="user-label-values">
            <li>
              <b>Username</b>: who to apply the label to.
            </li>
            <li>
              <b>Priority</b>: determines the order of labels. If multiple
              labels have the same priority they will be sorted alphabetically.
              In the topic listing only the highest priority label will be
              shown.
            </li>
            <li>
              <b>Color</b>: will set the background color of the label. The
              foreground color is calculated to be black or white depending on
              the brightness of the background color.
              <br />
              Valid values are hex colors or <code>transparent</code>.
              <br />
              Colors based on your current Tildes theme are also available in
              the dropdown menu.
            </li>
            <li>
              <b>Text</b>: the text to go in the label. If left empty the label
              will show as a 12 by 12 pixel square instead.
            </li>
          </ul>
        </details>
      </Setting>
    );
  }
}
