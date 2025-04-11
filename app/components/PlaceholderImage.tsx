"use client";

import { Box, Typography } from "@mui/material";

interface PlaceholderImageProps {
  name: string;
  className?: string;
}

export default function PlaceholderImage({ name, className = "" }: PlaceholderImageProps) {
  return (
    <Box
      className={`flex items-center justify-center bg-gray-100 ${className}`}
      sx={{
        backgroundColor: "rgba(0, 0, 0, 0.05)",
        minHeight: "200px",
      }}
    >
      <Typography
        variant="body1"
        className="text-gray-400 text-center px-4"
        sx={{
          fontSize: "0.875rem",
          lineHeight: 1.5,
        }}
      >
        {name}
      </Typography>
    </Box>
  );
}
