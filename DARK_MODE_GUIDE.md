# Dark Mode Implementation Guide

## Overview
Dark mode theme support telah diimplementasikan menggunakan:
- **Tailwind CSS** dark mode dengan class-based detection (`.dark` selector)
- **CSS Variables** untuk semantic color tokens
- **React Context** untuk global theme management
- **localStorage** untuk persistence theme preference

---

## Architecture

### 1. Theme Provider (`src/components/providers/ThemeProvider.tsx`)
Komponen context provider yang mengelola theme state global.

**Fitur:**
- Membaca preference dari localStorage
- Fallback ke system preference (`prefers-color-scheme`)
- Menerapkan `dark` class ke `<html>` element
- Menyediakan `useTheme()` hook untuk komponen

**API:**
```typescript
{
  theme: "light" | "dark",
  setTheme: (theme: "light" | "dark") => void,
  toggleTheme: () => void
}
```

### 2. CSS Variables (`src/app/globals.css`)

**Light Mode (`:root`):**
- `--background`: white (oklch(1 0 0))
- `--foreground`: near-black (oklch(0.145 0 0))
- `--primary`: dark blue (oklch(0.205 0 0))
- `--card`: white
- `--sidebar`: white
- ... dan banyak lagi

**Dark Mode (`.dark` selector):**
- `--background`: near-black (oklch(0.145 0 0))
- `--foreground`: white (oklch(0.985 0 0))
- `--primary`: light blue (oklch(0.922 0 0))
- `--card`: dark gray (oklch(0.205 0 0))
- `--sidebar`: dark gray
- ... dan banyak lagi

### 3. Component Integration (`src/components/Provider.tsx`)

Struktur provider hierarchy:
```
<ThemeProvider>
  <WorkspaceProvider>
    {children}
  </WorkspaceProvider>
</ThemeProvider>
```

---

## Semantic Token Usage

### Available Semantic Tokens

| Token | Usage |
|-------|-------|
| `bg-background` | Page/container background |
| `text-foreground` | Primary text color |
| `bg-card` | Card container background |
| `text-card-foreground` | Card text color |
| `bg-sidebar` | Sidebar background |
| `text-sidebar-foreground` | Sidebar text |
| `text-muted-foreground` | Secondary/muted text |
| `bg-muted` | Muted background |
| `bg-primary` | Primary action button |
| `text-primary-foreground` | Primary button text |
| `text-destructive` | Destructive/error text |
| `border-border` | Border color |
| `bg-input` | Input background |

### Badge Classes (Already Support Dark Mode)

- `.status-on-board`, `.status-on-progress`, `.status-pending`, `.status-canceled`, `.status-done`
- `.badge-low`, `.badge-normal`, `.badge-high`, `.badge-urgent`, `.badge-critical`, `.badge-tbd`
- `.division-frontend`, `.division-backend`, `.division-fullstack`, `.division-ui-ux`, `.division-product`, `.division-project-management`, `.division-qa`, `.division-devops`

---

## Usage Examples

### Using useTheme Hook
```typescript
"use client";

import { useTheme } from "@/components/providers/ThemeProvider";

export function SettingsPage() {
  const { theme, toggleTheme, setTheme } = useTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle</button>
      <button onClick={() => setTheme("dark")}>Dark</button>
    </div>
  );
}
```

### Using Semantic Classes
```tsx
// Automatically responds to theme changes
<div className="bg-background text-foreground">
  <div className="bg-card text-card-foreground p-4 rounded-lg">
    <h1>My Card</h1>
  </div>
  <aside className="bg-sidebar text-sidebar-foreground">
    <p className="text-muted-foreground">Sidebar content</p>
  </aside>
</div>
```

### Dark Mode Variants
```tsx
// For specific dark mode only styling
<div className="bg-slate-100 dark:bg-slate-900">
  Content
</div>

// Using semantic tokens (preferred)
<div className="bg-background">
  Automatically light or dark based on theme
</div>
```

---

