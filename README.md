# Quantum

**An opinionated starter kit for building workspace-based React applications**

Quantum provides everything you need to build modern, multi-workspace applications like Notion, Linear, or any Life OS. It includes enterprise authentication (OIDC), workspace routing, a complete UI component library, and responsive layouts out of the box.

## What is a Workspace?

A workspace is a self-contained area of your application with its own routing, UI, and functionality. Think of Notion's different pages, Linear's projects, or VS Code's activity bar items. Quantum makes workspaces first-class citizens in your app architecture.

## Tech Stack

- **React 18** with TypeScript
- **Jotai** - Atomic state management
- **React Router v6** - Routing with auth guards
- **TanStack Query** - Server state management
- **Radix UI + shadcn/ui** - Accessible component primitives
- **Tailwind CSS** - Utility-first styling
- **OIDC** - Enterprise authentication (Keycloak, Auth0, Okta compatible)

---

## Getting Started

### Step 1: Set Up Your Environment

Create a `.env` file in your app root with the required OIDC configuration:

```bash
# OIDC Authentication
VITE_OIDC_AUTHORITY=https://your-auth-server.com
VITE_OIDC_CLIENT_ID=your-client-id
VITE_OIDC_REDIRECT_URI=http://localhost:4200/login/callback
VITE_OIDC_RESPONSE_TYPE=code
VITE_OIDC_SCOPE=openid profile email

# API Configuration
VITE_API_BASE_URL=https://your-api.com
```

### Step 2: Create Your App Entry Point

In your main app (e.g., `apps/myapp/src/main.tsx`):

```tsx
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './app/app';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
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
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@awzm/core/api';
import QuantumApp from '@sameera/quantum/quantum-app';
import '@sameera/quantum/themes';

import { workspaces } from './workspaces';

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <QuantumApp workspaces={workspaces} />
    </QueryClientProvider>
  );
}

export default App;
```

### Step 4: Define Your Workspaces

Create `app/workspaces.ts`:

```tsx
import { lazy } from 'react';
import { MdOutlineTaskAlt } from 'react-icons/md';
import { GiSummits } from 'react-icons/gi';
import type { RuntimeWorkspace } from '@sameera/quantum/workspaces';

export const workspaces: RuntimeWorkspace[] = [
  {
    id: 'tasks',
    name: 'Tasks',
    icon: MdOutlineTaskAlt,
    isDefault: true, // This workspace loads by default
    router: lazy(() => import('@myorg/tasks/routes')),
  },
  {
    id: 'overview',
    name: 'Overview',
    icon: GiSummits,
    router: lazy(() => import('./workspaces/overview')),
  },
];
```

### Step 5: Create Your First Workspace

Create a workspace library (e.g., `libs/tasks/`):

**`libs/tasks/src/routes.tsx`**:
```tsx
import { Routes, Route } from 'react-router-dom';
import { TasksLayout } from './layout';
import { TasksList } from './pages/tasks-list';
import { TaskDetail } from './pages/task-detail';

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
import { Outlet } from 'react-router-dom';

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
  id: string;                              // Unique identifier
  name: string;                            // Display name
  icon: IconType;                          // React icon component
  isDefault?: boolean;                     // Load this workspace by default
  isPublic?: boolean;                      // Skip auth for this workspace
  router?: ReturnType<typeof lazy>;        // Lazy-loaded routes
  menu?: React.ReactNode;                  // Custom menu items
}
```

### Authentication

Quantum uses OIDC for authentication. By default:
- All workspaces require authentication
- Set `isPublic: true` to make a workspace accessible without login
- Auth tokens are automatically injected into API calls via `RestClient`

### Using the REST Client

```tsx
import { useRestClient } from '@sameera/quantum/http/rest-client';

function MyComponent() {
  const client = useRestClient({ baseUrl: import.meta.env.VITE_API_BASE_URL });

  const { data } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => client.get('/api/tasks'),
  });

  return <div>{/* render data */}</div>;
}
```

### State Management

Quantum uses Jotai for state. Access workspace state:

```tsx
import { useAtom } from 'jotai';
import { activeWorkspace$ } from '@sameera/quantum/workspaces';

function MyComponent() {
  const [activeWorkspace, setActiveWorkspace] = useAtom(activeWorkspace$);

  // Switch to a different workspace
  setActiveWorkspace('overview');

  return <div>Current: {activeWorkspace?.name}</div>;
}
```

### Using UI Components

Quantum includes 50+ shadcn/ui components:

```tsx
import { Button } from '@sameera/quantum/components/button';
import { Card, CardHeader, CardContent } from '@sameera/quantum/components/card';
import { Dialog, DialogTrigger, DialogContent } from '@sameera/quantum/components/dialog';

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
│   ├── components/        # UI components (shadcn/ui)
│   ├── hooks/             # React hooks
│   ├── http/              # REST client
│   ├── layout/            # App frame, workspace bar
│   ├── pages/             # Login, settings pages
│   ├── workspaces/        # Workspace state & routing
│   └── index.ts           # Public API
```

---

## Examples

See the `@awzm/tasks` library for a complete workspace implementation including:
- CRUD operations
- TanStack Query integration
- Jotai state management
- Workspace-specific layouts

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
- Authentication (OIDC)
- State management (Jotai)
- UI components (Radix + shadcn)
- Routing (React Router v6)

If you disagree with these choices, Quantum might not be for you - and that's okay! But if you embrace them, you'll have a production-ready workspace app in hours, not weeks.

---

## License

[Your License Here]
