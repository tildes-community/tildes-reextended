// Type definitions for third-party packages.

declare module "esbuild-copy-static-files" {
  import {type cpSync} from "node:fs";
  import {type Plugin} from "esbuild";

  type CopySyncParameters = Parameters<typeof cpSync>;

  type Options = {
    src?: CopySyncParameters[0];
    dest?: CopySyncParameters[1];
  } & CopySyncParameters[2];

  export default function (options: Options): Plugin;
}
