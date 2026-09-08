# Light Theme Implementation

## Overview

The Electricity Monitor application now supports both light and dark themes. The theme preference is persisted in localStorage and automatically applied when the user revisits the application.

## Files Added

### 1. **src/styles.css** (Updated)
- Added light theme CSS variables under `:root[data-theme="light"]`
- Light theme colors are complementary to the dark theme
- Smooth transitions between themes using `--motion-fast` duration

**Key Color Variables:**
- **Dark Theme (default):**
  - Background: `#0c0d0b`
  - Foreground: `#ecebe4`
  - Surface: `#121410`

- **Light Theme:**
  - Background: `#fafaf8`
  - Foreground: `#1a1a18`
  - Surface: `#f5f3f0`

### 2. **src/store/theme.ts** (New)
Zustand store for managing theme state with persistence.

**Exports:**
- `useTheme()` - Hook to access theme state and actions
- `theme` - Current theme ('light' or 'dark')
- `setTheme(theme)` - Set a specific theme
- `toggleTheme()` - Toggle between light and dark

**Features:**
- Persists theme preference to localStorage
- Automatically applies theme to DOM via `data-theme` attribute
- Restores theme preference on page reload

### 3. **src/components/theme-provider.tsx** (New)
React component that initializes the theme system.

**Features:**
- Rehydrates theme from localStorage on app mount
- Wraps the application to ensure theme is ready

### 4. **src/components/theme-toggle.tsx** (New)
Button component for users to toggle between themes.

**Features:**
- Displays Sun icon in dark mode, Moon icon in light mode
- Accessible with proper ARIA labels
- Uses existing UI Button component
- Smooth icon transitions

### 5. **src/routes/__root.tsx** (Updated)
- Integrated ThemeProvider into the root layout
- Wraps AuthProvider and other components with theme initialization

## Usage

### For End Users

Click the theme toggle button (Sun/Moon icon) in your application interface to switch between light and dark themes. Your preference will be automatically saved and restored on your next visit.

### For Developers

#### Using the Theme Hook

```tsx
import { useTheme } from "@/store/theme";

function MyComponent() {
  const { theme, toggleTheme, setTheme } = useTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <button onClick={() => setTheme("light")}>Light Mode</button>
      <button onClick={() => setTheme("dark")}>Dark Mode</button>
    </div>
  );
}
```

#### Adding the Theme Toggle Button

```tsx
import { ThemeToggle } from "@/components/theme-toggle";

function Header() {
  return (
    <header>
      {/* ... other header content ... */}
      <ThemeToggle />
    </header>
  );
}
```

## How It Works

1. **Initialization:** When the app loads, the `ThemeProvider` rehydrates the theme preference from localStorage
2. **DOM Application:** The `useTheme` store applies the theme by setting the `data-theme="light"` attribute on the `<html>` element (or removing it for dark mode)
3. **CSS Variables:** Tailwind CSS uses CSS custom properties that change based on the `data-theme` attribute
4. **Persistence:** Every theme change is automatically saved to localStorage

## Theme Switching Flow

```
User clicks toggle button
    ↓
toggleTheme() called
    ↓
setTheme() updates state
    ↓
DOM attribute updated (data-theme)
    ↓
CSS variables update via :root[data-theme="light"]
    ↓
localStorage persisted
    ↓
Theme restored on page reload
```

## Adding New Themed Styles

To add new colors to the theme system:

1. Add CSS variables to both dark and light theme sections in `src/styles.css`:

```css
@theme {
  --color-custom: #your-dark-color;
}

:root[data-theme="light"] {
  --color-custom: #your-light-color;
}
```

2. Use the variable in your Tailwind classes or CSS:

```tsx
<div className="bg-[var(--color-custom)]">...</div>
```

## Browser Support

The light theme implementation uses:
- CSS Custom Properties (supported in all modern browsers)
- localStorage API (supported in all modern browsers)
- CSS color-mix() function (for border colors)

## Accessibility

- Theme toggle includes proper ARIA labels for screen readers
- Theme preference persists across sessions
- Smooth transitions respect `prefers-reduced-motion` media query
- High contrast ratios maintained in both themes

## Future Enhancements

Potential improvements for the theme system:
- System theme detection (respects OS dark/light mode preference)
- Theme customization options
- Additional theme variations (e.g., high contrast)
- Real-time theme switching for multiple open tabs
