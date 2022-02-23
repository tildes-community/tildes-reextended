import {log, querySelectorAll} from '../utilities/exports.js';

export function runAnonymizeUsernamesFeature() {
  const observer = new window.MutationObserver(() => {
    observer.disconnect();
    anonymizeUsernames();
    startObserver();
  });

  function startObserver() {
    observer.observe(document, {
      childList: true,
      subtree: true,
    });
  }

  const count = anonymizeUsernames();
  startObserver();

  log(`Anonymize Usernames: Initialized for ${count} user links.`);
}

function anonymizeUsernames(): number {
  const usernameElements = querySelectorAll<HTMLElement>(
    '.link-user:not(.trx-anonymized)',
  );
  const replacements = generateReplacements(usernameElements);

  for (const element of usernameElements) {
    let username = usernameFromElement(element);
    const isMention = username.startsWith('@');
    if (isMention) {
      username = username.slice(1);
    }

    const replacement = replacements[username];
    element.textContent = isMention ? `@${replacement}` : `${replacement}`;

    element.classList.add('trx-anonymized');
    element.dataset.trxUsername = username;
  }

  return usernameElements.length;
}

function generateReplacements(elements: HTMLElement[]): Record<string, string> {
  const usernames = new Set(
    elements.map((element) => usernameFromElement(element).replace(/@/g, '')),
  );

  const replacements: Record<string, string> = {};
  for (const [index, username] of Array.from(usernames).entries()) {
    replacements[username] = `Anonymous ${index}`;
  }

  return replacements;
}

function usernameFromElement(element: HTMLElement): string {
  return (element.textContent ?? '<unknown>').trim();
}
