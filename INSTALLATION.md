# Quantum Library Installation Guide

## Why Dependencies Are Not Included

The Quantum library is designed as a workspace library for monorepos. To prevent multiple React versions and ensure consistent dependency resolution across the entire monorepo, **all runtime dependencies are installed in the parent repository's root `package.json`** rather than in the quantum library itself.

### Benefits of This Approach

- **Single React Version**: Guarantees only one React instance across the entire monorepo
- **Consistent Versions**: All packages use the same dependency versions
- **No Version Conflicts**: Prevents peer dependency resolution issues
- **Better Performance**: Reduces bundle size and memory usage
- **Simpler Debugging**: Easier to troubleshoot when all packages share dependencies

## Installation Steps

### 1. Install Quantum Dependencies

From the root of your monorepo, run the installation script:

```bash
bash libs/shared/quantum/install-deps.sh
```

This will add all 68 quantum dependencies to your root `package.json`.

### 2. Ensure React 19 is Installed

The quantum library requires React 19 as a peer dependency:

```bash
pnpm add react@^19.0.0 react-dom@^19.0.0
```

### 3. Install All Dependencies

Run pnpm install to resolve and install all dependencies:

```bash
pnpm install
```

### 4. Verify Installation

Check that only one React version exists:

```bash
grep -A 1 '"react":' pnpm-lock.yaml | head -n 2
```

You should only see React 19.x versions, no React 18.x.

## Required Peer Dependencies

- React: ^19.0.0
- React DOM: ^19.0.0

## Included Dependencies

The quantum library depends on the following packages (68 total):

### UI Component Libraries
- **Radix UI** (30 packages): Complete set of accessible UI primitives
- **DnD Kit**: Drag-and-drop functionality
- **Recharts**: Charting library

### Form & Authentication
- **react-hook-form**: Form management
- **@hookform/resolvers**: Form validation
- **react-oidc-context**: OIDC authentication
- **oidc-client-ts**: OIDC client library

### UI Utilities
- class-variance-authority
- clsx
- cmdk
- next-themes
- sonner
- vaul
- embla-carousel-react
- input-otp
- react-day-picker
- react-error-boundary
- react-resizable-panels

### Other
- jsonpath

## Troubleshooting

### Error: "Invalid hook call"

If you see this error, it means multiple React versions are installed. Run:

```bash
# Delete all node_modules
rm -rf node_modules libs/*/node_modules apps/*/node_modules

# Delete lock file
rm pnpm-lock.yaml

# Reinstall
pnpm install
```

### Error: "Cannot read properties of null (reading 'useState')"

This is also caused by multiple React instances. Follow the steps above to clean and reinstall dependencies.

### Checking for Multiple React Versions

Search the lock file for all React versions:

```bash
grep '"react":' pnpm-lock.yaml
```

You should only see React 19.x entries.

## For Quantum Library Developers

If you need to add a new dependency to the quantum library:

1. Add it to the `install-deps.sh` script
2. Update this documentation
3. Notify consumers to run the installation script again
4. DO NOT add it to quantum's `package.json` dependencies

The quantum library's `package.json` should only contain:
- `peerDependencies`: React and React DOM
- `devDependencies`: Build-time dependencies (TypeScript types, Tailwind, etc.)
