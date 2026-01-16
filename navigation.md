# Navigation & CTA Button Updates

## Objective
Update call-to-action buttons to use orange accent color (#f7941d) and improve navigation between pages.

## Color Reference
- **Orange CTA**: `#f7941d` (SECU accent orange for action buttons)
- **Orange Hover**: `#e5850f` (darker shade for hover state)

## Tasks

### 1. Add Orange Button Variant
**File**: `src/components/common/Button.tsx`

Add new `orange` variant to the button component:
```css
orange: 'bg-[#f7941d] text-white hover:bg-[#e5850f] shadow-sm hover:shadow-md'
```

### 2. Update "Explore Our Offerings" Button
**File**: `src/components/portal/NewProductSection.tsx`

Change the button from `variant="success"` to `variant="orange"`:
- Current: `<Button variant="success" onClick={handleExplore}>`
- Updated: `<Button variant="orange" onClick={handleExplore}>`

### 3. Update "Apply Now" Buttons on Products Page
**File**: `src/pages/ProductCatalog.tsx`

Change all Apply Now buttons from `variant="primary"` to `variant="orange"`:
- Current: `<Button variant="primary" className="w-full">`
- Updated: `<Button variant="orange" className="w-full">`

### 4. Add Back to Dashboard Link
**File**: `src/pages/ProductCatalog.tsx`

Add navigation link at the top of the page content:
```tsx
<Link to="/dashboard" className="...">
  ← Back to Dashboard
</Link>
```

## Files to Modify
| File | Change |
|------|--------|
| `src/components/common/Button.tsx` | Add `orange` variant |
| `src/components/portal/NewProductSection.tsx` | Use `orange` variant |
| `src/pages/ProductCatalog.tsx` | Use `orange` variant, add back link |
| `src/index.css` | Add orange color variable |
| `tailwind.config.js` | Add orange color config |

## Implementation Checklist
- [x] Add orange color to CSS variables and Tailwind config
- [x] Add orange variant to Button component
- [x] Update "Explore our offerings" button on dashboard
- [x] Update "Apply Now" buttons on products page
- [x] Add back to dashboard link on products page
- [ ] Test navigation flow
