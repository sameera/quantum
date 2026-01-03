# Quantum

**An opinionated starter kit for building workspace-based React applications**

Quantum provides everything you need to build modern, multi-workspace applications like Notion, Linear, or any Life OS. It includes enterprise authentication (OIDC), workspace routing, a complete UI component library, and responsive layouts out of the box.

## What is a Workspace?

A workspace is a self-contained area of your application with its own routing, UI, and functionality. Think of Notion's different pages, Linear's projects, or VS Code's activity bar items. Quantum makes workspaces first-class citizens in your app architecture.

## Tech Stack

-   **React 19** with TypeScript
-   **React Hook Form** - Form state and validation
-   **React Router v6** - Routing with auth guards
-   **Radix UI + shadcn/ui** - 25+ accessible component primitives
-   **Tailwind CSS** - Utility-first styling
-   **OIDC** - Enterprise authentication (Keycloak, Auth0, Okta compatible)
-   **recharts** - Chart and data visualization library
-   **cmdk** - Command palette component
-   **dnd-kit** - Drag and drop functionality

---

## Getting Started

### Step 1: Set Up Your Environment

Create a `.env` file in your app root with the required OIDC configuration:

```bash
# OIDC Authentication (Required)
VITE_OIDC_AUTHORITY=https://your-auth-server.com
VITE_OIDC_CLIENT_ID=your-client-id
VITE_OIDC_REDIRECT_URI=http://localhost:4200/login/callback

# API Configuration (Required)
VITE_API_BASE_URL=https://your-api.com

# OIDC Configuration (Optional - with defaults)
VITE_OIDC_POST_LOGOUT_REDIRECT_URI=http://localhost:4200
VITE_OIDC_RESPONSE_TYPE=code
VITE_OIDC_SCOPE=openid profile email

# Application Metadata (Optional)
VITE_APP_NAME=My Quantum App
VITE_APP_VERSION=1.0.0

# Workspace Lifecycle (Optional)
VITE_WORKSPACE_LIFECYCLE_TIMEOUT_MS=10000
```

### Step 2: Create Your App Entry Point

In your main app (e.g., `apps/myapp/src/main.tsx`):

```tsx
import { StrictMode } from "react";
import * as ReactDOM from "react-dom/client";
import App from "./app/app";

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
);

root.render(
    <StrictMode>
        <App />
    </StrictMode>
);
```

### Step 3: Set Up Quantum with Your Workspaces

In your `app/app.tsx`:

```tsx
import QuantumApp from "@sameera/quantum/quantum-app";
import "@sameera/quantum/themes";

import { workspaces } from "./workspaces";

export function App() {
    return <QuantumApp workspaces={workspaces} />;
}

export default App;
```

### Step 4: Define Your Workspaces

Create `app/workspaces.ts`:

```tsx
import { lazy } from "react";
import { MdOutlineTaskAlt } from "react-icons/md";
import { GiSummits } from "react-icons/gi";
import type { RuntimeWorkspace } from "@sameera/quantum/workspaces";

export const workspaces: RuntimeWorkspace[] = [
    {
        id: "tasks",
        name: "Tasks",
        icon: MdOutlineTaskAlt,
        isDefault: true, // This workspace loads by default
        router: lazy(() => import("@myorg/tasks/routes")),
    },
    {
        id: "overview",
        name: "Overview",
        icon: GiSummits,
        router: lazy(() => import("./workspaces/overview")),
    },
];
```

### Step 5: Create Your First Workspace

Create a workspace library (e.g., `libs/tasks/`):

**`libs/tasks/src/routes.tsx`**:

```tsx
import { Routes, Route } from "react-router-dom";
import { TasksLayout } from "./layout";
import { TasksList } from "./pages/tasks-list";
import { TaskDetail } from "./pages/task-detail";

export default function TasksRoutes() {
    return (
        <Routes>
            <Route path="/" element={<TasksLayout />}>
                <Route index element={<TasksList />} />
                <Route path=":taskId" element={<TaskDetail />} />
            </Route>
        </Routes>
    );
}
```

**`libs/tasks/src/layout.tsx`**:

```tsx
import { Outlet } from "react-router-dom";

export function TasksLayout() {
    return (
        <div className="flex-1 flex flex-col">
            <header className="border-b p-4">
                <h1 className="text-2xl font-bold">Tasks</h1>
            </header>
            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
}
```

### Step 6: Run Your App

```bash
npx nx dev myapp
```

Visit `http://localhost:4200` - you should see your workspace application with authentication!

---

## Key Concepts

### Workspace Configuration

Each workspace can have:

```typescript
interface RuntimeWorkspace {
    id: string; // Unique identifier
    name: string; // Display name
    icon: IconType; // React icon component
    isDefault?: boolean; // Load this workspace by default
    isPublic?: boolean; // Skip auth for this workspace
    router?: ReturnType<typeof lazy>; // Lazy-loaded routes
    menu?: React.ReactNode; // Custom menu items
}
```

### Configuration

Quantum uses a centralized configuration system via `quantum.config.ts`. You can customize or override the default configuration:

```typescript
import {
    createQuantumConfig,
    type QuantumConfig,
} from "@sameera/quantum/config";

// Use the default config (reads from environment variables)
export const quantumConfig = createQuantumConfig();

// Or create a custom configuration
export const customConfig: QuantumConfig = {
    auth: {
        authority: "https://your-auth-server.com",
        clientId: "your-client-id",
        redirectUri: "http://localhost:4200/login/callback",
        postLogoutRedirectUri: "http://localhost:4200",
        responseType: "code",
        scope: "openid profile email",
    },
    api: {
        baseUrl: "https://api.example.com",
    },
    app: {
        name: "My App",
        version: "1.0.0",
    },
};
```

**Configuration Structure:**

-   **auth**: OIDC authentication settings

    -   `authority` - Your OIDC provider URL
    -   `clientId` - OAuth client identifier
    -   `redirectUri` - Where users return after login
    -   `postLogoutRedirectUri` - Where users go after logout (optional)
    -   `responseType` - OAuth flow type (default: 'code')
    -   `scope` - OAuth scopes (default: 'openid profile email')

-   **api**: API endpoint configuration

    -   `baseUrl` - Your backend API base URL

-   **app**: Application metadata
    -   `name` - Application name (default: 'Quantum App')
    -   `version` - Application version (optional)

### Authentication

Quantum uses OIDC for authentication. By default:

-   All workspaces require authentication
-   Set `isPublic: true` to make a workspace accessible without login
-   Auth tokens are accessible via the `useAuthUser()` hook for API calls

### State Management

Quantum provides workspace state management through React context. Access workspace state:

```tsx
import { useWorkspace } from "@sameera/quantum/workspaces";

function MyComponent() {
    const { activeWorkspace, setActiveWorkspace } = useWorkspace();

    // Switch to a different workspace
    const handleSwitchWorkspace = () => {
        setActiveWorkspace("overview");
    };

    return (
        <div>
            <p>Current: {activeWorkspace?.name}</p>
            <button onClick={handleSwitchWorkspace}>Switch to Overview</button>
        </div>
    );
}
```

### Workspace Lifecycle Hooks

Quantum provides a powerful lifecycle system for workspaces, allowing you to run code when workspaces activate or deactivate. This is useful for data prefetching, cleanup, analytics, and more.

#### Lifecycle Events

Four lifecycle events are available:

-   **beforeActivate** - Before workspace becomes active (useful for initialization and analytics)
-   **afterActivate** - After workspace has become active (useful for tracking)
-   **beforeDeactivate** - Before workspace becomes inactive (useful for saving state)
-   **afterDeactivate** - After workspace has become inactive (useful for cleanup)

#### Registering Lifecycle Handlers

Add a `lifecycle` property to your workspace configuration:

```tsx
import { lazy } from "react";
import type { RuntimeWorkspace } from "@sameera/quantum/workspaces";
import { MdTask } from "react-icons/md";

export const tasksWorkspace: RuntimeWorkspace = {
    id: "tasks",
    name: "Tasks",
    icon: MdTask,
    router: lazy(() => import("./routes")),
    lifecycle: {
        beforeActivate: () =>
            import("./lifecycle").then((m) => m.beforeActivate),
        afterDeactivate: () =>
            import("./lifecycle").then((m) => m.afterDeactivate),
    },
};
```

#### Implementing Lifecycle Handlers

