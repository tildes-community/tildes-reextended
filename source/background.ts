import {browser} from 'webextension-polyfill-ts';
import {
  defaultSettings,
  getManifest,
  getSettings,
  setSettings,
  versionAsNumber
} from '.';

// Add listeners to open the options page when:
// * The extension icon is clicked.
// * The extension is installed.
browser.browserAction.onClicked.addListener(openOptionsPage);
browser.runtime.onInstalled.addListener(async () => {
  const manifest = getManifest();
  const settings = await getSettings();
  const versionGotUpdated =
    versionAsNumber(manifest.version) >
    versionAsNumber(settings.data.version ?? defaultSettings.data.version!);

  if (versionGotUpdated) {
    settings.data.version = manifest.version;
    await setSettings(settings);
  }

  if (versionGotUpdated || manifest.nodeEnv === 'development') {
    await openOptionsPage();
  }
});

async function openOptionsPage() {
  await browser.runtime.openOptionsPage();
}
