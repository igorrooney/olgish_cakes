"use client";

import { Button, ArrowBackIcon } from "@/lib/mui-optimization";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { designTokens } from "@/lib/design-system";

const { colors, typography, spacing } = designTokens;

export function BackButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    setIsLoading(true);
    router.back();
  };

  return (
    <Button
      variant="text"
      startIcon={<ArrowBackIcon /size="large">}
      onClick={handleBack}
      disabled={isLoading}
      sx={{
        color: colors.primary.main,
        textTransform: "none",
        fontWeight: typography.fontWeight.medium,
        fontSize: typography.fontSize.base,
        px: spacing.md,
        py: spacing.sm,
        borderRadius: spacing.sm,
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          backgroundColor: `${colors.primary.main}10`,
          transform: "translateX(-2px)",
        },
        "&:disabled": {
          color: colors.text.disabled,
        },
      }}
    >
      Back to Cakes
    </Button>
  );
}
