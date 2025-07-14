# Rich Text Editor Implementation

## Overview

The cake description field in Sanity Studio has been upgraded from a simple text field to a rich text editor. This allows content editors to create more engaging and formatted descriptions with headings, bold text, italic text, links, and embedded images.

## What Changed

### Schema Changes

- **Field Type**: Changed from `type: "text"` to `type: "array"`
- **Content Types**: Supports both rich text blocks and images
- **Styling Options**: Headings (H1, H2, H3), quotes, bold, italic, code formatting
- **Links**: Ability to add URLs to text
- **Images**: Can embed images within descriptions

### Frontend Changes

- **Type Interface**: Updated `Cake.description` from `string` to `any[]`
- **Utility Function**: Added `blocksToText()` function to convert rich text to plain text
- **Display Logic**: Updated all components to use `RichTextRenderer` for display

## Features Available in Studio

### Text Formatting

- **Normal**: Regular paragraph text
- **H1, H2, H3**: Different heading levels
- **Quote**: Blockquote styling
- **Bold**: Strong emphasis
- **Italic**: Emphasis
- **Code**: Inline code formatting

### Links

- Add URLs to any text selection
- Links open in new tab by default

### Images

- Embed images within descriptions
- Images support hotspot functionality
- Alt text can be added for accessibility

## How to Create Line Breaks

### In Sanity Studio

There are two ways to create line breaks in the Sanity editor:

1. **New Paragraph (Recommended)**: Press `Enter` to create a new paragraph block. This will create proper spacing between paragraphs.

2. **Soft Line Break**: Press `Shift + Enter` to create a line break within the same paragraph. This will create a line break without starting a new paragraph.

### Frontend Rendering

The `RichTextRenderer` component handles both types of line breaks:

- **Paragraph breaks** (Enter): Each paragraph is rendered as a separate `<p>` element with proper spacing
- **Soft line breaks** (Shift+Enter): Line breaks within the same paragraph are preserved using `whiteSpace: "pre-wrap"`

## Migration

### Existing Content

All existing text descriptions are automatically preserved. The migration script converts them to rich text blocks:

```bash
pnpm run migrate:descriptions
```

### Manual Migration

If you prefer to migrate manually:

1. Open Sanity Studio
2. Edit each cake
3. The description field will now show a rich text editor
4. Existing text will be displayed as plain text
5. You can now format it using the rich text tools

## Usage in Frontend

### Converting Rich Text to Plain Text

```typescript
import { blocksToText } from "@/types/cake";

const plainText = blocksToText(cake.description);
```

### Display in Components

```typescript
// Before
{
  cake.description;
}

// After
{
  <RichTextRenderer value={cake.description} />
}
```

## Benefits

1. **Better Content**: More engaging and readable descriptions
2. **SEO Friendly**: Proper heading structure for search engines
3. **Accessibility**: Better semantic structure with headings
4. **Visual Appeal**: Ability to add images and formatting
5. **Flexibility**: Content editors have more control over presentation

## Troubleshooting

### Line Breaks Not Showing

- **Use Shift+Enter**: For line breaks within the same paragraph, use `Shift + Enter` instead of just `Enter`
- **Check Rendering**: Ensure you're using `RichTextRenderer` component, not direct text display
- **Clear Cache**: If changes don't appear, clear your browser cache or Sanity cache

### Content Not Displaying

- Ensure `RichTextRenderer` is being used for display
- Check that the description field is properly typed as `any[]`

### Migration Issues

- Run the migration script: `pnpm run migrate:descriptions`
- Check Sanity Studio for any validation errors
- Verify the schema changes are deployed

### Type Errors

- Update all imports to use the new `Cake` interface from `@/types/cake`
- Replace direct `cake.description` usage with `RichTextRenderer`

## Best Practices

1. **Use Shift+Enter for line breaks** within the same paragraph
2. **Use Enter for new paragraphs** when you want more spacing
3. **Use headings** for better content structure
4. **Add images** to make descriptions more engaging
5. **Use bold and italic** for emphasis on important information
