import React from "react";
import { ChevronLeft } from "lucide-react";

import { Button } from "./button";
import { Separator } from "./separator";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./tooltip";
import { cn } from "./utils";

export interface SidebarHeaderProps {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    isExpanded: boolean;
    onToggleExpanded: () => void;
    onIconClick?: () => void;
    className?: string;
}

export function SidebarHeader({
    icon: Icon,
    title,
    isExpanded,
    onToggleExpanded,
    onIconClick,
    className,
}: SidebarHeaderProps) {
    if (isExpanded) {
        return (
            <div className={cn("w-full", className)}>
                <div className="flex items-center justify-between px-3 h-10">
                    <div
                        className="flex items-center cursor-pointer hover:opacity-80"
                        onClick={onIconClick}
                    >
                        <Icon className="h-4 w-4 text-primary mr-3" />
                        <span className="text-sm font-medium">{title}</span>
                    </div>
                    <Button
                        variant="ghost"
                        title="Collapse"
                        size="sm"
                        onClick={onToggleExpanded}
                        className="h-6 w-6 p-0 hover:bg-primary/10"
                    >
                        <ChevronLeft className="h-3 w-3" />
                    </Button>
                </div>
                <div className="px-1 mt-2">
                    <Separator />
                </div>
            </div>
        );
    }

    return (
        <div className={cn("w-full", className)}>
            <div className={isExpanded ? "px-1 py-2" : "px-1 py-1"}>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-full hover:bg-primary/10"
                                onClick={() => {
                                    onToggleExpanded();
                                    onIconClick?.();
                                }}
                            >
                                <Icon className="h-4 w-4 text-primary" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="p-2">
                            <div>
                                <p className="text-sm font-medium">{title}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Click to expand
                                </p>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
            <div className="px-1 mt-2">
                <Separator />
            </div>
        </div>
    );
}
