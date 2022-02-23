import {offset, Offset} from 'caret-pos';
import {html} from 'htm/preact';
import {Component} from 'preact';

import Settings from '../settings.js';
import {log, querySelectorAll} from '../utilities/exports.js';

type Props = {
  settings: Settings;
};

type State = {
  groups: Set<string>;
  groupsHidden: boolean;
  groupsMatches: Set<string>;
  groupsPosition: Offset | undefined;
  usernames: Set<string>;
  usernamesHidden: boolean;
  usernamesMatches: Set<string>;
  usernamesPosition: Offset | undefined;
};

export class AutocompleteFeature extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    // Get all the groups without their leading tildes.
    const groups = props.settings.data.knownGroups.map((value) =>
      value.startsWith('~') ? value.slice(1) : value,
    );

    // Get all the usernames on the page without their leading @s, and get
    // all the username from the saved user labels.
    const usernames = [
      ...querySelectorAll('.link-user').map((value) =>
        value.textContent!.replace(/^@/, '').toLowerCase(),
      ),
      ...props.settings.data.userLabels.map((value) => value.username),
    ].sort((a, b) => a.localeCompare(b));

    this.state = {
      groups: new Set(groups),
      groupsHidden: true,
      groupsMatches: new Set(groups),
      groupsPosition: undefined,
      usernames: new Set(usernames),
      usernamesHidden: true,
      usernamesMatches: new Set(usernames),
      usernamesPosition: undefined,
    };

    // Add a keydown listener for the entire page.
    document.addEventListener('keydown', this.globalInputHandler);

    log(
      `Autocomplete: Initialized with ${this.state.groups.size} groups and ` +
        `${this.state.usernames.size} usernames.`,
    );
  }

  globalInputHandler = (event: KeyboardEvent) => {
    const activeElement = document.activeElement as HTMLElement;
    // Only add the autocompletes to textareas.
    if (activeElement.tagName !== 'TEXTAREA') {
      return;
    }

    // Helper function to create autocompletes with.
    const createHandler = (
      prefix: string,
      target: string,
      values: Set<string>,
    ) => {
      const dataAttribute = `data-trx-autocomplete-${target}`;

      if (event.key === prefix && !activeElement.getAttribute(dataAttribute)) {
        activeElement.setAttribute(dataAttribute, 'true');
        activeElement.addEventListener('keyup', (event) => {
          this.textareaInputHandler(event, prefix, target, values);
        });

        this.textareaInputHandler(event, prefix, target, values);
      }
    };

    createHandler('~', 'groups', this.state.groups);
    createHandler('@', 'usernames', this.state.usernames);
  };

  textareaInputHandler = (
    event: KeyboardEvent,
    prefix: string,
    target: string,
    values: Set<string>,
  ) => {
    const textarea = event.target as HTMLTextAreaElement;
    const text = textarea.value;

    // If the prefix isn't in the textarea, return early.
    if (!text.includes(prefix)) {
      this.hide(target);
      return;
    }

    // Grab the starting position of the caret (text cursor).
    const position = textarea.selectionStart;

    // Grab the last index of the prefix inside the beginning of the textarea
    // and the starting position of the caret.
    const prefixIndex = text.slice(0, position).lastIndexOf(prefix);

    // Grab the input between the prefix and the caret position, which will be
    // what the user is currently typing.
    const input = text.slice(prefixIndex + prefix.length, position);

    // If there is any whitespace in the input or there is no input at all,
    // return early. Usernames cannot have whitespace in them.
    if (/\s/.test(input) || input === '') {
      this.hide(target);
      return;
    }

    // Find all the values that match the input using `includes`.
    const matches = new Set<string>(
      [...values].filter((value) => value.includes(input.toLowerCase())),
    );

    // If there are no matches, return early.
    if (matches.size === 0) {
      this.hide(target);
      return;
    }

    // Otherwise make sure the list is shown in the correct place and also
    // has all the new matches.
    this.show(target, offset(textarea));
    this.update(target, matches);
  };

  update = (target: string, matches: Set<string>) => {
    if (target === 'groups') {
      this.setState({
        groupsMatches: matches,
      });
    } else if (target === 'usernames') {
      this.setState({
        usernamesMatches: matches,
      });
    }
  };

  show = (target: string, position: Offset) => {
    if (target === 'groups') {
      this.setState({
        groupsHidden: false,
        groupsPosition: position,
      });
    } else if (target === 'usernames') {
      this.setState({
        usernamesHidden: false,
        usernamesPosition: position,
      });
    }
  };

  hide = (target: string) => {
    if (target === 'groups') {
      this.setState({groupsHidden: true});
    } else if (target === 'usernames') {
      this.setState({usernamesHidden: true});
    }
  };

  render() {
    // Create the list of groups and usernames.
    const groups = [...this.state.groupsMatches].map(
      (value) => html`<li>~${value}</li>`,
    );
    const usernames = [...this.state.usernamesMatches].map(
      (value) => html`<li>@${value}</li>`,
    );

    // Create the CSS class whether or not to hide the autocomplete.
    const groupsHidden = this.state.groupsHidden ? 'trx-hidden' : '';
    const usernamesHidden = this.state.usernamesHidden ? 'trx-hidden' : '';

    // Create the position for the group and usernames autocomplete.
    const groupsLeft = this.state.groupsPosition?.left ?? 0;
    const groupsTop =
      (this.state.groupsPosition?.top ?? 0) +
      (this.state.groupsPosition?.height ?? 0);

    const usernamesLeft = this.state.usernamesPosition?.left ?? 0;
    const usernamesTop =
      (this.state.usernamesPosition?.top ?? 0) +
      (this.state.usernamesPosition?.height ?? 0);

    return html`
      <ul
        id="trx-autocomplete-usernames"
        class="trx-autocomplete ${usernamesHidden}"
        style="left: ${usernamesLeft}px; top: ${usernamesTop}px"
      >
        ${usernames}
      </ul>
      <ul
        id="trx-autocomplete-groups"
        class="trx-autocomplete ${groupsHidden}"
        style="left: ${groupsLeft}px; top: ${groupsTop}px"
      >
        ${groups}
      </ul>
    `;
  }
}
