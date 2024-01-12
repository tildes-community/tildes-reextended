import browser from "webextension-polyfill";
import {type JSX} from "preact";
import {
  Link,
  log,
  isValidHexColor,
  isValidTildesUsername,
} from "../../utilities/exports.js";
import {migrations} from "../../storage/migrations/migrations.js";
import {type SettingProps, Setting} from "./index.js";

async function importFileHandler(event: Event): Promise<void> {
  // Grab the imported files (if any).
  const fileList = (event.target as HTMLInputElement).files;

  if (fileList === null) {
    log("No file imported.");
    return;
  }

  const reader = new window.FileReader();

  reader.addEventListener("load", async (): Promise<void> => {
    let data: Record<string, any>;

    try {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      data = JSON.parse(reader.result!.toString()) as Record<string, any>;
    } catch (error: unknown) {
      log(error, true);
      return;
    }

    if (!(data instanceof Object)) {
      log("Imported data is not an object", true);
      return;
    }

    // eslint-disable-next-line unicorn/prefer-ternary
    if (data.version === "1.1.2") {
      await migrations[0].migrate(data);
    } else {
      await browser.storage.sync.set(data);
    }

    log("Successfully imported your settings, reloading the page to apply.");
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  });

  reader.addEventListener("error", (): void => {
    log(reader.error, true);
    reader.abort();
  });

  // eslint-disable-next-line unicorn/prefer-blob-reading-methods
  reader.readAsText(fileList[0]);
}

async function exportSettings(event: MouseEvent): Promise<void> {
  event.preventDefault();

  const storage = await browser.storage.sync.get();
  const settingsBlob = new window.Blob([JSON.stringify(storage, null, 2)], {
    type: "text/json",
  });

  const objectUrl = URL.createObjectURL(settingsBlob);

  try {
    await browser.downloads.download({
      filename: "tildes-reextended-sync-data.json",
      url: objectUrl,
      saveAs: true,
    });
  } catch (error: unknown) {
    log(error);
  } finally {
    // According to MDN, when creating an object URL we should also revoke it
    // when "it's safe to do so" to prevent excessive memory/storage use.
    // 60 seconds should probably be enough time to download the settings.
    setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
    }, 60 * 1000);
  }
}

export function AboutSetting(props: SettingProps): JSX.Element {
  const importSettings = () => {
    document.querySelector<HTMLElement>("#import-settings")!.click();
  };

  const communityLink = (
    <Link
      url="https://gitlab.com/tildes-community"
      text="Tildes Community project"
    />
  );
  const criusLink = <Link url="https://tildes.net/user/crius" text="Crius" />;
  const gitlabIssuesLink = (
    <Link
      url="https://gitlab.com/tildes-community/tildes-reextended/-/issues"
      text="GitLab issue tracker"
    />
  );
  const gitlabLicenseLink = (
    <Link
      url="https://gitlab.com/tildes-community/tildes-reextended/blob/main/LICENSE"
      text="MIT License"
    />
  );
  const messageCommunityLink = (
    <Link
      url="https://tildes.net/user/Community/new_message"
      text="message Community"
    />
  );
  const tildesExtendedLink = (
    <Link
      url="https://github.com/theCrius/tildes-extended"
      text="Tildes Extended"
    />
  );
  return (
    <Setting {...props}>
      <p class="info">
        This feature will make debugging logs output to the console when
        enabled.
      </p>

      <p>
        Tildes ReExtended is a from-scratch recreation of the original{" "}
        {tildesExtendedLink} web extension by {criusLink}. Open-sourced with the{" "}
        {gitlabLicenseLink} and maintained as a {communityLink}.
      </p>

      <p>
        To report bugs or request new features use the links at the bottom of
        this page, check out the {gitlabIssuesLink} or {messageCommunityLink} on
        Tildes.
      </p>

      <div class="divider" />

      <div class="import-export">
        <p>
          Note that importing settings will delete and overwrite your existing
          ones.
        </p>

        <input
          id="import-settings"
          onChange={importFileHandler}
          class="trx-hidden"
          accept="application/json"
          type="file"
        />
        <button onClick={importSettings} class="button">
          Import Settings
        </button>
        <button onClick={exportSettings} class="button">
          Export Settings
        </button>
      </div>
    </Setting>
  );
}
