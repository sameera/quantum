import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { Home, Plus, Trash2 } from "lucide-react";

// Mock dependencies BEFORE imports
vi.mock("./state", () => ({
    useLayoutState: vi.fn(),
}));

vi.mock("../workspaces", () => ({
    useWorkspaces: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
    return {
        ...actual,
        useNavigate: vi.fn(),
        useLocation: vi.fn(),
        BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    };
});

import { BrowserRouter } from "react-router-dom";
import * as ReactRouterDom from "react-router-dom";

import { WorkspaceMenuItem } from "./workspace-menu-item";
import { WorkspaceMenuItemAction } from "./workspace-menu-item-action";
import * as layoutState from "./state";
import * as workspaces from "../workspaces";

describe("WorkspaceMenuItem", () => {
    let mockNavigate: Mock;
    let mockUseLayoutState: Mock;
    let mockUseWorkspaces: Mock;
    let mockUseLocation: Mock;

    const defaultWorkspace = {
        id: "workspace-123",
        name: "Test Workspace",
        icon: Home,
    };

    beforeEach(() => {
        vi.clearAllMocks();

        mockNavigate = vi.fn();
        mockUseLocation = vi.fn(() => ({ pathname: "/workspace-123/home" }));

        mockUseLayoutState = vi.fn(() => ({
            isExplorerCollapsed: false,
            setIsExplorerCollapsed: vi.fn(),
        }));

        mockUseWorkspaces = vi.fn(() => ({
            activeWorkspace: defaultWorkspace,
            workspaces: [defaultWorkspace],
            setActiveWorkspace: vi.fn(),
        }));

        (layoutState.useLayoutState as Mock) = mockUseLayoutState;
        (workspaces.useWorkspaces as Mock) = mockUseWorkspaces;

        (ReactRouterDom.useNavigate as Mock).mockReturnValue(mockNavigate);
        (ReactRouterDom.useLocation as Mock) = mockUseLocation;
    });

    const renderMenuItem = (props: React.ComponentProps<typeof WorkspaceMenuItem>) => {
        return render(
            <BrowserRouter>
                <WorkspaceMenuItem {...props} />
            </BrowserRouter>
        );
    };

    describe("Basic rendering without children", () => {
        it("should render icon and text when expanded", () => {
            renderMenuItem({
                icon: Home,
                text: "Dashboard",
                to: "dashboard",
            });

            expect(screen.getByText("Dashboard")).toBeInTheDocument();
            const button = screen.getByRole("button");
            expect(button).toBeInTheDocument();
        });

        it("should render only icon when collapsed", () => {
            mockUseLayoutState.mockReturnValue({
                isExplorerCollapsed: true,
                setIsExplorerCollapsed: vi.fn(),
            });

            renderMenuItem({
                icon: Home,
                text: "Dashboard",
                to: "dashboard",
            });

            const text = screen.getByText("Dashboard");
            expect(text).toHaveClass("hidden");
        });

        it("should apply justify-start when no actions", () => {
            const { container } = renderMenuItem({
                icon: Home,
                text: "Dashboard",
                to: "dashboard",
            });

            const wrapper = container.querySelector(".group");
            expect(wrapper).toHaveClass("justify-start");
        });
    });

    describe("Action button rendering", () => {
        it("should not render actions initially (before hover)", () => {
            renderMenuItem({
                icon: Home,
                text: "Dashboard",
                to: "dashboard",
                children: (
                    <WorkspaceMenuItemAction
                        icon={Plus}
                        tooltip="Create new page"
                        onClick={vi.fn()}
                        aria-label="Create new page"
                    />
                ),
            });

            // Action should not be visible initially
            expect(screen.queryByLabelText("Create new page")).not.toBeInTheDocument();
        });

        it("should render action button from WorkspaceMenuItemAction on hover", async () => {
            const mockOnClick = vi.fn();
            const { container } = renderMenuItem({
                icon: Home,
                text: "Dashboard",
                to: "dashboard",
                children: (
                    <WorkspaceMenuItemAction
                        icon={Plus}
                        tooltip="Create new page"
                        onClick={mockOnClick}
                        aria-label="Create new page"
                    />
                ),
            });

            const wrapper = container.querySelector(".group") as HTMLElement;
            fireEvent.mouseEnter(wrapper);

            await waitFor(() => {
                expect(screen.getByLabelText("Create new page")).toBeInTheDocument();
            });
        });

        it("should hide actions on mouse leave", async () => {
            const { container } = renderMenuItem({
                icon: Home,
                text: "Dashboard",
                to: "dashboard",
                children: (
                    <WorkspaceMenuItemAction
                        icon={Plus}
                        tooltip="Create new page"
                        onClick={vi.fn()}
                        aria-label="Create new page"
                    />
                ),
            });

            const wrapper = container.querySelector(".group") as HTMLElement;
            fireEvent.mouseEnter(wrapper);

            await waitFor(() => {
                expect(screen.getByLabelText("Create new page")).toBeInTheDocument();
            });

            fireEvent.mouseLeave(wrapper);

            await waitFor(() => {
                expect(screen.queryByLabelText("Create new page")).not.toBeInTheDocument();
            });
        });

        it("should render multiple actions in sequence", async () => {
            const mockCreate = vi.fn();
            const mockDelete = vi.fn();

            const { container } = renderMenuItem({
                icon: Home,
                text: "Dashboard",
                to: "dashboard",
                children: (
                    <>
                        <WorkspaceMenuItemAction
                            icon={Plus}
                            tooltip="Create"
                            onClick={mockCreate}
                            aria-label="Create item"
                        />
                        <WorkspaceMenuItemAction
                            icon={Trash2}
                            tooltip="Delete"
                            onClick={mockDelete}
                            aria-label="Delete item"
                            variant="destructive"
                        />
                    </>
                ),
            });

            const wrapper = container.querySelector(".group") as HTMLElement;
            fireEvent.mouseEnter(wrapper);

            await waitFor(() => {
                expect(screen.getByLabelText("Create item")).toBeInTheDocument();
                expect(screen.getByLabelText("Delete item")).toBeInTheDocument();
            });
        });

        it("should handle action onClick with stopPropagation", async () => {
            const mockActionClick = vi.fn();

            const { container } = renderMenuItem({
                icon: Home,
                text: "Dashboard",
                to: "dashboard",
                children: (
                    <WorkspaceMenuItemAction
                        icon={Plus}
                        tooltip="Create new page"
                        onClick={mockActionClick}
                        aria-label="Create new page"
                    />
                ),
            });

            const wrapper = container.querySelector(".group") as HTMLElement;
            fireEvent.mouseEnter(wrapper);

            await waitFor(() => {
                expect(screen.getByLabelText("Create new page")).toBeInTheDocument();
            });

            const actionButton = screen.getByLabelText("Create new page");
            fireEvent.click(actionButton);

            expect(mockActionClick).toHaveBeenCalledTimes(1);
            expect(mockNavigate).not.toHaveBeenCalled();
        });

        it("should apply justify-between when actions exist and expanded", () => {
            const { container } = renderMenuItem({
                icon: Home,
                text: "Dashboard",
                to: "dashboard",
                children: (
                    <WorkspaceMenuItemAction
                        icon={Plus}
                        tooltip="Create"
                        onClick={vi.fn()}
                        aria-label="Create"
                    />
                ),
            });

            const wrapper = container.querySelector(".group");
            expect(wrapper).toHaveClass("justify-between");
        });

        it("should render action container with data attribute", async () => {
            const { container } = renderMenuItem({
                icon: Home,
                text: "Dashboard",
                to: "dashboard",
                children: (
                    <WorkspaceMenuItemAction
                        icon={Plus}
                        tooltip="Create"
                        onClick={vi.fn()}
                        aria-label="Create"
                    />
                ),
            });

            const wrapper = container.querySelector(".group") as HTMLElement;
            fireEvent.mouseEnter(wrapper);

            await waitFor(() => {
                const actionContainer = container.querySelector("[data-action-container]");
                expect(actionContainer).toBeInTheDocument();
            });
        });

        it("should not render actions when sidebar collapsed", async () => {
            mockUseLayoutState.mockReturnValue({
                isExplorerCollapsed: true,
                setIsExplorerCollapsed: vi.fn(),
            });

            const { container } = renderMenuItem({
                icon: Home,
                text: "Dashboard",
                to: "dashboard",
                children: (
                    <WorkspaceMenuItemAction
                        icon={Plus}
                        tooltip="Create"
                        onClick={vi.fn()}
                        aria-label="Create"
                    />
                ),
            });

            const wrapper = container.querySelector(".group") as HTMLElement;
            fireEvent.mouseEnter(wrapper);

            // Actions should not appear even on hover when collapsed
            await waitFor(() => {
                expect(screen.queryByLabelText("Create")).not.toBeInTheDocument();
            });
        });
    });

    describe("Keyboard accessibility", () => {
        it("should show actions on focus", async () => {
            const { container } = renderMenuItem({
                icon: Home,
                text: "Dashboard",
                to: "dashboard",
                children: (
                    <WorkspaceMenuItemAction
                        icon={Plus}
                        tooltip="Create"
                        onClick={vi.fn()}
                        aria-label="Create item"
                    />
                ),
            });

            const wrapper = container.querySelector(".group") as HTMLElement;
            fireEvent.focus(wrapper);

            await waitFor(() => {
                expect(screen.getByLabelText("Create item")).toBeInTheDocument();
            });
        });

        it("should hide actions on blur", async () => {
            const { container } = renderMenuItem({
                icon: Home,
                text: "Dashboard",
                to: "dashboard",
                children: (
                    <WorkspaceMenuItemAction
                        icon={Plus}
                        tooltip="Create"
                        onClick={vi.fn()}
                        aria-label="Create item"
                    />
                ),
            });

            const wrapper = container.querySelector(".group") as HTMLElement;
            fireEvent.focus(wrapper);

            await waitFor(() => {
                expect(screen.getByLabelText("Create item")).toBeInTheDocument();
            });

            fireEvent.blur(wrapper);

            await waitFor(() => {
                expect(screen.queryByLabelText("Create item")).not.toBeInTheDocument();
            });
        });
    });

    describe("Action extraction logic", () => {
        it("should extract single action from children", async () => {
            const mockOnClick = vi.fn();
            const { container } = renderMenuItem({
                icon: Home,
                text: "Dashboard",
                to: "dashboard",
                children: (
                    <WorkspaceMenuItemAction
                        icon={Plus}
                        tooltip="Create"
                        onClick={mockOnClick}
                        aria-label="Create"
                    />
                ),
            });

            const wrapper = container.querySelector(".group") as HTMLElement;
            fireEvent.mouseEnter(wrapper);

            await waitFor(() => {
                expect(screen.getByLabelText("Create")).toBeInTheDocument();
            });
        });

        it("should extract multiple actions from children array", async () => {
            const { container } = renderMenuItem({
                icon: Home,
                text: "Dashboard",
                to: "dashboard",
                children: (
                    <>
                        <WorkspaceMenuItemAction
                            icon={Plus}
                            tooltip="Create"
                            onClick={vi.fn()}
                            aria-label="Create"
                        />
                        <WorkspaceMenuItemAction
                            icon={Trash2}
                            tooltip="Delete"
                            onClick={vi.fn()}
                            aria-label="Delete"
                        />
                    </>
                ),
            });

            const wrapper = container.querySelector(".group") as HTMLElement;
            fireEvent.mouseEnter(wrapper);

            await waitFor(() => {
                expect(screen.getByLabelText("Create")).toBeInTheDocument();
                expect(screen.getByLabelText("Delete")).toBeInTheDocument();
            });
        });

        it("should handle null/undefined children gracefully", () => {
            const { container } = renderMenuItem({
                icon: Home,
                text: "Dashboard",
                to: "dashboard",
                children: null,
            });

            const wrapper = container.querySelector(".group");
            expect(wrapper).toHaveClass("justify-start");
        });
    });

    describe("Navigation and onClick", () => {
        it("should navigate to relative path", () => {
            renderMenuItem({
                icon: Home,
                text: "Dashboard",
                to: "dashboard",
            });

            const button = screen.getByRole("button");
            fireEvent.click(button);

            expect(mockNavigate).toHaveBeenCalledWith("workspace-123/dashboard");
        });

        it("should navigate to absolute path", () => {
            renderMenuItem({
                icon: Home,
                text: "Settings",
                to: "/settings",
            });

            const button = screen.getByRole("button");
            fireEvent.click(button);

            expect(mockNavigate).toHaveBeenCalledWith("/settings");
        });

        it("should call onClick handler before navigation", () => {
            const mockOnClick = vi.fn();

            renderMenuItem({
                icon: Home,
                text: "Dashboard",
                to: "dashboard",
                onClick: mockOnClick,
            });

            const button = screen.getByRole("button");
            fireEvent.click(button);

            expect(mockOnClick).toHaveBeenCalledTimes(1);
            expect(mockNavigate).toHaveBeenCalled();
        });

        it("should handle navigation when no workspace is active", () => {
            mockUseWorkspaces.mockReturnValue({
                activeWorkspace: null,
                workspaces: [],
                setActiveWorkspace: vi.fn(),
            });

            renderMenuItem({
                icon: Home,
                text: "Dashboard",
                to: "dashboard",
            });

            const button = screen.getByRole("button");
            fireEvent.click(button);

            // When workspace is null, it navigates to "undefined/dashboard"
            expect(mockNavigate).toHaveBeenCalledWith("undefined/dashboard");
        });
    });

    describe("Collapsed state", () => {
        beforeEach(() => {
            mockUseLayoutState.mockReturnValue({
                isExplorerCollapsed: true,
                setIsExplorerCollapsed: vi.fn(),
            });
        });

        it("should apply justify-center when collapsed", () => {
            renderMenuItem({
                icon: Home,
                text: "Dashboard",
                to: "dashboard",
            });

            const button = screen.getByRole("button");
            expect(button).toHaveClass("justify-center");
        });

        it("should hide text when collapsed", () => {
            renderMenuItem({
                icon: Home,
                text: "Dashboard",
                to: "dashboard",
            });

            const text = screen.getByText("Dashboard");
            expect(text).toHaveClass("hidden");
        });
    });

    describe("Active state", () => {
        it("should apply active styles when path matches", () => {
            mockUseLocation.mockReturnValue({
                pathname: "/workspace-123/dashboard",
            });

            const { container } = renderMenuItem({
                icon: Home,
                text: "Dashboard",
                to: "dashboard",
            });

            const wrapper = container.querySelector(".group");
            expect(wrapper).toHaveClass("bg-accent", "text-accent-foreground");
        });

        it("should not apply active styles when path does not match", () => {
            mockUseLocation.mockReturnValue({
                pathname: "/workspace-123/settings",
            });

            renderMenuItem({
                icon: Home,
                text: "Dashboard",
                to: "dashboard",
            });

            const button = screen.getByRole("button");
            expect(button).not.toHaveClass("bg-accent");
        });

        it("should handle trailing slashes in path comparison", () => {
            mockUseLocation.mockReturnValue({
                pathname: "/workspace-123/dashboard/",
            });

            const { container } = renderMenuItem({
                icon: Home,
                text: "Dashboard",
                to: "dashboard",
            });

            const wrapper = container.querySelector(".group");
            expect(wrapper).toHaveClass("bg-accent", "text-accent-foreground");
        });

        it("should match exact paths only", () => {
            mockUseLocation.mockReturnValue({
                pathname: "/workspace-123/dashboard/sub",
            });

            renderMenuItem({
                icon: Home,
                text: "Dashboard",
                to: "dashboard",
            });

            const button = screen.getByRole("button");
            expect(button).not.toHaveClass("bg-accent");
        });
    });

    describe("Edge cases", () => {
        it("should handle undefined children prop", () => {
            const { container } = renderMenuItem({
                icon: Home,
                text: "Dashboard",
                to: "dashboard",
                children: undefined,
            });

            const wrapper = container.querySelector(".group");
            expect(wrapper).toHaveClass("justify-start");
        });

        it("should handle missing to prop", () => {
            renderMenuItem({
                icon: Home,
                text: "Dashboard",
            });

            const button = screen.getByRole("button");
            fireEvent.click(button);

            expect(mockNavigate).toHaveBeenCalledWith("workspace-123/undefined");
        });
    });
});
