/**
 * Creates an HTMLElement from a given string. Only use this when using
 * `htm/preact` isn't practical.
 * @param input The HTML.
 */
export function createElementFromString<T extends Element>(input: string): T {
  const template: HTMLTemplateElement = document.createElement('template');
  template.innerHTML = input.trim();
  return template.content.firstElementChild! as T;
}

/**
 * Initializes the global window with Tildes ReExtended-specific settings.
 */
export function initialize(): void {
  if (window.TildesReExtended === undefined) {
    window.TildesReExtended = {
      debug: false
    };
  }
}

/**
 * Logs something to the console under the debug level.
 * @param thing The thing to log.
 * @param force If true, ignores whether or not debug logging is enabled.
 */
export function log(thing: any, force = false): void {
  let overrideStyle = '';
  let prefix = '[TRX]';
  if (force) {
    prefix = '%c' + prefix;
    overrideStyle = 'background-color: #dc322f; margin-right: 9px;';
  }

  if (window.TildesReExtended.debug || force) {
    if (overrideStyle.length > 0) {
      console.debug(prefix, overrideStyle, thing);
    } else {
      console.debug(prefix, thing);
    }
  }
}

export * from './color';
export * from './components';
export * from './groups';
export * from './query-selectors';
export * from './report-a-bug';
export * from './validators';
