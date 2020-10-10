import {log, querySelectorAll, setSettings, Settings} from '..';

/**
 * Tries to extract and save the groups. Returns the current saved groups when
 * the user is not in `/groups` and the new ones when they are in `/groups`.
 * @param settings The user's extension settings.
 */
export async function extractAndSaveGroups(
  settings: Settings
): Promise<string[]> {
  if (window.location.pathname !== '/groups') {
    log('Not in "/groups", returning early.');
    return settings.data.knownGroups;
  }

  const groups: string[] = querySelectorAll('.link-group').map(
    (value) => value.textContent!
  );

  settings.data.knownGroups = groups;
  await setSettings(settings);
  log('Updated saved groups.', true);
  return groups;
}
