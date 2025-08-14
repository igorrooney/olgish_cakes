# Ukrainian Design System for Olgish Cakes

A comprehensive design system inspired by Ukrainian culture and traditional colors, designed specifically for the Olgish Cakes website.

## ðŸŽ¨ Color Palette

### Primary Ukrainian Colors

Our color palette is inspired by traditional Ukrainian culture and the colors of traditional Ukrainian desserts.

```typescript
import { colors } from "@/lib/design-system";

// Ukrainian traditional colors
colors.ukrainian.blue; // #2E3192 - Traditional Ukrainian blue
colors.ukrainian.yellow; // #FEF102 - Traditional Ukrainian yellow
colors.ukrainian.honey; // #D4A76A - Honey Cake color
colors.ukrainian.cream; // #FFF5E6 - Cream color for Kyiv Cake
colors.ukrainian.berry; // #8B0000 - Deep berry color for traditional desserts
```

### Semantic Colors

```typescript
// Primary colors (Ukrainian blue)
colors.primary.main; // #2E3192
colors.primary.light; // #4D8FD1
colors.primary.dark; // #003D7A
colors.primary.contrast; // #FFFFFF

// Secondary colors (Ukrainian yellow)
colors.secondary.main; // #FEF102
colors.secondary.light; // #FFE44D
colors.secondary.dark; // #B39700
colors.secondary.contrast; // #2D2D2D
```

### Background Colors

```typescript
colors.background.default; // #FFF8E7 - Light honey color
colors.background.paper; // #FFFFFF
colors.background.subtle; // #FFF5E6 - Cream
colors.background.warm; // #FEF9F0 - Very light honey
```

### Usage Guidelines

#### Primary Color Usage

- **Main Actions**: Use for primary buttons, links, and call-to-action elements
- **Brand Identity**: Use for headers, logos, and brand elements
- **Navigation**: Use for active navigation states

#### Secondary Color Usage

- **Accents**: Use for highlights, badges, and secondary actions
- **Warnings**: Use sparingly for important notices
- **Decorative Elements**: Use for borders, icons, and decorative accents

#### Background Color Usage

- **Default Background**: Use the honey color for main page backgrounds
- **Cards and Sections**: Use white for content areas
- **Subtle Backgrounds**: Use cream for form fields and secondary content

## ðŸ“ Typography

### Font Families

```typescript
import { typography } from "@/lib/design-system";

typography.fontFamily.primary; // Inter - for body text and UI elements
typography.fontFamily.display; // Playfair Display - for headings and titles
typography.fontFamily.mono; // Monospace - for code and technical content
```

### Font Sizes

```typescript
typography.fontSize.xs; // 0.75rem (12px) - Small labels, captions
typography.fontSize.sm; // 0.875rem (14px) - Small text, footnotes
typography.fontSize.base; // 1rem (16px) - Body text
typography.fontSize.lg; // 1.125rem (18px) - Large body text
typography.fontSize.xl; // 1.25rem (20px) - Small headings
typography.fontSize["2xl"]; // 1.5rem (24px) - Medium headings
typography.fontSize["3xl"]; // 1.875rem (30px) - Large headings
typography.fontSize["4xl"]; // 2.25rem (36px) - Extra large headings
typography.fontSize["5xl"]; // 3rem (48px) - Hero headings
typography.fontSize["6xl"]; // 3.75rem (60px) - Display headings
```

### Font Weights

```typescript
typography.fontWeight.light; // 300 - Light text
typography.fontWeight.normal; // 400 - Regular text
typography.fontWeight.medium; // 500 - Medium emphasis
typography.fontWeight.semibold; // 600 - Semi-bold headings
typography.fontWeight.bold; // 700 - Bold headings
typography.fontWeight.extrabold; // 800 - Extra bold display text
```

### Usage Guidelines

#### Headings

- Use Playfair Display for all headings (h1-h6)
- Use appropriate font weights: semibold for most headings, bold for important ones
- Maintain proper hierarchy: h1 > h2 > h3 > h4 > h5 > h6

#### Body Text

