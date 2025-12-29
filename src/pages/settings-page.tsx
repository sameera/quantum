import { Check, Moon, Sun } from "lucide-react";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../components/card";
import { Label } from "../components/label";
import { Switch } from "../components/switch";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "../components/tooltip";
import { cn } from "../components/utils";
import { useTheme } from "../layout/theme-provider";

export default function SettingsPage() {
    const { theme, setTheme, themeColor, setThemeColor } = useTheme();

    const isDark = theme === "dark";

    const toggleTheme = (checked: boolean) => {
        setTheme(checked ? "dark" : "light");
    };

    return (
        <TooltipProvider>
            <div className="py-10 max-w-4xl">
                <h1 className="text-3xl font-bold mb-6">Settings</h1>
                
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Appearance</CardTitle>
                            <CardDescription>
                                Customize the look and feel of the application.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Dark Mode Toggle */}
                            <div className="flex items-center justify-between">
                                <div className="space-y-1 text-left">
                                    <Label htmlFor="theme-mode" className="text-base">
                                        Dark Mode
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Switch between light and dark themes.
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Sun className="h-4 w-4 text-muted-foreground" />
                                    <Switch
                                        id="theme-mode"
                                        checked={isDark}
                                        onCheckedChange={toggleTheme}
                                    />
                                    <Moon className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>

                            {/* Theme Color Selection */}
                            <div className="space-y-3 text-left">
                                <Label className="text-base">Theme Color</Label>
                                <p className="text-sm text-muted-foreground mb-3">
                                    Select your preferred color scheme.
                                </p>
                                <div className="flex gap-4">
                                    <ThemeOption
                                        color="navy"
                                        active={themeColor === "navy"}
                                        onClick={() => setThemeColor("navy")}
                                        className="bg-slate-900"
                                    />
                                    <ThemeOption
                                        color="purple"
                                        active={themeColor === "purple"}
                                        onClick={() => setThemeColor("purple")}
                                        className="bg-purple-600"
                                    />
                                    <ThemeOption
                                        color="green"
                                        active={themeColor === "green"}
                                        onClick={() => setThemeColor("green")}
                                        className="bg-green-600"
                                    />
                                    <ThemeOption
                                        color="blue"
                                        active={themeColor === "blue"}
                                        onClick={() => setThemeColor("blue")}
                                        className="bg-blue-600"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </TooltipProvider>
    );
}

function ThemeOption({
    color,
    active,
    onClick,
    className,
}: {
    color: string;
    active: boolean;
    onClick: () => void;
    className: string;
}) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    onClick={onClick}
                    className={cn(
                        "h-12 w-12 rounded-full flex items-center justify-center transition-all ring-offset-background hover:ring-2 hover:ring-ring hover:ring-offset-2",
                        active && "ring-2 ring-ring ring-offset-2",
                        className
                    )}
                    aria-label={`Select ${color} theme`}
                >
                    {active && <Check className="h-6 w-6 text-white" />}
                </button>
            </TooltipTrigger>
            <TooltipContent>
                <p className="capitalize">{color}</p>
            </TooltipContent>
        </Tooltip>
    );
}

