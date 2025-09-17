"use client";

import { Box } from "@/lib/mui-optimization";

// Reusable component for table of contents links
export const TocLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <Box
      component="a"
      href={href}
      onClick={handleClick}
      sx={{
        textDecoration: "none",
        color: "inherit",
        display: "block",
        padding: "8px 12px",
        borderRadius: "4px",
        transition: "all 0.2s ease",
        cursor: "pointer",
        "&:hover": {
          backgroundColor: "#f5f5f5",
          color: "#1976d2",
        },
      }}
    >
      {children}
    </Box>
  );
};
