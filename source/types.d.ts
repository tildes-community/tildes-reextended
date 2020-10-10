// A fix for TypeScript so it sees this file as a module and thus allows to
// modify the global scope.
export {};

// See the initialize function located in `utilities/index.ts` for actual code.

type TildesReExtended = {
  debug: boolean;
};

declare global {
  interface Window {
    TildesReExtended: TildesReExtended;
  }
}
