import {Component, render} from "preact";
import {
  fromStorage,
  Feature,
  HideTopicMatcher,
  type UserLabelsData,
} from "../../storage/exports.js";
import {
  createElementFromString,
  log,
  pluralize,
  querySelector,
  querySelectorAll,
} from "../../utilities/exports.js";

/**
 * Alias for {@link HideTopicMatcher} for code brevity.
 */
const Matcher = HideTopicMatcher;

type Props = Record<string, unknown>;

type State = {
  hidden: boolean;
  hiddenTopicsCount: number;
};

/**
 * Hide a topic by adding `.trx-hidden` and setting the `data-trx-hide-topics`
 * attribute.
 * @param topic The topic to hide.
 */
function hideTopic(topic: HTMLElement) {
  if (
    topic.parentElement?.nextElementSibling?.getAttribute(
      "data-trx-hide-topics-spacer",
    ) === null
  ) {
    // Add a spacer to the topic listing so the `li:nth-child(2n)` styling
    // doesn't become inconsistent when this topic is hidden.
    topic.parentElement.insertAdjacentElement(
      "afterend",
      createElementFromString(
        '<li class="trx-hidden" data-trx-hide-topics-spacer></li>',
      ),
    );
  }

  topic.classList.add("trx-hidden");
  topic.dataset.trxHideTopics = "";
}

/**
 * Run the Hide Topics feature.
 * @param userLabels The {@link UserLabelsData} to use with the UserLabelEquals
 * {@link HideTopicMatcher}.
 */
export async function runHideTopicsFeature(
  userLabels: UserLabelsData,
): Promise<void> {
  const predicates = await fromStorage(Feature.HideTopics);

  // Select all topics not already handled by TRX.
  const topics = querySelectorAll<HTMLElement>(
    ".topic-listing .topic:not([data-trx-hide-topics])",
  );

  // Define all the predicates before going through the topics so matching the
  // topics is easier later.
  const domainPredicates = [];
  const titlePredicates = [];
  const userPredicates = new Set();

  for (const predicate of predicates) {
    const {matcher, value} = predicate.value;
    switch (matcher) {
      case Matcher.DomainIncludes: {
        domainPredicates.push(value.toLowerCase());
        break;
      }

      case Matcher.TildesUsernameEquals: {
        userPredicates.add(value.toLowerCase());
        break;
      }

      case Matcher.TitleIncludes: {
        titlePredicates.push(value.toLowerCase());
        break;
      }

      case Matcher.UserLabelEquals: {
        for (const userLabel of userLabels) {
          if (value === userLabel.value.text) {
            userPredicates.add(userLabel.value.username.toLowerCase());
          }
        }

        break;
      }

      default: {
        console.warn(`Unknown HideTopicMatcher: ${matcher as string}`);
      }
    }
  }

  // Keep a count of how many topics have been hidden.
  let topicsHidden = 0;

  // Shorthand to hide a topic and increment the count.
  const hide = (topic: HTMLElement) => {
    hideTopic(topic);
    topicsHidden++;
  };

  for (const topic of topics) {
    // First check the topic author.
    const author = (topic.dataset.topicPostedBy ?? "<unknown>").toLowerCase();
    if (userPredicates.has(author)) {
      hide(topic);
      continue;
    }

    // Second check the topic title.
    const title = (
      topic.querySelector(".topic-title")?.textContent ?? ""
    ).toLowerCase();
    if (titlePredicates.some((value) => title.includes(value))) {
      hide(topic);
      continue;
    }

    // Third check the topic link.
    const url = new URL(
      topic.querySelector<HTMLAnchorElement>(".topic-title a")!.href,
    );
    if (domainPredicates.some((value) => url.hostname.includes(value))) {
      hide(topic);
      continue;
    }
  }

  // Only add the Hide Topics button if any topics have been hidden and if the
  // button isn't already there.
  if (
    topicsHidden > 0 &&
    document.querySelector("#trx-hide-topics-button") === null
  ) {
    const container = document.createElement("div");
    render(<HideTopicsFeature hiddenTopicsCount={topicsHidden} />, container);
    querySelector("#sidebar").insertAdjacentElement("beforeend", container);
  }

  log(`Hide Topics: Initialized for ${topicsHidden} topics.`);
}

export class HideTopicsFeature extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      hiddenTopicsCount: this.getHiddenTopics().length,
      hidden: true,
    };
  }

  getHiddenTopics = (): HTMLElement[] => {
    return querySelectorAll("[data-trx-hide-topics]");
  };

  toggleHidden = () => {
    const {hidden} = this.state;
    if (hidden) {
      // Remove all the `<li>` spacers when unhiding the topics.
      for (const spacer of querySelectorAll("[data-trx-hide-topics-spacer]")) {
        spacer.remove();
      }
    }

    for (const topic of this.getHiddenTopics()) {
      if (hidden) {
        topic.classList.remove("trx-hidden");
      } else {
        hideTopic(topic);
      }
    }

    this.setState({hidden: !hidden});
  };

  render() {
    const {hidden, hiddenTopicsCount} = this.state;
    const pluralized = pluralize(hiddenTopicsCount, "topic");

    return (
      <button
        id="trx-hide-topics-button"
        class="btn primary"
        onClick={this.toggleHidden}
      >
        {hidden ? "Unhide" : "Hide"} {hiddenTopicsCount} {pluralized}
      </button>
    );
  }
}
