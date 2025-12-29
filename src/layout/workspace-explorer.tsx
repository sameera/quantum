import React from "react";
import { useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";

import { Button } from "../components/button";
import { Loader } from "../components/loader";
import { Sidebar } from "../components/sidebar";
import { cn } from "../components/utils";
import { RuntimeWorkspace } from "../workspaces";

import { useLayoutState } from "./state";

type WorkspaceExplorerProps = React.HTMLAttributes<HTMLDivElement> & {
    workspace: RuntimeWorkspace | null;
    hideWorkspaceSettings?: boolean;
};

export const WorkspaceExplorer: React.FC<WorkspaceExplorerProps> = ({
    className,
    workspace,
    hideWorkspaceSettings = false,
}) => {
    const {
        isExplorerCollapsed: isCollapsed,
        setIsExplorerCollapsed: setIsCollapsed,
    } = useLayoutState();

    const navigate = useNavigate();

    if (!workspace) {
        return <Loader />;
    }

    // Force re-render when workspace changes by using it as a key dependency
    const workspaceId = workspace.id;

    // Load menu from workspace if available
    const ExplorerContent = workspace.menu;

    const toggleCollapsed = () => setIsCollapsed(!isCollapsed);
    const isExpanded = !isCollapsed; // Convert collapsed to expanded logic

    const footerContent = (
        <div className="w-full">
            <div className="border-t px-2 py-4">
                {!hideWorkspaceSettings && (
                    <Button
                        variant="ghost"
                        className={cn(
                            "w-full",
                            isCollapsed
                                ? "px-2 justify-center"
                                : "justify-start"
                        )}
                        onClick={() => navigate("settings")}
                    >
                        <Settings
                            className={cn(
                                "mr-2 h-4 w-4",
                                isCollapsed && "mr-0 h-5 w-5"
                            )}
                        />
                        <span
                            className={cn(
                                "transition-all",
                                isCollapsed && "hidden"
                            )}
                        >
                            Settings
                        </span>
                    </Button>
                )}
            </div>
        </div>
    );

    return (
        <Sidebar
            icon={workspace.icon}
            title={workspace.name}
            isExpanded={isExpanded}
            onToggleExpanded={toggleCollapsed}
            footer={footerContent}
            className={className}
        >
            {/* Main Content */}
            <div className="flex-1 space-y-4 py-4 mb-8" key={workspaceId}>
                {ExplorerContent && (
                    <React.Suspense
                        fallback={<div className="px-3 py-2">Loading...</div>}
                    >
                        <ExplorerContent key={workspaceId} />
                    </React.Suspense>
                )}
            </div>
        </Sidebar>
    );
};
