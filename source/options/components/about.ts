import browser from 'webextension-polyfill';
import {html} from 'htm/preact';

import Settings from '../../settings.js';
import {
  Link,
  log,
  isValidHexColor,
  isValidTildesUsername,
} from '../../utilities/exports.js';
import {SettingProps, Setting} from './index.js';

async function logSettings() {
  log(await Settings.fromSyncStorage(), true);
}

async function importFileHandler(event: Event): Promise<void> {
  // Grab the imported files (if any).
  const fileList = (event.target as HTMLInputElement).files;

  if (fileList === null) {
    log('No file imported.');
    return;
  }

  const reader = new window.FileReader();

  reader.addEventListener('load', async (): Promise<void> => {
    let data: Partial<Settings>;

    try {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      data = JSON.parse(reader.result!.toString()) as Partial<Settings>;
    } catch (error: unknown) {
      log(error, true);
      return;
    }

    const settings = await Settings.fromSyncStorage();
    if (typeof data.data !== 'undefined') {
      if (typeof data.data.userLabels !== 'undefined') {
        settings.data.userLabels = [];

        for (const label of data.data.userLabels) {
          if (
            typeof label.username === 'undefined' ||
            !isValidTildesUsername(label.username)
          ) {
            log(`Invalid username in imported labels: ${label.username}`);
            continue;
          }

          settings.data.userLabels.push({
            color: isValidHexColor(label.color) ? label.color : '#f0f',
            id: settings.data.userLabels.length + 1,
            priority: Number.isNaN(label.priority) ? 0 : label.priority,
            text: typeof label.text === 'undefined' ? 'Label' : label.text,
            username: label.username,
          });
        }
      }

      if (typeof data.data.hideVotes !== 'undefined') {
        settings.data.hideVotes = data.data.hideVotes;
      }
    }

    if (typeof data.features !== 'undefined') {
      settings.features = {...data.features};
    }

    await settings.save();
    log('Successfully imported your settings, reloading the page to apply.');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  });

  reader.addEventListener('error', (): void => {
    log(reader.error, true);
    reader.abort();
  });

  reader.readAsText(fileList[0]);
}

async function exportSettings(event: MouseEvent): Promise<void> {
  event.preventDefault();

  const settings = await Settings.fromSyncStorage();
  const settingsBlob = new window.Blob([JSON.stringify(settings, null, 2)], {
    type: 'text/json',
  });

  const objectURL = URL.createObjectURL(settingsBlob);

  try {
    await browser.downloads.download({
      filename: 'tildes-reextended-settings.json',
      url: objectURL,
      saveAs: true,
    });
  } catch (error: unknown) {
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

export function AboutSetting(props: SettingProps): TRXComponent {
  const importSettings = () => {
    document.querySelector<HTMLElement>('#import-settings')!.click();
  };

  const communityLink = html`
    <${Link}
      url="https://gitlab.com/tildes-community"
      text="Tildes Community project"
    />
  `;

  const criusLink = html`
    <${Link} url="https://tildes.net/user/crius" text="Crius" />
  `;

  const gitlabIssuesLink = html`
    <${Link}
      url="https://gitlab.com/tildes-community/tildes-reextended/-/issues"
      text="GitLab issue tracker"
    />
  `;

  const gitlabLicenseLink = html`
    <${Link}
      url="https://gitlab.com/tildes-community/tildes-reextended/blob/main/LICENSE"
      text="MIT License"
    />
  `;

  const messageCommunityLink = html`
    <${Link}
      url="https://tildes.net/user/Community/new_message"
      text="message Community"
    />
  `;

  const tildesExtendedLink = html`
    <${Link}
      url="https://github.com/theCrius/tildes-extended"
      text="Tildes Extended"
    />
  `;

  return html`
    <${Setting} ...${props}>
      <p class="info">
        This feature will make debugging logs output to the console when
        enabled.
      </p>

      <p>
        Tildes ReExtended is a from-scratch recreation of the original${' '}
        ${tildesExtendedLink} web extension by ${criusLink}. Open-sourced${' '}
        with the ${gitlabLicenseLink} and maintained as a ${communityLink}.
      </p>

      <p>
        To report bugs or request new features use the links at the bottom of
        this page, check out the ${gitlabIssuesLink} or${' '}
        ${messageCommunityLink}${' '} on Tildes.
      </p>

      <div class="divider" />

      <div class="import-export">
        <p>
          Note that importing settings will delete and overwrite your existing
          ones.
        </p>

        <input
          id="import-settings"
          onChange=${importFileHandler}
          class="trx-hidden"
          accept="application/json"
          type="file"
        />
        <button onClick=${importSettings} class="button">
          Import Settings
        </button>
        <button onClick=${exportSettings} class="button">
          Export Settings
        </button>
      </div>

      <div class="divider" />

      <details class="misc-utilities">
        <summary>Danger Zone</summary>

        <div class="inner">
          <button onClick=${logSettings} class="button">Log Settings</button>

          <button onClick=${Settings.nuke} class="button destructive">
            Remove All Data
          </button>
        </div>
      </details>
    <//>
  `;
}
