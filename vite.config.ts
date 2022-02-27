import path from 'node:path';
import url from 'node:url';

import preact from '@preact/preset-vite';
import {defineConfig} from 'vite';
import webExtension from 'vite-plugin-web-extension';

const currentDir = path.dirname(url.fileURLToPath(import.meta.url));

const buildDir = path.join(currentDir, 'build');
const sourceDir = path.join(currentDir, 'source');

export default defineConfig({
  build: {
    outDir: buildDir,
    sourcemap: 'inline',
  },
  plugins: [
    preact(),
    webExtension({
      additionalInputs: ['options/user-label-editor.html'],
      assets: 'assets',
      browser: 'firefox',
      manifest: path.join(sourceDir, 'manifest.json'),
      webExtConfig: {
        browserConsole: true,
        firefoxProfile: 'firefox/',
        keepProfileChanges: true,
        startUrl: 'about:debugging#/runtime/this-firefox',
        target: 'firefox-desktop',
      },
    }),
  ],
  root: sourceDir,
});
