import {html} from 'htm/preact';
import {createContext} from 'preact';
import {Settings} from './settings';

export type TRXComponent = ReturnType<typeof html>;

type AppContextValues = {
  settings: Settings;
  setActiveFeature: (feature: string) => void;
  toggleFeature: (feature: string) => void;
};

// We create this context with null as we'll create the state and the other
// functions inside App itself. See `settings-page.ts` for that.
export const AppContext = createContext<AppContextValues>(null!);

export * from './scripts';
export * from './settings';
export * from './utilities';
