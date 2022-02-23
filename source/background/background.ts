import browser from 'webextension-polyfill';

import {log} from '../utilities/logging.js';

log('Debug logging is enabled.');

// Open the options page when the extension icon is clicked.
browser.browserAction.onClicked.addListener(openOptionsPage);

browser.runtime.onInstalled.addListener(async () => {
  // Always automatically open the options page in development.
  if (import.meta.env.DEV) {
    await openOptionsPage();
  }
});

async function openOptionsPage() {
  await browser.runtime.openOptionsPage();
}
