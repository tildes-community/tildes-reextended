import {html} from 'htm/preact';
import browser from 'webextension-polyfill';

declare global {
  interface Window {
    TildesReExtended: {
      debug: boolean;
    };
  }

  interface ImportMetaEnv {
    readonly DEV: boolean;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }

  type TRXComponent = ReturnType<typeof html>;

  type TRXManifest = browser.Manifest.ManifestBase;

  type UserLabel = {
    color: string;
    id: number;
    priority: number;
    text: string;
    username: string;
  };

  type UsernameColor = {
    color: string;
    id: number;
    username: string;
  };
}
