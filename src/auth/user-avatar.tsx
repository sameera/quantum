import { useAuth } from "react-oidc-context";
import { CircleUserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "../components/avatar";
import { Button } from "../components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../components/dropdown-menu";
import { User } from "../model/user";

import { useSession } from "./hooks";

const AnonUserAvatarButton: React.FC<{
    onLogin: () => void;
    isExpanded?: boolean;
}> = ({ onLogin: handleLogin, isExpanded = false }) => {
    const dropdownContent = (
        <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={handleLogin}>Sign In</DropdownMenuItem>
        </DropdownMenuContent>
    );

    const icon = (
        <CircleUserRound className={isExpanded ? "h-6 w-6" : "h-4 w-4"} />
    );

    const trigger = isExpanded ? (
        <div className="w-full flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-primary/10 rounded-md transition-colors">
            {icon}
            <span className="text-sm font-medium text-muted-foreground truncate">
                Sign In
            </span>
        </div>
    ) : (
        <Button variant="ghost" size="icon">
            {icon}
        </Button>
    );

    const dropdown = (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
            {dropdownContent}
        </DropdownMenu>
    );

    return isExpanded ? dropdown : <div className="py-2">{dropdown}</div>;
};

const LoggedInUserAvatarButton: React.FC<{
    loggedInUser: User;
    onLogout: () => void;
    isExpanded?: boolean;
}> = ({ loggedInUser, onLogout: handleLogout, isExpanded = false }) => {
    const navigate = useNavigate();

    const dropdownContent = (
        <DropdownMenuContent align="start">
            <DropdownMenuItem disabled>
                {loggedInUser.displayName}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>
                Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>Sign Out</DropdownMenuItem>
        </DropdownMenuContent>
    );

    const avatar = (
        <Avatar className="h-8 w-8">
            <AvatarFallback>{loggedInUser.initials}</AvatarFallback>
            <AvatarImage
                src={loggedInUser.profilePictureUrl}
                alt={loggedInUser.displayName || "User Avatar"}
            />
        </Avatar>
    );

    const trigger = isExpanded ? (
        <div className="w-full flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-primary/10 rounded-md transition-colors">
            {avatar}
            <span className="text-sm font-medium text-muted-foreground truncate">
                {loggedInUser.displayName}
            </span>
        </div>
    ) : (
        <Button
            variant="ghost"
            size="icon"
            className="w-full hover:bg-primary/10"
        >
            {avatar}
        </Button>
    );

    const dropdown = (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
            {dropdownContent}
        </DropdownMenu>
    );

    return isExpanded ? dropdown : <div className="py-2">{dropdown}</div>;
};

export const UserAvatar: React.FC<{ isExpanded?: boolean }> = ({
    isExpanded = false,
}) => {
    const auth = useAuth();
    const { isAuthenticated, user } = useSession();

    const handleLogin = () => auth.signinRedirect();
    const handleLogout = () => auth.signoutRedirect();

    if (isAuthenticated) {
        return (
            <LoggedInUserAvatarButton
                loggedInUser={user}
                onLogout={handleLogout}
                isExpanded={isExpanded}
            />
        );
    } else {
        return (
            <AnonUserAvatarButton
                onLogin={handleLogin}
                isExpanded={isExpanded}
            />
        );
    }
};
