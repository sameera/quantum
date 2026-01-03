import type { Meta, StoryObj } from "@storybook/react";
import { Toaster } from "./toaster";
import { useToast } from "./use-toast";
import { Button } from "./button";
import { ToastAction } from "./toast";

const meta: Meta<typeof Toaster> = {
    title: "Overlays/Toast",
    component: Toaster,
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Toaster>;

export const Default: Story = {
    render: () => {
        const { toast } = useToast();

        return (
            <div>
                <Toaster />
                <Button
                    variant="outline"
                    onClick={() => {
                        toast({
                            title: "Scheduled: Catch up ",
                            description: "Friday, February 10, 2023 at 5:57 PM",
                            action: (
                                <ToastAction altText="Goto schedule to undo">
                                    Undo
                                </ToastAction>
                            ),
                        });
                    }}>
                    Add to calendar
                </Button>
            </div>
        );
    },
};

export const Destructive: Story = {
    render: () => {
        const { toast } = useToast();

        return (
            <div>
                <Toaster />
                <Button
                    variant="outline"
                    onClick={() => {
                        toast({
                            variant: "destructive",
                            title: "Uh oh! Something went wrong.",
                            description:
                                "There was a problem with your request.",
                            action: (
                                <ToastAction altText="Try again">
                                    Try again
                                </ToastAction>
                            ),
                        });
                    }}>
                    Show Toast
                </Button>
            </div>
        );
    },
};

