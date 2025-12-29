/**
 * Workspace Lifecycle Manager
 *
 * Feature: 006-workspace-lifecycle-events
 * Date: 2025-11-16
 *
 * Component that monitors workspace changes and triggers lifecycle events.
 * Integrates with WorkspaceProvider via useWorkspaces hook.
 */

import { useEffect, useRef, useState } from "react";

import { Loader } from "../../components/loader";
import type { RuntimeWorkspace } from "../model";
import { useWorkspaces } from "../provider";

import { executeLifecycleEvents } from "./lifecycle-orchestrator";
import type { NavigationTrigger } from "./lifecycle-types";

/**
 * Internal component that monitors workspace changes and triggers lifecycle events
 * Must be rendered inside the router context (via RouterProvider)
 */
export function LifecycleManager() {
    const { activeWorkspace } = useWorkspaces();
    const previousWorkspaceRef = useRef<RuntimeWorkspace | undefined>(
        undefined
    );
    const abortControllerRef = useRef<AbortController | undefined>(undefined);
    const [isExecuting, setIsExecuting] = useState(false);

    useEffect(() => {
        const previousWorkspace = previousWorkspaceRef.current;

        // Skip if no change (first render with no workspace, or same workspace)
        if (
            (!activeWorkspace && !previousWorkspace) ||
            activeWorkspace?.id === previousWorkspace?.id
        ) {
            return;
        }

        // Abort previous lifecycle events if still running
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create new AbortController for this navigation
        const controller = new AbortController();
        abortControllerRef.current = controller;

        // Execute lifecycle events
        const trigger: NavigationTrigger = "navigation"; // TODO: detect programmatic vs user navigation

        if (activeWorkspace) {
            // Set loading state
            setIsExecuting(true);

            executeLifecycleEvents(
                previousWorkspace,
                activeWorkspace,
                trigger,
                controller.signal
            )
                .then(() => {
                    // Update previous workspace ref only if not aborted
                    if (!controller.signal.aborted) {
                        previousWorkspaceRef.current = activeWorkspace;
                    }
                })
                .catch((error) => {
                    console.error(
                        "[Lifecycle] Failed to execute lifecycle events:",
                        error
                    );
                })
                .finally(() => {
                    // Clear loading state only if not aborted
                    if (!controller.signal.aborted) {
                        setIsExecuting(false);
                    }
                });
        } else {
            // Navigating away from workspace to root (no active workspace)
            previousWorkspaceRef.current = undefined;
        }

        // Cleanup on unmount
        return () => {
            controller.abort();
        };
    }, [activeWorkspace]);

    // Show Loader component during handler execution
    if (isExecuting) {
        return (
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    zIndex: 9999,
                }}
            >
                <Loader />
            </div>
        );
    }

    return null;
}
