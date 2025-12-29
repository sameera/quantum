import { ReactNode } from "react";

import { SidebarHeader } from "./sidebar-header";
import { cn } from "./utils";

export interface SidebarProps {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    isExpanded: boolean;
    onToggleExpanded: () => void;
    onHeaderClick?: () => void;
    children: ReactNode;
    footer?: ReactNode;
    className?: string;
}

export function Sidebar({
    icon,
    title,
    isExpanded,
    onToggleExpanded,
    onHeaderClick,
    children,
    footer,
    className,
}: SidebarProps) {
    return (
        <div className={cn("flex flex-col h-full", className)}>
            {/* Sidebar Header */}
            <div className={isExpanded ? "py-2" : "py-1"}>
                <SidebarHeader
                    icon={icon}
                    title={title}
                    isExpanded={isExpanded}
                    onToggleExpanded={onToggleExpanded}
                    onIconClick={onHeaderClick}
                />
            </div>

            {/* User-controlled content */}
            {children}

            {/* Sidebar Footer */}
            {footer && (
                <div className="px-1">
                    <div
                        className={cn(
                            "space-y-1 flex",
                            isExpanded ? "justify-start" : "justify-center"
                        )}
                    >
                        {footer}
                    </div>
                </div>
            )}
        </div>
    );
}
