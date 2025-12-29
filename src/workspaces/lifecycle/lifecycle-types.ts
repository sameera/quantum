/**
 * Workspace Lifecycle Events - Type Contracts
 *
 * Feature: 006-workspace-lifecycle-events
 * Date: 2025-11-16
 *
 * This file defines the TypeScript type contracts for the workspace lifecycle event system.
 * These types will be implemented in @sameera/quantum library.
 */

import type { RuntimeWorkspace } from "../model";

/**
 * Lifecycle event phase identifiers
 */
export type LifecycleEventType =
    | "beforeActivate" // Before workspace becomes active
    | "afterActivate" // After workspace has become active
    | "beforeDeactivate" // Before workspace becomes inactive
    | "afterDeactivate"; // After workspace has become inactive

/**
 * Navigation trigger source
 */
export type NavigationTrigger =
    | "navigation" // User-initiated navigation (click, browser navigation)
    | "programmatic"; // Code-initiated navigation (setActiveWorkspace call)

/**
 * Context object passed to all lifecycle handlers
 *
 * Provides immutable metadata about the workspace transition to enable handlers
 * to make informed decisions about resource management and state updates.
 *
 * @example
 * const beforeActivate: LifecycleHandler = async (context) => {
 *   console.log(`Activating ${context.workspace.name} from ${context.previousWorkspace?.name}`);
 *   if (context.signal.aborted) return; // Check for cancellation
 *   await loadWorkspaceData(context.workspace.id);
 * };
 */
export interface WorkspaceLifecycleContext {
    /**
     * The workspace subject to the lifecycle event
     */
    workspace: RuntimeWorkspace;

    /**
     * The workspace being navigated away from (populated during activation events)
     * Undefined during initial mount or when activating from no workspace
     */
    previousWorkspace?: RuntimeWorkspace;

    /**
     * The workspace being navigated to (populated during deactivation events)
     * Undefined when deactivating to no workspace
     */
    nextWorkspace?: RuntimeWorkspace;

    /**
     * How the navigation was triggered
     * - 'navigation': User clicked link/button or used browser back/forward
     * - 'programmatic': Code called setActiveWorkspace()
     */
    trigger: NavigationTrigger;

    /**
     * Unix timestamp (milliseconds since epoch) when event was fired
     * Useful for logging, debugging, and performance monitoring
     */
    timestamp: number;

    /**
     * AbortSignal for cancellation support
     *
     * Handlers should periodically check signal.aborted and early-return
     * if true to avoid wasted work when navigation is cancelled by a new
     * navigation request.
     *
     * @example
     * if (context.signal.aborted) return;
     */
    signal: AbortSignal;
}

/**
 * Lifecycle event handler function signature
 *
 * All lifecycle handlers must conform to this signature. Handlers can be
 * synchronous (return void) or asynchronous (return Promise<void>).
 *
 * Handlers should:
 * - Be idempotent (safe to call multiple times)
 * - Check context.signal.aborted periodically for long operations
 * - Handle their own errors gracefully (errors are logged but don't block navigation)
 * - Not modify the context object (it's immutable)
 *
 * @param context - Immutable context with workspace transition metadata
 * @returns Promise<void> for async work, or void for sync work
 *
 * @example
 * const beforeActivate: LifecycleHandler = async (context) => {
 *   console.log(`Loading ${context.workspace.name}...`);
 *   await fetchWorkspaceData(context.workspace.id);
 * };
 *
 * const afterDeactivate: LifecycleHandler = (context) => {
 *   console.log(`Cleaning up ${context.workspace.name}...`);
 *   clearCache();
 * };
 */
export type LifecycleHandler = (
    context: WorkspaceLifecycleContext
) => Promise<void> | void;

/**
 * Lazy-loaded lifecycle handler import function
 *
 * Returns a Promise that resolves to a LifecycleHandler. This enables code-splitting
 * so handler implementations are only loaded when the workspace is first activated.
 *
 * Typically implemented as a dynamic import with module property access:
 *
 * @example
 * const loader: LifecycleHandlerLoader = () =>
 *   import('./lifecycle').then(module => module.beforeActivate);
 *
 * @returns Promise resolving to LifecycleHandler function
 */
export type LifecycleHandlerLoader = () => Promise<LifecycleHandler>;

