import { UserManager, WebStorageStateStore } from "oidc-client-ts";

import { quantumConfig as config } from "../config/quantum.config";

const oidcConfig = {
    authority: config.auth.authority,
    client_id: config.auth.clientId,
    redirect_uri: config.auth.redirectUri,
    post_logout_redirect_uri: config.auth.postLogoutRedirectUri,
    response_type: config.auth.responseType,
    scope: config.auth.scope,
    loadUserInfo: true,
    userStore: new WebStorageStateStore({ store: window.sessionStorage }),
    automaticSilentRenew: true,
    filterProtocolClaims: true,
};

export const userManager = new UserManager(oidcConfig);
