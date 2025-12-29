import { useEffect, useRef, useState } from "react";
import { useAtom } from "jotai";

import { UserAvatar } from "../auth/user-avatar";
import { Button } from "../components/button";
import { ScrollArea } from "../components/scroll-area";
import { Sidebar } from "../components/sidebar";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "../components/tooltip";
import { cn } from "../components/utils";
import { appMeta$ } from "../model/app-metadata";
import { Workspace } from "../workspaces";
import { useWorkspaces } from "../workspaces/provider";

import { useLayoutState } from "./state";

const WORKSPACE_BUTTON = "w-full hover:bg-primary/10 group relative";
const ACTIVE_WORKSPACE_ICON = "h-4 w-4 text-primary";
const INACTIVE_WORKSPACE_ICON = "h-4 w-4 group-hover:text-primary";

function WorkspaceButton({
    workspace,
    activeWorkspace,
    isExpanded = false,
    onButtonRef,
}: {
    workspace: Workspace;
    activeWorkspace?: Workspace | null;
    isExpanded?: boolean;
    onButtonRef?: (el: HTMLButtonElement | null) => void;
}) {
    const { setActiveWorkspace } = useWorkspaces();
    const switchWorkspace = () => setActiveWorkspace(workspace.id);

    const isActive = workspace.id === activeWorkspace?.id;
    const iconClassNames = isActive
        ? ACTIVE_WORKSPACE_ICON
        : INACTIVE_WORKSPACE_ICON;

    if (isExpanded) {
        return (
            <Button
                ref={onButtonRef}
                variant="ghost"
                className={cn(WORKSPACE_BUTTON, "justify-start px-3 h-10")}
                onClick={switchWorkspace}
            >
                <workspace.icon className={cn(iconClassNames, "mr-3")} />
                <span className="text-sm font-medium">{workspace.name}</span>
            </Button>
        );
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    ref={onButtonRef}
                    variant="ghost"
                    size="icon"
                    className={WORKSPACE_BUTTON}
                    onClick={switchWorkspace}
                >
                    <workspace.icon className={iconClassNames} />
                </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
                <p>{workspace.name}</p>
            </TooltipContent>
        </Tooltip>
    );
}

export type WorkspacesBarProps = React.HTMLAttributes<HTMLDivElement>;

export function WorkspacesBar({ className }: WorkspacesBarProps) {
    const [appMeta] = useAtom(appMeta$);
    const { workspaces, activeWorkspace } = useWorkspaces();
    const { isWorkspacesBarExpanded, setIsWorkspacesBarExpanded } =
        useLayoutState();

    const toggleExpanded = () =>
        setIsWorkspacesBarExpanded(!isWorkspacesBarExpanded);

    // Track button refs for animation
    const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
    const [indicatorStyle, setIndicatorStyle] = useState<{
        top: number;
        height: number;
        opacity: number;
    }>({ top: 0, height: 0, opacity: 0 });

    // Update indicator position when active workspace changes
    useEffect(() => {
        if (!activeWorkspace) return;

        const activeButton = buttonRefs.current.get(activeWorkspace.id);
        if (activeButton) {
            const container = activeButton.parentElement;
            if (container) {
                const containerRect = container.getBoundingClientRect();
                const buttonRect = activeButton.getBoundingClientRect();
                setIndicatorStyle({
                    top: buttonRect.top - containerRect.top,
                    height: buttonRect.height,
                    opacity: 1,
                });
            }
        }
    }, [activeWorkspace?.id, isWorkspacesBarExpanded]);

    return (
        <Sidebar
            icon={appMeta.icon}
            title={appMeta.name}
            isExpanded={isWorkspacesBarExpanded}
            onToggleExpanded={toggleExpanded}
            footer={
                <div className="py-3 w-full">
                    <UserAvatar isExpanded={isWorkspacesBarExpanded} />
                </div>
            }
            className={className}
        >
            {/* Workspaces List */}
            <div className="flex-1 space-y-1 py-2">
                <div className="px-1 h-full">
                    <ScrollArea className="h-full px-1">
                        <div className="space-y-1 relative">
                            {/* Animated background indicator */}
                            <div
                                className="absolute left-0 right-0 bg-primary/10 rounded-md transition-all duration-300 ease-out pointer-events-none"
                                style={{
                                    transform: `translateY(${indicatorStyle.top}px)`,
                                    height: `${indicatorStyle.height}px`,
                                    opacity: indicatorStyle.opacity,
                                }}
                            />
                            <TooltipProvider>
                                {workspaces.map((workspace) => (
                                    <WorkspaceButton
                                        key={workspace.id}
                                        workspace={workspace}
                                        activeWorkspace={activeWorkspace}
                                        isExpanded={isWorkspacesBarExpanded}
                                        onButtonRef={(el) => {
                                            if (el) {
                                                buttonRefs.current.set(
                                                    workspace.id,
                                                    el
                                                );
                                            } else {
                                                buttonRefs.current.delete(
                                                    workspace.id
                                                );
                                            }
                                        }}
                                    />
                                ))}
                            </TooltipProvider>
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </Sidebar>
    );
}
