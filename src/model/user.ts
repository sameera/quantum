import { User as OidcUser } from "oidc-client-ts";

export interface User {
    id: string;
    displayName: string;
    fullName: string;
    initials: string;
    email: string;
    profilePictureUrl?: string;
}

export type AuthenticatedUser = User & { oidcProfile: OidcUser };
