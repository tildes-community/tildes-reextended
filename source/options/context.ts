import {createContext} from 'preact';

import Settings from '../settings.js';

type AppContextValues = {
  settings: Settings;
  setActiveFeature: (feature: string) => void;
  toggleFeature: (feature: string) => void;
};

export const AppContext = createContext<AppContextValues>(null!);
