import {browser} from 'webextension-polyfill-ts';
import {getSettings, log} from '..';

export async function exportSettings(event: MouseEvent): Promise<void> {
  event.preventDefault();

  const settings = await getSettings();
  const settingsBlob = new window.Blob([JSON.stringify(settings, null, 2)], {
    type: 'text/json'
  });

  const objectURL = URL.createObjectURL(settingsBlob);

  try {
    await browser.downloads.download({
      filename: 'tildes-reextended-settings.json',
      url: objectURL,
      saveAs: true
    });
  } catch (error) {
    log(error);
  } finally {
    // According to MDN, when creating an object URL we should also revoke it
    // when "it's safe to do so" to prevent excessive memory/storage use.
    // 60 seconds should probably be enough time to download the settings.
    setTimeout(() => {
      URL.revokeObjectURL(objectURL);
    }, 60 * 1000);
  }
}
