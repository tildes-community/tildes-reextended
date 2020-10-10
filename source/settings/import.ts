import {
  getSettings,
  log,
  isValidHexColor,
  isValidTildesUsername,
  setSettings,
  Settings
} from '..';

export async function importFileHandler(event: Event): Promise<void> {
  // Grab the imported files (if any).
  const fileList: FileList | null = (event.target as HTMLInputElement).files;

  if (fileList === null) {
    log('No file imported.');
    return;
  }

  const reader = new window.FileReader();

  reader.addEventListener(
    'load',
    async (): Promise<void> => {
      let data: Partial<Settings>;

      try {
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        data = JSON.parse(reader.result!.toString());
      } catch (error) {
        log(error, true);
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
              color: isValidHexColor(label.color) ? label.color : '#f0f',
              id: newSettings.data.userLabels.length + 1,
              priority: Number.isNaN(label.priority) ? 0 : label.priority,
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
      log('Successfully imported your settings, reloading the page to apply.');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  );

  reader.addEventListener('error', (): void => {
    log(reader.error, true);
    reader.abort();
  });

  reader.readAsText(fileList[0]);
}
