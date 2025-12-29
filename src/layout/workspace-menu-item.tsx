import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "../components/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "../components/tooltip";
import { cn } from "../components/utils";
import { IconType } from "../types-def";
import { useWorkspaces } from "../workspaces";

import { useLayoutState } from "./state";
import { WorkspaceMenuItemActionProps } from "./workspace-menu-item-action";

/**
 * Helper function to extract WorkspaceMenuItemAction configurations from children.
 * Only extracts components that are of type WorkspaceMenuItemAction.
 */
function extractActions(
    children: React.ReactNode
): WorkspaceMenuItemActionProps[] {
    const actions: WorkspaceMenuItemActionProps[] = [];

    const processChild = (child: React.ReactNode) => {
        if (
            React.isValidElement(child) &&
            child.props &&
            typeof child.props === "object"
        ) {
            // Check if this is a fragment with children
            if (child.type === React.Fragment && child.props.children) {
                // Recursively process fragment children
                React.Children.forEach(child.props.children, processChild);
            }
            // Check if this looks like a WorkspaceMenuItemAction
            else if (
                "icon" in child.props &&
                "tooltip" in child.props &&
                "onClick" in child.props &&
                "aria-label" in child.props
            ) {
                actions.push(child.props as WorkspaceMenuItemActionProps);
            }
        }
    };

    React.Children.forEach(children, processChild);

    return actions;
}

/**
 * Props for the WorkspaceMenuItem component.
 *
 * @property {IconType} icon - The icon to be displayed in the menu item.
 * @property {string} text - The text to be displayed in the menu item.
 * @property {string} [to] - The optional URL to navigate to when the menu item is clicked.
 * @property {() => void} [onClick] - The optional click handler function to be executed when the menu item is clicked.
 * @property {React.ReactNode} [children] - Optional WorkspaceMenuItemAction components for action buttons displayed on the right side when expanded and hovered.
 *
 * @remarks
 * Both `to` and `onClick` can be specified together. The `onClick` handler will run prior to navigation, allowing the handler to perform any necessary actions before navigating.
 *
 * Children must be WorkspaceMenuItemAction components. Use WorkspaceMenuItemAction to declare action buttons with tooltips.
 */
export interface WorkspaceMenuItemProps {
    icon: IconType;
    text: string;
    to?: string;
    onClick?: () => void;
    children?: React.ReactNode;
}

export const WorkspaceMenuItem: React.FC<WorkspaceMenuItemProps> = ({
    icon: Icon,
    text,
    to,
    onClick,
    children,
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isExplorerCollapsed, isMobileView } = useLayoutState();
    const { activeWorkspace } = useWorkspaces();
    const [isHovered, setIsHovered] = React.useState(false);

    // Extract action configurations from children
    const actions = useMemo(() => extractActions(children), [children]);

    const targetPath = useMemo(() => {
        if (!to) return "/" + (activeWorkspace?.id || "");
        if (to.charAt(0) === "/") return to;
        return `/${activeWorkspace?.id || ""}/${to}`;
    }, [to, activeWorkspace?.id]);

    const isActive = useMemo(() => {
        if (typeof targetPath !== "string") return false;

        // Remove trailing slashes for consistent comparison
        const currentPath = location.pathname.replace(/\/$/, "");
        const target = targetPath.replace(/\/$/, "");

        // Exact match
        return currentPath === target;
    }, [location.pathname, targetPath]);

    const onItemClicked = () => {
        if (onClick) onClick();
        if (to && to.charAt(0) === "/") {
            navigate(to);
        } else {
            navigate(`${activeWorkspace?.id}/${to}`);
        }
    };

    // Render action buttons from configurations
    const renderActions = () => {
        if (actions.length === 0) return null;

        return (
            <TooltipProvider>
                <div className="flex items-center gap-1">
                    {actions.map((action, index) => (
                        <Tooltip key={index}>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    className={cn(
                                        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                                        "h-6 w-6 p-0",
                                        action.variant === "destructive"
                                            ? "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90"
                                            : "hover:bg-background/50 hover:text-accent-foreground"
                                    )}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        action.onClick(e);
                                    }}
                                    aria-label={action["aria-label"]}
                                    data-testid={action["data-testid"]}
                                >
                                    <action.icon className="h-3.5 w-3.5" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <p>{action.tooltip}</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>
            </TooltipProvider>
        );
    };

    return (
        <div className="w-full px-2">
            <div
                className={cn(
                    "group flex items-center w-full px-2 rounded-md transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    isActive && "bg-accent text-accent-foreground",
                    // Base justification: between when expanded with actions, start otherwise
                    actions.length > 0 && !isExplorerCollapsed
                        ? "justify-between"
                        : "justify-start"
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onFocus={() => setIsHovered(true)}
                onBlur={() => setIsHovered(false)}
            >
                <Button
                    variant="ghost"
                    className={cn(
                        "flex-1 justify-start hover:bg-transparent hover:text-current",
                        // Override justification when collapsed (tailwind-merge will keep this over justify-start)
                        isExplorerCollapsed && "px-2 justify-center"
                    )}
                    onClick={onItemClicked}
                >
                    <div className="flex items-center">
                        <Icon
                            className={cn(
                                "mr-2 h-4 w-4",
                                isExplorerCollapsed && "mr-0 h-5 w-5"
                            )}
                        />
                        <span
                            className={cn(
                                "transition-all",
                                isExplorerCollapsed && "hidden"
                            )}
                        >
                            {text}
                        </span>
                    </div>
                </Button>
                {actions.length > 0 && !isExplorerCollapsed && (isMobileView || isHovered) && (
                    <div
                        className="ml-2 transition-opacity duration-200 opacity-100"
                        data-action-container
                    >
                        {renderActions()}
                    </div>
                )}
            </div>
        </div>
    );
};
