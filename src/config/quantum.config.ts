/**
 * Centralized configuration for Quantum
 *
 * This file consolidates all configuration options in one place for easy customization.
 * All environment variables should be defined in .env files at the application level.
 */

export interface QuantumAuthConfig {
    authority: string;
    clientId: string;
    redirectUri: string;
    postLogoutRedirectUri?: string;
    responseType?: string;
    scope?: string;
}

export interface QuantumApiConfig {
    baseUrl: string;
    coreApiBaseUrl?: string;
}

export interface QuantumAppConfig {
    name: string;
    version?: string;
}

export interface QuantumConfig {
    auth: QuantumAuthConfig;
    api: QuantumApiConfig;
    app: QuantumAppConfig;
}

/**
 * Creates Quantum configuration from environment variables
 * Override this function in your app to provide custom configuration
 */
export const createQuantumConfig = (): QuantumConfig => {
    return {
        auth: {
            authority: import.meta.env.VITE_OIDC_AUTHORITY,
            clientId: import.meta.env.VITE_OIDC_CLIENT_ID,
            redirectUri: import.meta.env.VITE_OIDC_REDIRECT_URI,
            postLogoutRedirectUri: import.meta.env
                .VITE_OIDC_POST_LOGOUT_REDIRECT_URI,
            responseType: import.meta.env.VITE_OIDC_RESPONSE_TYPE || "code",
            scope: import.meta.env.VITE_OIDC_SCOPE || "openid profile email",
        },
        api: {
            baseUrl: import.meta.env.VITE_API_BASE_URL,
        },
        app: {
            name: import.meta.env.VITE_APP_NAME || "Quantum App",
            version: import.meta.env.VITE_APP_VERSION,
        },
    };
};

/**
 * Default Quantum configuration instance
 * Import this in your app to access configuration values
 */
export const quantumConfig = createQuantumConfig();
