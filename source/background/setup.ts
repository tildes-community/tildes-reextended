import browser from "webextension-polyfill";
import {migrations} from "../storage/migrations/migrations.js";
import {log} from "../utilities/logging.js";

if ($browser === "firefox") {
  browser.browserAction.onClicked.addListener(openOptionsPage);
} else if ($browser === "chromium") {
  browser.action.onClicked.addListener(openOptionsPage);
}

browser.runtime.onInstalled.addListener(async () => {
  const existingStorage = await browser.storage.sync.get();
  if (existingStorage.version === "1.1.2") {
    log("Running 1.1.2 to 2.0.0 data migration.", true);
    await browser.storage.local.set({backup: JSON.stringify(existingStorage)});
    await browser.storage.sync.clear();
    await migrations[0].migrate(existingStorage);
  }

  if ($dev) {
    await openOptionsPage();
  }
});

async function openOptionsPage(): Promise<void> {
  await browser.runtime.openOptionsPage();
}
