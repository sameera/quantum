import { User as OidcUser } from "oidc-client-ts";

import { AuthenticatedUser } from "../model/user";

export type ValidatedOidcUser = OidcUser & {
    id_token: string; // Ensures id_token is defined and not null
    profile: OidcUser["profile"] & {
        email: string; // Ensures profile.email is defined and not null
        user_id: string; // Ensure that the user_id custom claim is defied and not null
    };
};

export function isValidUser(
    user: OidcUser | null | undefined
): user is ValidatedOidcUser {
    return (
        user !== null &&
        user !== undefined &&
        !user.expired &&
        typeof user.id_token === "string" &&
        typeof user.profile === "object" &&
        typeof user.profile.email === "string" &&
        "user_id" in user.profile &&
        typeof user.profile.user_id === "string"
    );
}

export function toAuthenticatedUser(
    user: ValidatedOidcUser,
    displayNameFallback: string = import.meta.env
        .VITE_ANON_DISPLAY_NAME_FALLBACK || "(Mysterious User)"
): AuthenticatedUser {
    const firstName = user.profile.given_name;
    const lastName = user.profile.family_name;

    const email = user.profile.email;

    let fullName: string;
    let displayName: string;
    let initials: string;

    if (firstName && lastName) {
        fullName = `${firstName} ${lastName}`;
        displayName = fullName;
        initials = `${firstName[0]}${lastName[0]}`.toUpperCase();
    } else {
        fullName = firstName || lastName || email || displayNameFallback;
        displayName = fullName;
        initials = displayName[0].toUpperCase();
    }

    return {
        id: user.profile.user_id,
        fullName,
        displayName,
        email,
        initials,
        oidcProfile: user,
    };
}
