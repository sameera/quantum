import React from "react";
import { useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import { Settings } from "lucide-react";

import { UserAvatar } from "../auth/user-avatar";
import { Button } from "../components/button";
import { ScrollArea } from "../components/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/select";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetTitle,
} from "../components/sheet";
import { appMeta$ } from "../model/app-metadata";
import { useWorkspaces } from "../workspaces/provider";

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
    const [appMeta] = useAtom(appMeta$);
    const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspaces();
    const navigate = useNavigate();

    const AppIcon = appMeta.icon;

    const PLACEHOLDER_WORKSPACE_ID = "__no_workspace__";

    const handleWorkspaceChange = (workspaceId: string) => {
        setActiveWorkspace(workspaceId);
        onClose();
    };

    // Load menu from workspace if available
    const ExplorerContent = activeWorkspace?.menu;
    const workspaceId = activeWorkspace?.id;

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="left" className="w-[280px] p-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">
                    Access workspaces and navigate through workspace items
                </SheetDescription>

                <div className="flex h-full flex-col">
                    {/* Header Section */}
                    <div className="flex items-center gap-3 border-b p-4">
                        <AppIcon className="h-6 w-6" />
                        <h2 className="text-lg font-semibold">
                            {appMeta.name}
                        </h2>
                    </div>

                    {/* Workspace Selector Section */}
                    <div className="border-b p-4">
                        <Select
                            value={
                                activeWorkspace?.id ?? PLACEHOLDER_WORKSPACE_ID
                            }
                            onValueChange={handleWorkspaceChange}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select workspace" />
                            </SelectTrigger>
                            <SelectContent>
                                {!activeWorkspace && (
                                    <SelectItem
                                        value={PLACEHOLDER_WORKSPACE_ID}
                                        disabled
                                    >
                                        <span className="text-muted-foreground">
                                            Select a workspace
                                        </span>
                                    </SelectItem>
                                )}
                                {workspaces.map((workspace) => (
                                    <SelectItem
                                        key={workspace.id}
                                        value={workspace.id}
                                    >
                                        <div className="flex items-center gap-2">
                                            <workspace.icon className="h-4 w-4" />
                                            <span>{workspace.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Workspace Content Section */}
                    {activeWorkspace && (
                        <ScrollArea className="flex-1">
                            <div className="space-y-4 px-3 py-4">
                                {ExplorerContent ? (
                                    <React.Suspense
                                        fallback={
                                            <div className="px-3 py-2">
                                                Loading...
                                            </div>
                                        }
                                    >
                                        <ExplorerContent key={workspaceId} />
                                    </React.Suspense>
                                ) : (
                                    <div className="px-3 py-2 text-muted-foreground">
                                        No content available
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    )}

                    {/* Footer Section */}
                    <div className="border-t">
                        <div className="px-2 py-4">
                            <Button
                                variant="ghost"
                                className="w-full justify-start"
                                onClick={() => {
                                    navigate("/settings");
                                    onClose();
                                }}
                            >
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </Button>
                        </div>
                        <div className="border-t p-4">
                            <UserAvatar isExpanded={true} />
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
