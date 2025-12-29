import { createContext, useContext, useMemo } from "react";

import { RuntimeWorkspace } from "./model";

interface WorkspacesContextValue {
    workspaces: Map<string, RuntimeWorkspace>;
}

const WorkspacesContext = createContext<WorkspacesContextValue | null>(null);

export function WorkspacesProvider({
    workspaces,
    children,
}: {
    workspaces: RuntimeWorkspace[];
    children: React.ReactNode;
}) {
    const workspacesMap = useMemo(() => {
        const map = new Map<string, RuntimeWorkspace>();
        workspaces.forEach((workspace) => {
            if (map.has(workspace.id)) {
                throw new Error(`Duplicate workspace id: ${workspace.id}`);
            }
            map.set(workspace.id, workspace);
        });
        return map;
    }, [workspaces]);

    return (
        <WorkspacesContext.Provider value={{ workspaces: workspacesMap }}>
            {children}
        </WorkspacesContext.Provider>
    );
}

export function useWorkspaces() {
    const context = useContext(WorkspacesContext);
    if (!context) {
        throw new Error("useWorkspaces must be used within WorkspacesProvider");
    }
    return Array.from(context.workspaces.values());
}

export function useWorkspaceById(id: string): RuntimeWorkspace | undefined {
    const context = useContext(WorkspacesContext);
    if (!context) {
        throw new Error(
            "useWorkspaceById must be used within WorkspacesProvider"
        );
    }
    return context.workspaces.get(id);
}
