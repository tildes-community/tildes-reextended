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

  // Removes an index signature from a type, useful for getting all defined keys
  // from an object that also has an index signature, like Settings.features.
  // https://stackoverflow.com/a/66252656
  type RemoveIndexSignature<T> = {
    [K in keyof T as string extends K
      ? never
      : number extends K
      ? never
      : K]: T[K];
  };
}
