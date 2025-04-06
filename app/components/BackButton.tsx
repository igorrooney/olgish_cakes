"use client";

import { Button } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
      color="primary"
      startIcon={<ArrowBack />}
      onClick={handleBack}
      disabled={isLoading}
      sx={{
        textTransform: "none",
        fontWeight: 500,
        "&:hover": {
          backgroundColor: "rgba(25, 118, 210, 0.04)",
        },
      }}
    >
      Back to Cakes
    </Button>
  );
}
