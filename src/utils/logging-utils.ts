export function getCallingFunctionName(error: Error): string {
    const fallbackName = "<unknown>";

    const stack = error.stack;
    if (!stack) return fallbackName;

    const stackLines = stack.split("\n");
    if (stackLines.length < 4) return fallbackName;

    const callerLine = stackLines[3];
    const match = callerLine.match(/at (\w+) /);
    return match ? match[1] : fallbackName;
}

export function getErrorMessage(error: unknown, defaultMessage?: string) {
    if (error instanceof Error) return error.message;
    if (error && typeof error === "object" && "message" in error)
        return error.message;
    if (error) return String(error);

    return defaultMessage || "(I have no clue!)";
}