Create a `lifecycle.ts` file in your workspace:

```tsx
import type { LifecycleHandler } from "@sameera/quantum/workspaces/lifecycle";

export const beforeActivate: LifecycleHandler = async (context) => {
    // Initialize workspace before it activates
    console.log(`Activating ${context.workspace.name}`);

    // Check if navigation was cancelled
    if (context.signal.aborted) return;

    // Perform initialization tasks
    // e.g., tracking, preloading resources, etc.
};

export const afterDeactivate: LifecycleHandler = (context) => {
    // Clean up when leaving the workspace
    console.log(`Deactivating ${context.workspace.name}`);

    // Perform cleanup tasks
    // e.g., save state, clear timers, etc.
};
```

#### Lifecycle Context

Each handler receives a context object with:

-   `workspace` - The workspace being activated/deactivated
-   `previousWorkspace` - The previous workspace (for activate events)
-   `nextWorkspace` - The next workspace (for deactivate events)
-   `trigger` - How navigation was triggered ('navigation' or 'programmatic')
-   `timestamp` - When the event was fired
-   `signal` - AbortSignal for cancellation support

### Using UI Components

Quantum includes 50+ shadcn/ui components:

```tsx
import { Button } from "@sameera/quantum/components/button";
import {
    Card,
    CardHeader,
    CardContent,
} from "@sameera/quantum/components/card";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
} from "@sameera/quantum/components/dialog";

function MyFeature() {
    return (
        <Card>
            <CardHeader>
                <h2>My Feature</h2>
            </CardHeader>
            <CardContent>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>Open Dialog</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <p>Dialog content here</p>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
```

### Advanced Components

Quantum includes specialized components for complex UI patterns:

#### Charts and Data Visualization

Built on recharts for powerful data visualization:

```tsx
import {
    Card,
    CardHeader,
    CardContent,
} from "@sameera/quantum/components/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@sameera/quantum/components/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

function AnalyticsDashboard() {
    const data = [
        { month: "Jan", tasks: 65 },
        { month: "Feb", tasks: 78 },
        { month: "Mar", tasks: 90 },
    ];

    return (
        <Card>
            <CardHeader>Task Completion Trend</CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                            type="monotone"
                            dataKey="tasks"
                            stroke="#8884d8"
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
```

#### Kanban Board

Drag-and-drop kanban boards with dnd-kit:

```tsx
import { KanbanBoard } from '@sameera/quantum/components/kanban-board';

function TaskBoard() {
  const columns = [
    { id: 'todo', title: 'To Do', items: [...] },
    { id: 'in-progress', title: 'In Progress', items: [...] },
    { id: 'done', title: 'Done', items: [...] },
  ];

  const handleDragEnd = (result) => {
    // Handle item moved between columns
  };

  return <KanbanBoard columns={columns} onDragEnd={handleDragEnd} />;
}
```

#### Command Palette

Keyboard-driven command menu with cmdk:

```tsx
import {
    CommandDialog,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
} from "@sameera/quantum/components/command";

function GlobalCommandPalette() {
    const [open, setOpen] = React.useState(false);

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Suggestions">
                    <CommandItem>Create Task</CommandItem>
                    <CommandItem>View Calendar</CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
```

#### Date Picker

Date selection with react-day-picker:

```tsx
import { Calendar } from "@sameera/quantum/components/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@sameera/quantum/components/popover";
import { Button } from "@sameera/quantum/components/button";

function DatePickerDemo() {
    const [date, setDate] = React.useState<Date>();

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline">
                    {date ? format(date, "PPP") : "Pick a date"}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} />
            </PopoverContent>
        </Popover>
    );
}
```

#### Carousel

Image and content carousels with embla-carousel:

```tsx
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
} from "@sameera/quantum/components/carousel";
import { Card, CardContent } from "@sameera/quantum/components/card";

function ImageGallery() {
    const images = ["/img1.jpg", "/img2.jpg", "/img3.jpg"];

    return (
        <Carousel className="w-full max-w-xs">
            <CarouselContent>
                {images.map((img, index) => (
                    <CarouselItem key={index}>
                        <Card>
                            <CardContent className="flex aspect-square items-center justify-center p-6">
                                <img src={img} alt={`Slide ${index + 1}`} />
                            </CardContent>
                        </Card>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
    );
}
```

