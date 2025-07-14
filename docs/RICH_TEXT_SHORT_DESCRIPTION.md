# Rich Text Editor for Cake Short Descriptions

## Overview

The cake short description field has been updated to use a rich text editor in Sanity Studio, allowing for basic formatting options while maintaining the concise nature of short descriptions.

## Changes Made

### 1. Sanity Schema Updates (`sanity/schemas/cake.ts`)

- Changed `shortDescription` field from `string` type to `array` type with portable text blocks
- Limited formatting options to maintain simplicity:
  - **Styles**: Normal, Strong, Emphasis
  - **Decorators**: Bold, Italic
- Added validation to ensure only one block is used (keeping descriptions concise)

### 2. TypeScript Type Updates

- Updated `types/cake.ts` and `app/types/cake.ts` to reflect the new rich text format
- Changed `shortDescription?: string` to `shortDescription?: any[]`

### 3. Component Updates

#### CakeCard Component (`app/components/CakeCard.tsx`)

- Updated to use `RichTextRenderer` for short descriptions
- Maintains fallback to main description if short description is empty
- Updated alt text generation to use `blocksToText()` helper

#### CakePageClient Component (`app/cakes/[slug]/CakePageClient.tsx`)

- Updated to render rich text short descriptions
- Maintains consistent styling with existing design

### 4. Script Updates

#### Seed Script (`scripts/seed-cakes.ts`)

- Added `stringToRichText()` helper function
- Updated all cake data to use rich text format
- Updated TypeScript interface

#### Update Script (`scripts/update-cakes.ts`)

- Added `stringToRichText()` helper function
- Updated to convert existing string descriptions to rich text format

## Rich Text Format

The short description now uses Sanity's portable text format:

```typescript
[
  {
    _type: "block",
    style: "normal",
    children: [
      {
        _type: "span",
        text: "Description text here",
      },
    ],
    markDefs: [],
  },
];
```

## Available Formatting Options

In Sanity Studio, content editors can now use:

- **Bold text** (Strong)
- _Italic text_ (Emphasis)
- Normal text

## Migration Notes

- Existing string-based short descriptions will need to be migrated to rich text format
- The `blocksToText()` utility function is used for SEO and accessibility purposes
- All components gracefully handle both old string format and new rich text format

## Benefits

1. **Better Content Control**: Editors can emphasize key words or phrases
2. **Consistent Formatting**: Rich text ensures consistent styling across the site
3. **SEO Friendly**: Plain text extraction for meta descriptions and alt text
4. **Accessibility**: Proper semantic markup for screen readers

## Usage in Sanity Studio

1. Navigate to any cake document
2. Find the "Short Description" field
3. Use the toolbar to apply bold or italic formatting
4. Keep descriptions concise (recommended: 1-2 sentences)

## Technical Implementation

The implementation uses:

- Sanity's portable text blocks
- `RichTextRenderer` component for frontend rendering
- `blocksToText()` utility for plain text extraction
- Graceful fallbacks for backward compatibility
- Unique key generation for all portable text blocks

## Key Generation

To prevent "Non-unique keys" errors, all portable text blocks are generated with unique `_key` properties:

```typescript
{
  _type: "block",
  _key: "block_1703123456789_abc123def",
  style: "normal",
  children: [
    {
      _type: "span",
      _key: "span_1703123456789_xyz789ghi",
      text: "Description text",
    },
  ],
}
```

## Utility Functions

The `lib/rich-text-utils.ts` file provides several utility functions:

- `stringToRichText(text)`: Converts plain text to portable text with unique keys
- `richTextToText(blocks)`: Converts portable text back to plain text
- `validateRichTextKeys(blocks)`: Validates that all blocks have unique keys
- `ensureUniqueKeys(blocks)`: Regenerates keys for blocks that have duplicates

## Fixing Existing Data

If you encounter "Non-unique keys" errors with existing data, run:

```bash
pnpm tsx scripts/fix-rich-text-keys.ts
```

This script will automatically detect and fix any duplicate keys in your rich text fields.
