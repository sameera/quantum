import { ErrorContext, useAuth as useOidcAuth } from "react-oidc-context";

import type { AuthenticatedUser, User } from "../model/user";

import { isValidUser, toAuthenticatedUser } from "./auth-utils";
import { userManager } from "./user-manager";

/**
 * Function type returned by event subscription methods.
 * Call this function to unsubscribe from the event and prevent memory leaks.
 *
 * @returns void
 */
export type UnsubscribeFunction = () => void;

/**
 * Event handler type for user initialization events.
 *
 * @param user - The authenticated user object
 */
export type UserInitializedEventHandler = (user: User) => void;

interface AuthEvents {
    userLoaded: (callback: (user: User) => void) => () => void;
    userUnloaded: (callback: () => void) => () => void;
}

interface AuthenticatedState {
    isAuthenticated: true;
    isLoading: false;
    user: AuthenticatedUser;
    accessToken: string;
    signin: () => void;
    signout: () => void;
    error?: ErrorContext;
    events: AuthEvents;
}

interface UnauthenticatedState {
    isAuthenticated: false;
    isLoading: false;
    user?: User;
    accessToken?: string;
    signin: () => void;
    signout: () => void;
    error?: ErrorContext;
    events: AuthEvents;
}

interface LoadingState {
    isLoading: true;
    isAuthenticated: false;
    user?: undefined;
    accessToken?: undefined;
    signin?: () => void;
    signout?: () => void;
    error?: ErrorContext;
    events?: AuthEvents;
}

export type Session = AuthenticatedState | UnauthenticatedState | LoadingState;

export function useSession(): Session {
    const oidc = useOidcAuth();

    if (!oidc || oidc.isLoading) {
        return {
            isLoading: true,
            isAuthenticated: false,
        };
    }

    const events = {
        userLoaded: (cb: (user: User) => void) => {
            return oidc.events.addUserLoaded((oidcUser) => {
                if (isValidUser(oidcUser)) {
                    cb(toAuthenticatedUser(oidcUser));
                } else {
                    console.error("Auth: Loaded invalid user", oidcUser);
                }
            });
        },
        userUnloaded: (cb: () => void) => {
            return oidc.events.addUserUnloaded(cb);
        },
    };

    const common = {
        events,
        signin: oidc?.signinRedirect,
        signout: oidc?.signoutRedirect,
        error: oidc?.error,
    };

    if (oidc.user && isValidUser(oidc.user)) {
        const user = toAuthenticatedUser(oidc.user);

        return {
            ...common,
            user,
            isLoading: false,
            isAuthenticated: true,
            accessToken: oidc.user.access_token,
        };
    }

    return {
        ...common,
        isLoading: false,
        isAuthenticated: false,
    };
}

export function useAuthUser(): AuthenticatedUser {
    const auth = useSession();
    if (!auth.isAuthenticated || !auth.user) {
        throw new Error("No logged in user");
    }
    return auth.user;
}

export async function getAuthUser() {
    const oidcUser = await userManager.getUser();
    if (isValidUser(oidcUser)) {
        return toAuthenticatedUser(oidcUser);
    } else {
        throw new Error("User is not authenticated.");
    }
}
