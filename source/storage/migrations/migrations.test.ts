import browser from "webextension-polyfill";
import {setup} from "@holllo/test";
import {Data, Feature} from "../exports.js";
import {migrations} from "./migrations.js";
import {v112Sample} from "./v1-1-2.js";

await setup("Migrations", async (group) => {
  group.test("2.0.0", async (test) => {
    await browser.storage.sync.clear();

    await migrations[0].migrate(v112Sample);
    const storage = await browser.storage.sync.get();
    for (const [key, value] of Object.entries(storage)) {
      switch (key) {
        case Data.EnabledFeatures: {
          test.equals(
            value,
            '["autocomplete","back-to-top","debug","hide-votes","jump-to-new-comment","markdown-toolbar","themed-logo","user-labels"]',
          );
          break;
        }

        case Data.KnownGroups: {
          test.equals(value, '["~group","~group.subgroup","~test"]');
          break;
        }

        case Data.Version: {
          test.equals(value, '"2.0.0"');
          break;
        }

        case Feature.HideVotes: {
          test.equals(
            value,
            '{"otherComments":true,"otherTopics":true,"ownComments":true,"ownTopics":false}',
          );
          break;
        }

        case `${Feature.UsernameColors}-4`: {
          test.equals(value, '{"color":"red","id":4,"username":"Test"}');
          break;
        }

        case `${Feature.UsernameColors}-18`: {
          test.equals(
            value,
            '{"color":"green","id":18,"username":"AnotherTest"}',
          );
          break;
        }

        case `${Feature.UserLabels}-1`: {
          test.equals(
            value,
            '{"color":"#ff00ff","id":1,"priority":0,"text":"Test Label","username":"Test"}',
          );
          break;
        }

        case `${Feature.UserLabels}-15`: {
          test.equals(
            value,
            '{"id":15,"color":"var(--syntax-string-color)","priority":0,"text":"Another Label","username":"AnotherTest"}',
          );
          break;
        }

        default: {
          console.log(key, JSON.stringify(value));
        }
      }
    }
  });
});
