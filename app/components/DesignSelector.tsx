"use client";

import { Box, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { useState } from "react";

export type DesignType = "standard" | "individual";

interface DesignSelectorProps {
  hasIndividualDesigns: boolean;
  onChange: (design: DesignType) => void;
}

export function DesignSelector({ hasIndividualDesigns, onChange }: DesignSelectorProps) {
  const [selectedDesign, setSelectedDesign] = useState<DesignType>("standard");

  const handleChange = (_: React.MouseEvent<HTMLElement>, newDesign: DesignType | null) => {
    if (newDesign !== null) {
      setSelectedDesign(newDesign);
      onChange(newDesign);
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
        Select Design Type:
      </Typography>
      <ToggleButtonGroup
        value={selectedDesign}
        exclusive
        onChange={handleChange}
        aria-label="design type"
        sx={{
          "& .MuiToggleButton-root": {
            textTransform: "none",
            px: 3,
          },
        }}
      >
        <ToggleButton value="standard">Standard Design</ToggleButton>
        <ToggleButton value="individual" disabled={!hasIndividualDesigns}>
          Individual Design Examples
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}
