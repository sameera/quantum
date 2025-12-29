import jsonpath from "jsonpath";

import { Aspect } from "../aspect";

/**
 * Converts an array of Aspects into a table structure based on row and column JSONPath expressions.
 * The function first classifies Aspects into rows based on rowExpressions, then into columns based on columnExpressions.
 * Aspects that do not match any row or column expression are placed in the "remainder" property.
 *
 * @param aspects Array of Aspects to organize into a table
 * @param rowExpressions Array of JSONPath expressions for determining row placement
 * @param columnExpressions Array of JSONPath expressions for determining column placement
 * @returns Object containing the table structure and remainder Aspects
 */
export function convertToTable(
    aspects: Aspect[],
    rowExpressions: string[],
    columnExpressions: string[]
): { table: Aspect[][][]; remainder: Aspect[] } {
    // Initialize table structure (with additional rows and columns for remainders)
    const table: Aspect[][][] = Array(rowExpressions.length)
        .fill(null)
        .map(() =>
            Array(columnExpressions.length)
                .fill(null)
                .map(() => [])
        );

    const remainder: Aspect[] = [];

    const envelope: Array<Aspect | null> = [null];
    const isMatch = (expression: string, aspect: Aspect): boolean => {
        envelope[0] = aspect;
        try {
            return jsonpath.query(envelope, expression).length > 0;
        } catch (error) {
            console.warn(`Invalid JSONPath expression: ${expression}`, error);
            return false;
        }
    };

    // Iterate through each aspect and apply row and column expressions
    aspects.forEach((aspect) => {
        let rowIndex = -1;
        let colIndex = -1;

        // Check for matching row
        for (let i = 0; i < rowExpressions.length; i++) {
            if (isMatch(rowExpressions[i], aspect)) {
                rowIndex = i;
                break;
            }
        }

        // If no row match, add to remainder
        if (rowIndex === -1) {
            remainder.push(aspect);
            return;
        }

        // Check for matching column
        for (let j = 0; j < columnExpressions.length; j++) {
            if (isMatch(columnExpressions[j], aspect)) {
                colIndex = j;
                break;
            }
        }

        // If no column match, add to remainder
        if (colIndex === -1) {
            remainder.push(aspect);
            return;
        }

        // Place the aspect in the table
        table[rowIndex][colIndex].push(aspect);
    });

    return { table, remainder };
}

// export function convertToTable(
//     aspects: Aspect[],
//     rowExpressions: string[],
//     columnExpressions: string[]
// ): { table: Aspect[][][]; remainder: Aspect[] } {
//     // Initialize table structure
//     const table: Aspect[][][] = Array(rowExpressions.length)
//         .fill(null)
//         .map(() =>
//             Array(columnExpressions.length)
//                 .fill(null)
//                 .map(() => [])
//         );

//     /**
//      * Helper function to evaluate a JSONPath query safely on an array.
//      */
//     const filterByExpression = (
//         data: Aspect[],
//         expression: string
//     ): Aspect[] => {
//         try {
//             return jsonpath.query(data, expression);
//         } catch (error) {
//             console.warn(`Invalid JSONPath expression: ${expression}`, error);
//             return [];
//         }
//     };

//     // Step 1: Classify aspects into rows
//     const rowGroups: Aspect[][] = rowExpressions.map((rowExpression) =>
//         filterByExpression(aspects, rowExpression)
//     );

//     const matchedAspects = new Set<string>();

//     // Step 2: Classify aspects into columns for each row
//     rowGroups.forEach((rowGroup, rowIndex) => {
//         // Apply column expression on the row group and place the result in the table
//         columnExpressions.forEach((colExpression, colIndex) => {
//             const cellAspects = filterByExpression(rowGroup, colExpression);
//             table[rowIndex][colIndex] = cellAspects;
//             cellAspects.forEach((aspect) => matchedAspects.add(aspect.id));
//         });
//     });

//     // Unmatched aspects (not matching any row or column expression) are placed in the "remainder"
//     const remainder = aspects.filter(
//         (aspect) => !matchedAspects.has(aspect.id)
//     );

//     return { table, remainder };
// }
