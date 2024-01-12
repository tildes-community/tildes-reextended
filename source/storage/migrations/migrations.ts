import {type Migration} from "@holllo/migration-helper";
import {
  Data,
  Feature,
  createValueUsernamecolor,
  createValueUserLabel,
  fromStorage,
  saveUsernameColors,
  saveUserLabels,
} from "../exports.js";
import {v112DeserializeData, type V112Settings} from "./v1-1-2.js";

export const migrations: Array<Migration<string>> = [
  {
    version: "2.0.0",
    async migrate(data: V112Settings): Promise<void> {
      const deserialized = v112DeserializeData(data);
      data.data.userLabels = deserialized.userLabels;
      data.data.usernameColors = deserialized.usernameColors;

      const usernameColors = [];
      const userLabels = [];

      for (const usernameColor of data.data.usernameColors) {
        usernameColors.push(await createValueUsernamecolor(usernameColor));
      }

      for (const userLabel of data.data.userLabels) {
        userLabels.push(await createValueUserLabel(userLabel));
      }

      await saveUsernameColors(usernameColors);
      await saveUserLabels(userLabels);

      const hideVotes = await fromStorage(Feature.HideVotes);
      hideVotes.value = {
        otherComments: data.data.hideVotes.comments,
        otherTopics: data.data.hideVotes.topics,
        ownComments: data.data.hideVotes.ownComments,
        ownTopics: data.data.hideVotes.ownTopics,
      };
      await hideVotes.save();

      const knownGroups = await fromStorage(Data.KnownGroups);
      knownGroups.value = new Set(data.data.knownGroups);
      await knownGroups.save();

      const version = await fromStorage(Data.Version);
      version.value = "2.0.0";
      await version.save();

      const enabledFeatures = await fromStorage(Data.EnabledFeatures);
      enabledFeatures.value.clear();
      for (const [key, value] of Object.entries(data.features)) {
        if (value) {
          const snakeCasedKey = key.replaceAll(/([A-Z])/g, "-$1").toLowerCase();
          if (Object.values(Feature).includes(snakeCasedKey as Feature)) {
            enabledFeatures.value.add(snakeCasedKey as Feature);
          } else {
            throw new Error(`Unknown key: ${key}`);
          }
        }
      }

      await enabledFeatures.save();
    },
  },
];
