# Accessibility Guidelines for Olgish Cakes

This document outlines accessibility best practices for the Olgish Cakes website, with a focus on link accessibility and general web accessibility standards.

## Link Accessibility Standards

### 1. Link Names and Descriptions

**✅ Good Examples:**

```tsx
// Descriptive link text
<Link href="/cakes" aria-label="Browse our complete cake collection">
  View All Cakes
</Link>

// Phone number with context
<Link href="tel:+447867218194" aria-label="Call us at +44 786 721 8194">
  +44 786 721 8194
</Link>

// Email with context
<Link href="mailto:hello@olgishcakes.co.uk" aria-label="Email us at hello@olgishcakes.co.uk">
  hello@olgishcakes.co.uk
</Link>
```

**❌ Avoid:**

```tsx
// Generic link text
<Link href="/cakes">Click here</Link>
<Link href="/cakes">Read more</Link>
<Link href="/cakes">Learn more</Link>

// Insufficient context
<Link href="/cakes">More</Link>
<Link href="/cakes">Here</Link>
```

### 2. External Links

Always indicate when links open in a new tab:

```tsx
<Link
  href="https://www.trustpilot.com/review/olgishcakes.co.uk"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="Read our reviews on Trustpilot (opens in new tab)"
>
  Trustpilot Reviews
</Link>
```

### 3. Image Links

When using images as links, provide descriptive alt text:

```tsx
<Link href="/cakes" aria-label="Browse our cake collection">
  <Image
    src="/images/cake-collection.jpg"
    alt="Beautiful display of Ukrainian honey cakes and wedding cakes"
    width={400}
    height={300}
  />
</Link>
```

## General Accessibility Standards

### 1. Semantic HTML

Use proper semantic elements:

```tsx
// ✅ Good
<main role="main" aria-label="Main content">
  <section aria-label="Product information">
    <h1>Traditional Ukrainian Honey Cake</h1>
  </section>
</main>

// ❌ Avoid
<div>
  <div>
    <span style={{ fontSize: '2rem' }}>Traditional Ukrainian Honey Cake</span>
  </div>
</div>
```

### 2. Color and Contrast

- Ensure sufficient color contrast (minimum 4.5:1 for normal text)
- Don't rely solely on color to convey information
- Use our design system colors which meet WCAG standards

### 3. Keyboard Navigation

- All interactive elements must be keyboard accessible
- Provide visible focus indicators
- Ensure logical tab order

### 4. Screen Reader Support

- Use proper ARIA labels and roles
- Provide alternative text for images
- Use descriptive headings and landmarks

## Accessibility Checklist

### Links

- [ ] All links have descriptive text or aria-label
- [ ] No generic text like "click here" or "read more"
- [ ] External links indicate they open in new tab
- [ ] Link text is unique and descriptive
- [ ] Links are keyboard accessible

### Images

- [ ] All images have alt text
- [ ] Decorative images have empty alt="" or role="presentation"
- [ ] Complex images have detailed descriptions
- [ ] Images used as links have descriptive alt text

### Forms

- [ ] All form fields have labels
- [ ] Error messages are associated with fields
- [ ] Required fields are clearly marked
- [ ] Forms have proper validation

### Navigation

- [ ] Skip links are available
- [ ] Breadcrumbs are properly structured
- [ ] Navigation is keyboard accessible
- [ ] Current page is clearly indicated

### Content

- [ ] Proper heading hierarchy (h1, h2, h3, etc.)
- [ ] Sufficient color contrast
- [ ] Text is readable and resizable
- [ ] No content relies solely on color

## Testing Tools

### Automated Testing

```bash
# Run accessibility audit
node scripts/accessibility-audit.js

# Run Lighthouse accessibility audit
npm run lighthouse:accessibility
```

### Manual Testing

1. **Keyboard Navigation**: Navigate using Tab, Shift+Tab, Enter, Space
2. **Screen Reader**: Test with NVDA, JAWS, or VoiceOver
3. **Color Contrast**: Use browser dev tools or contrast checkers
4. **Zoom Testing**: Test at 200% zoom level

## Common Issues and Solutions

### Issue: Link without discernible name

**Solution**: Add descriptive aria-label or improve link text

### Issue: Insufficient color contrast

**Solution**: Use design system colors or adjust contrast ratios

### Issue: Missing alt text

**Solution**: Add descriptive alt text for all images

### Issue: Keyboard navigation problems

**Solution**: Ensure all interactive elements are focusable and have visible focus indicators

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Deque University - Link Name Rule](https://dequeuniversity.com/rules/axe/4.10/link-name)
- [WebAIM - Links and Hypertext](https://webaim.org/techniques/hypertext/)
- [MDN - Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

## Maintenance

- Run accessibility audits regularly
- Test with real users when possible
- Keep up with accessibility standards updates
- Monitor accessibility metrics in analytics

---

_Last updated: December 2024_
