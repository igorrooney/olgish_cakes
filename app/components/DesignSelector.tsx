"use client";

import { Box, FormControl, MenuItem, Select, Typography } from "@/lib/mui-optimization";
import type { SelectChangeEvent } from "@/lib/mui-optimization";

export type DesignType = "standard" | "individual";

interface DesignSelectorProps {
  hasIndividualDesigns: boolean;
  onChange: (design: DesignType) => void;
  value: DesignType;
}

export function DesignSelector({ hasIndividualDesigns, onChange, value }: DesignSelectorProps) {
  const handleChange = (event: SelectChangeEvent<DesignType>) => {
    onChange(event.target.value as DesignType);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
        Select Design Type:
      </Typography>
      <FormControl fullWidth size="small">
        <Select
          value={value}
          onChange={handleChange}
          sx={{
            minWidth: 200,
            "& .MuiSelect-select": {
              py: 1.5,
            },
          }}
        >
          <MenuItem value="standard">Standard Design</MenuItem>
          {hasIndividualDesigns && <MenuItem value="individual">Individual Design</MenuItem>}
        </Select>
      </FormControl>
    </Box>
  );
}
