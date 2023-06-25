/**
 * Initialize the `TildesReExtended` global.
 */
export function initializeGlobals() {
  if (window.TildesReExtended === undefined) {
    window.TildesReExtended = {
      debug: false,
    };
  }
}
