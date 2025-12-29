import { Menu } from "lucide-react";

import { Button } from "../components/button";
import { Workspace } from "../workspaces";

interface MobileHeaderProps {
    onOpenSidebar: () => void;
    workspace: Workspace | null;
}

export function MobileHeader({
    onOpenSidebar,
    workspace,
}: MobileHeaderProps) {
    return (
        <header className="flex h-14 items-center justify-between border-b px-4 lg:hidden">
            <div className="flex">
                <div className="py-2" onClick={onOpenSidebar}>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-4 w-4" />
                    </Button>
                </div>
                {workspace && (
                    <div className="flex items-center gap-3 rounded-md px-3 py-2">
                        <workspace.icon className="h-6 w-6" />
                        <h1 className="text-lg font-semibold">
                            {workspace.name}
                        </h1>
                    </div>
                )}
            </div>
        </header>
    );
}
