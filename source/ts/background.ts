import {browser} from 'webextension-polyfill-ts';

// Add listeners to open the options page when:
// * The extension icon gets clicked.
// * The extension first gets installed.
browser.browserAction.onClicked.addListener(openOptionsPage);
browser.runtime.onInstalled.addListener(openOptionsPage);

async function openOptionsPage(): Promise<void> {
  await browser.runtime.openOptionsPage();
}
