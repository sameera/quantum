import { useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router-dom";

import { isValidUser } from "../auth/auth-utils";

const LoginCallbackPage: React.FC = () => {
    const auth = useAuth();
    const navigate = useNavigate();

    const user = auth.user;

    useEffect(() => {
        if (isValidUser(user)) {
            navigate("/");
        }
    }, [user, navigate]);

    if (auth.error) {
        console.error("Auth Error:", auth.error);
    }
    return auth.error ? (
        <>
            <p>There was an error logging you in.</p>
            <p>
                <a href="/login">Return to login page.</a>
            </p>
        </>
    ) : (
        <p>Logging in...</p>
    );
};

export default LoginCallbackPage;
