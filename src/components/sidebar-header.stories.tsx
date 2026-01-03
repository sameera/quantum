import type { Meta, StoryObj } from "@storybook/react";
import { SidebarHeader } from "./sidebar-header";
import { Box } from "lucide-react";
import * as React from "react";

const meta: Meta<typeof SidebarHeader> = {
    title: "Layout/SidebarHeader",
    component: SidebarHeader,
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SidebarHeader>;

export const Expanded: Story = {
    args: {
        icon: Box,
        title: "Quantum",
        isExpanded: true,
        onToggleExpanded: () => console.log("toggle"),
    },
};

export const Collapsed: Story = {
    args: {
        icon: Box,
        title: "Quantum",
        isExpanded: false,
        onToggleExpanded: () => console.log("toggle"),
    },
};

