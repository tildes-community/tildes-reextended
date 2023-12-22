import fastDiff from "fast-diff";
import {type JSX, render} from "preact";
import {capitalize, log, querySelector} from "../../../utilities/exports.js";

export function runTopicLogEnhancementsFeature(): void {
  const count = applyEnhancements();
  if (count > 0) {
    log(`Topic Log Enhancements: Applied to ${count} topic log entries.`);
  }
}

function applyEnhancements(): number {
  // Get the topic log listing if there is one.
  const listing =
    document.querySelector<HTMLOListElement>(
      ".topic-log-listing:not([data-trx-topic-log-enhancements])",
    ) ?? undefined;
  if (listing === undefined) {
    return 0;
  }

  // Open the topic log `<details>` element.
  querySelector<HTMLDetailsElement>("details.topic-log").open = true;

  const entries = listing.querySelectorAll<HTMLLIElement>(".topic-log-entry");
  const enhancements: JSX.Element[] = [];

  for (const entry of Array.from(entries)) {
    const editor = entry.querySelector(".link-user")?.textContent ?? undefined;

    // Grab the text of the topic log entry.
    let text = entry.textContent ?? undefined;
    if (text === undefined) {
      log(
        "Undefined topic log entry text encountered, this should be unreachable.",
        true,
      );
      continue;
    }

    // Remove any excess whitespace.
    text = text.replace(/\s+/g, " ").trim();

    // Remove the editor's name too as we already have that.
    text = text.slice(text.indexOf(" ") + 1);

    // Grab the timestamp and remove it from the text.
    const timestampIndex = text.lastIndexOf("(");
    const timestamp = text.slice(timestampIndex);
    text = text.slice(0, timestampIndex - 1);

    // Account for the original poster making edits.
    const editedByAuthor = text.startsWith("(OP) ");
    if (editedByAuthor) {
      text = text.slice("(OP) ".length);
    }

    // Account for deleted and removed topics or users not having their names
    // shown.
    if (text.startsWith("user ")) {
      text = text.slice("user ".length);
    }

    // Create the enhanced entry and remove the original one.
    enhancements.push(
      <TopicLogEnhancement
        editedByAuthor={editedByAuthor}
        editor={editor}
        text={text}
        timestamp={timestamp}
      />,
    );
    entry.remove();
  }

  listing.dataset.trxTopicLogEnhancements = "true";
  render(enhancements, listing);
  return enhancements.length;
}

/** Properties for the {@linkcode TopicLogEnhancement} component. */
type TopicLogEnhancementProps = {
  /** Whether the original topic author made the changes. */
  editedByAuthor: boolean;

  /**
   * The username of the person making the change, can be undefined if no user
   * link was in the entry.
   */
  editor: string | undefined;

  /** The text body of the entry. */
  text: string;

  /** The timestamp of when the edit was made. */
  timestamp: string;
};

/** The topic log entry enhancement component. */
function TopicLogEnhancement(props: TopicLogEnhancementProps): JSX.Element {
  const {editedByAuthor, editor, text, timestamp} = props;

  const editorLink = editor ? (
    <a class="link-user" href={`/user/${editor}`}>
      {editor}
    </a>
  ) : (
    "Unknown user"
  );

  const originalPosterSpan = editedByAuthor ? (
    <>
      (<abbr title="Original Poster (of the topic)">OP</abbr>)
    </>
  ) : undefined;

  const transformedText = transformText(text);

  return (
    <li class="topic-log-entry">
      {editorLink} {originalPosterSpan} {transformedText.title} {timestamp}{" "}
      <br /> {transformedText.body}
    </li>
  );
}

/** The result of the {@linkcode transformText} function. */
type TransformedText = {
  /** The main body of the topic log entry. */
  body: JSX.Element | string;

  /** The title of the entry to be placed between the username and timestamp. */
  title: string;
};

