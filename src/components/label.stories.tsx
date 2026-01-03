import type { Meta, StoryObj } from "@storybook/react";
import { Label } from "./label";

const meta: Meta<typeof Label> = {
    title: "UI/Label",
    component: Label,
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
    args: {
        children: "Label Text",
    },
};

export const ForInput: Story = {
    render: () => (
        <div className="flex items-center space-x-2">
            <Label htmlFor="email">Email</Label>
            <input
                id="email"
                className="border rounded px-2 py-1"
                placeholder="Enter email"
            />
        </div>
    ),
};

