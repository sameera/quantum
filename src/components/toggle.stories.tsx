import type { Meta, StoryObj } from "@storybook/react";
import { Bold } from "lucide-react";
import { Toggle } from "./toggle";

const meta: Meta<typeof Toggle> = {
    title: "Forms/Toggle",
    component: Toggle,
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const Default: Story = {
    render: (args) => (
        <Toggle {...args} aria-label="Toggle bold">
            <Bold className="h-4 w-4" />
        </Toggle>
    ),
};

export const Outline: Story = {
    render: (args) => (
        <Toggle {...args} variant="outline" aria-label="Toggle bold">
            <Bold className="h-4 w-4" />
        </Toggle>
    ),
};

