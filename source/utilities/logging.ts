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

  if (window.TildesReExtended?.debug || import.meta.env.DEV || force) {
    if (overrideStyle.length > 0) {
      console.debug(prefix, overrideStyle, thing);
    } else {
      console.debug(prefix, thing);
    }
  }
}
