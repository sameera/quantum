import { describe, expect, it } from "vitest";

import { Aspect } from "../aspect";

import { convertToTable } from "./table-converter";

describe("convertToTable", () => {
    // Sample test data
    const aspects: Aspect[] = [
        {
            id: "1",
            name: "Task 1",
            status: "todo",
            priority: "high",
            type: "bug",
        },
        {
            id: "2",
            name: "Task 2",
            status: "in-progress",
            priority: "medium",
            type: "feature",
        },
        {
            id: "3",
            name: "Task 3",
            status: "done",
            priority: "low",
            type: "bug",
        },
        {
            id: "4",
            name: "Task 4",
            status: "todo",
            priority: "high",
            type: "feature",
        },
        {
            id: "5",
            name: "Task 5",
            status: "in-progress",
            priority: "medium",
            type: "enhancement",
        },
        {
            id: "6",
            name: "Task 6",
            status: "backlog",
            priority: "low",
            type: "bug",
        },
        {
            id: "7",
            name: "Task 7",
            status: "todo",
            priority: "critical",
            type: "feature",
        },
    ];

    it("should organize aspects into a table based on row and column expressions", () => {
        const rowExpressions = [
            '$[?(@.priority == "high")]',
            '$[?(@.priority == "medium")]',
            '$[?(@.priority == "low")]',
        ];
        const columnExpressions = [
            '$[?(@.status == "todo")]',
            '$[?(@.status == "in-progress")]',
            '$[?(@.status == "done")]',
        ];

        const result = convertToTable(
            aspects,
            rowExpressions,
            columnExpressions
        );

        // Expected table structure:
        // Row 0 (high): [Task 1, Task 4], [], []
        // Row 1 (medium): [], [Task 2, Task 5], []
        // Row 2 (low): [], [], [Task 3]
        // Remainder: Task 6, Task 7

        // Check table dimensions
        expect(result.table.length).toBe(3); // 3 rows
        expect(result.table[0].length).toBe(3); // 3 columns in each row

        // Check specific cell contents
        // Row 0 (high priority)
        expect(result.table[0][0].length).toBe(2); // todo column
        expect(result.table[0][0].map((a) => a.id)).toContain("1");
        expect(result.table[0][0].map((a) => a.id)).toContain("4");
        expect(result.table[0][1].length).toBe(0); // in-progress column
        expect(result.table[0][2].length).toBe(0); // done column

        // Row 1 (medium priority)
        expect(result.table[1][0].length).toBe(0); // todo column
        expect(result.table[1][1].length).toBe(2); // in-progress column
        expect(result.table[1][1].map((a) => a.id)).toContain("2");
        expect(result.table[1][1].map((a) => a.id)).toContain("5");
        expect(result.table[1][2].length).toBe(0); // done column

        // Row 2 (low priority)
        expect(result.table[2][0].length).toBe(0); // todo column
        expect(result.table[2][1].length).toBe(0); // in-progress column
        expect(result.table[2][2].length).toBe(1); // done column
        expect(result.table[2][2][0].id).toBe("3");

        // Check remainder
        expect(result.remainder.length).toBe(2);
        expect(result.remainder.map((a) => a.id)).toContain("6"); // backlog status
        expect(result.remainder.map((a) => a.id)).toContain("7"); // critical priority
    });

    it("should handle empty arrays", () => {
        const result = convertToTable(
            [],
            ['$.priority == "high"'],
            ['$.status == "todo"']
        );

        expect(result.table.length).toBe(1);
        expect(result.table[0].length).toBe(1);
        expect(result.table[0][0].length).toBe(0);
        expect(result.remainder.length).toBe(0);
    });

    it("should handle empty expression arrays", () => {
        const result = convertToTable(aspects, [], []);

        expect(result.table.length).toBe(0);
        expect(result.remainder.length).toBe(aspects.length);
        expect(result.remainder).toEqual(aspects);
    });

    it("should handle complex JSONPath expressions", () => {
        const complexAspects: Aspect[] = [
            {
                id: "1",
                name: "Task 1",
                metadata: { tags: ["frontend", "ui"] },
                assignee: { level: "senior" },
            },
            {
                id: "2",
                name: "Task 2",
                metadata: { tags: ["backend", "api"] },
                assignee: { level: "junior" },
            },
            {
                id: "3",
                name: "Task 3",
                metadata: { tags: ["database"] },
                assignee: { level: "senior" },
            },
            {
                id: "4",
                name: "Task 4",
                metadata: { tags: ["frontend", "performance"] },
                assignee: { level: "junior" },
            },
        ];

        const rowExpressions = [
            '$[?(@.assignee.level == "senior")]',
            '$[?(@.assignee.level == "junior")]',
        ];
        const columnExpressions = [
            '$[?(@.metadata.tags.indexOf("frontend") != -1)]',
            '$[?(@.metadata.tags.indexOf("backend") != -1)]',
            '$[?(@.metadata.tags.indexOf("database") != -1)]',
        ];

        const result = convertToTable(
            complexAspects,
            rowExpressions,
            columnExpressions
        );

        // Expected:
        // Row 0 (senior): [Task 1], [], [Task 3]
        // Row 1 (junior): [Task 4], [Task 2], []

        expect(result.table[0][0].length).toBe(1);
        expect(result.table[0][0][0].id).toBe("1");
        expect(result.table[0][1].length).toBe(0);
        expect(result.table[0][2].length).toBe(1);
        expect(result.table[0][2][0].id).toBe("3");

        expect(result.table[1][0].length).toBe(1);
        expect(result.table[1][0][0].id).toBe("4");
        expect(result.table[1][1].length).toBe(1);
        expect(result.table[1][1][0].id).toBe("2");
        expect(result.table[1][2].length).toBe(0);

        expect(result.remainder.length).toBe(0);
    });

    it("should place aspects in the first matching cell only", () => {
        const aspects: Aspect[] = [
            {
                id: "1",
                name: "Task 1",
                status: "todo",
                priority: "high",
                type: "bug",
            },
        ];

        // Multiple expressions that could match the same aspect
        const rowExpressions = [
            '$[?(@.priority == "high")]',
            '$[?(@.type == "bug")]',
        ];
        const columnExpressions = [
            '$[?(@.status == "todo")]',
            '$[?(@.priority == "high")]',
        ];

        const result = convertToTable(
            aspects,
            rowExpressions,
            columnExpressions
        );

        // The aspect should only be in the first matching cell (row 0, col 0)
        // and not duplicated in other cells that also match
        expect(result.table[0][0].length).toBe(1);
        expect(result.table[0][0][0].id).toBe("1");
        expect(result.table[0][1].length).toBe(0);
        expect(result.table[1][0].length).toBe(0);
        expect(result.table[1][1].length).toBe(0);

        expect(result.remainder.length).toBe(0);
    });

    it("should handle invalid JSONPath expressions gracefully", () => {
        const rowExpressions = ['$[?(@.priority == "high")]'];
        const columnExpressions = [
            "invalid expression",
            '$[?(@.status == "in-progress")]',
        ];

        // This test assumes the implementation will skip invalid expressions
        // rather than throwing an error
        const result = convertToTable(
            aspects,
            rowExpressions,
            columnExpressions
        );

        // Only the valid column expression should be used
        expect(result.table[0].length).toBe(2);
        expect(result.table[0][0].length).toBe(0); // Invalid expression column
        expect(result.table[0][1].length).toBe(0); // in-progress column (no high priority in-progress)
    });
});
