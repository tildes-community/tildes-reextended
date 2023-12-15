import {offset, type Offset} from "caret-pos";
import {Component} from "preact";
import {type UserLabelsData} from "../../storage/exports.js";
import {log, querySelectorAll} from "../../utilities/exports.js";

type Props = {
  /**
   * Whether the Anonymize Usernames feature is enabled, in which case this
   * feature needs to handle collecting usernames a little differently.
   */
  anonymizeUsernamesEnabled: boolean;

  /** The list of known groups to use for the group autocompletions. */
  knownGroups: Set<string>;

  /**
   * All the User Labels the user has saved to use for additional username
   * completions.
   */
  userLabels: UserLabelsData;
};

type State = {
  /** All the groups without leading tildes. */
  groups: Set<string>;

  /** Whether the group autocompletion list is hidden or not. */
  groupsHidden: boolean;

  /** The current set of group matches. */
  groupsMatches: Set<string>;

  /** The position where the group autocompletion list should be shown. */
  groupsPosition: Offset | undefined;

  /** All the usernames without leading @-symbols. */
  usernames: Set<string>;

  /** Whether the username autocompletion list is hidden or not. */
  usernamesHidden: boolean;

  /** The current set of username matches. */
  usernamesMatches: Set<string>;

  /** The position where the username autocompletion list should be shown. */
  usernamesPosition: Offset | undefined;
};

export class AutocompleteFeature extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    // Get all the groups without their leading tildes.
    const groups = Array.from(props.knownGroups).map((value) =>
      value.startsWith("~") ? value.slice(1) : value,
    );

    const usernames = [
      // Get all the usernames on the page without their leading @-symbols.
      ...querySelectorAll<HTMLElement>(".link-user").map((value) => {
        if (props.anonymizeUsernamesEnabled) {
          return (value.dataset.trxUsername ?? "<unknown>").toLowerCase();
        }

        return value.textContent!.replace(/^@/, "").toLowerCase();
      }),
      // Get all the usernames from the saved User Labels.
      ...props.userLabels.map(({value}) => value.username),
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

    document.addEventListener("keydown", this.globalInputHandler);
    document.addEventListener("compositionupdate", this.globalInputHandler);

    log(
      `Autocomplete: Initialized with ${this.state.groups.size} groups and ` +
        `${this.state.usernames.size} usernames.`,
    );
  }

  /**
   * The global input handler for `keydown` and `compositionupdate` events.
   *
   * See https://gitlab.com/tildes-community/tildes-reextended/-/issues/31 for
   * why we also need to listen for `compositionupdate`.
   */
  globalInputHandler = (event: CompositionEvent | KeyboardEvent) => {
    const textarea = event.target;

    // Only add the autocompletes to textareas.
    if (!(textarea instanceof HTMLTextAreaElement)) {
      return;
    }

    // Helper function to create autocompletes with.
    const createHandler = (
      prefix: string,
      target: string,
      values: Set<string>,
    ) => {
      const dataAttribute = `data-trx-autocomplete-${target}`;

      // Get the key that was pressed.
      const key = event instanceof KeyboardEvent ? event.key : event.data;

      if (key === prefix && !textarea.getAttribute(dataAttribute)) {
        textarea.setAttribute(dataAttribute, "true");
        textarea.addEventListener("keyup", (event) => {
          if (!(event.target instanceof HTMLTextAreaElement)) {
            return;
          }

          this.textareaInputHandler(event.target, prefix, target, values);
        });

        this.textareaInputHandler(textarea, prefix, target, values);
      }
    };

    createHandler("~", "groups", this.state.groups);
    createHandler("@", "usernames", this.state.usernames);
  };

  /** The input handler for any `<textarea>` elements. */
  textareaInputHandler = (
    textarea: HTMLTextAreaElement,
    prefix: string,
    target: string,
    values: Set<string>,
  ) => {
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

    // If there is any whitespace in the input, return early. Usernames and
    // groups cannot have whitespace in them which means that the user has
    // finished typing what the autocomplete should handle.
    if (/\s/.test(input)) {
      this.hide(target);
      return;
    }

    // Find any values that match using case-insensitive includes.
    const matches = new Set<string>(
      [...values].filter((value) =>
        value.toLowerCase().includes(input.toLowerCase()),
      ),
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

  /** Update the available matches. */
  update = (target: string, matches: Set<string>) => {
    if (target === "groups") {
      this.setState({
        groupsMatches: matches,
      });
    } else if (target === "usernames") {
      this.setState({
        usernamesMatches: matches,
      });
    }
  };

  /** Show the autocomplete list in the given position. */
  show = (target: string, position: Offset) => {
    if (target === "groups") {
      this.setState({
        groupsHidden: false,
        groupsPosition: position,
      });
    } else if (target === "usernames") {
      this.setState({
        usernamesHidden: false,
        usernamesPosition: position,
      });
    }
  };

  /** Hide the autocomplete list. */
  hide = (target: string) => {
    if (target === "groups") {
      this.setState({groupsHidden: true});
    } else if (target === "usernames") {
      this.setState({usernamesHidden: true});
    }
  };

  render() {
    // Create the `<li>` elements for groups and usernames.
    const groups = [...this.state.groupsMatches].map((value) => (
      <li>~{value}</li>
    ));
    const usernames = [...this.state.usernamesMatches].map((value) => (
      <li>@{value}</li>
    ));

    // Figure out which lists are hidden.
    const groupsHidden = this.state.groupsHidden ? "trx-hidden" : "";
    const usernamesHidden = this.state.usernamesHidden ? "trx-hidden" : "";

    // Calculate the position for the `<ul>` elements.
    const groupsLeft = this.state.groupsPosition?.left ?? 0;
    const groupsTop =
      (this.state.groupsPosition?.top ?? 0) +
      (this.state.groupsPosition?.height ?? 0);

    const usernamesLeft = this.state.usernamesPosition?.left ?? 0;
    const usernamesTop =
      (this.state.usernamesPosition?.top ?? 0) +
      (this.state.usernamesPosition?.height ?? 0);

    return (
      <>
        <ul
          id="trx-autocomplete-usernames"
          class={`trx-autocomplete ${usernamesHidden}`}
          style={`left: ${usernamesLeft}px; top: ${usernamesTop}px`}
        >
          {usernames}
        </ul>
        <ul
          id="trx-autocomplete-groups"
          class={`trx-autocomplete ${groupsHidden}`}
          style={`left: ${groupsLeft}px; top: ${groupsTop}px`}
        >
          {groups}
        </ul>
      </>
    );
  }
}
