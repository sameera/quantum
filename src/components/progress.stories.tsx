import type { Meta, StoryObj } from "@storybook/react";
import { Progress } from "./progress";
import * as React from "react";

const meta: Meta<typeof Progress> = {
    title: "UI/Progress",
    component: Progress,
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
    args: {
        value: 33,
    },
};

export const Indeterminate: Story = {
    render: () => {
        const [progress, setProgress] = React.useState(13);

        React.useEffect(() => {
            const timer = setTimeout(() => setProgress(66), 500);
            return () => clearTimeout(timer);
        }, []);

        return <Progress value={progress} className="w-[60%]" />;
    },
};

