import {html} from 'htm/preact';
import {
  getSettings,
  exportSettings,
  importFileHandler,
  Link,
  log,
  removeAllData,
  Setting,
  SettingProps,
  TRXComponent
} from '../..';

async function logSettings() {
  log(await getSettings(), true);
}

export function AboutSetting(props: SettingProps): TRXComponent {
  const importSettings = () => {
    (document.querySelector('#import-settings') as HTMLInputElement).click();
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

  return html`<${Setting} ...${props}>
    <p class="info">
      This feature will make debugging logs output to the console when enabled.
    </p>

    <p>
      Tildes ReExtended is a from-scratch recreation of the original${' '}
      ${tildesExtendedLink} web extension by ${criusLink}. Open-sourced${' '}
      with the ${gitlabLicenseLink} and maintained as a ${communityLink}.
    </p>

    <p>
      To report bugs or request new features use the links at the bottom of this
      page, check out the ${gitlabIssuesLink} or ${messageCommunityLink}${' '}
      on Tildes.
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
      <button onClick=${importSettings} class="button">Import Settings</button>
      <button onClick=${exportSettings} class="button">Export Settings</button>
    </div>

    <div class="divider" />

    <details class="misc-utilities">
      <summary>Danger Zone</summary>

      <div class="inner">
        <button onClick=${logSettings} class="button">Log Settings</button>

        <button onClick=${removeAllData} class="button destructive">
          Remove All Data
        </button>
      </div>
    </details>
  <//>`;
}
