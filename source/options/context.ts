import {createContext} from "preact";
import {type Feature} from "../storage/exports.js";

type AppContextValues = {
  setActiveFeature: (feature: Feature) => void;
  toggleFeature: (feature: Feature) => void;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const AppContext = createContext<AppContextValues>(null!);
