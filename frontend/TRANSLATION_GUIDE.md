# Translation Guide for Daleel Balady

## Overview
This guide explains how Arabic and English translations are implemented in the Daleel Balady application.

## Setup
The application uses `react-i18next` for internationalization with Arabic as the default language.

### Key Files
- `/src/lib/i18n.ts` - i18n configuration
- `/src/locales/ar.json` - Arabic translations
- `/src/locales/en.json` - English translations
- `/src/components/LanguageSwitcher.tsx` - Language switching component

## Features

### 1. Automatic Language Detection
The app remembers the user's language preference in localStorage and applies it on load.

### 2. RTL Support
When Arabic is selected, the entire document switches to RTL (Right-to-Left) layout.

### 3. Language Switcher
A dropdown menu in the dashboard allows users to switch between Arabic and English.

## Usage in Components

### Basic Usage
```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('dashboard.provider.servicesPage.title')}</h1>
    </div>
  );
}
```

### With Interpolation
```tsx
// In translation file:
"welcome": "Welcome back, {name}!"

// In component:
<p>{t('dashboard.provider.welcome', { name: user.name })}</p>
```

### With Default Values
```tsx
{t('common.currency', { defaultValue: 'EGP' })}
```

## Translation Key Structure

The translation keys follow a hierarchical structure:

```
dashboard
  ├── provider
  │   ├── servicesPage
  │   │   ├── title
  │   │   ├── description
  │   │   ├── categories
  │   │   │   ├── cleaning
  │   │   │   ├── maintenance
  │   │   │   └── ...
  │   │   └── days
  │   │       ├── monday
  │   │       ├── tuesday
  │   │       └── ...
  │   ├── bookings
  │   └── ...
  ├── services
  ├── products
  └── ...
```

## Provider Dashboard Translations

### Service Page Keys
- `dashboard.provider.servicesPage.title` - Page title
- `dashboard.provider.servicesPage.description` - Page description
- `dashboard.provider.servicesPage.addNewService` - Add service button
- `dashboard.provider.servicesPage.categories.*` - Service categories
- `dashboard.provider.servicesPage.days.*` - Days of the week

### Common Provider Keys
- `dashboard.provider.welcome` - Welcome message
- `dashboard.provider.totalBookings` - Total bookings stat
- `dashboard.provider.active` - Active status
- `dashboard.provider.inactive` - Inactive status

## Testing Translations

### Quick Test
1. Open the dashboard
2. Use the language switcher in the top right
3. Verify all text changes to the selected language
4. Check that RTL layout is applied for Arabic

### Adding New Translations
1. Add the key to both `ar.json` and `en.json`
2. Use the key in your component with `t('your.key.here')`
3. Test both languages

## Common Issues & Solutions

### Issue: Translation not showing
**Solution:** Check that:
- The key exists in both language files
- You're using the correct key path
- The component has `useTranslation()` hook

### Issue: RTL layout not working
**Solution:** Ensure:
- Document direction is set: `document.documentElement.dir = 'rtl'`
- CSS supports RTL with appropriate margin/padding adjustments

### Issue: Language doesn't persist after refresh
**Solution:** Check:
- localStorage is working
- The i18n.ts file reads from localStorage on init

## Best Practices

1. **Always add translations for both languages** when adding new text
2. **Use nested keys** for organization (e.g., `dashboard.provider.servicesPage.title`)
3. **Provide default values** for dynamic content
4. **Test both languages** after adding new features
5. **Use interpolation** for dynamic values instead of concatenation

## Example: Adding a New Page

1. Create translation keys:
```json
// ar.json
"dashboard": {
  "newPage": {
    "title": "صفحة جديدة",
    "description": "وصف الصفحة الجديدة"
  }
}

// en.json
"dashboard": {
  "newPage": {
    "title": "New Page",
    "description": "New page description"
  }
}
```

2. Use in component:
```tsx
import { useTranslation } from 'react-i18next';

export function NewPage() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('dashboard.newPage.title')}</h1>
      <p>{t('dashboard.newPage.description')}</p>
    </div>
  );
}
```

## Support

For any issues with translations, check:
1. Browser console for errors
2. Network tab to ensure translation files are loading
3. React DevTools to verify the i18n context is available
