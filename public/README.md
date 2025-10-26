# Static Assets

## Current Files
- ✅ `favicon.ico` - Main favicon (4.2KB)
- ✅ `logo.svg` - Main vector logo (394KB)

## Usage in Components
- **LoginForm**: Logo displayed in login card
- **Dashboard**: Logo displayed in header
- **Favicon**: Automatically loaded in browser tab

## Usage in Code
```jsx
// For logos in components
import logo from '/logo.svg'  // From public folder
// or
import logo from '../assets/images/logo.svg'  // From src/assets

// Favicon is automatically loaded from public/favicon.ico
```

## Recommended Sizes
- **Favicon**: 16x16, 32x32, 48x48 (ICO format)
- **Logo**: 200x50px or similar ratio
- **Apple Touch Icon**: 180x180px
