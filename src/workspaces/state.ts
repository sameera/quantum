import { atom } from "jotai";

import { appMeta$ } from "../model/app-metadata";

export const systemWorkspace$ = atom((get) => {
    const appMeta = get(appMeta$);
    return {
        id: "/",
        name: appMeta.name,
        icon: appMeta.icon,
    };
});
