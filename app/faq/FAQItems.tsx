"use client";

import {
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState } from "react";
import { FAQ } from "../utils/fetchFaqs";

interface FAQItemsProps {
  items: FAQ[];
}

export function FAQItems({ items }: FAQItemsProps) {
  const [expanded, setExpanded] = useState<string | false>(false);
  const theme = useTheme();

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Grid container spacing={3}>
      {items.map((item, index) => {
        const panel = `panel${index}`;
        return (
          <Grid item xs={12} key={item._id}>
            <Box
              sx={{
                transform: "scale(1)",
                transition: "transform 0.2s ease",
                "&:hover": {
                  transform: "scale(1.01)",
                },
              }}
            >
              <Accordion
                expanded={expanded === panel}
                onChange={handleChange(panel)}
                sx={{
                  borderRadius: "8px !important",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  background: "white",
                  "&:before": {
                    display: "none",
                  },
                  "&.Mui-expanded": {
                    margin: 0,
                    boxShadow: "0 4px 12px rgba(0, 91, 187, 0.15)",
                  },
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(0, 91, 187, 0.15)",
                  },
                  overflow: "hidden",
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <ExpandMoreIcon
                      sx={{
                        color: expanded === panel ? "primary.main" : "text.secondary",
                        transition: "all 0.3s ease",
                      }}
                    />
                  }
                  sx={{
                    backgroundColor:
                      expanded === panel ? `${theme.palette.primary.main}08` : "background.paper",
                    borderRadius: "8px",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: `${theme.palette.primary.main}08`,
                    },
                    "& .MuiAccordionSummary-content": {
                      transition: "all 0.3s ease",
                    },
                    "&.Mui-expanded": {
                      "& .MuiAccordionSummary-content": {
                        color: "primary.main",
                      },
                    },
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      fontFamily: "var(--font-playfair-display)",
                      fontSize: "1.1rem",
                      transition: "color 0.3s ease",
                      color: expanded === panel ? "primary.main" : "text.primary",
                    }}
                  >
                    {item.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails
                  sx={{
                    backgroundColor: `${theme.palette.primary.main}04`,
                    borderTop: `1px solid ${theme.palette.primary.main}1a`,
                    padding: "1.5rem",
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      color: "text.secondary",
                      lineHeight: 1.7,
                      fontSize: "1rem",
                    }}
                  >
                    {item.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </Box>
          </Grid>
        );
      })}
    </Grid>
  );
}
