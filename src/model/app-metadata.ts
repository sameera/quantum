import { atom } from "jotai";
import { Zap } from "lucide-react";

import { IconType } from "../types-def";

export const DEFAULT_APP_ICON = Zap;

export interface AppMetadata {
    name: string;
    icon: IconType;
}

export const appMeta$ = atom<AppMetadata>({
    name: "Quantum App",
    icon: DEFAULT_APP_ICON,
});
