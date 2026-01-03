import type { Meta, StoryObj } from "@storybook/react";
import { KanbanBoard } from "./kanban-board";

const meta: Meta<typeof KanbanBoard> = {
    title: "Complex/KanbanBoard",
    component: KanbanBoard,
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof KanbanBoard>;

const mockData = [
    [
        [
            { id: "1", name: "Task 1" },
            { id: "2", name: "Task 2" },
        ],
        [{ id: "3", name: "Task 3" }],
    ],
    [
        [{ id: "4", name: "Task 4" }],
        [
            { id: "5", name: "Task 5" },
            { id: "6", name: "Task 6" },
        ],
    ],
];

export const Default: Story = {
    args: {
        data: mockData,
        columnHeaders: ["To Do", "In Progress"],
        rowHeaders: ["High Priority", "Low Priority"],
    },
};

