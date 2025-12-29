import React from "react";
import { AuthProvider, useAuth } from "react-oidc-context";
import { SignoutResponse, User, UserManagerSettings } from "oidc-client-ts";

import { isValidUser, toAuthenticatedUser } from "./auth/auth-utils";
import { userManager } from "./auth/user-manager";
import { AuthenticatedUser } from "./model/user";
import { WorkspaceProvider, WorkspaceProviderProps } from "./workspaces";

interface QuantumAppProps extends WorkspaceProviderProps {
    children?: React.ReactNode;
    onSignInCallback?: (user: AuthenticatedUser) => Promise<void> | void;
    onSignOutCallback?: () => Promise<void> | void;
    /**
     * Callback function for user initialization events.
     * Invoked when an authenticated user becomes available (fresh login or page refresh).
     *
     * @param user - The authenticated user object with complete profile and access token
     * @returns void or Promise<void> for async initialization
     */
    onUserInitialized?: (user: AuthenticatedUser) => void | Promise<void>;
}

const QuantumApp: React.FC<QuantumAppProps> = (props) => {
    const initializedSessionRef = React.useRef<string | null>(null);

    const userInitializedProxy = (user: AuthenticatedUser) => {
        if (!props.onUserInitialized) {
            return;
        }

        const sessionId = `${user.id}-${user.oidcProfile.access_token}`;

        if (initializedSessionRef.current === sessionId) {
            return;
        }

        initializedSessionRef.current = sessionId;

        try {
            return props.onUserInitialized(user);
        } catch (error) {
            console.error("Auth: Error in onUserInitialized callback", error);
        }
    };

    const signinProxy = (user: User | undefined) => {
        if (user && isValidUser(user)) {
            const authenticatedUser = toAuthenticatedUser(user);

            if (props.onSignInCallback) {
                props.onSignInCallback(authenticatedUser);
            }

            userInitializedProxy(authenticatedUser);
        }
    };

    const matchSignoutCallback = (args: UserManagerSettings) => {
        return window && window.location.href === args.post_logout_redirect_uri;
    };

    const signoutProxy = (resp: SignoutResponse | undefined) => {
        if (!resp?.error && props.onSignOutCallback) {
            return props.onSignOutCallback();
        } else if (resp?.error) {
            console.error("Signout unsuccessful:", resp.error);
        }
    };

    return (
        <AuthProvider
            userManager={userManager}
            onSigninCallback={signinProxy}
            onSignoutCallback={signoutProxy}
            matchSignoutCallback={matchSignoutCallback}
        >
            <UserInitializedDetector
                onUserInitialized={props.onUserInitialized}
                initializedSessionRef={initializedSessionRef}
            />
            <WorkspaceProvider workspaces={props.workspaces} />
            {props.children}
        </AuthProvider>
    );
};

interface UserInitializedDetectorProps {
    onUserInitialized?: (user: AuthenticatedUser) => void | Promise<void>;
    initializedSessionRef: React.MutableRefObject<string | null>;
}

const UserInitializedDetector: React.FC<UserInitializedDetectorProps> = ({
    onUserInitialized,
    initializedSessionRef,
}) => {
    const auth = useAuth();

    React.useEffect(() => {
        if (!onUserInitialized || !auth.user || auth.isLoading) {
            return;
        }

        if (!isValidUser(auth.user)) {
            return;
        }

        const authenticatedUser = toAuthenticatedUser(auth.user);
        const sessionId = `${authenticatedUser.id}-${auth.user.access_token}`;

        if (initializedSessionRef.current === sessionId) {
            return;
        }

        initializedSessionRef.current = sessionId;

        try {
            onUserInitialized(authenticatedUser);
        } catch (error) {
            console.error("Auth: Error in onUserInitialized callback", error);
        }
    }, [auth.user, auth.isLoading, onUserInitialized, initializedSessionRef]);

    return null;
};

export default QuantumApp;
