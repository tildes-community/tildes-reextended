import {Component, render} from "preact";
import {log, pluralize, querySelectorAll} from "../../utilities/exports.js";

export function runGroupListSubscribeButtonFeature(): void {
  const count = addSubscribeButtonsToGroupList();
  if (count > 0) {
    const pluralized = `${count} ${pluralize(count, "subscribe button")}`;
    log(`Added ${pluralized} to the group list`);
  }
}

function addSubscribeButtonsToGroupList(): number {
  if (window.location.pathname !== "/groups") {
    return 0;
  }

  const csrfToken = document.querySelector<HTMLMetaElement>(
    'meta[name="csrftoken"]',
  )?.content;
  if (csrfToken === undefined) {
    log("No CSRF token found", true);
    return 0;
  }

  let count = 0;
  for (const listItem of querySelectorAll<HTMLLIElement>(
    ".group-list li:not(.trx-group-list-subscribe-button)",
  )) {
    const group = listItem.querySelector(".link-group")?.textContent?.slice(1);
    if (group === undefined) {
      log(`Missing expected group in list item`, true);
      log(listItem, true);
      continue;
    }

    const button = document.createDocumentFragment();
    render(
      <SubscribeButton
        csrfToken={csrfToken}
        group={group}
        listItem={listItem}
      />,
      button,
    );

    const activity =
      listItem.querySelector(".group-list-activity") ?? undefined;
    if (activity === undefined) {
      listItem.append(button);
    } else {
      activity.before(button);
    }

    listItem.classList.add("trx-group-list-subscribe-button");
    count++;
  }

  return count;
}

type Props = {
  csrfToken: string;
  listItem: HTMLLIElement;
  group: string;
};

type State = {
  isSubscribed: boolean;
};

class SubscribeButton extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isSubscribed: props.listItem.classList.contains(
        "group-list-item-subscribed",
      ),
    };
  }

  clickHandler = async () => {
    const {csrfToken, group} = this.props;
    const {isSubscribed} = this.state;

    const response = await window.fetch(
      `https://tildes.net/api/web/group/${group}/subscribe`,
      {
        headers: {
          "X-CSRF-Token": csrfToken,
          "X-IC-Request": "true",
        },
        method: isSubscribed ? "DELETE" : "PUT",
        referrer: "https://tildes.net",
      },
    );

    if (response.status !== 200) {
      log(`Unexpected status code: ${response.status}`, true);
      return;
    }

    this.setState({isSubscribed: !isSubscribed});
  };

  render() {
    const {listItem} = this.props;
    const {isSubscribed} = this.state;

    if (isSubscribed) {
      listItem.classList.add("group-list-item-subscribed");
      listItem.classList.remove("group-list-item-not-subscribed");
    } else {
      listItem.classList.add("group-list-item-not-subscribed");
      listItem.classList.remove("group-list-item-subscribed");
    }

    return (
      <button
        class={`btn btn-sm ${isSubscribed ? "btn-used" : ""}`}
        onClick={this.clickHandler}
      >
        {isSubscribed ? "Unsubscribe" : "Subscribe"}
      </button>
    );
  }
}
