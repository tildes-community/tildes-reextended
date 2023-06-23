import path from "node:path";
import process from "node:process";
import fsp from "node:fs/promises";
import esbuild from "esbuild";
import copyPlugin from "esbuild-copy-static-files";
import {sassPlugin, type SassPluginOptions} from "esbuild-sass-plugin";
import cssnano from "cssnano";
import postcss from "postcss";
import {createManifest} from "./manifest.js";
import {createWebExtConfig} from "./web-ext.js";

/**
 * Create an absolute path from a given relative one, using the directory
 * this file is located in as the base.
 *
 * @param relative The relative path to make absolute.
 * @returns The absolute path.
 */
function toAbsolutePath(relative: string): string {
  return new URL(relative, import.meta.url).pathname;
}

// Create variables based on the environment.
const browser = process.env.BROWSER ?? "firefox";
const dev = process.env.NODE_ENV === "development";
const test = process.env.TEST === "true";
const watch = process.env.WATCH === "true";

// Create absolute paths to various directories.
const buildDir = toAbsolutePath("../build");
const outDir = path.join(buildDir, browser);
const sourceDir = toAbsolutePath("../source");

// Ensure that the output directory exists.
await fsp.mkdir(outDir, {recursive: true});

// Write the WebExtension manifest file.
await fsp.writeFile(
  path.join(outDir, "manifest.json"),
  JSON.stringify(createManifest(browser)),
);

// Write the web-ext configuration file.
await fsp.writeFile(
  path.join(buildDir, `web-ext-${browser}.json`),
  JSON.stringify(createWebExtConfig(browser, buildDir, dev, outDir)),
);

const cssProcessor = postcss([cssnano()]);

const createSassPlugin = (type: SassPluginOptions["type"]) => {
  return sassPlugin({
    type,
    async transform(source) {
      // In development, don't do any extra processing.
      if (dev) {
        return source;
      }

      // But in production, run the CSS through PostCSS.
      const {css} = await cssProcessor.process(source, {from: undefined});
      return css;
    },
  });
};

const options: esbuild.BuildOptions = {
  bundle: true,
  // Define variables to be replaced in the code. Note that these are replaced
  // "as is" and so we have to stringify them as JSON, otherwise a string won't
  // have its quotes for example.
  define: {
    $browser: JSON.stringify(browser),
    $dev: JSON.stringify(dev),
    $test: JSON.stringify(test),
  },
  entryPoints: [
    path.join(sourceDir, "background/setup.ts"),
    path.join(sourceDir, "options/setup.tsx"),
    path.join(sourceDir, "options/user-label-editor.tsx"),
    path.join(sourceDir, "content-scripts/setup.tsx"),
  ],
  format: "esm",
  logLevel: "info",
  minify: !dev,
  outdir: outDir,
  plugins: [
    // Copy all files from `source/assets/` to the output directory.
    copyPlugin({src: path.join(sourceDir, "assets/"), dest: outDir}),

    // Compile SCSS to CSS.
    createSassPlugin("style"),
  ],
  // Link sourcemaps in development but omit them in production.
  sourcemap: dev ? "linked" : false,
  // Currently code splitting can't be used because we use ES modules and
  // Firefox doesn't run the background script with `type="module"`.
  // Once Firefox properly supports Manifest V3 this should be possible though.
  splitting: false,
  // Target ES2022, and the first Chromium and Firefox releases from 2022.
  target: ["es2022", "chrome97", "firefox102"],
  treeShaking: true,
};

const contentStyleOptions: esbuild.BuildOptions = {
  entryPoints: [path.join(sourceDir, "scss/content-scripts.scss")],
  logLevel: options.logLevel,
  minify: options.minify,
  outfile: path.join(outDir, "css/content-scripts.css"),
  plugins: [createSassPlugin("css")],
  sourcemap: options.sourcemap,
  target: options.target,
};

if (watch) {
  const context = await esbuild.context(options);
  const contentStyleContext = await esbuild.context(contentStyleOptions);
  await Promise.all([context.watch(), contentStyleContext.watch()]);
} else {
  await esbuild.build(options);
  await esbuild.build(contentStyleOptions);
}
