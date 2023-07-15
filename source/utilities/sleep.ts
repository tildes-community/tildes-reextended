/**
 * Promisified {@linkcode window.setTimeout}.
 * @param timeout The amount of time in milliseconds to sleep for.
 */
export async function sleep(timeout: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, timeout);
  });
}
