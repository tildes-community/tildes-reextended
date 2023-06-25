import path from "node:path";

/**
 * Barebones type definition for web-ext configuration.
 *
 * Since web-ext doesn't export any types this is done by ourselves. The keys
 * mostly follow a camelCased version of the CLI options
 * (ie. --start-url becomes startUrl).
 */
type WebExtConfig = {
  artifactsDir: string;
  sourceDir: string;
  verbose?: boolean;

  build: {
    filename: string;
    overwriteDest: boolean;
  };

  run: {
    browserConsole: boolean;
    chromiumProfile: string;
    firefoxProfile: string;
    keepProfileChanges: boolean;
    profileCreateIfMissing: boolean;
    startUrl: string[];
    target: string[];
  };
};

/**
 * Create the web-ext configuration.
 *
 * @param browser The browser target ("firefox" or "chromium").
 * @param buildDir The path to the build directory.
 * @param dev Is this for development or production.
 * @param outDir The path to the output directory.
 * @returns The configuration for web-ext.
 */
export function createWebExtConfig(
  browser: string,
  buildDir: string,
  dev: boolean,
  outDir: string,
): WebExtConfig {
  const config: WebExtConfig = {
    artifactsDir: path.join(buildDir, "artifacts"),
    sourceDir: outDir,

    build: {
      filename: `{name}-{version}-${browser}.zip`,
      overwriteDest: true,
    },

    run: {
      browserConsole: dev,
      chromiumProfile: path.join(buildDir, "chromium-profile/"),
      firefoxProfile: path.join(buildDir, "firefox-profile/"),
      keepProfileChanges: true,
      profileCreateIfMissing: true,
      startUrl: [],
      target: [],
    },
  };

  if (browser === "firefox") {
    config.run.startUrl.push("about:debugging#/runtime/this-firefox");
    config.run.target.push("firefox-desktop");
  } else if (browser === "chromium") {
    config.run.startUrl.push("chrome://extensions/");
    config.run.target.push("chromium");
  } else {
    throw new Error(`Unknown target browser: ${browser}`);
  }

  return config;
}
