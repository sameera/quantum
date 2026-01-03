import type { Meta, StoryObj } from "@storybook/react";
import { Loader } from "./loader";

const meta: Meta<typeof Loader> = {
    title: "UI/Loader",
    component: Loader,
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Loader>;

export const Default: Story = {};

export const CustomText: Story = {
    args: {
        text: "Syncing data...",
    },
};

