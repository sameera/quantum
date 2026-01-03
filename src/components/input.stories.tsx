import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./input";

const meta: Meta<typeof Input> = {
    title: "Forms/Input",
    component: Input,
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
    args: {
        placeholder: "Email",
    },
};

export const File: Story = {
    args: {
        type: "file",
    },
};

export const Disabled: Story = {
    args: {
        disabled: true,
        value: "Disabled value",
    },
};

