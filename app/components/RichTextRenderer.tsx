"use client";

import {
  PortableText,
  type PortableTextBlock,
  type PortableTextComponents,
} from "@portabletext/react";
import type { ReactNode } from "react";
import { Typography, Box, Link } from "@/lib/daisy-ui";
import { designTokens } from "@/lib/design-system";

const { colors, typography } = designTokens;

interface RichTextRendererProps {
  value: PortableTextBlock[];
  variant?: "body1" | "body2" | "caption";
  sx?: Record<string, unknown>;
  structuredData?: boolean;
}

type ChildrenProps = {
  children?: ReactNode;
};

type LinkMarkProps = ChildrenProps & {
  value?: {
    href?: string;
  };
};

type ImageValue = {
  asset?: {
    url?: string;
  };
  alt?: string;
  caption?: string;
};

type ImageProps = {
  value?: ImageValue;
};

export function RichTextRenderer({
  value,
  variant = "body1",
  sx = {},
}: RichTextRendererProps) {
  const components: PortableTextComponents = {
    block: {
      h1: ({ children }: ChildrenProps) => (
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontFamily: typography.fontFamily.display,
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
            mb: 2,
            ...sx,
          }}
        >
          {children}
        </Typography>
      ),
      h2: ({ children }: ChildrenProps) => (
        <Typography
          variant="h2"
          component="h2"
          sx={{
            fontFamily: typography.fontFamily.display,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
            mb: 1.5,
            ...sx,
          }}
        >
          {children}
        </Typography>
      ),
      h3: ({ children }: ChildrenProps) => (
        <Typography
          variant="h3"
          component="h3"
          sx={{
            fontFamily: typography.fontFamily.display,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
            mb: 1,
            ...sx,
          }}
        >
          {children}
        </Typography>
      ),
      h4: ({ children }: ChildrenProps) => (
        <Typography
          variant="h4"
          component="h4"
          sx={{
            fontFamily: typography.fontFamily.display,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
            mb: 1,
            ...sx,
          }}
        >
          {children}
        </Typography>
      ),
      h5: ({ children }: ChildrenProps) => (
        <Typography
          variant="h5"
          component="h5"
          sx={{
            fontFamily: typography.fontFamily.display,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
            mb: 1,
            ...sx,
          }}
        >
          {children}
        </Typography>
      ),
      h6: ({ children }: ChildrenProps) => (
        <Typography
          variant="h6"
          component="h6"
          sx={{
            fontFamily: typography.fontFamily.display,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
            mb: 1,
            ...sx,
          }}
        >
          {children}
        </Typography>
      ),
      normal: ({ children }: ChildrenProps) => (
        <Typography
          variant={variant}
          component="p"
          sx={{
            color: colors.text.primary,
            lineHeight: typography.lineHeight.relaxed,
            mb: 1.5,
            whiteSpace: "pre-wrap", // This preserves line breaks and spaces
            ...sx,
          }}
        >
          {children}
        </Typography>
      ),
      blockquote: ({ children }: ChildrenProps) => (
        <Box
          component="blockquote"
          sx={{
            borderLeft: `4px solid ${colors.primary.main}`,
            pl: 2,
            ml: 2,
            my: 2,
            fontStyle: "italic",
            color: colors.text.secondary,
            ...sx,
          }}
        >
          <Typography variant={variant}>{children}</Typography>
        </Box>
      ),
    },
    list: {
      bullet: ({ children }: ChildrenProps) => (
        <Box
          component="ul"
          sx={{
            mb: 1.5,
            pl: 3,
            listStyleType: "disc",
            listStylePosition: "outside",
          }}
        >
          {children}
        </Box>
      ),
      number: ({ children }: ChildrenProps) => (
        <Box
          component="ol"
          sx={{
            mb: 1.5,
            pl: 3,
            listStyleType: "decimal",
            listStylePosition: "outside",
          }}
        >
          {children}
        </Box>
      ),
    },
    listItem: ({ children }: ChildrenProps) => (
      <Box
        component="li"
        sx={{
          mb: 0.5,
          display: "list-item",
        }}
      >
        {children}
      </Box>
    ),
    marks: {
      strong: ({ children }: ChildrenProps) => (
        <Box component="strong" sx={{ fontWeight: typography.fontWeight.bold }}>
          {children}
        </Box>
      ),
      em: ({ children }: ChildrenProps) => (
        <Box component="em" sx={{ fontStyle: "italic" }}>
          {children}
        </Box>
      ),
      code: ({ children }: ChildrenProps) => (
        <Box
          component="code"
          sx={{
            backgroundColor: colors.background.subtle,
            fontFamily: "monospace",
            px: 0.5,
            py: 0.25,
            borderRadius: 0.5,
            fontSize: "0.875em",
          }}
        >
          {children}
        </Box>
      ),
      link: ({ value, children }: LinkMarkProps) => (
        <Link
          href={value?.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`External link to ${value?.href} (opens in new tab)`}
          sx={{
            color: colors.primary.main,
            textDecoration: "underline",
            "&:hover": {
              color: colors.primary.dark,
            },
          }}
        >
          {children}
        </Link>
      ),
    },
    types: {
      image: ({ value }: ImageProps) => (
        <Box
          component="figure"
          sx={{
            my: 2,
            textAlign: "center",
          }}
        >
          <Box
            component="img"
            src={value?.asset?.url}
            alt={value?.alt || "Honey cake image from Olgish Cakes"}
            loading="lazy"
            decoding="async"
            sx={{
              maxWidth: "100%",
              height: "auto",
              borderRadius: 1,
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          {value?.caption && (
            <Typography
              component="figcaption"
              variant="caption"
              sx={{
                mt: 1,
                color: colors.text.secondary,
                fontStyle: "italic",
              }}
            >
              {value.caption}
            </Typography>
          )}
        </Box>
      ),
    },
  };

  return <PortableText value={value} components={components} />;
}
