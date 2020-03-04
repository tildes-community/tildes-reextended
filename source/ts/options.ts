import platform from 'platform';
import {browser} from 'webextension-polyfill-ts';
import {
  importSettingsHandler,
  importFileHandler,
  exportSettingsHandler
} from './import-export';
import {
  getSettings,
  Settings,
  camelToKebab,
  log,
  kebabToCamel,
  querySelector,
  setSettings,
  createElementFromString,
  flashMessage,
  querySelectorAll
} from './utilities';

window.addEventListener(
  'load',
  async (): Promise<void> => {
    const settings: Settings = await getSettings();
    // Grab the version anchor from the header and add the tag link to it.
    const versionSpan: HTMLAnchorElement = querySelector('#version');
    const {version} = browser.runtime.getManifest();
    versionSpan.setAttribute(
      'href',
      `https://gitlab.com/tildes-community/tildes-reextended/-/tags/${version}`
    );
    versionSpan.textContent = `v${version}`;

    const gitlabReportTemplate: string = createReportTemplate('gitlab');
    const tildesReportTemplate: string = createReportTemplate('tildes');
    // Grab the "Report A Bug" anchors and add a prefilled template for them.
    const gitlabReportAnchors: HTMLAnchorElement[] = querySelectorAll(
      '.report-a-bug-gitlab'
    );
    for (const element of gitlabReportAnchors) {
      element.setAttribute(
        'href',
        encodeURI(
          `https://gitlab.com/tildes-community/tildes-reextended/issues/new?issue[description]=${gitlabReportTemplate}`
        )
      );
    }

    const tildesReportAnchors: HTMLAnchorElement[] = querySelectorAll(
      '.report-a-bug-tildes'
    );
    for (const element of tildesReportAnchors) {
      element.setAttribute(
        'href',
        encodeURI(
          `https://tildes.net/user/Bauke/new_message?subject=Tildes ReExtended Bug&message=${tildesReportTemplate}`
        )
      );
    }

    ['comments', 'topics', 'own-comments', 'own-topics'].forEach(
      (val: string): void => {
        const hideCheckbox: HTMLInputElement = querySelector(
          `#hide-votes-${val}`
        );
        const settingsKey: string = kebabToCamel(val);
        hideCheckbox.checked = settings.data.hideVotes[settingsKey];
        hideCheckbox.addEventListener(
          'change',
          async (): Promise<void> => {
            settings.data.hideVotes[settingsKey] = hideCheckbox.checked;
            await setSettings(settings);
          }
        );
      }
    );

    const importSettingsButton: HTMLButtonElement = querySelector(
      '#import-button'
    );
    importSettingsButton.addEventListener('click', importSettingsHandler);

    const importFileInput: HTMLInputElement = querySelector('#import-file');
    importFileInput.addEventListener('change', importFileHandler);

    const exportSettingsButton: HTMLButtonElement = querySelector(
      '#export-button'
    );
    exportSettingsButton.addEventListener('click', exportSettingsHandler);

    const copyBugTemplateButton: HTMLButtonElement = querySelector(
      '#copy-bug-template-button'
    );
    copyBugTemplateButton.addEventListener('click', copyBugTemplateHandler);

    const logStoredDataButton: HTMLButtonElement = querySelector(
      '#log-stored-data-button'
    );
    logStoredDataButton.addEventListener('click', logStoredDataHandler);

    const removeAllDataButton: HTMLButtonElement = querySelector(
      '#remove-all-data-button'
    );
    removeAllDataButton.addEventListener('click', removeAllDataHandler);

    // Set the latest feature to active.
    const latestActiveListItem: HTMLAnchorElement = querySelector(
      `#${settings.data.latestActiveFeatureTab}-list`
    );
    latestActiveListItem.classList.add('active');
    const latestActiveContent: HTMLDivElement = querySelector(
      `#${settings.data.latestActiveFeatureTab}`
    );
    latestActiveContent.classList.add('active');

    for (const key in settings.features) {
      if (Object.hasOwnProperty.call(settings.features, key)) {
        const value: boolean = settings.features[key];
        // Convert the camelCase key to a kebab-case string.
        const id: string = camelToKebab(key);

        const settingContent: HTMLDivElement | null = document.querySelector(
          `#${id}`
        );
        if (settingContent === null) {
          log(
            `New setting key:${key} id:${id} does not have an entry in the settings content!`,
            true
          );
          continue;
        }

        if (value) {
          settingContent.classList.add('enabled');
        }

        // Set the button text to enable/disable based on the current setting.
        const toggleButton: HTMLButtonElement = querySelector(`#${id}-button`);
        toggleButton.addEventListener('click', toggleButtonClickHandler);
        toggleButton.textContent = value ? 'Enabled' : 'Disabled';

        // Add a checkmark to the list item if the feature is enabled.
        const listItem: HTMLAnchorElement = querySelector(`#${id}-list`);
        listItem.addEventListener('click', listItemClickHandler);
        if (value) {
          listItem.textContent += ' ✔';
        }
      }
    }

    if (typeof settings.data.version !== 'undefined') {
      if (settings.data.version !== version) {
        flashMessage(`Updated to ${version}!`);
      }
    }

    settings.data.version = version;
    await setSettings(settings);
  }
);

