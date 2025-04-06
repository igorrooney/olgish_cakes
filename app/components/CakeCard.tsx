"use client";

import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import { urlFor } from "@/lib/sanity";
import { Cake } from "@/types/cake";
import { motion } from "framer-motion";
import { Info } from "@mui/icons-material";

interface CakeCardProps {
  cake: Cake;
}

export function CakeCard({ cake }: CakeCardProps) {
  const tooltipContent = (
    <Box sx={{ p: 1 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
        Ingredients:
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1 }}>
        {cake.ingredients.map((ingredient, index) => (
          <Chip
            key={index}
            label={ingredient}
            size="small"
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              color: "text.primary",
              fontSize: "0.75rem",
            }}
          />
        ))}
      </Box>
      {cake.allergens && cake.allergens.length > 0 && (
        <>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 1, mb: 1 }}>
            Allergens:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {cake.allergens.map((allergen, index) => (
              <Chip
                key={index}
                label={allergen}
                size="small"
                color="error"
                sx={{
                  backgroundColor: "rgba(211, 47, 47, 0.9)",
                  color: "white",
                  fontSize: "0.75rem",
                }}
              />
            ))}
          </Box>
        </>
      )}
    </Box>
  );

  return (
    <motion.div whileHover={{ y: -8 }} transition={{ duration: 0.3 }}>
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          boxShadow: theme => theme.shadows[4],
          "&:hover": {
            boxShadow: theme => theme.shadows[8],
          },
        }}
      >
        <CardMedia
          component="img"
          height={240}
          image={urlFor(cake.image).width(500).height(500).url()}
          alt={cake.name}
          sx={{
            objectFit: "cover",
          }}
        />
        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="h6"
              component="h3"
              sx={{
                fontFamily: "var(--font-playfair-display)",
                fontWeight: 600,
              }}
            >
              {cake.name}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                minHeight: "4.5em",
              }}
            >
              {cake.description}
            </Typography>
          </Box>

          <Box sx={{ mt: "auto" }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip
                  label={cake.category}
                  size="small"
                  sx={{
                    textTransform: "capitalize",
                    fontWeight: 500,
                  }}
                />
                <Chip
                  label={`${cake.size} inch`}
                  size="small"
                  color="primary"
                  sx={{
                    fontWeight: 500,
                  }}
                />
              </Box>
              <Tooltip
                title={tooltipContent}
                placement="top-end"
                arrow
                componentsProps={{
                  tooltip: {
                    sx: {
                      bgcolor: "rgba(255, 255, 255, 0.95)",
                      color: "text.primary",
                      boxShadow: theme => theme.shadows[2],
                      maxWidth: "none",
                      p: 2,
                      "& .MuiTooltip-arrow": {
                        color: "rgba(255, 255, 255, 0.95)",
                      },
                    },
                  },
                }}
              >
                <IconButton
                  size="small"
                  color="primary"
                  sx={{
                    "&:hover": {
                      backgroundColor: "primary.light",
                      color: "white",
                    },
                  }}
                >
                  <Info fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                borderTop: "1px solid",
                borderColor: "divider",
                pt: 2,
              }}
            >
              <Typography
                variant="h6"
                color="primary"
                sx={{
                  fontWeight: 600,
                }}
              >
                £{cake.price}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}
