import { AuthProvider, useAuth } from "react-oidc-context";
import { render, waitFor } from "@testing-library/react";
import { User } from "oidc-client-ts";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import { AuthenticatedUser } from "./model/user";
import QuantumApp from "./quantum-app";

// Mock dependencies
vi.mock("react-oidc-context", () => ({
    AuthProvider: vi.fn(({ children }) => <div>{children}</div>),
    useAuth: vi.fn(),
}));

vi.mock("./workspaces", () => ({
    WorkspaceProvider: vi.fn(({ children }) => <div>{children}</div>),
}));

vi.mock("./auth/auth-utils", () => ({
    isValidUser: vi.fn((user: User | undefined) => {
        if (!user) return false;
        return !!user.id_token && !!user.profile?.email && !user.expired;
    }),
    toAuthenticatedUser: vi.fn((user: User) => ({
        id: user.profile?.sub || "",
        displayName: user.profile?.name || "",
        fullName: user.profile?.name || "",
        initials: user.profile?.name?.substring(0, 2) || "",
        email: user.profile?.email || "",
        oidcProfile: user,
    })),
}));

describe("QuantumApp", () => {
    let mockOnSignInCallback: Mock;
    let mockOnUserInitialized: Mock;

    const createMockUser = (userId = "user-123", accessToken = "token-abc") =>
        ({
            id_token: "id-token",
            session_state: null,
            access_token: accessToken,
            refresh_token: "refresh-token",
            token_type: "Bearer",
            scope: "openid profile email",
            profile: {
                sub: userId,
                name: "Test User",
                email: "test@example.com",
            },
            expires_at: Date.now() / 1000 + 3600,
            expired: false,
            scopes: ["openid", "profile", "email"],
            toStorageString: () => "",
        } as User);

    beforeEach(() => {
        vi.clearAllMocks();
        mockOnSignInCallback = vi.fn();
        mockOnUserInitialized = vi.fn();

        // Default mock: no user, not loading
        (useAuth as Mock).mockReturnValue({
            user: null,
            isLoading: false,
            isAuthenticated: false,
        });
    });

    describe("onSignInCallback", () => {
        it("should fire onSignInCallback when user signs in via OAuth", () => {
            let capturedOnSigninCallback: ((user: User) => void) | undefined;

            (AuthProvider as Mock).mockImplementation(
                ({ onSigninCallback, children }) => {
                    capturedOnSigninCallback = onSigninCallback;
                    return <div>{children}</div>;
                }
            );

            render(
                <QuantumApp
                    workspaces={[]}
                    onSignInCallback={mockOnSignInCallback}
                />
            );

            const mockUser = createMockUser();
            capturedOnSigninCallback?.(mockUser);

            expect(mockOnSignInCallback).toHaveBeenCalledTimes(1);
            expect(mockOnSignInCallback).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: "user-123",
                    email: "test@example.com",
                })
            );
        });

        it("should not fire onSignInCallback if callback not provided", () => {
            let capturedOnSigninCallback: ((user: User) => void) | undefined;

            (AuthProvider as Mock).mockImplementation(
                ({ onSigninCallback, children }) => {
                    capturedOnSigninCallback = onSigninCallback;
                    return <div>{children}</div>;
                }
            );

            render(<QuantumApp workspaces={[]} />);

            const mockUser = createMockUser();
            capturedOnSigninCallback?.(mockUser);

            expect(mockOnSignInCallback).not.toHaveBeenCalled();
        });

        it("should not fire onSignInCallback if user is invalid", () => {
            let capturedOnSigninCallback: ((user: User) => void) | undefined;

            (AuthProvider as Mock).mockImplementation(
                ({ onSigninCallback, children }) => {
                    capturedOnSigninCallback = onSigninCallback;
                    return <div>{children}</div>;
                }
            );

            render(
                <QuantumApp
                    workspaces={[]}
                    onSignInCallback={mockOnSignInCallback}
                />
            );

            const invalidUser = {
                ...createMockUser(),
                id_token: undefined,
            } as User;
            capturedOnSigninCallback?.(invalidUser);

            expect(mockOnSignInCallback).not.toHaveBeenCalled();
        });

        it("should not fire onSignInCallback if user is undefined", () => {
            let capturedOnSigninCallback:
                | ((user: User | undefined) => void)
                | undefined;

            (AuthProvider as Mock).mockImplementation(
                ({ onSigninCallback, children }) => {
                    capturedOnSigninCallback = onSigninCallback;
                    return <div>{children}</div>;
                }
            );

            render(
                <QuantumApp
                    workspaces={[]}
                    onSignInCallback={mockOnSignInCallback}
                />
            );

            capturedOnSigninCallback?.(undefined);

            expect(mockOnSignInCallback).not.toHaveBeenCalled();
        });
    });

    describe("onUserInitialized", () => {
        it("should fire onUserInitialized when user signs in via OAuth", () => {
            let capturedOnSigninCallback: ((user: User) => void) | undefined;

            (AuthProvider as Mock).mockImplementation(
                ({ onSigninCallback, children }) => {
                    capturedOnSigninCallback = onSigninCallback;
                    return <div>{children}</div>;
                }
            );

            render(
                <QuantumApp
                    workspaces={[]}
                    onUserInitialized={mockOnUserInitialized}
                />
            );

            const mockUser = createMockUser();
            capturedOnSigninCallback?.(mockUser);

            expect(mockOnUserInitialized).toHaveBeenCalledTimes(1);
            expect(mockOnUserInitialized).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: "user-123",
                    email: "test@example.com",
                })
            );
        });

        it("should fire onUserInitialized when user is loaded from session (page refresh)", async () => {
            const mockUser = createMockUser();

            (useAuth as Mock).mockReturnValue({
                user: mockUser,
                isLoading: false,
                isAuthenticated: true,
            });

            render(
                <QuantumApp
                    workspaces={[]}
                    onUserInitialized={mockOnUserInitialized}
                />
            );

            await waitFor(() => {
                expect(mockOnUserInitialized).toHaveBeenCalledTimes(1);
            });

            expect(mockOnUserInitialized).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: "user-123",
                    email: "test@example.com",
                })
            );
        });

        it("should fire both onSignInCallback and onUserInitialized on OAuth sign-in", () => {
            let capturedOnSigninCallback: ((user: User) => void) | undefined;

            (AuthProvider as Mock).mockImplementation(
                ({ onSigninCallback, children }) => {
                    capturedOnSigninCallback = onSigninCallback;
                    return <div>{children}</div>;
                }
            );

            render(
                <QuantumApp
                    workspaces={[]}
                    onSignInCallback={mockOnSignInCallback}
                    onUserInitialized={mockOnUserInitialized}
                />
            );

            const mockUser = createMockUser();
            capturedOnSigninCallback?.(mockUser);

            expect(mockOnSignInCallback).toHaveBeenCalledTimes(1);
            expect(mockOnUserInitialized).toHaveBeenCalledTimes(1);

            // Both should receive the same user object
            const signInUser = mockOnSignInCallback.mock
                .calls[0][0] as AuthenticatedUser;
            const initializedUser = mockOnUserInitialized.mock
                .calls[0][0] as AuthenticatedUser;

            expect(signInUser.id).toBe(initializedUser.id);
            expect(signInUser.email).toBe(initializedUser.email);
        });

        it("should not fire onUserInitialized while auth is loading", async () => {
            (useAuth as Mock).mockReturnValue({
                user: null,
                isLoading: true,
                isAuthenticated: false,
            });

            render(
                <QuantumApp
                    workspaces={[]}
                    onUserInitialized={mockOnUserInitialized}
                />
            );

            await waitFor(() => {
                expect(mockOnUserInitialized).not.toHaveBeenCalled();
            });
        });

        it("should not fire onUserInitialized if user is invalid", async () => {
            const invalidUser = { ...createMockUser(), id_token: undefined };

            (useAuth as Mock).mockReturnValue({
                user: invalidUser,
                isLoading: false,
                isAuthenticated: false,
            });

            render(
                <QuantumApp
                    workspaces={[]}
                    onUserInitialized={mockOnUserInitialized}
                />
            );

            await waitFor(() => {
                expect(mockOnUserInitialized).not.toHaveBeenCalled();
            });
        });

        it("should not fire onUserInitialized if callback not provided", async () => {
            const mockUser = createMockUser();

            (useAuth as Mock).mockReturnValue({
                user: mockUser,
                isLoading: false,
                isAuthenticated: true,
            });

            render(<QuantumApp workspaces={[]} />);

            await waitFor(() => {
                expect(mockOnUserInitialized).not.toHaveBeenCalled();
            });
        });
    });

    describe("Session tracking - prevent duplicate callbacks", () => {
        it("should fire onUserInitialized only once per session", async () => {
            const mockUser = createMockUser();

            const { rerender } = render(
                <QuantumApp
                    workspaces={[]}
                    onUserInitialized={mockOnUserInitialized}
                />
            );

            (useAuth as Mock).mockReturnValue({
                user: mockUser,
                isLoading: false,
                isAuthenticated: true,
            });

            // Trigger re-render with same user
            rerender(
                <QuantumApp
                    workspaces={[]}
                    onUserInitialized={mockOnUserInitialized}
                />
            );

            await waitFor(() => {
                expect(mockOnUserInitialized).toHaveBeenCalledTimes(1);
            });
        });

        it("should fire onUserInitialized again when session changes (new access token)", async () => {
            const mockUser1 = createMockUser("user-123", "token-abc");
            const mockUser2 = createMockUser("user-123", "token-xyz");

            (useAuth as Mock).mockReturnValue({
                user: mockUser1,
                isLoading: false,
                isAuthenticated: true,
            });

            const { rerender } = render(
                <QuantumApp
                    workspaces={[]}
                    onUserInitialized={mockOnUserInitialized}
                />
            );

            await waitFor(() => {
                expect(mockOnUserInitialized).toHaveBeenCalledTimes(1);
            });

            // Simulate token renewal with different access token
            (useAuth as Mock).mockReturnValue({
                user: mockUser2,
                isLoading: false,
                isAuthenticated: true,
            });

            rerender(
                <QuantumApp
                    workspaces={[]}
                    onUserInitialized={mockOnUserInitialized}
                />
            );

            await waitFor(() => {
                expect(mockOnUserInitialized).toHaveBeenCalledTimes(2);
            });
        });

        it("should fire onUserInitialized again when user ID changes", async () => {
            const mockUser1 = createMockUser("user-123", "token-abc");
            const mockUser2 = createMockUser("user-456", "token-abc");

            (useAuth as Mock).mockReturnValue({
                user: mockUser1,
                isLoading: false,
                isAuthenticated: true,
            });

            const { rerender } = render(
                <QuantumApp
                    workspaces={[]}
                    onUserInitialized={mockOnUserInitialized}
                />
            );

            await waitFor(() => {
                expect(mockOnUserInitialized).toHaveBeenCalledTimes(1);
            });

            // Simulate different user
            (useAuth as Mock).mockReturnValue({
                user: mockUser2,
                isLoading: false,
                isAuthenticated: true,
            });

            rerender(
                <QuantumApp
                    workspaces={[]}
                    onUserInitialized={mockOnUserInitialized}
                />
            );

            await waitFor(() => {
                expect(mockOnUserInitialized).toHaveBeenCalledTimes(2);
            });
        });
    });

    describe("Error handling", () => {
        it("should catch and log errors from onUserInitialized callback", async () => {
            const consoleErrorSpy = vi
                .spyOn(console, "error")
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                .mockImplementation(() => {});
            const errorCallback = vi.fn(() => {
                throw new Error("Callback error");
            });

            const mockUser = createMockUser();

            (useAuth as Mock).mockReturnValue({
                user: mockUser,
                isLoading: false,
                isAuthenticated: true,
            });

            render(
                <QuantumApp workspaces={[]} onUserInitialized={errorCallback} />
            );

            await waitFor(() => {
                expect(errorCallback).toHaveBeenCalled();
                expect(consoleErrorSpy).toHaveBeenCalledWith(
                    "Auth: Error in onUserInitialized callback",
                    expect.any(Error)
                );
            });

            consoleErrorSpy.mockRestore();
        });

        it("should catch and log errors from onUserInitialized via OAuth sign-in", () => {
            const consoleErrorSpy = vi
                .spyOn(console, "error")
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                .mockImplementation(() => {});
            const errorCallback = vi.fn(() => {
                throw new Error("Callback error");
            });

            let capturedOnSigninCallback: ((user: User) => void) | undefined;

            (AuthProvider as Mock).mockImplementation(
                ({ onSigninCallback, children }) => {
                    capturedOnSigninCallback = onSigninCallback;
                    return <div>{children}</div>;
                }
            );

            render(
                <QuantumApp workspaces={[]} onUserInitialized={errorCallback} />
            );

            const mockUser = createMockUser();
            capturedOnSigninCallback?.(mockUser);

            expect(errorCallback).toHaveBeenCalled();
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                "Auth: Error in onUserInitialized callback",
                expect.any(Error)
            );

            consoleErrorSpy.mockRestore();
        });
    });
});
