// Export something so TypeScript doesn't see this file as an ambient module.
export {};

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    TildesReExtended: {
      debug: boolean;
    };
  }

  const $browser: "chromium" | "firefox";
  const $dev: boolean;
  const $test: boolean;
}
