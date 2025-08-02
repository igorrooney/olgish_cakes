# Accessibility Guidelines for Olgish Cakes

## Overview

This document outlines accessibility standards and best practices for the Olgish Cakes website to ensure it's usable by people with disabilities.

## Key Accessibility Standards

### 1. Button Accessibility

All buttons must have accessible names. Use the `AccessibleIconButton` component for icon-only buttons:

```tsx
import { AccessibleIconButton } from "@/lib/ui-components";

<AccessibleIconButton
  onClick={handleClick}
  ariaLabel="Descriptive action name"
  title="Optional tooltip text"
>
  <IconComponent />
</AccessibleIconButton>;
```

### 2. Image Accessibility

- All images must have meaningful `alt` text
- Decorative images should have `alt=""` or `role="presentation"`
- Complex images should have detailed descriptions

```tsx
<Image
  src="/cake-image.jpg"
  alt="Traditional Ukrainian honey cake with layered cream and honey glaze"
  width={400}
  height={300}
/>
```

### 3. Form Accessibility

- All form inputs must have associated labels
- Use proper form structure with `fieldset` and `legend` for groups
- Provide clear error messages and validation feedback

```tsx
<TextField
  label="Full Name"
  aria-label="Enter your full name"
  required
  error={!!errors.name}
  helperText={errors.name}
/>
```

### 4. Navigation Accessibility

- Use semantic HTML elements (`nav`, `main`, `section`, etc.)
- Provide skip links for keyboard users
- Ensure logical tab order
- Use ARIA landmarks appropriately

### 5. Color and Contrast

- Maintain minimum contrast ratios (4.5:1 for normal text, 3:1 for large text)
- Don't rely solely on color to convey information
- Use the Ukrainian brand colors (#005BBB and #FFD700) with proper contrast

### 6. Keyboard Navigation

- All interactive elements must be keyboard accessible
- Provide visible focus indicators
- Support keyboard shortcuts where appropriate

### 7. Screen Reader Support

- Use semantic HTML elements
- Provide proper ARIA labels and descriptions
- Ensure logical reading order
- Test with screen readers

## Components with Built-in Accessibility

### AccessibleIconButton

A wrapper component that enforces accessibility requirements:

```tsx
interface AccessibleIconButtonProps {
  children: React.ReactNode;
  ariaLabel: string; // Required
  title?: string; // Optional tooltip
  [key: string]: any;
}
```

### ContactInfo Component

Automatically generates accessible labels for contact information:

```tsx
<ContactInfo icon={<PhoneIcon />} text="+44 123 456 7890" href="tel:+441234567890" />
```

## Testing Checklist

### Manual Testing

- [ ] Test with keyboard navigation only
- [ ] Test with screen reader (NVDA, JAWS, VoiceOver)
- [ ] Test with high contrast mode
- [ ] Test with zoom (200% and 400%)
- [ ] Test with reduced motion preferences

### Automated Testing

- [ ] Run Lighthouse accessibility audit
- [ ] Use axe-core for automated testing
- [ ] Check color contrast ratios
- [ ] Validate ARIA attributes

### Common Issues to Avoid

- [ ] Empty or missing alt text on images
- [ ] Buttons without accessible names
- [ ] Missing form labels
- [ ] Insufficient color contrast
- [ ] Missing focus indicators
- [ ] Non-semantic HTML structure

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material-UI Accessibility](https://mui.com/material-ui/getting-started/accessibility/)
- [axe-core Testing](https://github.com/dequelabs/axe-core)
- [Lighthouse Accessibility](https://developers.google.com/web/tools/lighthouse)

## Implementation Notes

- All new components should follow these guidelines
- Existing components should be updated to meet accessibility standards
- Regular accessibility audits should be performed
- User testing with people with disabilities is recommended
