import { LoaderFunction, redirect } from "react-router-dom";

import { useSession } from "./hooks";

export interface RouteGuards {
    authGuard: LoaderFunction;
    loginGuard: LoaderFunction;
}

export function useRouteGuards() {
    const { isAuthenticated } = useSession();

    function authGuard() {
        return isAuthenticated ? true : redirect("/login");
    }

    function loginGuard() {
        return isAuthenticated ? redirect("/") : true;
    }

    return {
        authGuard,
        loginGuard,
    };
}
