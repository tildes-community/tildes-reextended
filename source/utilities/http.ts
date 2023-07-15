import {log} from "./logging.js";

/**
 * Make an HTTP request to the Tildes API that is normally used by Intercooler.
 * This should only be used when using HTML elements from Tildes itself isn't
 * feasible.
 * @param url The API URL to call.
 * @param request Any extra request details, note that some of these values will
 * be overridden by the ones required to make a proper Intercooler request.
 */
export async function makeIntercoolerRequest(
  url: string,
  request: RequestInit,
): Promise<Response> {
  if (!url.startsWith("https://tildes.net")) {
    throw new Error(`Can't make Intercooler request to non-Tildes URL: ${url}`);
  }

  const csrfToken = document.querySelector<HTMLMetaElement>(
    'meta[name="csrftoken"]',
  )!.content;

  const ic: RequestInit = {
    headers: {
      "X-CSRF-Token": csrfToken,
      "X-IC-Request": "true",
      // Include this header so it's clear this isn't a request actually sent by
      // Intercooler but by Tildes ReExtended.
      "X-TRX-Request": "true",
    },
    referrer: "https://tildes.net",
  };

  request.headers =
    request.headers === undefined
      ? ic.headers
      : {
          ...request.headers,
          // Apply the Intercooler headers last so they can't be overridden.
          ...ic.headers,
        };

  request.referrer = request.referrer ?? ic.referrer;

  // Explicitly log the request because content script HTTP calls don't show up
  // in the Network DevTools.
  log("Making Intercooler request:");
  log(request);
  return window.fetch(url, request);
}
