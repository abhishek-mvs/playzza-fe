# RainbowKit ConnectButton Customization Guide

This guide explains how to use the customized RainbowKit ConnectButton components in your prediction market DApp.

## Overview

We've created a custom `ConnectWallet` component that wraps RainbowKit's `ConnectButton` with additional styling and sizing options. This allows for consistent wallet connection UI across different parts of your application.

## Available Components

### 1. Main ConnectWallet Component

The main component with full customization options:

```tsx
import { ConnectWallet } from '@/components/ConnectButton';

<ConnectWallet 
  size="md"           // 'sm' | 'md' | 'lg'
  variant="default"   // 'default' | 'compact' | 'minimal'
  showBalance={true}  // Show/hide wallet balance
  showAvatar={true}   // Show/hide wallet avatar
  className="custom-class" // Additional CSS classes
/>
```

### 2. Preset Components

Pre-configured components for common use cases:

#### NavbarConnectButton
Perfect for navigation bars - compact, no balance display:
```tsx
import { NavbarConnectButton } from '@/components/ConnectButton';
<NavbarConnectButton />
```

#### HeroConnectButton
For hero sections and landing pages - large, full features:
```tsx
import { HeroConnectButton } from '@/components/ConnectButton';
<HeroConnectButton />
```

#### CardConnectButton
For cards and modals - medium size, no balance:
```tsx
import { CardConnectButton } from '@/components/ConnectButton';
<CardConnectButton />
```

#### MinimalConnectButton
For minimal UI - small, no avatar or balance:
```tsx
import { MinimalConnectButton } from '@/components/ConnectButton';
<MinimalConnectButton />
```

## Size Options

- **`sm`**: Small (32px height) - Good for compact spaces
- **`md`**: Medium (40px height) - Default size for most use cases
- **`lg`**: Large (48px height) - Prominent display for hero sections

## Variant Options

- **`default`**: Gradient blue-to-purple background with shadow effects
- **`compact`**: Dark gray background with subtle border
- **`minimal`**: Transparent background with white border

## Usage Examples

### In Navbar
```tsx
// Use the preset component
<NavbarConnectButton />

// Or customize manually
<ConnectWallet 
  size="sm" 
  variant="compact"
  showBalance={false}
  className="!min-w-fit"
/>
```

### In Hero Section
```tsx
// Use the preset component
<HeroConnectButton />

// Or customize manually
<ConnectWallet 
  size="lg"
  variant="default"
  showBalance={true}
  showAvatar={true}
  className="!mx-auto"
/>
```

### In Cards/Modals
```tsx
// Use the preset component
<CardConnectButton />

// Or customize manually
<ConnectWallet 
  size="md"
  variant="default"
  showBalance={false}
  showAvatar={true}
  className="!mx-auto"
/>
```

### Minimal UI
```tsx
// Use the preset component
<MinimalConnectButton />

// Or customize manually
<ConnectWallet 
  size="sm"
  variant="minimal"
  showBalance={false}
  showAvatar={false}
  className="!min-w-fit"
/>
```

## Styling Customization

### CSS Classes
The component uses Tailwind CSS with `!important` declarations to override RainbowKit's default styles. Key classes:

- `!font-semibold`: Bold font weight
- `!rounded-lg`: Rounded corners
- `!transition-all !duration-300`: Smooth transitions
- `!min-h-[32px/40px/48px]`: Minimum heights for different sizes

### Custom CSS
Additional styling is available in `globals.css`:

```css
/* RainbowKit Customization */
.rainbowkit-connect-button-wrapper {
  display: inline-flex;
  align-items: center;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .rainbowkit-connect-button-wrapper button {
    font-size: 0.875rem !important;
    padding: 0.5rem 0.75rem !important;
  }
}
```

## Features

### Responsive Design
- Automatically adjusts size on mobile devices
- Hides balance and some text on small screens
- Maintains functionality across all screen sizes

### Accessibility
- Proper ARIA labels and roles
- Keyboard navigation support
- Focus management for modals

### Network Support
- Shows network switching when on wrong network
- Displays network icons and names
- Handles unsupported networks gracefully

### Wallet Information
- Shows wallet address (truncated)
- Displays ENS names when available
- Shows wallet balance (optional)
- Displays wallet avatar (optional)

## Best Practices

1. **Use preset components** when possible for consistency
2. **Choose appropriate sizes** for the context (navbar = small, hero = large)
3. **Consider mobile** - some features hide on small screens
4. **Test network switching** - ensure your app handles network changes
5. **Handle loading states** - the component handles mounting states automatically

## Troubleshooting

### Button not showing
- Ensure RainbowKit provider is properly configured
- Check that wallet is available in browser
- Verify network configuration

### Styling issues
- Use `!important` classes for custom styling
- Check z-index for modal overlays
- Ensure proper CSS specificity

### Network issues
- Verify chain configuration in `wagmi-config.ts`
- Check that target network is supported
- Ensure proper RPC endpoints

## Migration from Basic ConnectButton

If you were using the basic RainbowKit ConnectButton:

```tsx
// Before
import { ConnectButton } from '@rainbow-me/rainbowkit';
<ConnectButton />

// After
import { ConnectWallet } from '@/components/ConnectButton';
<ConnectWallet size="md" variant="default" />
```

The new component provides the same functionality with better styling and more customization options. 