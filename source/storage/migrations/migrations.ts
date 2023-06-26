import {setup} from "@holllo/test";
import {type Migration} from "@holllo/migration-helper";
import browser from "webextension-polyfill";
import {
  Data,
  Feature,
  createValueUserLabel,
  fromStorage,
  saveUserLabels,
} from "../common.js";
import {v112DeserializeData, v112Sample, type V112Settings} from "./v1-1-2.js";

export const migrations: Array<Migration<string>> = [
  {
    version: "2.0.0",
    async migrate(data: V112Settings): Promise<void> {
      const deserialized = v112DeserializeData(data);
      data.data.userLabels = deserialized.userLabels;
      data.data.usernameColors = deserialized.usernameColors;

      const userLabels = [];
      for (const userLabel of data.data.userLabels) {
        userLabels.push(await createValueUserLabel(userLabel));
      }

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

      const usernameColors = await fromStorage(Feature.UsernameColors);
      usernameColors.value = data.data.usernameColors;
      await usernameColors.save();

      const enabledFeatures = await fromStorage(Data.EnabledFeatures);
      for (const [key, value] of Object.entries(data.features)) {
        if (value) {
          const snakeCasedKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
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
