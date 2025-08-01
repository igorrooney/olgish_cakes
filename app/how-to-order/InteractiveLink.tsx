"use client";

import Link from "next/link";
import { Box } from "@mui/material";
import { useState } from "react";

interface InteractiveLinkProps {
  href: string;
  text: string;
  sx?: any;
}

export function InteractiveLink({ href, text, sx }: InteractiveLinkProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        color: "inherit",
        fontWeight: 500,
        ...sx,
      }}
    >
      <Box
        component="span"
        sx={{
          cursor: "pointer",
          textDecoration: isHovered ? "underline" : "none",
          color: isHovered ? "var(--mui-palette-primary-main)" : "inherit",
          transition: "all 0.2s ease-in-out",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {text}
      </Box>
    </Link>
  );
} 