async function toggleButtonClickHandler(event: MouseEvent): Promise<void> {
  event.preventDefault();
  const target: HTMLButtonElement = event.target as HTMLButtonElement;
  const settings: Settings = await getSettings();

  // Convert the kebab-case ID to camelCase and remove the `-button` suffix.
  const wantedSettingKey: string = kebabToCamel(
    target.id.slice(0, target.id.lastIndexOf('-'))
  );

  // Toggle the value and update it in the settings.
  const wantedSettingValue = !settings.features[wantedSettingKey];
  settings.features[wantedSettingKey] = wantedSettingValue;
  await setSettings(settings);

  // Update the button text.
  target.textContent = wantedSettingValue ? 'Enabled' : 'Disabled';

  // Grab the equivalent list item and update the checkmark.
  const listItem: HTMLAnchorElement = querySelector(
    `#${camelToKebab(wantedSettingKey)}-list`
  );
  if (wantedSettingValue) {
    listItem.textContent += ' ✔';
  } else {
    listItem.textContent = listItem.textContent!.slice(
      0,
      listItem.textContent!.lastIndexOf(' ')
    );
  }

  const settingContent: HTMLDivElement = querySelector(
    `#${camelToKebab(wantedSettingKey)}`
  );
  if (wantedSettingValue) {
    settingContent.classList.add('enabled');
  } else {
    settingContent.classList.remove('enabled');
  }
}

async function listItemClickHandler(event: MouseEvent): Promise<void> {
  const target: HTMLAnchorElement = event.target as HTMLAnchorElement;
  const id: string = target.id.slice(0, target.id.lastIndexOf('-'));
  const currentActiveListItem: HTMLAnchorElement = querySelector(
    '#settings-list > .active'
  );
  // If the currently selected item is the same as the new one, do nothing.
  if (target.id === currentActiveListItem.id) {
    return;
  }

  // Hide the currently active settings content.
  const currentActiveContent: HTMLDivElement = querySelector(
    '#settings-content > .active'
  );
  currentActiveContent.classList.remove('active');

  // And show the newly selected active settings content.
  const newActiveContent: HTMLDivElement = querySelector(`#${id}`);
  newActiveContent.classList.add('active');

  // Remove the active style from the currently active settings list item.
  currentActiveListItem.classList.remove('active');

  // And add it to the newly selected settings list item.
  target.classList.add('active');

  // Update the latest active feature data.
  const settings: Settings = await getSettings();
  settings.data.latestActiveFeatureTab = id;
  await setSettings(settings);
}

function copyBugTemplateHandler(event: MouseEvent): void {
  event.preventDefault();
  const temporaryElement: HTMLTextAreaElement = createElementFromString(
    `<textarea>${createReportTemplate('tildes')}</textarea>`
  );
  temporaryElement.classList.add('trx-offscreen');
  document.body.append(temporaryElement);
  temporaryElement.select();
  try {
    document.execCommand('copy');
    flashMessage('Copied bug report template to clipboard.');
  } catch (error) {
    flashMessage(
      'Failed to copy bug report template to clipboard. Check the console for an error.',
      true
    );
    log(error, true);
  } finally {
    temporaryElement.remove();
    log('Removed temporary textarea from DOM.');
  }
}

async function logStoredDataHandler(event: MouseEvent): Promise<void> {
  event.preventDefault();
  log(JSON.stringify(await getSettings(), null, 2), true);
}

async function removeAllDataHandler(event: MouseEvent): Promise<void> {
  event.preventDefault();
  if (
    // eslint-disable-next-line no-alert
    !confirm(
      'Are you sure you want to delete your data? There is no way to recover your data once it has been deleted.'
    )
  ) {
    return;
  }

  await browser.storage.sync.clear();
  flashMessage(
    'Data removed, reloading this page to reinitialize default settings.'
  );
  setTimeout(() => {
    window.location.reload();
  }, 2500);
}

function createReportTemplate(location: 'gitlab' | 'tildes'): string {
  let introText =
    "Thank you for taking the time to report a bug! Don't forget to fill in an\n  appropriate title above, and make sure the information below is correct.";

  if (location === 'tildes') {
    introText =
      'Thank you for taking the time to report a bug! Please make sure the\n  information below is correct.';
  }

  // Set the headers using HTML tags, these can't be with #-style Markdown
  // headers as they'll be interpreted as an ID instead of Markdown content
  // and so GitLab won't add it to the description.
  let reportTemplate = `<h2>Bug Report</h2>
<!--
  ${introText}
-->
<h3>Info</h3>\n
| Type | Value |
|------|-------|
| Operating System | ${platform.os!.toString()} |
| Browser | ${platform.name!} ${platform.version!} (${platform.layout!}) |\n`;
  // The platform manufacturer and product can be null in certain cases (such as
  // desktops) so only when they're both not null include them.
  if (platform.manufacturer !== null && platform.product !== null) {
    reportTemplate += `| Device | ${platform.manufacturer!} ${platform.product!} |\n`;
  }

  reportTemplate += `\n<h3>The Problem</h3>
<!--
  Please explain in sufficient detail what the problem is. When suitable,
  including an image or video showing the problem will also help immensely.
-->\n\n
<h3>A Solution</h3>
<!--
  If you know of any possible solutions, feel free to include them. If the
  solution is just something like "it should work" then you can safely omit
  this section.
-->\n\n\n`;

  return reportTemplate;
}
