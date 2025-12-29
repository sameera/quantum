/**
 * Workspace Lifecycle Orchestrator
 *
 * Feature: 006-workspace-lifecycle-events
 * Date: 2025-11-16
 *
 * Core orchestration logic for workspace lifecycle events.
 * Manages event dispatching, handler loading, caching, and execution.
 */

import type { RuntimeWorkspace } from "../model";

import type {
    LifecycleEventType,
    LifecycleHandler,
    LifecycleHandlerLoader,
    NavigationTrigger,
    WorkspaceLifecycleContext,
} from "./lifecycle-types";

/**
 * Cache for loaded lifecycle handlers per workspace
 * Key: workspace.id
 * Value: Map of event type to loaded handler
 */
const handlerCache = new Map<
    string,
    Partial<Record<LifecycleEventType, LifecycleHandler>>
>();

/**
 * Clear the handler cache (for testing purposes)
 * @internal
 */
export function clearHandlerCache(): void {
    handlerCache.clear();
}

/**
 * Get timeout threshold from environment variable or use default
 * Default: 10000ms (10 seconds)
 */
function getTimeoutThreshold(): number {
    if (
        typeof import.meta.env.VITE_WORKSPACE_LIFECYCLE_TIMEOUT_MS === "string"
    ) {
        const parsed = parseInt(
            import.meta.env.VITE_WORKSPACE_LIFECYCLE_TIMEOUT_MS,
            10
        );
        return isNaN(parsed) ? 10000 : parsed;
    }
    return 10000;
}

/**
 * Load a lifecycle handler from the workspace configuration
 * Caches the loaded handler to avoid re-importing on subsequent calls
 *
 * @param workspace - The workspace containing the handler
 * @param eventType - The lifecycle event type to load
 * @returns The loaded handler, or undefined if not registered
 */
async function loadHandler(
    workspace: RuntimeWorkspace,
    eventType: LifecycleEventType
): Promise<LifecycleHandler | undefined> {
    // Check cache first
    const cached = handlerCache.get(workspace.id)?.[eventType];
    if (cached) {
        return cached;
    }

    // Check if workspace has lifecycle handlers registered
    if (!workspace.lifecycle) {
        return undefined;
    }

    // Get the handler loader for this event type
    const loader: LifecycleHandlerLoader | undefined =
        workspace.lifecycle[eventType];
    if (!loader) {
        return undefined;
    }

    try {
        // Dynamically import the handler
        const handler = await loader();

        // Cache the loaded handler
        const workspaceCache = handlerCache.get(workspace.id) || {};
        workspaceCache[eventType] = handler;
        handlerCache.set(workspace.id, workspaceCache);

        return handler;
    } catch (error) {
        console.error(
            `[Lifecycle] Failed to load ${eventType} handler for workspace ${workspace.id}:`,
            error
        );
        return undefined;
    }
}

/**
 * Build a WorkspaceLifecycleContext object for a lifecycle event
 *
 * @param workspace - The workspace subject to the lifecycle event
 * @param eventType - The type of lifecycle event
 * @param previousWorkspace - The previous workspace (for activation events)
 * @param nextWorkspace - The next workspace (for deactivation events)
 * @param trigger - How the navigation was initiated
 * @param signal - AbortSignal for cancellation support
 * @returns Immutable context object for handler
 */
function buildContext(
    workspace: RuntimeWorkspace,
    eventType: LifecycleEventType,
    previousWorkspace: RuntimeWorkspace | undefined,
    nextWorkspace: RuntimeWorkspace | undefined,
    trigger: NavigationTrigger,
    signal: AbortSignal
): WorkspaceLifecycleContext {
    const context: WorkspaceLifecycleContext = {
        workspace,
        trigger,
        timestamp: Date.now(),
        signal,
    };

    // Add previousWorkspace for activation events
    if (eventType === "beforeActivate" || eventType === "afterActivate") {
        context.previousWorkspace = previousWorkspace;
    }

    // Add nextWorkspace for deactivation events
    if (eventType === "beforeDeactivate" || eventType === "afterDeactivate") {
        context.nextWorkspace = nextWorkspace;
    }

    return context;
}

