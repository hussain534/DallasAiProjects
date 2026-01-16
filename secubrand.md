# SECU Branding Guide

Reference: https://www.ncsecu.org/loans/auto-loans

## Color Palette

### Primary Colors
| Color | Hex Code | Usage |
|-------|----------|-------|
| Navy Blue | `#003366` | Primary brand color, headers, banners, CTAs |
| White | `#FFFFFF` | Backgrounds, text on dark backgrounds |

### Secondary Colors
| Color | Hex Code | Usage |
|-------|----------|-------|
| Light Gray | `#F5F5F5` | Card backgrounds, section dividers |
| Dark Gray | `#333333` | Body text |
| Medium Gray | `#666666` | Secondary text, captions |

### Accent Colors
| Color | Hex Code | Usage |
|-------|----------|-------|
| Accent Blue | `#0066CC` | Links, interactive elements |
| Success Green | `#28A745` | Confirmation states |

## Typography

### Font Families
```css
/* Primary Font - Sans-serif for modern, clean look */
font-family: 'Open Sans', 'Helvetica Neue', Arial, sans-serif;

/* Headings may use */
font-family: 'Roboto', 'Arial', sans-serif;
```

### Font Weights
- **Bold (700)**: Headings, CTAs, important text
- **Semi-Bold (600)**: Subheadings, navigation
- **Regular (400)**: Body text, descriptions
- **Light (300)**: Large display text (optional)

### Font Sizes
| Element | Size | Line Height |
|---------|------|-------------|
| H1 | 32-40px | 1.2 |
| H2 | 24-28px | 1.3 |
| H3 | 20-22px | 1.4 |
| Body | 16px | 1.5 |
| Small | 14px | 1.5 |
| Caption | 12px | 1.4 |

## Button Styles

### Primary Button
```css
.btn-primary {
  background-color: #003366;
  color: #FFFFFF;
  padding: 12px 24px;
  border-radius: 4px;
  font-weight: 600;
  border: none;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: #002244;
}
```

### Secondary Button
```css
.btn-secondary {
  background-color: transparent;
  color: #003366;
  padding: 12px 24px;
  border-radius: 4px;
  font-weight: 600;
  border: 2px solid #003366;
  cursor: pointer;
}

.btn-secondary:hover {
  background-color: #003366;
  color: #FFFFFF;
}
```

## Design Patterns

### Card Components
- White background with subtle shadow
- Rounded corners (4-8px border-radius)
- Consistent padding (24px)
- Icon + heading + description layout

### Navigation
- Clean horizontal layout
- Icons paired with text labels
- Dropdown menus for sub-navigation
- Navy blue active/hover states

### Banners
- Navy blue background sections
- White text for contrast
- Curved/wave decorative shapes
- Strong calls-to-action

## CSS Variables Template

```css
:root {
  /* Primary Colors */
  --color-primary: #003366;
  --color-primary-dark: #002244;
  --color-primary-light: #004488;

  /* Neutral Colors */
  --color-white: #FFFFFF;
  --color-gray-100: #F5F5F5;
  --color-gray-300: #CCCCCC;
  --color-gray-600: #666666;
  --color-gray-900: #333333;

  /* Accent Colors */
  --color-accent: #0066CC;
  --color-success: #28A745;
  --color-warning: #FFC107;
  --color-error: #DC3545;

  /* Typography */
  --font-primary: 'Open Sans', 'Helvetica Neue', Arial, sans-serif;
  --font-heading: 'Roboto', Arial, sans-serif;

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 20px rgba(0, 0, 0, 0.15);
}
```

## Implementation Checklist

- [x] Import/configure font families (Google Fonts or self-hosted)
- [x] Set up CSS variables for colors
- [x] Create button component styles
- [x] Design card components
- [x] Build navigation with SECU-style patterns
- [x] Add banner sections with navy backgrounds
- [x] Implement responsive typography scale
- [ ] Test color contrast for accessibility (WCAG AA)

## Notes

- Verify exact hex codes using browser DevTools on the live site
- SECU uses a professional, trustworthy financial services aesthetic
- Prioritize accessibility with sufficient color contrast
- Maintain clean whitespace and organized layouts
