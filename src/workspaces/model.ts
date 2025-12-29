import { lazy } from "react";

import { IconType } from "../types-def";

import type { WorkspaceLifecycleHandlers } from "./lifecycle/lifecycle-types";

export interface Workspace {
    id: string;
    name: string;
    icon: IconType;
    isDefault?: boolean;
}

export interface RuntimeWorkspace extends Workspace {
    router?: ReturnType<typeof lazy>;
    isPublic?: boolean;
    menu?: ReturnType<typeof lazy>;
    lifecycle?: WorkspaceLifecycleHandlers;
}
