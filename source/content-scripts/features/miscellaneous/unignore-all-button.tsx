import {Component, render} from "preact";
import {log, querySelectorAll, sleep} from "../../../utilities/exports.js";

export function runUnignoreAllButtonFeature(): void {
  if (addUnignoreAllButton()) {
    log("Added Unignore All button.");
  }
}

function addUnignoreAllButton(): boolean {
  // Only add the button when we're on the ignore list page and the ignore list
  // isn't empty.
  if (
    window.location.pathname !== "/ignored_topics" ||
    document.querySelector("main > .empty") !== null
  ) {
    return false;
  }

  const heading = document.querySelector(".heading-main") ?? undefined;
  if (heading === undefined) {
    return false;
  }

  const button = document.createDocumentFragment();
  render(<UnignoreAllButton />, button);
  heading.after(button);

  return true;
}

type Props = Record<string, unknown>;

type State = {
  isRunning: boolean;
  remaining: number;
  total: number;
  wasCanceled: boolean;
};

class UnignoreAllButton extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isRunning: false,
      remaining: 0,
      total: 0,
      wasCanceled: false,
    };
  }

  click = () => {
    if (this.state.isRunning) {
      // If we're already running, cancel the run.
      this.setState({isRunning: false, wasCanceled: true});
      window.setTimeout(() => {
        // And after 5 seconds, return back to the default state.
        this.setState({wasCanceled: false});
      }, 5000);
      return;
    }

    // Select the ignore buttons that have a HTTP DELETE method set. Since we're
    // going to have Intercooler do all the work for us, we don't want to
    // accidentally also select ignore buttons that would ignore the topics
    // again.
    const unignoreButtons = querySelectorAll<HTMLButtonElement>(
      'button[name="topic-actions-ignore"][data-ic-delete-from]',
    );
    this.setState({
      isRunning: true,
      remaining: unignoreButtons.length,
      total: unignoreButtons.length,
    });
    void this.unignoreAll(unignoreButtons);
  };

  unignoreAll = async (buttons: HTMLButtonElement[]) => {
    let remaining = buttons.length;
    for (const ignoreButton of buttons) {
      // Stop the loop if the user canceled it.
      if (!this.state.isRunning && this.state.wasCanceled) {
        return;
      }

      ignoreButton.click();
      remaining--;
      this.setState({remaining});
      await sleep(250);
    }

    this.setState({isRunning: false});
  };

  render() {
    const {isRunning, remaining, total, wasCanceled} = this.state;
    let text = "Unignore All";

    if (isRunning) {
      // When we're running show how many topics are remaining.
      text = `Unignoring topics, ${remaining} out of ${total} remaining`;
    } else if (wasCanceled) {
      // If the user canceled, say that.
      text = "Canceled unignoring all topics";
    }

    return (
      <button class="btn" onClick={this.click}>
        {text}
      </button>
    );
  }
}
