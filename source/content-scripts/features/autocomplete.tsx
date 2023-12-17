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

  /** The currently highlighted match index of the active list. */
  highlightedIndex: number;

  /** Whether the user is currently typing in an autocomplete section. */
  typingInAutocomplete: boolean;

  /** All the usernames without leading @-symbols. */
  usernames: Set<string>;

  /** Whether the username autocompletion list is hidden or not. */
  usernamesHidden: boolean;

  /** The current set of username matches. */
  usernamesMatches: Set<string>;

  /** The position where the username autocompletion list should be shown. */
  usernamesPosition: Offset | undefined;
};

/** All the properties we need to handle `<textarea>` input. */
type TextareaInputProps = {
  /** Which key is being pressed. */
  key: string;

  /** The prefix for the autocomplete to detect. */
  prefix: "~" | "@";

  /** Whether SHIFT is being pressed. */
  shift: boolean;

  /** The list of values we are targetting. */
  target: "groups" | "usernames";

  /** The `<textarea>` element. */
  textarea: HTMLTextAreaElement;

  /** The current set of values to match against. */
  values: Set<string>;
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
      highlightedIndex: 0,
      typingInAutocomplete: false,
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

    // Get the key that was pressed.
    const [key, shift] =
      event instanceof KeyboardEvent
        ? [event.key, event.shiftKey]
        : [event.data, false];

    if (this.state.typingInAutocomplete && ["Enter", "Tab"].includes(key)) {
      // If the user is typing with an autocomplete list active then prevent
      // certain keys from taking effect, like Tab moving the focus away.
      event.preventDefault();
    }

    // Helper function to create autocompletes with.
    const createHandler = (
      prefix: TextareaInputProps["prefix"],
      target: TextareaInputProps["target"],
      values: TextareaInputProps["values"],
    ) => {
      const dataAttribute = `data-trx-autocomplete-${target}`;

      if (key === prefix && !textarea.getAttribute(dataAttribute)) {
        textarea.setAttribute(dataAttribute, "true");
        textarea.addEventListener("keyup", (innerEvent) => {
          this.textareaInputHandler({
            key: innerEvent.key,
            prefix,
            shift: innerEvent.shiftKey,
            target,
            textarea,
            values,
          });
        });

        this.textareaInputHandler({
          key,
          prefix,
          shift,
          target,
          textarea,
          values,
        });
      }
    };

    createHandler("~", "groups", this.state.groups);
    createHandler("@", "usernames", this.state.usernames);

    if (["~", "@"].includes(key)) {
      // When an autocomplete is first started manually set that we're typing
      // in it.
      this.setState({typingInAutocomplete: true});
    }
  };

  /** The input handler for any `<textarea>` elements. */
  textareaInputHandler = (props: TextareaInputProps) => {
    const {key, prefix, shift, target, textarea, values} = props;
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
      if (key === " " || key === "Backspace") {
        // If Space or Backspace were pressed and there was nothing between the
        // prefix and current cursor position then it means we don't want to
        // continue showing the autocomplete list.
        this.hide(target);
      }

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

    let {highlightedIndex} = this.state;
    if (key === "Enter") {
      // Grab the highlighted match.
      const highlightedMatch = Array.from(matches)[highlightedIndex];
      if (highlightedMatch === undefined) {
        log(
          `Autocomplete: Attempted to enter undefined match with index ${highlightedIndex}`,
          true,
        );
        return;
      }

      // Then insert it into the textarea.
      textarea.value =
        // First grab the existing text up to and including the current prefix.
        text.slice(0, prefixIndex + prefix.length) +
        // Then add the highlighted match.
        highlightedMatch +
        // And finally add the existing text where the cursor was positioned.
        text.slice(position);
      this.hide(target);
      highlightedIndex = 0;

      // Set the cursor position to the end of the autocompleted match.
      const newPosition = prefixIndex + prefix.length + highlightedMatch.length;
      textarea.selectionStart = newPosition;
      textarea.selectionEnd = newPosition;
    } else if (key === "Tab") {
      if (shift) {
        // If shift is being pressed move the highlight back up.
        highlightedIndex -= 1;
      } else {
        // Otherwise with just tab being pressed move it down.
        highlightedIndex += 1;
      }
    } else {
      // When any other key is pressed make sure the list is shown in the
      // correct place and also has all the new matches.
      this.show(target, offset(textarea));
      this.update(target, matches);
    }

    // Make sure the highlighted index is never set out of bounds.
    if (highlightedIndex < 0) {
      highlightedIndex = matches.size - 1;
    } else if (highlightedIndex >= matches.size) {
      highlightedIndex = 0;
    }

    this.setState({highlightedIndex});
  };

  /** Update the available matches. */
  update = (
    target: TextareaInputProps["target"],
    matches: TextareaInputProps["values"],
  ) => {
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
  show = (target: TextareaInputProps["target"], position: Offset) => {
    if (target === "groups") {
      this.setState({
        groupsHidden: false,
        groupsPosition: position,
        typingInAutocomplete: true,
      });
    } else if (target === "usernames") {
      this.setState({
        usernamesHidden: false,
        usernamesPosition: position,
        typingInAutocomplete: true,
      });
    }
  };

  /** Hide the autocomplete list. */
  hide = (target: TextareaInputProps["target"]) => {
    if (target === "groups") {
      this.setState({
        groupsHidden: true,
        typingInAutocomplete: false,
      });
    } else if (target === "usernames") {
      this.setState({
        usernamesHidden: true,
        typingInAutocomplete: false,
      });
    }
  };

  render() {
    const {groupsMatches, highlightedIndex, usernamesMatches} = this.state;

    // Create the `<li>` elements for groups and usernames.
    const groups = [...groupsMatches].map((value, index) => (
      <li class={highlightedIndex === index ? "highlighted" : ""}>~{value}</li>
    ));
    const usernames = [...usernamesMatches].map((value, index) => (
      <li class={highlightedIndex === index ? "highlighted" : ""}>@{value}</li>
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