/**
 * Execute a handler with timeout warning
 * Logs a warning if handler execution exceeds the configured threshold
 * Does NOT abort the handler - it's responsible for its own timeout handling
 *
 * @param handler - The lifecycle handler to execute
 * @param context - The context to pass to the handler
 * @param eventType - The event type (for logging)
 * @returns Promise that resolves when handler completes or throws
 */
async function executeWithTimeout(
    handler: LifecycleHandler,
    context: WorkspaceLifecycleContext,
    eventType: LifecycleEventType
): Promise<void> {
    const threshold = getTimeoutThreshold();
    // Start timeout warning timer
    const timeoutId = setTimeout(() => {
        console.warn(
            `[Lifecycle] Handler ${eventType} exceeded ${threshold}ms for workspace: ${context.workspace.id}`
        );
    }, threshold);

    try {
        // Execute the handler
        await handler(context);
    } finally {
        // Clear the timeout warning
        clearTimeout(timeoutId);
    }
}

/**
 * Execute a single lifecycle handler for a workspace
 * Loads handler (with caching), builds context, and executes with timeout warning
 *
 * @param workspace - The workspace containing the handler
 * @param eventType - The lifecycle event type to execute
 * @param previousWorkspace - The previous workspace (for activation events)
 * @param nextWorkspace - The next workspace (for deactivation events)
 * @param trigger - How the navigation was initiated
 * @param signal - AbortSignal for cancellation support
 */
export async function executeHandler(
    workspace: RuntimeWorkspace,
    eventType: LifecycleEventType,
    previousWorkspace: RuntimeWorkspace | undefined,
    nextWorkspace: RuntimeWorkspace | undefined,
    trigger: NavigationTrigger,
    signal: AbortSignal
): Promise<void> {
    // Load handler (with caching)
    const handler = await loadHandler(workspace, eventType);
    if (!handler) {
        // No handler registered for this event
        return;
    }

    // Build context
    const context = buildContext(
        workspace,
        eventType,
        previousWorkspace,
        nextWorkspace,
        trigger,
        signal
    );

    // Execute handler with timeout warning
    try {
        await executeWithTimeout(handler, context, eventType);
    } catch (error) {
        console.error(
            `[Lifecycle] Handler ${eventType} failed for workspace ${workspace.id}:`,
            error
        );
        // Navigation continues even if handler fails
    }
}

/**
 * Execute all lifecycle events for a workspace transition
 * Orchestrates the full sequence: beforeDeactivate → afterDeactivate → beforeActivate → afterActivate
 *
 * @param previousWorkspace - The workspace being deactivated (undefined if no previous workspace)
 * @param nextWorkspace - The workspace being activated
 * @param trigger - How the navigation was initiated
 * @param signal - AbortSignal for cancellation support
 */
export async function executeLifecycleEvents(
    previousWorkspace: RuntimeWorkspace | undefined,
    nextWorkspace: RuntimeWorkspace,
    trigger: NavigationTrigger,
    signal: AbortSignal
): Promise<void> {
    // Deactivate previous workspace (if exists)
    if (previousWorkspace) {
        // beforeDeactivate
        await executeHandler(
            previousWorkspace,
            "beforeDeactivate",
            undefined,
            nextWorkspace,
            trigger,
            signal
        );

        // afterDeactivate
        await executeHandler(
            previousWorkspace,
            "afterDeactivate",
            undefined,
            nextWorkspace,
            trigger,
            signal
        );
    }

    // Activate next workspace
    // beforeActivate
    await executeHandler(
        nextWorkspace,
        "beforeActivate",
        previousWorkspace,
        undefined,
        trigger,
        signal
    );

    // afterActivate
    await executeHandler(
        nextWorkspace,
        "afterActivate",
        previousWorkspace,
        undefined,
        trigger,
        signal
    );
}
