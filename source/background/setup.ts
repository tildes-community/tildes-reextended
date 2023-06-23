import browser from "webextension-polyfill";

if ($browser === "firefox") {
  browser.browserAction.onClicked.addListener(openOptionsPage);
} else if ($browser === "chromium") {
  browser.action.onClicked.addListener(openOptionsPage);
}

browser.runtime.onInstalled.addListener(async () => {
  if ($dev) {
    await openOptionsPage();
  }
});

async function openOptionsPage(): Promise<void> {
  await browser.runtime.openOptionsPage();
}
