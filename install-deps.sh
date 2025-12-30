#!/bin/bash
# Install all quantum library dependencies to the parent repository
# This script should be run from the root of the parent monorepo

echo "Installing quantum library dependencies to root package.json..."
echo ""

pnpm add -w \
  @dnd-kit/core@^6.3.1 \
  @dnd-kit/sortable@^10.0.0 \
  @dnd-kit/utilities@^3.2.2 \
  @hookform/resolvers@^3.10.0 \
  @radix-ui/react-accordion@^1.2.0 \
  @radix-ui/react-alert-dialog@^1.1.1 \
  @radix-ui/react-aspect-ratio@^1.1.0 \
  @radix-ui/react-avatar@^1.1.0 \
  @radix-ui/react-checkbox@^1.1.1 \
  @radix-ui/react-collapsible@^1.1.0 \
  @radix-ui/react-context-menu@^2.2.1 \
  @radix-ui/react-dialog@^1.1.1 \
  @radix-ui/react-dropdown-menu@^2.1.1 \
  @radix-ui/react-hover-card@^1.1.1 \
  @radix-ui/react-icons@^1.3.0 \
  @radix-ui/react-label@^2.1.0 \
  @radix-ui/react-menubar@^1.1.1 \
  @radix-ui/react-navigation-menu@^1.2.0 \
  @radix-ui/react-popover@^1.1.1 \
  @radix-ui/react-progress@^1.1.0 \
  @radix-ui/react-radio-group@^1.2.0 \
  @radix-ui/react-scroll-area@^1.1.0 \
  @radix-ui/react-select@^2.1.1 \
  @radix-ui/react-separator@^1.1.0 \
  @radix-ui/react-slider@^1.2.0 \
  @radix-ui/react-slot@^1.1.0 \
  @radix-ui/react-switch@^1.1.0 \
  @radix-ui/react-tabs@^1.1.0 \
  @radix-ui/react-toast@^1.2.1 \
  @radix-ui/react-toggle@^1.1.0 \
  @radix-ui/react-toggle-group@^1.1.0 \
  @radix-ui/react-tooltip@^1.1.2 \
  class-variance-authority@^0.7.0 \
  clsx@^2.1.1 \
  cmdk@^1.0.0 \
  embla-carousel-react@^8.3.0 \
  input-otp@^1.4.2 \
  jsonpath@^1.1.1 \
  next-themes@^0.3.0 \
  oidc-client-ts@^3.2.0 \
  react-day-picker@^8.10.1 \
  react-error-boundary@^5.0.0 \
  react-hook-form@^7.53.0 \
  react-oidc-context@^3.3.0 \
  react-resizable-panels@^2.1.3 \
  recharts@^2.12.7 \
  sonner@^1.5.0 \
  vaul@^1.0.0

echo ""
echo "✓ Quantum library dependencies installed successfully!"
echo ""
echo "Next steps:"
echo "  1. Update libs/shared/quantum/package.json to remove dependencies"
echo "  2. Run 'pnpm install' to resolve dependencies"
echo "  3. Verify application works correctly"
