import type { Preview } from "@storybook/react-vite";
import React from "react";
import { ThemeProvider } from "../src/layout/theme-provider";
import { TooltipProvider } from "../src/components/tooltip";
import { BrowserRouter } from "react-router-dom";
import "../src/styles.css";

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
    },
    decorators: [
        (Story) => (
            <BrowserRouter>
                <ThemeProvider defaultTheme="dark" defaultThemeColor="navy">
                    <TooltipProvider>
                        <div className="p-8 min-h-screen bg-background text-foreground">
                            <Story />
                        </div>
                    </TooltipProvider>
                </ThemeProvider>
            </BrowserRouter>
        ),
    ],
};

export default preview;