#### Toast Notifications

Beautiful toast notifications with sonner:

```tsx
import { toast } from "sonner";
import { Button } from "@sameera/quantum/components/button";

function NotificationDemo() {
    return (
        <Button onClick={() => toast.success("Task completed successfully!")}>
            Show Toast
        </Button>
    );
}

// In your root app component, add the Toaster:
import { Toaster } from "@sameera/quantum/components/sonner";

function App() {
    return (
        <>
            <QuantumApp workspaces={workspaces} />
            <Toaster />
        </>
    );
}
```

#### Resizable Panels

Create resizable layouts with react-resizable-panels:

```tsx
import {
    ResizablePanelGroup,
    ResizablePanel,
    ResizableHandle,
} from "@sameera/quantum/components/resizable";

function SplitLayout() {
    return (
        <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={25}>
                <div>Sidebar</div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={75}>
                <div>Main Content</div>
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}
```

#### Form Components

Integrated with React Hook Form for powerful form handling:

```tsx
import { useForm } from "react-hook-form";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@sameera/quantum/components/form";
import { Input } from "@sameera/quantum/components/input";
import { Button } from "@sameera/quantum/components/button";

function LoginForm() {
    const form = useForm({
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = (data) => {
        console.log(data);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="email@example.com"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Submit</Button>
            </form>
        </Form>
    );
}
```

---

## Customization

### Theming

Quantum uses Tailwind CSS. Customize your theme in `tailwind.config.js`:

```js
module.exports = {
    theme: {
        extend: {
            colors: {
                primary: {
                    // Your custom colors
                },
            },
        },
    },
};
```

### Custom Auth Provider

To use a different auth provider, modify `libs/shared/quantum/src/auth/auth-service.ts`:

```typescript
const oidcConfig = {
    authority: import.meta.env.VITE_OIDC_AUTHORITY,
    client_id: import.meta.env.VITE_OIDC_CLIENT_ID,
    // ... customize as needed
};
```

### Custom Layout

Override the default layout by passing a custom component:

```tsx
<QuantumApp
    workspaces={workspaces}
    MainPage={MyCustomLayout}
    LoginPage={MyCustomLoginPage}
/>
```

---

## Project Structure

```
libs/shared/quantum/
├── src/
│   ├── auth/              # Authentication logic (OIDC)
│   ├── components/        # 60+ UI components (shadcn/ui)
│   ├── config/            # Configuration management
│   ├── layout/            # App frame, workspace bar, theme
│   ├── model/             # Data models (user, aspects, metadata)
│   ├── pages/             # Login, logout, settings pages
│   ├── utils/             # Utilities (atom-storage, logging, hash)
│   ├── workspaces/        # Workspace state & routing
│   │   └── lifecycle/     # Workspace lifecycle event system
│   ├── quantum-app.tsx    # Main Quantum app component
│   ├── styles.ts/.css     # Global styles and theming
│   └── index.ts           # Public API
```

---

## Examples

The examples above show common patterns for workspace implementation including:

-   Workspace-specific routing and layouts
-   Component library integration
-   Authentication and protected routes
-   Lifecycle hooks for initialization and cleanup

These are example patterns you can follow when creating your own workspace libraries (e.g., `@myorg/tasks`, `@myorg/dashboard`).

---

## Running Tests

```bash
npx nx test quantum
```

---

## Next Steps

1. **Review the code review**: See [code-review.md](./code-review.md) for architectural insights
2. **Create your first workspace**: Follow the pattern in `libs/tasks/`
3. **Customize the theme**: Update Tailwind config and component styles
4. **Add workspace features**: Explore lifecycle hooks and permissions (coming soon)

---

## Philosophy

Quantum is opinionated because **opinions accelerate development**. We've made choices about:

-   Authentication (OIDC via oidc-client-ts)
-   Form state (React Hook Form)
-   UI components (Radix UI + shadcn/ui)
-   Routing (React Router v6)
-   Styling (Tailwind CSS)

If you disagree with these choices, Quantum might not be for you - and that's okay! But if you embrace them, you'll have a production-ready workspace app in hours, not weeks.

---

## License

Apache 2.0
