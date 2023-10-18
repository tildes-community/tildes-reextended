import {Component} from "preact";
import {
  createValueHideTopicPredicate,
  fromStorage,
  isHideTopicMatcher,
  Feature,
  HideTopicMatcher,
  type HideTopicPredicate,
  type HideTopicsData,
} from "../../storage/exports.js";
import {log} from "../../utilities/logging.js";
import {Setting, type SettingProps} from "./index.js";

type State = {
  predicates: HideTopicsData;
  predicatesToRemove: HideTopicsData;
  unsavedPredicateIds: number[];
};

export class HideTopicsSetting extends Component<SettingProps, State> {
  constructor(props: SettingProps) {
    super(props);

    this.state = {
      predicates: [],
      predicatesToRemove: [],
      unsavedPredicateIds: [],
    };
  }

  async componentDidMount() {
    this.setState({
      predicates: await fromStorage(Feature.HideTopics),
    });
  }

  newPredicate = async () => {
    const {predicates, unsavedPredicateIds} = this.state;
    predicates.sort((a, b) => b.value.id - a.value.id);
    const newId = (predicates[0]?.value.id ?? 0) + 1;
    predicates.push(
      await createValueHideTopicPredicate({
        id: newId,
        matcher: HideTopicMatcher.DomainIncludes,
        value: "example.org",
      }),
    );
    unsavedPredicateIds.push(newId);

    this.setState({
      predicates,
      unsavedPredicateIds,
    });
  };

  onInput = (event: Event, id: number, key: keyof HideTopicPredicate) => {
    const {predicates, unsavedPredicateIds} = this.state;
    const index = predicates.findIndex(({value}) => value.id === id);
    if (index === -1) {
      log(`Tried to edit unknown predicate with ID: ${id}`);
      return;
    }

    const newValue = (event.target as HTMLInputElement)!.value;
    switch (key) {
      case "matcher": {
        if (isHideTopicMatcher(newValue)) {
          predicates[index].value.matcher = newValue;
        } else {
          log(`Unknown HideTopicMatcher: ${newValue}`, true);
          return;
        }

        break;
      }

      case "value": {
        predicates[index].value.value = newValue;
        break;
      }

      default: {
        log(`Can't edit predicate key: ${key}`, true);
        return;
      }
    }

    unsavedPredicateIds.push(id);
    this.setState({predicates, unsavedPredicateIds});
  };

  remove = (id: number) => {
    const {predicates, predicatesToRemove, unsavedPredicateIds} = this.state;
    const index = predicates.findIndex(({value}) => value.id === id);
    if (index === -1) {
      log(`Tried to remove unknown predicate with ID: ${id}`);
      return;
    }

    predicatesToRemove.push(...predicates.splice(index, 1));
    unsavedPredicateIds.push(id);
    this.setState({predicates, predicatesToRemove, unsavedPredicateIds});
  };

  save = async () => {
    const {predicates, predicatesToRemove} = this.state;
    for (const predicate of predicates) {
      await predicate.save();
    }

    for (const predicate of predicatesToRemove) {
      await predicate.remove();
    }

    this.setState({predicatesToRemove: [], unsavedPredicateIds: []});
  };

  render() {
    const {predicates, unsavedPredicateIds} = this.state;
    predicates.sort((a, b) => a.value.id - b.value.id);

    const editors = predicates.map(({value: predicate}) => {
      const matcherHandler = (event: Event) => {
        this.onInput(event, predicate.id, "matcher");
      };

      const valueHandler = (event: Event) => {
        this.onInput(event, predicate.id, "value");
      };

      const removeHandler = () => {
        this.remove(predicate.id);
      };

      const matcherOptions = Object.values(HideTopicMatcher).map((key) => (
        <option selected={predicate.matcher === key} value={key}>
          {key
            .replace(/-/g, " ")
            .replace(/(\b[a-z])/gi, (character) => character.toUpperCase())}
        </option>
      ));

      const hasUnsavedChanges = unsavedPredicateIds.includes(predicate.id)
        ? "unsaved-changes"
        : "";

      const disableValueInput = [HideTopicMatcher.VotedOnTopic].includes(
        predicate.matcher,
      );

      return (
        <div class={`has-save-status hide-topics-editor ${hasUnsavedChanges}`}>
          <select class="styled-select" onChange={matcherHandler}>
            {matcherOptions}
          </select>
          <input
            disabled={disableValueInput}
            type="text"
            placeholder={
              disableValueInput ? "No value needed" : "Value to match"
            }
            value={predicate.value}
            onInput={valueHandler}
          />
          <button class="button destructive" onClick={removeHandler}>
            Remove
          </button>
        </div>
      );
    });

    const hasUnsavedChanges = unsavedPredicateIds.length > 0;
    return (
      <Setting {...this.props}>
        <p class="info">
          Hide topics from the topic listing matching custom predicates.
          <br />
          Topics will be hidden when any of your predicates match and you can
          unhide them by clicking a button that will appear at the bottom of the
          sidebar. The topics will then show themselves and have a red border.
          <br />
          For hiding topics with certain tags, Tildes can do that natively via
          your{" "}
          <a href="https://tildes.net/settings/filters">
            filtered tags settings
          </a>
          .
        </p>

        <details class="hide-topics-matcher-explanation">
          <summary>Matcher explanations</summary>

          <p>
            All matches are done without taking casing into account, so you
            don't have to care about upper or lowercase letters.
          </p>

          <ul>
            <li>
              <b>Domain Includes</b> will match the domain of all topic links
              (including text topics). For example with the link{" "}
              <code>https://tildes.net/~tildes</code>, "tildes.net" is what will
              be matched against. If your value is included in the domain
              anywhere the topic will be hidden.
            </li>

            <li>
              <b>Tildes Username Equals</b> will match the topic author's
              username. If your value is exactly the same as the topic author's
              the topic will be hidden.
            </li>

            <li>
              <b>Title Includes</b> will match the topic title. If your value is
              anywhere in the title the topic will be hidden.
            </li>

            <li>
              <b>User Label Equals</b> will match any user labels you have
              applied to the topic author. For example if you set a "Hide
              Topics" user labels matcher and then add a user label to someone
              with "Hide Topics" as the text, their topics will be hidden.
            </li>

            <li>
              <b>Voted On Topic</b> will match any topic that you have voted on
              and hide it. You do not have to put in a value for this matcher.
            </li>
          </ul>
        </details>

        <div class="hide-topics-main-button-group">
          <button class="button" onClick={this.newPredicate}>
            New Predicate
          </button>
          <button
            class={`button ${hasUnsavedChanges ? "unsaved-changes" : ""}`}
            onClick={this.save}
          >
            Save{hasUnsavedChanges ? "*" : ""}
          </button>
        </div>
        <div class="hide-topics-predicate-editors">{editors}</div>
      </Setting>
    );
  }
}