## Migration Guide

If you have components with hardcoded colors:

### Before
```tsx
<div className="bg-white text-slate-900 border-slate-200">
  <h1 className="text-slate-900">Title</h1>
  <p className="text-slate-600">Subtitle</p>
</div>
```

### After
```tsx
<div className="bg-card text-card-foreground border-border">
  <h1 className="text-foreground font-bold">Title</h1>
  <p className="text-muted-foreground">Subtitle</p>
</div>
```

---

## Components Already Updated

✅ **Layout Components:**
- `src/components/layout/admin/Sidebar.tsx`
- `src/components/layout/admin/Header.tsx`
- `src/components/layout/member/*` (similar updates)

✅ **Settings Pages:**
- `src/components/Settings/Profile.tsx`
- `src/components/Settings/MemberProfile.tsx`

✅ **Global Styles:**
- `src/app/globals.css` (CSS variables + component classes)
- `src/app/layout.tsx` (ThemeProvider integrated)

---

## Remaining Components to Update

For complete dark mode support, update these components to use semantic tokens instead of hardcoded colors:

- `src/components/shared/*`
- `src/components/modals/*`
- `src/components/task/*`
- `src/components/project/*`
- `src/components/ui/*` (shadcn/ui components - check if already configured)

---

## Browser Behavior

1. **First Visit:** Uses system preference (`prefers-color-scheme`)
2. **After Toggle:** Saves to localStorage and applies to `<html>` element
3. **Refresh:** Restores from localStorage
4. **CSS Applies:** Tailwind picks up `.dark` class on `<html>` element

---

## Troubleshooting

### Theme Not Applying?
1. Ensure component imports `useTheme` from `@/components/providers/ThemeProvider`
2. Check that ThemeProvider wraps your component (it's in root Provider.tsx)
3. Verify you're using semantic tokens or `dark:` variants

### Elements Still Light in Dark Mode?
- Replace hardcoded colors with semantic tokens
- Example: `text-slate-700` → `text-foreground`

### Switch Not Working?
1. Ensure `ThemeProvider` is at root level (it is, in Provider.tsx)
2. Check component has `onCheckedChange={toggleTheme}`
3. Verify component imports `useTheme` correctly

---

## Testing Dark Mode

1. Open Settings page
2. Toggle "Dark Mode" switch
3. Verify all UI changes to dark colors
4. Refresh page - theme should persist
5. Check System → Display Settings → switch OS dark mode
6. On first visit without localStorage set, should follow OS preference

---

## CSS Variable Reference

### Oklch Color Values Explained

Using `oklch()` color space instead of traditional hex/rgb:
- `oklch(1 0 0)` = Pure white
- `oklch(0.145 0 0)` = Near-black (#1e293b-like)
- `oklch(0.205 0 0)` = Dark gray (#0f172a-like)

Benefits:
- Perceptually uniform (consistent brightness across hues)
- Better color contrast in dark mode
- More maintainable theme system

---

## Next Steps

1. **Component Migration:** Update remaining components to use semantic tokens
2. **Test Coverage:** Test theme switching on all pages
3. **Accessibility:** Verify color contrast meets WCAG standards in both modes
4. **User Testing:** Get feedback on dark mode appearance

---

## Files Modified

- ✅ `src/components/providers/ThemeProvider.tsx` (NEW)
- ✅ `src/components/Provider.tsx` (UPDATED - added ThemeProvider)
- ✅ `src/app/globals.css` (UPDATED - added dark mode variants for badges)
- ✅ `src/components/layout/admin/Sidebar.tsx` (UPDATED - semantic tokens)
- ✅ `src/components/layout/admin/Header.tsx` (UPDATED - semantic tokens)
- ✅ `src/components/Settings/Profile.tsx` (UPDATED - semantic tokens + dark mode toggle)
- ✅ `src/components/Settings/MemberProfile.tsx` (UPDATED - semantic tokens + dark mode toggle)

---

Last Updated: November 18, 2025
