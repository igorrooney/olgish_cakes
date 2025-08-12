"use client";

import { PortableText } from "@portabletext/react";
import { Typography, Box, Link } from "@/lib/mui-optimization";
import { designTokens } from "@/lib/design-system";

const { colors, typography } = designTokens;

interface RichTextRendererProps {
  value: any[];
  variant?: "body1" | "body2" | "caption";
  sx?: any;
  structuredData?: boolean;
}

export function RichTextRenderer({
  value,
  variant = "body1",
  sx = {},
  structuredData = false,
}: RichTextRendererProps) {
  const components = {
    block: {
      h1: ({ children }: any) => (
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
      h2: ({ children }: any) => (
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
      h3: ({ children }: any) => (
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
      h4: ({ children }: any) => (
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
      h5: ({ children }: any) => (
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
      h6: ({ children }: any) => (
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
      normal: ({ children }: any) => (
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
      blockquote: ({ children }: any) => (
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
      bullet: ({ children }: any) => (
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
      number: ({ children }: any) => (
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
    listItem: ({ children }: any) => (
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
      strong: ({ children }: any) => (
        <Box component="strong" sx={{ fontWeight: typography.fontWeight.bold }}>
          {children}
        </Box>
      ),
      em: ({ children }: any) => (
        <Box component="em" sx={{ fontStyle: "italic" }}>
          {children}
        </Box>
      ),
      code: ({ children }: any) => (
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
      link: ({ value, children }: any) => (
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
      image: ({ value }: any) => (
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
