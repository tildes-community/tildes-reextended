/**
 * A list of default known groups to seed the Autocomplete feature with.
 *
 * This list does not need to be updated to match the groups available on Tildes.
 * Instead, in `source/utilities/groups.ts` is a function that will extract the
 * groups from Tildes whenever the user goes to `https://tildes.net/groups`.
 *
 * Inside `source/content-scripts/setup.tsx` a list of features that uses this
 * data is defined, when any of those features are enabled the extract function
 * will be called. So if a feature ever gets added that uses this data, remember
 * to add it to the list in the content scripts setup.
 */
export const defaultKnownGroups = [
  "~anime",
  "~arts",
  "~books",
  "~comp",
  "~creative",
  "~design",
  "~enviro",
  "~finance",
  "~food",
  "~games",
  "~games.game_design",
  "~games.tabletop",
  "~health",
  "~hobbies",
  "~humanities",
  "~lgbt",
  "~life",
  "~misc",
  "~movies",
  "~music",
  "~news",
  "~science",
  "~space",
  "~sports",
  "~talk",
  "~tech",
  "~test",
  "~tildes",
  "~tildes.official",
  "~tv",
];