/** Transform the topic log entry text into its respective enhanced version. */
function transformText(text: string): TransformedText {
  // Check for tag additions and removals.
  if (text.startsWith("added tag") || text.startsWith("removed tag")) {
    const sections = text.includes("' and removed tag")
      ? // If the entry has both added and removed tags in the same line, split
        // them in the middle so we can more easily match them. The extra colon
        // in the split string is so we don't accidentally split on an " and "
        // in a tag.
        text.split("' and ")
      : [text];

    // Match the added tags using the first section, as it always comes first.
    const {added} =
      /^added tags? (?<added>.+)$/g.exec(sections[0])?.groups ?? {};

    // Match the removed tags using the second section first and if that
    // doesn't exist, try using the first section.
    const {removed} =
      /^removed tags? (?<removed>.+)$/g.exec(sections[1] ?? sections[0])
        ?.groups ?? {};

    // Collect all the diff spans into one array.
    const spans: JSX.Element[] = [];

    // Get the topic's group path by removing the ID and slug from the pathname.
    // So for example "/~group/id36/title_slug" becomes "/~group".
    const groupPath = window.location.pathname.slice(
      0,
      window.location.pathname.indexOf("/", 1),
    );

    if (removed !== undefined) {
      const tags = removed.replace(/'/g, "").split(", ");
      spans.push(
        ...tags.map((tag) => (
          <>
            <span class="trx-topic-log-diff-from">
              <a href={`${groupPath}?tag=${tag}`}>{tag}</a>
            </span>
            <br />
          </>
        )),
      );
    }

    if (added !== undefined) {
      const tags = added.replace(/'/g, "").split(", ");
      spans.push(
        ...tags.map((tag) => (
          <>
            <span class="trx-topic-log-diff-to">
              <a href={`${groupPath}?tag=${tag}`}>{tag}</a>
            </span>
            <br />
          </>
        )),
      );
    }

    return {
      body: <>{spans}</>,
      title: "edited the tags",
    };
  }

  // Check for link changes.
  if (text.startsWith("changed link from")) {
    // The Tildes link topic schema only allows HTTP or HTTPS links so we can
    // take advantage of that to match them more easily.
    const {from, to} = /(?<from>http.+) to (?<to>http.+)$/g.exec(text)!.groups!;
    return {
      body: <DiffSpans from={from} to={to} />,
      title: "edited the link",
    };
  }

  // Check for title changes.
  if (text.startsWith("changed title from")) {
    const {from, to} = /"(?<from>.+)" to "(?<to>.+)"$/g.exec(text)!.groups!;
    return {
      body: <DiffSpans from={from} to={to} />,
      title: "edited the title",
    };
  }

  // Check for both the locking and unlocking of topics.
  if (text.includes("locked comments")) {
    const locked = text.startsWith("locked");
    return {
      body: locked
        ? "New comments can not be posted."
        : "New comments can be posted again.",
      title: `${locked ? "" : "un"}locked the topic`,
    };
  }

  // Check for the topic group being changed.
  if (text.startsWith("moved from")) {
    const {from, to} = /(?<from>~.+) to (?<to>~.+)/g.exec(text)!.groups!;
    return {
      body: (
        <>
          From{" "}
          <a class="link-group" href={`/${from}`}>
            {from}
          </a>{" "}
          to{" "}
          <a class="link-group" href={`/${to}`}>
            {to}
          </a>
        </>
      ),
      title: "moved the topic",
    };
  }

  // Check for topic removals and un-removals.
  if (text.includes("removed")) {
    const removed = text.startsWith("removed");
    return {
      body: removed
        ? "The topic was removed by a site administrator."
        : "The topic has been made available again.",
      title: `${removed ? "" : "un-"}removed the topic`,
    };
  }

  // Log any unhandled topic log entries and return the text as the body so the
  // entry still shows up in a decent enough way.
  log(`Unhandled topic log entry: ${text}`, true);
  return {body: capitalize(text), title: ""};
}

/** Properties for the {@linkcode DiffSpans} component. */
type DiffSpansProps = {
  /** The original text string. */
  from: string;

  /** The resulting text string to compare against the original with. */
  to: string;
};

/**
 * Calculate the diff between to strings using `fast-diff` and render the
 * results as two `<span>`s.
 */
function DiffSpans({from, to}: DiffSpansProps): JSX.Element {
  const fromParts: Array<JSX.Element | string> = [];
  const toParts: typeof fromParts = [];

  for (const [action, change] of fastDiff(from, to)) {
    // eslint-disable-next-line default-case
    switch (action) {
      case fastDiff.EQUAL: {
        fromParts.push(change);
        toParts.push(change);
        break;
      }

      case fastDiff.INSERT: {
        toParts.push(<span class="trx-topic-log-diff-insert">{change}</span>);
        break;
      }

      case fastDiff.DELETE: {
        fromParts.push(<span class="trx-topic-log-diff-delete">{change}</span>);
        break;
      }
    }
  }

  return (
    <>
      <span class="trx-topic-log-diff-from">{fromParts}</span>
      <br />
      <span class="trx-topic-log-diff-to">{toParts}</span>
    </>
  );
}
