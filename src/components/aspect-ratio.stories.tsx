import type { Meta, StoryObj } from "@storybook/react";
import { AspectRatio } from "./aspect-ratio";

const meta: Meta<typeof AspectRatio> = {
    title: "UI/AspectRatio",
    component: AspectRatio,
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof AspectRatio>;

export const Default: Story = {
    render: () => (
        <div className="w-[450px]">
            <AspectRatio ratio={16 / 9} className="bg-muted">
                <img
                    src="https://images.unsplash.com/photo-1588345921523-c2dcd57fd21b?w=800&dpr=2&q=80"
                    alt="Photo by Drew Beamer"
                    className="rounded-md object-cover w-full h-full"
                />
            </AspectRatio>
        </div>
    ),
};

