import { createContext, useContext, useMemo } from "react";
import { RouterProvider, useLocation, useNavigate } from "react-router-dom";

import { useRouteGuards } from "../auth/use-guards";

import { RuntimeWorkspace } from "./model";
import { createWorkspaceRouter } from "./router";

export interface WorkspaceProviderProps {
    workspaces: RuntimeWorkspace[];
    MainPage?: React.ComponentType;
    LoginPage?: React.ComponentType;
}

interface WorkspacesContextValue {
    workspaces: Map<string, RuntimeWorkspace>;
}

const WorkspacesContext = createContext<WorkspacesContextValue | null>(null);

export const WorkspaceProvider: React.FC<WorkspaceProviderProps> = ({
    workspaces,
}) => {
    const routeGuards = useRouteGuards();
    const router = createWorkspaceRouter(workspaces, routeGuards);

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
            <RouterProvider router={router} />
        </WorkspacesContext.Provider>
    );
};

export function useWorkspaces() {
    const context = useContext(WorkspacesContext);
    const location = useLocation();
    const navigate = useNavigate();

    if (!context) {
        throw new Error("useWorkspaces must be used within WorkspaceProvider");
    }

    const workspaces = useMemo(
        () => Array.from(context.workspaces.values()),
        [context.workspaces]
    );

    const activeWorkspace = useMemo(() => {
        const workspaceId = location.pathname.split("/")[1];

        if (!workspaceId) return null;

        return workspaces.find((w) => w.id === workspaceId) || null;
    }, [location.pathname, workspaces]);

    const setActiveWorkspace = (workspaceId: string) => {
        navigate(workspaceId ? `/${workspaceId}` : "/");
    };

    const getById = (id: string) => context.workspaces.get(id);

    return { workspaces, activeWorkspace, setActiveWorkspace, getById };
}

export function useWorkspaceById(id: string): RuntimeWorkspace | undefined {
    const context = useContext(WorkspacesContext);
    if (!context) {
        throw new Error(
            "useWorkspaceById must be used within WorkspaceProvider"
        );
    }
    return context.workspaces.get(id);
}
