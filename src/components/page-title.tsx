import React from "react";

export function PageTitle({ children }: { children?: React.ReactNode }) {
    return (
        <h1 className="pt-2 pb-6 text-left text-2xl font-semibold">
            {children}
        </h1>
    );
}
