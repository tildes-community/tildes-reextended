import {browser} from 'webextension-polyfill-ts';

// Add listeners to open the options page when:
// * The extension icon is clicked.
// * The extension is installed.
browser.browserAction.onClicked.addListener(openOptionsPage);
browser.runtime.onInstalled.addListener(openOptionsPage);

async function openOptionsPage() {
  await browser.runtime.openOptionsPage();
}
