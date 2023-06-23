{ pkgs ? import <nixpkgs> { } }:

with pkgs;

mkShell rec {
  packages = [ cargo-make nodejs nodePackages.pnpm ];
}
