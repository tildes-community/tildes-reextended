import debounce from 'debounce';
import {Component, render} from 'preact';
import {html} from 'htm/preact';

import Settings from '../settings.js';
import {
  createElementFromString,
  isColorBright,
  isValidHexColor,
  log,
  querySelectorAll,
  themeColors,
} from '../utilities/exports.js';

type Props = {
  settings: Settings;
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

const colorPattern: string = [
  '^(?:#(?:', // (?:) are non-capturing groups.
  '[a-f\\d]{8}|', // The order of 8 -> 6 -> 4 -> 3 character hex colors matters.
  '[a-f\\d]{6}|',
  '[a-f\\d]{4}|',
  '[a-f\\d]{3})',
  '|transparent)$', // "Transparent" is also allowed in the input.
].join('');

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
      text: '',
      priority: 0,
      selectedColor,
      target: undefined,
      username: '',
    };

    const count = this.addLabelsToUsernames(querySelectorAll('.link-user'));
    log(`User Labels: Initialized for ${count} user links.`);
  }

  hide = () => {
    this.setState({hidden: true});
  };

  addLabelsToUsernames = (elements: Element[], onlyID?: number): number => {
    const settings = this.props.settings;
    const inTopicListing = document.querySelector('.topic-listing') !== null;

    // Sort the labels by priority or alphabetically, so 2 labels with the same
    // priority will be sorted alphabetically.
    const sortedLabels = settings.data.userLabels.sort((a, b): number => {
      if (inTopicListing) {
        // If we're in the topic listing sort with highest priority first.
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
      } else if (a.priority !== b.priority) {
        // If we're not in the topic listing, sort with lowest priority first.
        // We will add elements backwards, so the first label will be
        // behind all the other labels.
        return a.priority - b.priority;
      }

      return b.text.localeCompare(a.text);
    });

    for (const element of elements) {
      const username: string = element
        .textContent!.replace(/@/g, '')
        .toLowerCase();

      const userLabels = sortedLabels.filter(
        (value) =>
          value.username === username &&
          (onlyID === undefined ? true : value.id === onlyID),
      );

      const addLabel = html`
        <span
          class="trx-user-label-add"
          onClick=${(event: MouseEvent) => {
            this.addLabelHandler(event, username);
          }}
        >
          [+]
        </span>
      `;

      if (!inTopicListing && onlyID === undefined) {
        const addLabelPlaceholder = document.createElement('span');
        element.after(addLabelPlaceholder);
        render(addLabel, element.parentElement!, addLabelPlaceholder);
      }

      if (userLabels.length === 0 && onlyID === undefined) {
        if (
          inTopicListing &&
          (element.nextElementSibling === null ||
            !element.nextElementSibling.className.includes('trx-user-label'))
        ) {
          const addLabelPlaceholder = document.createElement('span');
          element.after(addLabelPlaceholder);
          render(addLabel, element.parentElement!, addLabelPlaceholder);
        }

        continue;
      }

      for (const userLabel of userLabels) {
        const bright = isColorBright(userLabel.color.trim())
          ? 'trx-bright'
          : '';

        const label = createElementFromString<HTMLSpanElement>(`<span
          data-trx-label-id="${userLabel.id}"
          class="trx-user-label ${bright}"
        >
          ${userLabel.text}
        </span>`);

        label.addEventListener('click', (event: MouseEvent) => {
          this.editLabelHandler(event, userLabel.id);
        });

        element.after(label);
        label.setAttribute('style', `background-color: ${userLabel.color};`);

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
        text: '',
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
      const label = this.props.settings.data.userLabels.find(
        (value) => value.id === id,
      );
      if (label === undefined) {
        log(
          'User Labels: Tried to edit label with ID that could not be found.',
          true,
        );
        return;
      }

      this.setState({
        hidden: false,
        target,
        ...label,
      });
    }
  };

  colorChange = (event: Event) => {
    let color: string = (event.target as HTMLInputElement).value.toLowerCase();
    if (!color.startsWith('#') && !color.startsWith('t') && color.length > 0) {
      color = `#${color}`;
    }

    if (color !== 'transparent' && !isValidHexColor(color)) {
      log('User Labels: Color must be a valid hex color or "transparent".');
    }

    // If the color was changed through the preset values, also change the
    // selected color state.
    if ((event.target as HTMLElement).tagName === 'SELECT') {
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
    if (color === '' || username === '') {
      log('Cannot save user label without all values present.');
      return;
    }

    const {settings} = this.props;
    // If no ID is present then save a new label otherwise edit the existing one.
    if (id === undefined) {
      let newID = 1;
      if (settings.data.userLabels.length > 0) {
        newID = settings.data.userLabels.sort((a, b) => b.id - a.id)[0].id + 1;
      }

      settings.data.userLabels.push({
        color,
        id: newID,
        priority,
        text,
        username,
      });

      this.addLabelsToUsernames(querySelectorAll('.link-user'), newID);
    } else {
      const index = settings.data.userLabels.findIndex(
        (value) => value.id === id,
      );
      settings.data.userLabels.splice(index, 1);
      settings.data.userLabels.push({
        id,
        color,
        priority,
        text,
        username,
      });

      const elements = querySelectorAll(`[data-trx-label-id="${id}"]`);
      const bright = isColorBright(color);
      for (const element of elements) {
        element.textContent = text;
        element.setAttribute('style', `background-color: ${color};`);
        if (bright) {
          element.classList.add('trx-bright');
        } else {
          element.classList.remove('trx-bright');
        }
      }
    }

    await settings.save();
    this.props.settings = settings;
    this.hide();
  };

  remove = async (event: MouseEvent) => {
    event.preventDefault();
    const {id} = this.state;
    if (id === undefined) {
      log('User Labels: Tried remove label when ID was undefined.');
      return;
    }

    const {settings} = this.props;
    const index = settings.data.userLabels.findIndex(
      (value) => value.id === id,
    );
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

    settings.data.userLabels.splice(index, 1);
    await settings.save();
    this.props.settings = settings;
    this.hide();
  };

  render() {
    const bodyStyle = window.getComputedStyle(document.body);
    const themeSelectOptions = themeColors.map(
      ({name, value}) =>
        html`
          <option value="${bodyStyle.getPropertyValue(value).trim()}">
            ${name}
          </option>
        `,
    );

    const bright = isColorBright(this.state.color) ? 'trx-bright' : '';
    const hidden = this.state.hidden ? 'trx-hidden' : '';
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

    return html`
      <form class="trx-user-label-form ${hidden}" style="${position}">
        <div class="trx-label-username-priority">
          <label class="trx-label-username">
            Add New Label
            <input
              type="text"
              class="form-input"
              placeholder="Username"
              value="${username}"
              required
            />
          </label>

          <label class="trx-label-priority">
            Priority
            <input
              type="number"
              class="form-input"
              value="${priority}"
              onChange=${this.priorityChange}
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
              value="${color}"
              onInput=${debounce(this.colorChange, 250)}
              pattern="${colorPattern}"
              required
            />

            <select
              class="form-select"
              value="${selectedColor}"
              onChange="${this.colorChange}"
            >
              ${themeSelectOptions}
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
              value="${label}"
              onInput=${debounce(this.labelChange, 250)}
            />

            <div class="trx-label-preview ${bright}" style="${previewStyle}">
              <p>${label}</p>
            </div>
          </div>
        </div>

        <div class="trx-label-actions">
          <a class="btn-post-action" onClick=${this.save}>Save</a>
          <a class="btn-post-action" onClick=${this.hide}>Close</a>
          <a class="btn-post-action" onClick=${this.remove}>Remove</a>
        </div>
      </form>
    `;
  }
}
