import {hashSha256, log, querySelectorAll} from "../../utilities/exports.js";
import {
  type AnonymizeUsernamesData,
  ReplacementType,
} from "../../storage/exports.js";

export async function runAnonymizeUsernamesFeature(
  data: AnonymizeUsernamesData,
) {
  const count = await anonymizeUsernames(data);
  log(`Anonymize Usernames: Initialized for ${count} user links.`);
}

async function anonymizeUsernames(
  data: AnonymizeUsernamesData,
): Promise<number> {
  const usernameElements = querySelectorAll<HTMLElement>(
    ".link-user:not(.trx-anonymized)",
  );
  const replacements = await generateReplacements(usernameElements, data);

  for (const element of usernameElements) {
    let username = usernameFromElement(element);
    const isMention = username.startsWith("@");
    if (isMention) {
      username = username.slice(1);
    }

    const replacement = replacements[username];
    element.textContent = isMention ? `@${replacement}` : `${replacement}`;

    element.classList.add("trx-anonymized");
    element.dataset.trxUsername = username;
  }

  return usernameElements.length;
}

async function generateReplacements(
  elements: HTMLElement[],
  data: AnonymizeUsernamesData,
): Promise<Record<string, string>> {
  const usernames = new Set(
    elements.map((element) => usernameFromElement(element).replaceAll("@", "")),
  );

  const replacements: Record<string, string> = {};
  for (const [index, username] of Array.from(usernames).entries()) {
    switch (data.replacementType) {
      case ReplacementType.Hashed: {
        const hash = await hashSha256(username);
        replacements[username] = hash.slice(0, 10).toUpperCase();
        break;
      }

      case ReplacementType.Numerical: {
        replacements[username] = `Anonymous ${index + 1}`;
        break;
      }

      default: {
        throw new Error(
          `Unknown ReplacementType in AnonymizeUsernamesData: ${JSON.stringify(
            data,
          )}`,
        );
      }
    }
  }

  return replacements;
}

function usernameFromElement(element: HTMLElement): string {
  return (element.textContent ?? "<unknown>").trim().toLowerCase();
}
