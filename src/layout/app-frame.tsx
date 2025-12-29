import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { cn } from "../components/utils";
import { useWorkspaces } from "../workspaces";
import { LifecycleManager } from "../workspaces/lifecycle/lifecycle-manager";

import { MobileHeader } from "./mobile-header";
import { MobileMenu } from "./mobile-menu";
import { useLayoutState } from "./state";
import { ThemeProvider } from "./theme-provider";
import { WorkspaceExplorer } from "./workspace-explorer";
import { WorkspacesBar } from "./workspaces-bar";

export const AppFrame: React.FC = () => {
    const { key: locationKey } = useLocation();
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const { activeWorkspace } = useWorkspaces();
    const { isExplorerCollapsed, isWorkspacesBarExpanded, isMobileView } =
        useLayoutState();

    const [scrollOffset, setScrollOffset] = React.useState(0);

    const workspacesBarWidth = isWorkspacesBarExpanded ? 256 : 56; // w-64 = 256px, w-[56px] = 56px

    useEffect(() => {
        // Close mobile sidebar on route change
        setIsMobileSidebarOpen(false);
    }, [locationKey]);

    // Track scroll position in desktop mode
    useEffect(() => {
        if (isMobileView) return;

        const handleScroll = () => {
            setScrollOffset(window.scrollY);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isMobileView]);

    return (
        <ThemeProvider defaultTheme="dark">
            {/* Lifecycle Manager - triggers lifecycle events on workspace navigation */}
            <LifecycleManager />
            <div className="flex h-screen w-screen">
                {!isMobileView /* Desktop Layout */ && (
                    <div className="hidden md:flex h-full w-full">
                        {/* Workspaces Bar */}
                        <div
                            className={`${
                                isWorkspacesBarExpanded ? "w-64" : "w-[56px]"
                            } border-r shadow-lg fixed left-0 h-screen z-10`}
                            style={{
                                top: scrollOffset > 0 ? "0px" : undefined,
                                background: "var(--surface-nav)",
                            }}
                        >
                            <WorkspacesBar />
                        </div>
                        {/* Spacer to account for fixed workspaces bar */}
                        <div
                            className={`${
                                isWorkspacesBarExpanded ? "w-64" : "w-[56px]"
                            } flex-shrink-0`}
                        />
                        {/* Workspace Explorer */}
                        {/* Workspace Explorer */}
                        {activeWorkspace && (
                            <>
                                <div
                                    className={cn(
                                        "shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] fixed h-screen z-10",
                                        isExplorerCollapsed
                                            ? "w-[64px]"
                                            : "w-60"
                                    )}
                                    style={{
                                        top:
                                            scrollOffset > 0
                                                ? "0px"
                                                : undefined,
                                        left: `${workspacesBarWidth}px`,
                                        background: "var(--surface-sidebar)",
                                    }}
                                >
                                    <WorkspaceExplorer
                                        key={activeWorkspace?.id}
                                        workspace={activeWorkspace}
                                    />
                                </div>
                                {/* Spacer to account for fixed explorer */}
                                <div
                                    className={cn(
                                        "flex-shrink-0",
                                        isExplorerCollapsed
                                            ? "w-[64px]"
                                            : "w-60"
                                    )}
                                />
                            </>
                        )}
                        {/* Main Content Area */}
                        <div
                            className="flex-1 overflow-auto"
                            style={{ background: "var(--surface-app)" }}
                        >
                            <div className="flex h-full flex-col px-10 py-4">
                                <Outlet />
                            </div>
                        </div>
                    </div>
                )}

                {isMobileView && (
                    <div className="flex flex-col h-full w-full md:hidden">
                        <MobileHeader
                            workspace={activeWorkspace}
                            onOpenSidebar={() => setIsMobileSidebarOpen(true)}
                        />
                        <div className="flex-1 overflow-auto p-5">
                            <Outlet />
                        </div>
                        <MobileMenu
                            isOpen={isMobileSidebarOpen}
                            onClose={() => setIsMobileSidebarOpen(false)}
                        />
                    </div>
                )}
            </div>
        </ThemeProvider>
    );
};
