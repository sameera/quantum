import type { Meta, StoryObj } from "@storybook/react";
import {
    Card,
    CardHeader,
    CardFooter,
    CardTitle,
    CardDescription,
    CardContent,
} from "./card";
import { Button } from "./button";

const meta: Meta<typeof Card> = {
    title: "UI/Card",
    component: Card,
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
    render: () => (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Create project</CardTitle>
                <CardDescription>
                    Deploy your new project in one-click.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col space-y-4">
                    <p className="text-sm">
                        This is the card content area where you can place any
                        information.
                    </p>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline">Cancel</Button>
                <Button>Deploy</Button>
            </CardFooter>
        </Card>
    ),
};

export const Simple: Story = {
    render: () => (
        <Card>
            <CardContent className="pt-6">
                <p>A simple card with just content.</p>
            </CardContent>
        </Card>
    ),
};