- Use Inter for all body text, buttons, and UI elements
- Use normal weight (400) for regular text
- Use medium weight (500) for emphasized text

## ðŸ“ Spacing

### Spacing Scale

```typescript
import { spacing } from "@/lib/design-system";

spacing.xs; // 0.25rem (4px) - Minimal spacing
spacing.sm; // 0.5rem (8px) - Small spacing
spacing.md; // 1rem (16px) - Medium spacing (base unit)
spacing.lg; // 1.5rem (24px) - Large spacing
spacing.xl; // 2rem (32px) - Extra large spacing
spacing["2xl"]; // 3rem (48px) - Section spacing
spacing["3xl"]; // 4rem (64px) - Large section spacing
spacing["4xl"]; // 6rem (96px) - Hero section spacing
spacing["5xl"]; // 8rem (128px) - Extra large section spacing
```

### Usage Guidelines

- Use consistent spacing throughout the interface
- Prefer the spacing scale over arbitrary values
- Use larger spacing for sections and smaller spacing for components

## ðŸ”² Border Radius

### Border Radius Scale

```typescript
import { borderRadius } from "@/lib/design-system";

borderRadius.none; // 0 - No border radius
borderRadius.sm; // 0.125rem (2px) - Small radius
borderRadius.base; // 0.25rem (4px) - Base radius
borderRadius.md; // 0.375rem (6px) - Medium radius
borderRadius.lg; // 0.5rem (8px) - Large radius
borderRadius.xl; // 0.75rem (12px) - Extra large radius
borderRadius["2xl"]; // 1rem (16px) - Card radius
borderRadius["3xl"]; // 1.5rem (24px) - Large card radius
borderRadius.full; // 9999px - Fully rounded
```

### Usage Guidelines

- Use `borderRadius.lg` for buttons and form inputs
- Use `borderRadius['2xl']` for cards and content containers
- Use `borderRadius.full` for avatars and circular elements

## ðŸŽ­ Shadows

### Shadow Scale

```typescript
import { shadows } from "@/lib/design-system";

shadows.sm; // Subtle shadow for small elements
shadows.base; // Base shadow for cards and containers
shadows.md; // Medium shadow for elevated elements
shadows.lg; // Large shadow for prominent elements
shadows.xl; // Extra large shadow for hero elements
shadows["2xl"]; // Maximum shadow for overlays
shadows.inner; // Inner shadow for pressed states
shadows.none; // No shadow
```

### Usage Guidelines

- Use `shadows.base` for most cards and containers
- Use `shadows.md` for hover states and elevated elements
- Use `shadows.lg` for modals and overlays
- Use `shadows.inner` for pressed button states

## ðŸ§© Components

### Buttons

#### Primary Button

```typescript
import { components } from '@/lib/design-system';

// Usage in Material-UI
<Button
  variant="contained"
  sx={components.button.primary}
>
  Order Now
</Button>
```

#### Secondary Button

```typescript
<Button
  variant="contained"
  sx={components.button.secondary}
>
  Learn More
</Button>
```

#### Outline Button

```typescript
<Button
  variant="outlined"
  sx={components.button.outline}
>
  View Details
</Button>
```

### Cards

```typescript
<Paper sx={components.card}>
  <Typography variant="h6">Card Title</Typography>
  <Typography variant="body1">Card content goes here</Typography>
</Paper>
```

### Inputs

```typescript
<TextField
  sx={components.input}
  placeholder="Enter your email"
/>
```

### Chips

```typescript
<Chip
  label="Ingredient"
  sx={components.chip}
/>
```

## ðŸ“± Responsive Design

### Breakpoints

```typescript
import { breakpoints } from "@/lib/design-system";

breakpoints.xs; // 0px - Mobile
breakpoints.sm; // 600px - Tablet portrait
breakpoints.md; // 900px - Tablet landscape
breakpoints.lg; // 1200px - Desktop
breakpoints.xl; // 1536px - Large desktop
```

### Usage with Material-UI