/**
 * Lifecycle handler registration for a workspace
 *
 * All fields are optional - workspaces only need to register handlers for
 * lifecycle events they care about.
 *
 * Each field is a LifecycleHandlerLoader (not the handler itself) to enable
 * lazy-loading. Handlers are loaded on first workspace activation and cached.
 *
 * @example
 * const lifecycle: WorkspaceLifecycleHandlers = {
 *   beforeActivate: () => import('./lifecycle').then(m => m.beforeActivate),
 *   afterDeactivate: () => import('./lifecycle').then(m => m.afterDeactivate),
 *   // afterActivate and beforeDeactivate omitted (not needed)
 * };
 */
export interface WorkspaceLifecycleHandlers {
    /**
     * Handler invoked before workspace becomes active
     * Use for: Prefetching data, initializing state, setting up subscriptions
     */
    beforeActivate?: LifecycleHandlerLoader;

    /**
     * Handler invoked after workspace has become active
     * Use for: Starting background tasks, logging analytics, updating UI state
     */
    afterActivate?: LifecycleHandlerLoader;

    /**
     * Handler invoked before workspace becomes inactive
     * Use for: Saving draft state, pausing timers, preparing for cleanup
     */
    beforeDeactivate?: LifecycleHandlerLoader;

    /**
     * Handler invoked after workspace has become inactive
     * Use for: Releasing resources, cancelling subscriptions, clearing caches
     */
    afterDeactivate?: LifecycleHandlerLoader;
}

/**
 * Extended RuntimeWorkspace interface with lifecycle support
 *
 * This extends the existing RuntimeWorkspace interface from @sameera/quantum
 * to add optional lifecycle handler registration.
 *
 * Backward compatible: Existing workspaces work without modification.
 * New workspaces opt-in by adding the lifecycle property.
 *
 * @example
 * export const tasksWorkspace: RuntimeWorkspace = {
 *   id: 'tasks',
 *   name: 'Tasks',
 *   icon: CheckSquare,
 *   router: lazy(() => import('./routes')),
 *   lifecycle: {
 *     beforeActivate: () => import('./lifecycle').then(m => m.beforeActivate),
 *     afterDeactivate: () => import('./lifecycle').then(m => m.afterDeactivate),
 *   }
 * };
 */
export interface RuntimeWorkspaceWithLifecycle extends RuntimeWorkspace {
    /**
     * Optional lifecycle event handlers for this workspace
     * Omit if workspace doesn't need lifecycle management
     */
    lifecycle?: WorkspaceLifecycleHandlers;
}

/**
 * Configuration for lifecycle event execution behavior
 *
 * Allows customization of lifecycle orchestration settings.
 * Typically configured via environment variables.
 */
export interface LifecycleConfig {
    /**
     * Timeout threshold in milliseconds for handler warning logs
     * Default: 10000 (10 seconds)
     * Configurable via: VITE_WORKSPACE_LIFECYCLE_TIMEOUT_MS
     *
     * If a handler takes longer than this threshold, a warning is logged.
     * The handler is NOT aborted - it's responsible for its own timeout handling.
     */
    timeoutWarningMs: number;

    /**
     * Whether to show Loader component during handler execution
     * Default: true
     *
     * When true, the Loader component from @sameera/quantum is displayed
     * while lifecycle handlers are executing.
     */
    showLoader: boolean;

    /**
     * Whether to log lifecycle events to console (for debugging)
     * Default: false in production, true in development
     */
    enableLogging: boolean;
}

/**
 * Internal state maintained by lifecycle orchestrator
 * (Not part of public API - for documentation purposes only)
 *
 * @internal
 */
export interface LifecycleExecutionState {
    /**
     * Whether handlers are currently executing
     * Controls Loader visibility
     */
    isExecuting: boolean;

    /**
     * Active AbortController for current handler execution
     * Used to signal cancellation when new navigation starts
     */
    abortController: AbortController | null;

    /**
     * Cache of loaded handlers per workspace
     * Key: workspace.id
     * Value: Map of event type to loaded handler function
     *
     * Handlers are loaded once on first workspace activation and cached
     * to avoid re-importing on subsequent activations.
     */
    handlerCache: Map<
        string,
        {
            beforeActivate?: LifecycleHandler;
            afterActivate?: LifecycleHandler;
            beforeDeactivate?: LifecycleHandler;
            afterDeactivate?: LifecycleHandler;
        }
    >;

    /**
     * Previous workspace (to detect transitions)
     * Null when no previous workspace (initial mount)
     */
    previousWorkspace: RuntimeWorkspace | null;
}
