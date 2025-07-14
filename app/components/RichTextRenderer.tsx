"use client";

import { PortableText } from "@portabletext/react";
import { Typography, Box, Link } from "@mui/material";
import { designTokens } from "@/lib/design-system";

const { colors, typography } = designTokens;

interface RichTextRendererProps {
  value: any[];
  variant?: "body1" | "body2" | "caption";
  sx?: any;
}

export function RichTextRenderer({ value, variant = "body1", sx = {} }: RichTextRendererProps) {
  const components = {
    block: {
      h1: ({ children }: any) => (
        <Typography
          variant="h1"
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
        <Box component="ul" sx={{ mb: 1.5, pl: 2 }}>
          {children}
        </Box>
      ),
      number: ({ children }: any) => (
        <Box component="ol" sx={{ mb: 1.5, pl: 2 }}>
          {children}
        </Box>
      ),
    },
    listItem: ({ children }: any) => (
      <Box component="li" sx={{ mb: 0.5 }}>
        {children}
      </Box>
    ),
    marks: {
      strong: ({ children }: any) => (
        <Box component="span" sx={{ fontWeight: typography.fontWeight.bold }}>
          {children}
        </Box>
      ),
      em: ({ children }: any) => (
        <Box component="span" sx={{ fontStyle: "italic" }}>
          {children}
        </Box>
      ),
      code: ({ children }: any) => (
        <Box
          component="span"
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
          component="img"
          src={value?.asset?.url}
          alt={value?.alt || "Cake image from Olgish Cakes"}
          loading="lazy"
          sx={{
            maxWidth: "100%",
            height: "auto",
            borderRadius: 1,
            my: 2,
          }}
        />
      ),
    },
  };

  return <PortableText value={value} components={components} />;
}