```typescript
// Responsive spacing
sx={{
  padding: {
    xs: spacing.md,    // 16px on mobile
    sm: spacing.lg,    // 24px on tablet
    md: spacing.xl,    // 32px on desktop
  }
}}

// Responsive typography
sx={{
  fontSize: {
    xs: typography.fontSize.base,  // 16px on mobile
    md: typography.fontSize.lg,    // 18px on desktop
  }
}}
```

## ðŸŽ¬ Animations

### Animation Tokens

```typescript
import { animation } from "@/lib/design-system";

animation.duration.fast; // 0.15s - Quick interactions
animation.duration.normal; // 0.3s - Standard transitions
animation.duration.slow; // 0.5s - Complex animations

animation.easing.ease; // ease
animation.easing.easeIn; // ease-in
animation.easing.easeOut; // ease-out
animation.easing.easeInOut; // ease-in-out

animation.transitions.fast; // all 0.15s ease-in-out
animation.transitions.normal; // all 0.3s ease-in-out
animation.transitions.slow; // all 0.5s ease-in-out
```

### Usage Guidelines

- Use fast transitions for hover states and quick interactions
- Use normal transitions for most UI changes
- Use slow transitions for complex animations and page transitions

## ðŸŽ¯ Best Practices

### Color Usage

1. **Accessibility**: Ensure sufficient contrast ratios (4.5:1 for normal text, 3:1 for large text)
2. **Consistency**: Use the same colors for the same purposes throughout the app
3. **Hierarchy**: Use color to establish visual hierarchy
4. **Semantic Meaning**: Use colors consistently with their semantic meaning

### Typography

1. **Readability**: Use appropriate line heights and letter spacing
2. **Hierarchy**: Maintain clear typographic hierarchy
3. **Consistency**: Use consistent font families and weights
4. **Responsive**: Scale typography appropriately for different screen sizes

### Spacing

1. **Consistency**: Use the spacing scale consistently
2. **Rhythm**: Maintain visual rhythm with consistent spacing
3. **Proportion**: Use larger spacing for larger elements
4. **Responsive**: Adjust spacing for different screen sizes

### Components

1. **Reusability**: Design components to be reusable
2. **Consistency**: Use consistent styling across similar components
3. **Accessibility**: Ensure components are accessible
4. **Performance**: Optimize components for performance

## ðŸ”§ Implementation

### Importing the Design System

```typescript
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  components,
  animation,
} from "@/lib/design-system";
```

### Using with Material-UI

```typescript
import { Box, Button, Typography } from '@mui/material';

function MyComponent() {
  return (
    <Box sx={{ padding: spacing.lg }}>
      <Typography
        variant="h1"
        sx={{
          color: colors.primary.main,
          fontFamily: typography.fontFamily.display,
          fontWeight: typography.fontWeight.bold
        }}
      >
        Welcome to Olgish Cakes
      </Typography>

      <Button sx={components.button.primary}>
        Order Now
      </Button>
    </Box>
  );
}
```

### Using with Tailwind CSS

```typescript
// You can also use these tokens with Tailwind by extending the config
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        ukrainian: {
          blue: "#2E3192",
          yellow: "#FEF102",
          honey: "#D4A76A",
          cream: "#FFF5E6",
          berry: "#8B0000",
        },
      },
      spacing: {
        xs: "0.25rem",
        sm: "0.5rem",
        md: "1rem",
        lg: "1.5rem",
        xl: "2rem",
        "2xl": "3rem",
        "3xl": "4rem",
        "4xl": "6rem",
        "5xl": "8rem",
      },
    },
  },
};
```

## ðŸ“š Resources

- [Ukrainian Flag Colors](https://en.wikipedia.org/wiki/Flag_of_Ukraine)
- [Ukrainian Traditional Desserts](https://en.wikipedia.org/wiki/Ukrainian_cuisine#Desserts)
- [Material-UI Design System](https://mui.com/material-ui/customization/design-tokens/)
- [Design Tokens Best Practices](https://www.designtokens.org/)

---

This design system ensures consistency, accessibility, and a beautiful Ukrainian-inspired aesthetic across the Olgish Cakes website.

