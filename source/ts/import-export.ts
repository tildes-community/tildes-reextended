import {browser} from 'webextension-polyfill-ts';
import {
  querySelector,
  flashMessage,
  Settings,
  log,
  getSettings,
  isValidTildesUsername,
  isValidHexColor,
  setSettings
} from './utilities';
import {themeColors} from './theme-colors';

export async function importSettingsHandler(event: MouseEvent): Promise<void> {
  event.preventDefault();
  const fileInput: HTMLInputElement = querySelector('#import-file');
  fileInput.click();
}

export async function importFileHandler(event: Event): Promise<void> {
  const fileList: FileList | null = (event.target as HTMLInputElement).files;
  if (fileList === null) {
    flashMessage('No file imported.');
    return;
  }

  const reader: FileReader = new FileReader();
  reader.addEventListener(
    'load',
    async (): Promise<void> => {
      let data: Partial<Settings>;
      try {
        data = JSON.parse(reader.result!.toString());
      } catch (error) {
        log(error, true);
        flashMessage(error, true);
        return;
      }

      const settings: Settings = await getSettings();
      const newSettings: Settings = {...settings};
      if (typeof data.data !== 'undefined') {
        if (typeof data.data.userLabels !== 'undefined') {
          newSettings.data.userLabels = [];
          for (const label of data.data.userLabels) {
            if (
              typeof label.username === 'undefined' ||
              !isValidTildesUsername(label.username)
            ) {
              log(`Invalid username in imported labels: ${label.username}`);
              continue;
            }

            newSettings.data.userLabels.push({
              color: isValidHexColor(label.color)
                ? label.color
                : themeColors.white.backgroundAlt,
              id: newSettings.data.userLabels.length + 1,
              priority: isNaN(label.priority) ? 0 : label.priority,
              text: typeof label.text === 'undefined' ? 'Label' : label.text,
              username: label.username
            });
          }
        }

        if (typeof data.data.hideVotes !== 'undefined') {
          newSettings.data.hideVotes = data.data.hideVotes;
        }
      }

      if (typeof data.features !== 'undefined') {
        newSettings.features = {...data.features};
      }

      await setSettings(newSettings);
      flashMessage(
        'Successfully imported your settings, reloading the page to apply.'
      );
      setTimeout(() => {
        window.location.reload();
      }, 2500);
    }
  );
  reader.addEventListener('error', (): void => {
    log(reader.error, true);
    reader.abort();
  });
  reader.readAsText(fileList[0]);
}

export async function exportSettingsHandler(event: MouseEvent): Promise<void> {
  event.preventDefault();
  const settings: Settings = await getSettings();
  const settingsBlob: Blob = new Blob([JSON.stringify(settings, null, 2)], {
    type: 'text/json'
  });
  const blobObjectURL: string = URL.createObjectURL(settingsBlob);
  try {
    await browser.downloads.download({
      filename: 'tildes_reextended-settings.json',
      url: blobObjectURL,
      saveAs: true
    });
  } catch (error) {
    log(error);
  } finally {
    // According to MDN, when creating an object URL we should also revoke it
    // when "it's safe to do so" to prevent excess memory/storage use. 60
    // seconds should be enough time to download the settings.
    setTimeout(() => URL.revokeObjectURL(blobObjectURL), 60000);
  }
}
