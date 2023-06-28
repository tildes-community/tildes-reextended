import debounce from "debounce";
import {Component, render} from "preact";
import {
  type UserLabelsData,
  createValueUserLabel,
  saveUserLabels,
} from "../../storage/exports.js";
import {
  createElementFromString,
  isColorBright,
  log,
  querySelectorAll,
  themeColors,
} from "../../utilities/exports.js";

type Props = {
  anonymizeUsernamesEnabled: boolean;
  userLabels: UserLabelsData;
};

type State = {
  color: string;
  selectedColor: string;
  hidden: boolean;
  id: number | undefined;
  priority: number;
  target: HTMLElement | undefined;
  text: string;
  username: string;
};

export class UserLabelsFeature extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const selectedColor = window
      .getComputedStyle(document.body)
      .getPropertyValue(themeColors[1].value)
      .trim();

    this.state = {
      color: selectedColor,
      hidden: true,
      id: undefined,
      text: "",
      priority: 0,
      selectedColor,
      target: undefined,
      username: "",
    };

    const count = this.addLabelsToUsernames(querySelectorAll(".link-user"));
    log(`User Labels: Initialized for ${count} user links.`);
  }

  hide = () => {
    this.setState({hidden: true});
  };

  addLabelsToUsernames = (elements: HTMLElement[], onlyID?: number): number => {
    const {userLabels} = this.props;
    const inTopicListing = document.querySelector(".topic-listing") !== null;

    // Sort the labels by priority or alphabetically, so 2 labels with the same
    // priority will be sorted alphabetically.
    const sortedLabels = userLabels.sort((a, b): number => {
      if (inTopicListing) {
        // If we're in the topic listing sort with highest priority first.
        if (a.value.priority !== b.value.priority) {
          return b.value.priority - a.value.priority;
        }
      } else if (a.value.priority !== b.value.priority) {
        // If we're not in the topic listing, sort with lowest priority first.
        // We will add elements backwards, so the first label will be
        // behind all the other labels.
        return a.value.priority - b.value.priority;
      }

      return b.value.text.localeCompare(a.value.text);
    });

    for (const element of elements) {
      let username: string = element.textContent!.replace(/@/g, "");

      if (this.props.anonymizeUsernamesEnabled) {
        username = element.dataset.trxUsername ?? username;
      }

      const userLabels = sortedLabels.filter(
        ({value}) =>
          value.username.toLowerCase() === username.toLowerCase() &&
          (onlyID === undefined ? true : value.id === onlyID),
      );

      const addLabel = (
        <span
          class="trx-user-label-add"
          onClick={(event: MouseEvent) => {
            this.addLabelHandler(event, username);
          }}
        >
          [+]
        </span>
      );
      if (!inTopicListing && onlyID === undefined) {
        const addLabelPlaceholder = document.createElement("span");
        element.after(addLabelPlaceholder);
        render(addLabel, element.parentElement!, addLabelPlaceholder);
      }

      if (userLabels.length === 0 && onlyID === undefined) {
        if (
          inTopicListing &&
          (element.nextElementSibling === null ||
            !element.nextElementSibling.className.includes("trx-user-label"))
        ) {
          const addLabelPlaceholder = document.createElement("span");
          element.after(addLabelPlaceholder);
          render(addLabel, element.parentElement!, addLabelPlaceholder);
        }

        continue;
      }

      for (const userLabel of userLabels) {
        const bright = isColorBright(userLabel.value.color.trim())
          ? "trx-bright"
          : "";

        const label = createElementFromString<HTMLSpanElement>(`<span
          data-trx-label-id="${userLabel.value.id}"
          class="trx-user-label ${bright}"
        >
          ${userLabel.value.text}
        </span>`);

        label.addEventListener("click", (event: MouseEvent) => {
          this.editLabelHandler(event, userLabel.value.id);
        });

        element.after(label);
        label.setAttribute(
          "style",
          `background-color: ${userLabel.value.color};`,
        );

        // If we're in the topic listing, stop after adding 1 label.
        if (inTopicListing) {
          break;
        }
      }
    }

    return elements.length;
  };

  addLabelHandler = (event: MouseEvent, username: string) => {
    event.preventDefault();
    const target = event.target as HTMLElement;

    if (this.state.target === target && !this.state.hidden) {
      this.hide();
    } else {
      const selectedColor = window
        .getComputedStyle(document.body)
        .getPropertyValue(themeColors[1].value)
        .trim();

      this.setState({
        hidden: false,
        target,
        username,
        color: selectedColor,
        id: undefined,
        text: "",
        priority: 0,
        selectedColor,
      });
    }
  };

  editLabelHandler = (event: MouseEvent, id: number) => {
    event.preventDefault();
    const target = event.target as HTMLElement;

    if (this.state.target === target && !this.state.hidden) {
      this.hide();
    } else {
      const label = this.props.userLabels.find(({value}) => value.id === id);
      if (label === undefined) {
        log(
          "User Labels: Tried to edit label with ID that could not be found.",
          true,
        );
        return;
      }

      this.setState({
        hidden: false,
        target,
        color: label.value.color,
        id: label.value.id,
        priority: label.value.priority,
        text: label.value.text,
        username: label.value.username,
      });
    }
  };

  colorChange = (event: Event) => {
    const color = (event.target as HTMLInputElement).value.toLowerCase();

    // If the color was changed through the preset values, also change the
    // selected color state.
    if ((event.target as HTMLElement).tagName === "SELECT") {
      this.setState({color, selectedColor: color});
    } else {
      this.setState({color});
    }
  };

  labelChange = (event: Event) => {
    this.setState({text: (event.target as HTMLInputElement).value});
  };

  priorityChange = (event: Event) => {
    this.setState({
      priority: Number((event.target as HTMLInputElement).value),
    });
  };

  save = async (event: MouseEvent) => {
    event.preventDefault();
    const {color, id, text, priority, username} = this.state;
    if (color === "" || username === "") {
      log("Cannot save user label without all values present.");
      return;
    }

    const {userLabels} = this.props;
    // If no ID is present then save a new label otherwise edit the existing one.
    if (id === undefined) {
      let newId = 1;
      if (userLabels.length > 0) {
        newId =
          userLabels.sort((a, b) => b.value.id - a.value.id)[0].value.id + 1;
      }

      userLabels.push(
        await createValueUserLabel({
          color,
          id: newId,
          priority,
          text,
          username,
        }),
      );

      this.addLabelsToUsernames(querySelectorAll(".link-user"), newId);
    } else {
      const index = userLabels.findIndex(({value}) => value.id === id);
      userLabels.splice(index, 1);
      userLabels.push(
        await createValueUserLabel({
          id,
          color,
          priority,
          text,
          username,
        }),
      );

      const elements = querySelectorAll(`[data-trx-label-id="${id}"]`);
      const bright = isColorBright(color);
      for (const element of elements) {
        element.textContent = text;
        element.setAttribute("style", `background-color: ${color};`);
        if (bright) {
          element.classList.add("trx-bright");
        } else {
          element.classList.remove("trx-bright");
        }
      }
    }

    await saveUserLabels(userLabels);
    this.props.userLabels = userLabels;
    this.hide();
  };

  remove = async (event: MouseEvent) => {
    event.preventDefault();
    const {id} = this.state;
    if (id === undefined) {
      log("User Labels: Tried remove label when ID was undefined.");
      return;
    }

    const {userLabels} = this.props;
    const index = userLabels.findIndex(({value}) => value.id === id);
    if (index === undefined) {
      log(
        `User Labels: Tried to remove label with ID ${id} that could not be found.`,
        true,
      );
      return;
    }

    for (const value of querySelectorAll(`[data-trx-label-id="${id}"]`)) {
      value.remove();
    }

    for (const userLabel of userLabels.splice(index, 1)) {
      await userLabel.remove();
    }

    this.props.userLabels = userLabels;
    this.hide();
  };

  render() {
    const bodyStyle = window.getComputedStyle(document.body);
    const themeSelectOptions = themeColors.map(({name, value}) => (
      <option value={bodyStyle.getPropertyValue(value).trim()}>{name}</option>
    ));

    const bright = isColorBright(this.state.color) ? "trx-bright" : "";
    const hidden = this.state.hidden ? "trx-hidden" : "";
    const {color, text: label, priority, selectedColor, username} = this.state;

    let top = 0;
    let left = 0;

    const target = this.state.target;
    if (target !== undefined) {
      const bounds = target.getBoundingClientRect();
      top = bounds.y + bounds.height + 4 + window.scrollY;
      left = bounds.x + window.scrollX;
    }

    const position = `left: ${left}px; top: ${top}px;`;
    const previewStyle = `background-color: ${color}`;

    return (
      <form class={`trx-user-label-form ${hidden}`} style={position}>
        <div class="trx-label-username-priority">
          <label class="trx-label-username">
            Add New Label
            <input
              type="text"
              class="form-input"
              placeholder="Username"
              value={username}
              required
            />
          </label>

          <label class="trx-label-priority">
            Priority
            <input
              type="number"
              class="form-input"
              value={priority}
              onChange={this.priorityChange}
              required
            />
          </label>
        </div>

        <div>
          <label for="trx-label-color-input">Pick A Color</label>

          <div class="trx-label-grid">
            <input
              id="trx-label-color-input"
              type="text"
              class="form-input"
              placeholder="Color"
              value={color}
              onInput={debounce(this.colorChange, 250)}
              required
            />

            <select
              class="form-select"
              value={selectedColor}
              onChange={this.colorChange}
            >
              {themeSelectOptions}
            </select>
          </div>
        </div>

        <div>
          <label for="trx-label-input">Label</label>

          <div class="trx-label-grid">
            <input
              id="trx-label-input"
              type="text"
              class="form-input"
              placeholder="Text"
              value={label}
              onInput={debounce(this.labelChange, 250)}
            />

            <div class={`trx-label-preview ${bright}`} style={previewStyle}>
              <p>{label}</p>
            </div>
          </div>
        </div>

        <div class="trx-label-actions">
          <a class="btn-post-action" onClick={this.save}>
            Save
          </a>
          <a class="btn-post-action" onClick={this.hide}>
            Close
          </a>
          <a class="btn-post-action" onClick={this.remove}>
            Remove
          </a>
        </div>
      </form>
    );
  }
}
