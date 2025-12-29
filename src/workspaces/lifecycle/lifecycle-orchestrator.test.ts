/**
 * Workspace Lifecycle Orchestrator Tests
 *
 * Feature: 006-workspace-lifecycle-events
 * Date: 2025-11-16
 *
 * Test suite for lifecycle event orchestration
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { RuntimeWorkspace } from "../model";

import {
    clearHandlerCache,
    executeHandler,
    executeLifecycleEvents,
} from "./lifecycle-orchestrator";
import type {
    LifecycleHandler,
    WorkspaceLifecycleContext,
} from "./lifecycle-types";

// Mock workspace for testing
const createMockWorkspace = (id: string, name: string): RuntimeWorkspace => ({
    id,
    name,
    icon: () => null as any,
});

describe("Lifecycle Orchestrator", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        clearHandlerCache(); // Clear handler cache between tests for isolation
    });

    describe("Event Sequencing (T010)", () => {
        it("should fire events in correct order: beforeDeactivate → afterDeactivate → beforeActivate → afterActivate", async () => {
            // This test will fail until we implement executeLifecycleEvents
            const executionOrder: string[] = [];

            const workspaceA = createMockWorkspace("a", "Workspace A");
            const workspaceB = createMockWorkspace("b", "Workspace B");

            // Mock handlers that track execution order
            const handlers = {
                beforeDeactivate: vi.fn(async () => {
                    executionOrder.push("beforeDeactivate(A)");
                }),
                afterDeactivate: vi.fn(async () => {
                    executionOrder.push("afterDeactivate(A)");
                }),
                beforeActivate: vi.fn(async () => {
                    executionOrder.push("beforeActivate(B)");
                }),
                afterActivate: vi.fn(async () => {
                    executionOrder.push("afterActivate(B)");
                }),
            };

            // Workspace A has deactivation handlers
            workspaceA.lifecycle = {
                beforeDeactivate: async () => handlers.beforeDeactivate,
                afterDeactivate: async () => handlers.afterDeactivate,
            };

            // Workspace B has activation handlers
            workspaceB.lifecycle = {
                beforeActivate: async () => handlers.beforeActivate,
                afterActivate: async () => handlers.afterActivate,
            };

            // Execute lifecycle events
            await executeLifecycleEvents(
                workspaceA,
                workspaceB,
                "navigation",
                new AbortController().signal
            );

            // Expect correct order
            expect(executionOrder).toEqual([
                "beforeDeactivate(A)",
                "afterDeactivate(A)",
                "beforeActivate(B)",
                "afterActivate(B)",
            ]);
        });

        it("should execute before events before after events", async () => {
            const beforeCalled: string[] = [];
            const afterCalled: string[] = [];

            const workspace = createMockWorkspace("test", "Test");
            workspace.lifecycle = {
                beforeActivate: async () => async () => {
                    beforeCalled.push("before");
                },
                afterActivate: async () => async () => {
                    afterCalled.push("after");
                },
            };

            // Execute lifecycle events
            await executeLifecycleEvents(
                undefined,
                workspace,
                "navigation",
                new AbortController().signal
            );

            expect(beforeCalled.length).toBeGreaterThan(0);
            expect(afterCalled.length).toBeGreaterThan(0);
        });
    });

    describe("Context Object Construction (T011)", () => {
        it("should include workspace in context", async () => {
            let capturedContext: WorkspaceLifecycleContext | null = null;
            let handlerCalled = false;

            const handler: LifecycleHandler = async (context) => {
                handlerCalled = true;
                capturedContext = context;
            };

            const workspace = createMockWorkspace("test", "Test");
            workspace.lifecycle = {
                beforeActivate: async () => handler,
            };

            // Execute handler
            await executeHandler(
                workspace,
                "beforeActivate",
                undefined,
                undefined,
                "navigation",
                new AbortController().signal
            );

            // Verify handler was called
            expect(handlerCalled).toBe(true);
            expect(capturedContext).not.toBeNull();
            expect(capturedContext?.workspace).toBe(workspace);
        });

        it("should include previousWorkspace for activation events", async () => {
            let capturedContext: WorkspaceLifecycleContext | null = null;

            const previousWorkspace = createMockWorkspace(
                "previous",
                "Previous"
            );
            const currentWorkspace = createMockWorkspace("current", "Current");

            currentWorkspace.lifecycle = {
                beforeActivate: async () => async (context) => {
                    capturedContext = context;
                },
            };

            // Execute lifecycle events with previousWorkspace
            await executeLifecycleEvents(
                previousWorkspace,
                currentWorkspace,
                "navigation",
                new AbortController().signal
            );

            expect(capturedContext?.previousWorkspace).toBe(previousWorkspace);
        });

        it("should include trigger type in context", async () => {
            let capturedContext: WorkspaceLifecycleContext | null = null;

            const handler = vi
                .fn<[WorkspaceLifecycleContext], Promise<void>>()
                .mockImplementation(async (context) => {
                    capturedContext = context;
                });

            const workspace = createMockWorkspace("test", "Test");
            workspace.lifecycle = {
                beforeActivate: async () => handler,
            };

            // Execute with 'programmatic' trigger
            await executeHandler(
                workspace,
                "beforeActivate",
                undefined,
                undefined,
                "programmatic",
                new AbortController().signal
            );

            expect(capturedContext?.trigger).toBe("programmatic");
        });

        it("should include timestamp in context", async () => {
            let capturedContext: WorkspaceLifecycleContext | null = null;

            const handler = vi
                .fn<[WorkspaceLifecycleContext], Promise<void>>()
                .mockImplementation(async (context) => {
                    capturedContext = context;
                });

            const workspace = createMockWorkspace("test", "Test");
            workspace.lifecycle = {
                beforeActivate: async () => handler,
            };

            const before = Date.now();
            await executeHandler(
                workspace,
                "beforeActivate",
                undefined,
                undefined,
                "navigation",
                new AbortController().signal
            );
            const after = Date.now();

            expect(capturedContext?.timestamp).toBeGreaterThanOrEqual(before);
            expect(capturedContext?.timestamp).toBeLessThanOrEqual(after);
        });
    });

    describe("Handler Invocation (T012)", () => {
        it("should call handler with correct context", async () => {
            const handler = vi
                .fn<[WorkspaceLifecycleContext], Promise<void>>()
                .mockResolvedValue(undefined);

            const workspace = createMockWorkspace("test", "Test");
            workspace.lifecycle = {
                beforeActivate: async () => handler,
            };

            // Execute handler
            await executeHandler(
                workspace,
                "beforeActivate",
                undefined,
                undefined,
                "navigation",
                new AbortController().signal
            );

            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    workspace: expect.objectContaining({ id: "test" }),
                    trigger: expect.any(String),
                    timestamp: expect.any(Number),
                    signal: expect.any(Object),
                })
            );
        });

        it("should not call handler if not registered", async () => {
            const workspace = createMockWorkspace("test", "Test");
            // No lifecycle handlers registered

            // Should not throw - just return without executing anything
            await expect(
                executeHandler(
                    workspace,
                    "beforeActivate",
                    undefined,
                    undefined,
                    "navigation",
                    new AbortController().signal
                )
            ).resolves.toBeUndefined();
        });
    });

    describe("Handler Lazy-Loading (T019-T021)", () => {
        it("should not load handler until first activation (T019)", async () => {
            // Track if loader was called
            let loaderCalled = false;
            const mockHandler = vi
                .fn<[WorkspaceLifecycleContext], Promise<void>>()
                .mockResolvedValue(undefined);

            const loader = vi.fn(async () => {
                loaderCalled = true;
                return mockHandler;
            });

            const workspace = createMockWorkspace("test", "Test");
            workspace.lifecycle = {
                beforeActivate: loader,
            };

            // Loader should not be called just from defining the workspace
            expect(loaderCalled).toBe(false);
            expect(loader).not.toHaveBeenCalled();

            // Execute handler - this should trigger the loader
            await executeHandler(
                workspace,
                "beforeActivate",
                undefined,
                undefined,
                "navigation",
                new AbortController().signal
            );

            // Now loader should have been called
            expect(loaderCalled).toBe(true);
            expect(loader).toHaveBeenCalledTimes(1);
            expect(mockHandler).toHaveBeenCalledTimes(1);
        });

        it("should cache handler and not reload on subsequent activations (T020)", async () => {
            const mockHandler = vi
                .fn<[WorkspaceLifecycleContext], Promise<void>>()
                .mockResolvedValue(undefined);
            const loader = vi.fn(async () => mockHandler);

            const workspace = createMockWorkspace("test", "Test");
            workspace.lifecycle = {
                beforeActivate: loader,
            };

            // First activation - should call loader
            await executeHandler(
                workspace,
                "beforeActivate",
                undefined,
                undefined,
                "navigation",
                new AbortController().signal
            );

            expect(loader).toHaveBeenCalledTimes(1);
            expect(mockHandler).toHaveBeenCalledTimes(1);

            // Second activation - should use cached handler, not call loader again
            await executeHandler(
                workspace,
                "beforeActivate",
                undefined,
                undefined,
                "navigation",
                new AbortController().signal
            );

            expect(loader).toHaveBeenCalledTimes(1); // Still 1 - not called again
            expect(mockHandler).toHaveBeenCalledTimes(2); // Handler called twice

            // Third activation - verify cache still working
            await executeHandler(
                workspace,
                "beforeActivate",
                undefined,
                undefined,
                "navigation",
                new AbortController().signal
            );

            expect(loader).toHaveBeenCalledTimes(1); // Still 1
            expect(mockHandler).toHaveBeenCalledTimes(3); // Handler called three times
        });

        it("should handle dynamic import failures gracefully (T021)", async () => {
            const consoleErrorSpy = vi
                .spyOn(console, "error")
                .mockImplementation(() => {});

            const loader = vi.fn(async () => {
                throw new Error("Network error: Failed to load module");
            });

            const workspace = createMockWorkspace("test", "Test");
            workspace.lifecycle = {
                beforeActivate: loader,
            };

            // Execute handler - should not throw despite loader failure
            await expect(
                executeHandler(
                    workspace,
                    "beforeActivate",
                    undefined,
                    undefined,
                    "navigation",
                    new AbortController().signal
                )
            ).resolves.toBeUndefined();

            // Verify error was logged
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining("[Lifecycle] Failed to load"),
                expect.any(Error)
            );

            consoleErrorSpy.mockRestore();
        });
    });

    describe("Resource Management and Timing (T027-T030)", () => {
        it("should execute beforeActivate before afterActivate (T027)", async () => {
            const executionOrder: string[] = [];

            const workspace = createMockWorkspace("test", "Test");
            workspace.lifecycle = {
                beforeActivate: async () => async () => {
                    executionOrder.push("beforeActivate");
                    // Simulate async work (loading resources)
                    await new Promise((resolve) => setTimeout(resolve, 10));
                },
                afterActivate: async () => async () => {
                    executionOrder.push("afterActivate");
                },
            };

            await executeLifecycleEvents(
                undefined,
                workspace,
                "navigation",
                new AbortController().signal
            );

            // beforeActivate should complete before afterActivate starts
            expect(executionOrder).toEqual(["beforeActivate", "afterActivate"]);
        });

        it("should execute afterDeactivate after beforeDeactivate (T028)", async () => {
            const executionOrder: string[] = [];

            const workspace = createMockWorkspace("test", "Test");
            workspace.lifecycle = {
                beforeDeactivate: async () => async () => {
                    executionOrder.push("beforeDeactivate");
                },
                afterDeactivate: async () => async () => {
                    executionOrder.push("afterDeactivate");
                    // Simulate cleanup work
                    await new Promise((resolve) => setTimeout(resolve, 10));
                },
            };

            const nextWorkspace = createMockWorkspace("next", "Next");
            await executeLifecycleEvents(
                workspace,
                nextWorkspace,
                "navigation",
                new AbortController().signal
            );

            // beforeDeactivate should complete before afterDeactivate starts
            expect(executionOrder).toEqual([
                "beforeDeactivate",
                "afterDeactivate",
            ]);
        });

        it("should include previousWorkspace in activation event context (T029)", async () => {
            let beforeActivateContext: WorkspaceLifecycleContext | null = null;
            let afterActivateContext: WorkspaceLifecycleContext | null = null;

            const previousWorkspace = createMockWorkspace(
                "previous",
                "Previous"
            );
            const currentWorkspace = createMockWorkspace("current", "Current");

            currentWorkspace.lifecycle = {
                beforeActivate: async () => async (context) => {
                    beforeActivateContext = context;
                },
                afterActivate: async () => async (context) => {
                    afterActivateContext = context;
                },
            };

            await executeLifecycleEvents(
                previousWorkspace,
                currentWorkspace,
                "navigation",
                new AbortController().signal
            );

            // Both activation events should have previousWorkspace
            expect(beforeActivateContext?.previousWorkspace).toBe(
                previousWorkspace
            );
            expect(afterActivateContext?.previousWorkspace).toBe(
                previousWorkspace
            );
        });

        it("should include nextWorkspace in deactivation event context (T030)", async () => {
            let beforeDeactivateContext: WorkspaceLifecycleContext | null =
                null;
            let afterDeactivateContext: WorkspaceLifecycleContext | null = null;

            const currentWorkspace = createMockWorkspace("current", "Current");
            const nextWorkspace = createMockWorkspace("next", "Next");

            currentWorkspace.lifecycle = {
                beforeDeactivate: async () => async (context) => {
                    beforeDeactivateContext = context;
                },
                afterDeactivate: async () => async (context) => {
                    afterDeactivateContext = context;
                },
            };

            await executeLifecycleEvents(
                currentWorkspace,
                nextWorkspace,
                "navigation",
                new AbortController().signal
            );

            // Both deactivation events should have nextWorkspace
            expect(beforeDeactivateContext?.nextWorkspace).toBe(nextWorkspace);
            expect(afterDeactivateContext?.nextWorkspace).toBe(nextWorkspace);
        });
    });

    describe("Error Handling (T037-T040, T045)", () => {
        it("should not block navigation when handler throws error (T037)", async () => {
            const workspace = createMockWorkspace("test", "Test");
            workspace.lifecycle = {
                beforeActivate: async () => async () => {
                    throw new Error("Handler error");
                },
            };

            // Should not throw - navigation continues despite handler error
            await expect(
                executeHandler(
                    workspace,
                    "beforeActivate",
                    undefined,
                    undefined,
                    "navigation",
                    new AbortController().signal
                )
            ).resolves.toBeUndefined();
        });

        it("should log handler errors to console (T038)", async () => {
            const consoleErrorSpy = vi
                .spyOn(console, "error")
                .mockImplementation(() => {});

            const testError = new Error("Test handler failure");
            const workspace = createMockWorkspace("test", "Test");
            workspace.lifecycle = {
                afterActivate: async () => async () => {
                    throw testError;
                },
            };

            await executeHandler(
                workspace,
                "afterActivate",
                undefined,
                undefined,
                "navigation",
                new AbortController().signal
            );

            // Verify error was logged with workspace ID and event type
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining("[Lifecycle]"),
                testError
            );

            consoleErrorSpy.mockRestore();
        });

        it("should warn when handler exceeds timeout threshold (T039)", async () => {
            vi.useFakeTimers();
            const consoleWarnSpy = vi
                .spyOn(console, "warn")
                .mockImplementation(() => {});

            const workspace = createMockWorkspace("test", "Test");
            workspace.lifecycle = {
                beforeActivate: async () => async () => {
                    // Simulate slow handler
                    await new Promise((resolve) => setTimeout(resolve, 15000));
                },
            };

            const executePromise = executeHandler(
                workspace,
                "beforeActivate",
                undefined,
                undefined,
                "navigation",
                new AbortController().signal
            );

            // Fast-forward past timeout threshold (10 seconds default)
            await vi.advanceTimersByTimeAsync(10001);

            // Warning should have been logged
            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining("[Lifecycle]")
            );

            // Complete the handler
            await vi.runAllTimersAsync();
            await executePromise;

            consoleWarnSpy.mockRestore();
            vi.useRealTimers();
        });

        it("should pass AbortSignal in context (T040)", async () => {
            let capturedSignal: AbortSignal | null = null;

            const workspace = createMockWorkspace("test", "Test");
            workspace.lifecycle = {
                beforeActivate: async () => async (context) => {
                    capturedSignal = context.signal;
                },
            };

            const controller = new AbortController();
            await executeHandler(
                workspace,
                "beforeActivate",
                undefined,
                undefined,
                "navigation",
                controller.signal
            );

            expect(capturedSignal).toBe(controller.signal);
            expect(capturedSignal?.aborted).toBe(false);

            // Verify signal can be aborted
            controller.abort();
            expect(capturedSignal?.aborted).toBe(true);
        });

        it("should handle rapid navigation with AbortController (T045)", async () => {
            const executionOrder: string[] = [];

            const workspace1 = createMockWorkspace("workspace1", "Workspace 1");
            const workspace2 = createMockWorkspace("workspace2", "Workspace 2");
            const workspace3 = createMockWorkspace("workspace3", "Workspace 3");

            workspace1.lifecycle = {
                beforeActivate: async () => async (context) => {
                    executionOrder.push("ws1-start");
                    // Simulate slow handler
                    await new Promise((resolve) => setTimeout(resolve, 100));
                    // Check if aborted
                    if (context.signal.aborted) {
                        executionOrder.push("ws1-aborted");
                        return;
                    }
                    executionOrder.push("ws1-complete");
                },
            };

            workspace2.lifecycle = {
                beforeActivate: async () => async (context) => {
                    executionOrder.push("ws2-start");
                    await new Promise((resolve) => setTimeout(resolve, 50));
                    if (context.signal.aborted) {
                        executionOrder.push("ws2-aborted");
                        return;
                    }
                    executionOrder.push("ws2-complete");
                },
            };

            workspace3.lifecycle = {
                beforeActivate: async () => async (context) => {
                    executionOrder.push("ws3-start");
                    await new Promise((resolve) => setTimeout(resolve, 10));
                    if (context.signal.aborted) {
                        executionOrder.push("ws3-aborted");
                        return;
                    }
                    executionOrder.push("ws3-complete");
                },
            };

            // Simulate rapid navigation
            const controller1 = new AbortController();
            const controller2 = new AbortController();
            const controller3 = new AbortController();

            // Start first navigation
            const promise1 = executeLifecycleEvents(
                undefined,
                workspace1,
                "navigation",
                controller1.signal
            );

            // Immediately start second navigation (abort first)
            controller1.abort();
            const promise2 = executeLifecycleEvents(
                workspace1,
                workspace2,
                "navigation",
                controller2.signal
            );

            // Immediately start third navigation (abort second)
            controller2.abort();
            const promise3 = executeLifecycleEvents(
                workspace2,
                workspace3,
                "navigation",
                controller3.signal
            );

            // Wait for all to complete
            await Promise.all([promise1, promise2, promise3]);

            // Only workspace3 should complete fully
            expect(executionOrder).toContain("ws3-complete");
        });
    });
});
