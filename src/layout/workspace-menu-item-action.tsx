import { LucideIcon } from "lucide-react";

/**
 * Props for WorkspaceMenuItemAction component.
 *
 * This marker component declares an action button configuration for WorkspaceMenuItem.
 * It doesn't render anything itself - the parent WorkspaceMenuItem extracts these props
 * and renders the action with proper tooltip wrapping and event handling.
 */
export interface WorkspaceMenuItemActionProps {
    /**
     * The icon component to display in the action button.
     */
    icon: LucideIcon;

    /**
     * Tooltip text shown when hovering over the action button.
     */
    tooltip: string;

    /**
     * Click handler for the action button.
     * Note: stopPropagation() and preventDefault() are called automatically.
     */
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;

    /**
     * Accessibility label for screen readers.
     * This is required for proper accessibility support.
     */
    "aria-label": string;

    /**
     * Optional variant for different button styles.
     * @default "ghost"
     */
    variant?: "ghost" | "destructive";

    /**
     * Optional data-testid attribute for testing.
     */
    "data-testid"?: string;
}

/**
 * A marker component that declares an action button for WorkspaceMenuItem.
 *
 * This component does not render anything itself - it's used to pass configuration
 * to the parent WorkspaceMenuItem component, which handles the actual rendering
 * with proper tooltip wrapping, styling, and event handling.
 *
 * @example
 * ```tsx
 * <WorkspaceMenuItem text="Pages" icon={File} to="">
 *     <WorkspaceMenuItemAction
 *         icon={Plus}
 *         tooltip="Create new page"
 *         onClick={handleCreate}
 *         aria-label="Create new page"
 *     />
 * </WorkspaceMenuItem>
 * ```
 *
 * @example Multiple actions
 * ```tsx
 * <WorkspaceMenuItem text="Projects" icon={Folder} to="projects">
 *     <WorkspaceMenuItemAction
 *         icon={Plus}
 *         tooltip="Create project"
 *         onClick={handleCreate}
 *         aria-label="Create new project"
 *     />
 *     <WorkspaceMenuItemAction
 *         icon={Trash}
 *         tooltip="Delete all"
 *         onClick={handleDeleteAll}
 *         aria-label="Delete all projects"
 *         variant="destructive"
 *     />
 * </WorkspaceMenuItem>
 * ```
 */
export const WorkspaceMenuItemAction: React.FC<WorkspaceMenuItemActionProps> = () => {
    return null;
};

// Set display name for debugging and type checking
WorkspaceMenuItemAction.displayName = "WorkspaceMenuItemAction";
