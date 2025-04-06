"use client";

import { Card, CardContent, CardMedia, Typography, Box, Chip, IconButton } from "@mui/material";
import { urlFor } from "@/lib/sanity";
import { Cake } from "@/types/cake";
import { motion } from "framer-motion";
import { Info } from "@mui/icons-material";

interface CakeCardProps {
  cake: Cake;
}

export function CakeCard({ cake }: CakeCardProps) {
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
                mb: 1,
                fontFamily: "var(--font-playfair-display)",
                fontWeight: 600,
              }}
            >
              {cake.name}
            </Typography>
            <Typography
              variant="h6"
              color="primary"
              sx={{
                fontWeight: 600,
                mb: 2,
              }}
            >
              £{cake.price}
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

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
            {cake.allergens?.map(allergen => (
              <Chip
                key={allergen}
                label={allergen}
                size="small"
                color="default"
                sx={{
                  backgroundColor: "rgba(0, 0, 0, 0.08)",
                  fontSize: "0.75rem",
                }}
              />
            ))}
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Chip
              label={cake.category}
              color="primary"
              size="small"
              sx={{
                textTransform: "capitalize",
                fontWeight: 500,
              }}
            />
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
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}
