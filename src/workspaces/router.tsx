import { lazy } from "react";
import { createBrowserRouter, Navigate, RouteObject } from "react-router-dom";

import { RouteGuards } from "../auth/use-guards";
import { withSuspense } from "../components/with-suspense";
import { AppFrame } from "../layout";
import LoginPage from "../pages/login-page";

import { RuntimeWorkspace } from "./model";

/**
 * Creates a workspace router using the provided root element and a list of routable workspaces.
 *
 * This function generates a browser router configuration where each workspace is mapped to a route
 * based on its `id`. If a workspace has a `router` component, it will be wrapped with a suspense
 * handler; otherwise, a fallback "Not found" message will be displayed.
 *
 * @param root - The root ReactNode element to be used as the base of the router.
 * @param workspaces - An array of `RuntimeWorkspace` objects, each containing an `id` and an optional `router` component.
 * @returns A configured `BrowserRouter` instance with the specified routes.
 */
export function createWorkspaceRouter(
    workspaces: RuntimeWorkspace[],
    { authGuard, loginGuard }: RouteGuards
): ReturnType<typeof createBrowserRouter> {
    const workspaceRoutes: RouteObject[] = workspaces.map((w) => ({
        path: `/${w.id}/*`,
        element: w.router ? (
            withSuspense(w.router)
        ) : (
            <p>This workspace is unavailable</p>
        ),
        loader: w.isPublic ? undefined : authGuard,
    }));

    const defaultWorkspace =
        workspaces.find((w) => w.isDefault) ?? workspaces[0];
    if (defaultWorkspace) {
        workspaceRoutes.push({
            index: true,
            element: <Navigate to={`/${defaultWorkspace.id}`} replace />,
        });
    }



    workspaceRoutes.push({
        path: "settings",
        element: withSuspense(lazy(() => import("../pages/settings-page"))),
        loader: authGuard,
    });

    return createBrowserRouter([
        {
            path: "/login/callback",
            element: withSuspense(
                lazy(() => import("../pages/login-callback"))
            ),
        },
        {
            path: "/logout/callback",
            element: withSuspense(
                lazy(() => import("../pages/logout-callback"))
            ),
        },
        {
            path: "/login",
            element: <LoginPage />,
            loader: loginGuard,
        },
        {
            path: "/",
            element: <AppFrame />,
            children: workspaceRoutes,
        },
    ]);
}
