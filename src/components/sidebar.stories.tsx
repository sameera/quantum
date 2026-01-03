import type { Meta, StoryObj } from "@storybook/react";
import { Sidebar } from "./sidebar";
import { Home, Settings, User, Box } from "lucide-react";
import * as React from "react";

const meta: Meta<typeof Sidebar> = {
    title: "Layout/Sidebar",
    component: Sidebar,
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

export const Expanded: Story = {
    render: () => {
        const [expanded, setExpanded] = React.useState(true);
        return (
            <div className="h-[600px] border rounded-lg overflow-hidden">
                <Sidebar
                    icon={Box}
                    title="Quantum"
                    isExpanded={expanded}
                    onToggleExpanded={() => setExpanded(!expanded)}>
                    <div className="flex-1 p-2 space-y-1">
                        <div className="flex items-center p-2 rounded-md hover:bg-accent cursor-pointer">
                            <Home className="h-4 w-4 mr-2" />
                            {expanded && <span>Dashboard</span>}
                        </div>
                        <div className="flex items-center p-2 rounded-md hover:bg-accent cursor-pointer">
                            <User className="h-4 w-4 mr-2" />
                            {expanded && <span>Profile</span>}
                        </div>
                    </div>
                </Sidebar>
            </div>
        );
    },
};

export const Collapsed: Story = {
    render: () => {
        const [expanded, setExpanded] = React.useState(false);
        return (
            <div className="h-[600px] border rounded-lg overflow-hidden w-[60px]">
                <Sidebar
                    icon={Box}
                    title="Quantum"
                    isExpanded={expanded}
                    onToggleExpanded={() => setExpanded(!expanded)}>
                    <div className="flex-1 p-2 space-y-1">
                        <div className="flex items-center justify-center p-2 rounded-md hover:bg-accent cursor-pointer">
                            <Home className="h-4 w-4" />
                        </div>
                        <div className="flex items-center justify-center p-2 rounded-md hover:bg-accent cursor-pointer">
                            <User className="h-4 w-4" />
                        </div>
                    </div>
                </Sidebar>
            </div>
        );
    },
};

