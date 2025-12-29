import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";
type ThemeColor = "purple" | "green" | "blue" | "navy";

type ThemeProviderProps = {
    children: React.ReactNode;
    defaultTheme?: Theme;
    defaultThemeColor?: ThemeColor;
    storageKey?: string;
    themeColorStorageKey?: string;
};

type ThemeProviderState = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    themeColor: ThemeColor;
    setThemeColor: (color: ThemeColor) => void;
};

const initialState: ThemeProviderState = {
    theme: "system",
    setTheme: () => null,
    themeColor: "navy",
    setThemeColor: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
    children,
    defaultTheme = "system",
    defaultThemeColor = "navy",
    storageKey = "apex-ui-theme",
    themeColorStorageKey = "apex-ui-theme-color",
    ...props
}: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(
        () => (localStorage.getItem(storageKey) as Theme) || defaultTheme,
    );
    
    const [themeColor, setThemeColor] = useState<ThemeColor>(
        () => (localStorage.getItem(themeColorStorageKey) as ThemeColor) || defaultThemeColor,
    );

    useEffect(() => {
        const root = window.document.documentElement;

        // Handle Theme Mode
        root.classList.remove("light", "dark");

        if (theme === "system") {
            const systemTheme = window.matchMedia(
                "(prefers-color-scheme: dark)",
            ).matches
                ? "dark"
                : "light";

            root.classList.add(systemTheme);
        } else {
            root.classList.add(theme);
        }
    }, [theme]);

    useEffect(() => {
        const root = window.document.documentElement;

        // Handle Theme Color
        root.classList.remove("theme-purple", "theme-green", "theme-blue", "theme-navy");
        root.classList.add(`theme-${themeColor}`);
    }, [themeColor]);

    const value = {
        theme,
        setTheme: (theme: Theme) => {
            localStorage.setItem(storageKey, theme);
            setTheme(theme);
        },
        themeColor,
        setThemeColor: (color: ThemeColor) => {
            localStorage.setItem(themeColorStorageKey, color);
            setThemeColor(color);
        }
    };

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext);

    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider");

    return context;
};
