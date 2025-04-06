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
  Button,
  CircularProgress,
} from "@mui/material";
import { urlFor } from "@/sanity/lib/image";
import { Cake } from "@/types/cake";
import { motion } from "framer-motion";
import { Info, CakeOutlined, ArrowForward } from "@mui/icons-material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CakeCardProps {
  cake: Cake;
}

export function CakeCard({ cake }: CakeCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const mainImage = cake.images && (cake.images.find(img => img.isMain) || cake.images[0]);

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    router.push(`/cakes/${cake.slug.current}`);
  };

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

  const handleInfoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Link href={`/cakes/${cake.slug.current}`} style={{ textDecoration: "none" }}>
      <motion.div whileHover={{ y: -8 }} transition={{ duration: 0.3 }}>
        <Card
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            "&:hover": {
              boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.2)",
              cursor: "pointer",
            },
          }}
        >
          {mainImage ? (
            <CardMedia
              component="img"
              height={240}
              image={urlFor(mainImage).width(500).height(500).url()}
              alt={mainImage.alt || cake.name}
              sx={{
                objectFit: "cover",
              }}
            />
          ) : (
            <Box
              sx={{
                height: 240,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "grey.100",
              }}
            >
              <CakeOutlined sx={{ fontSize: 80, color: "grey.400" }} />
            </Box>
          )}
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
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
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
                    onClick={handleInfoClick}
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
                  justifyContent: "space-between",
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
                <Button
                  variant="contained"
                  color="primary"
                  endIcon={
                    isLoading ? <CircularProgress size={16} color="inherit" /> : <ArrowForward />
                  }
                  onClick={handleViewDetails}
                  disabled={isLoading}
                  sx={{
                    textTransform: "none",
                    fontWeight: 500,
                    minWidth: 120,
                  }}
                >
                  {isLoading ? "Loading..." : "View Details"}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
