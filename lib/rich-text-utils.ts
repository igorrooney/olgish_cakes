/**
 * Utility functions for working with Sanity portable text
 */

/**
 * Generates a unique key for portable text blocks
 */
function generateUniqueKey(prefix: string = "block"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Converts a plain string to a portable text block with proper keys
 */
export function stringToRichText(text: string): any[] {
  if (!text || text.trim() === "") {
    return [];
  }

  const blockKey = generateUniqueKey("block");
  const spanKey = generateUniqueKey("span");

  return [
    {
      _type: "block",
      _key: blockKey,
      style: "normal",
      children: [
        {
          _type: "span",
          _key: spanKey,
          text: text.trim(),
        },
      ],
      markDefs: [],
    },
  ];
}

/**
 * Converts portable text blocks to plain text
 * This is a more robust version of blocksToText
 */
export function richTextToText(blocks: any[]): string {
  if (!blocks || !Array.isArray(blocks)) return "";

  return blocks
    .map(block => {
      if (block._type === "block") {
        return block.children?.map((child: any) => child.text).join("") || "";
      }
      return "";
    })
    .join("\n")
    .trim();
}

/**
 * Validates that portable text blocks have unique keys
 */
export function validateRichTextKeys(blocks: any[]): boolean {
  if (!blocks || !Array.isArray(blocks)) return true;

  const keys = new Set<string>();

  for (const block of blocks) {
    if (block._key) {
      if (keys.has(block._key)) {
        return false; // Duplicate key found
      }
      keys.add(block._key);
    }

    // Check children keys
    if (block.children && Array.isArray(block.children)) {
      for (const child of block.children) {
        if (child._key) {
          if (keys.has(child._key)) {
            return false; // Duplicate key found
          }
          keys.add(child._key);
        }
      }
    }
  }

  return true;
}

/**
 * Ensures all blocks have unique keys by regenerating them if needed
 */
export function ensureUniqueKeys(blocks: any[]): any[] {
  if (!blocks || !Array.isArray(blocks)) return [];

  return blocks.map(block => {
    const newBlock = { ...block };

    // Generate new key for block if it doesn't exist or is duplicate
    if (!newBlock._key) {
      newBlock._key = generateUniqueKey("block");
    }

    // Generate new keys for children if they don't exist
    if (newBlock.children && Array.isArray(newBlock.children)) {
      newBlock.children = newBlock.children.map((child: any) => ({
        ...child,
        _key: child._key || generateUniqueKey("span"),
      }));
    }

    return newBlock;
  });
}
