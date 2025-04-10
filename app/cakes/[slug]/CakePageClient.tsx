"use client";

import { Container, Typography, Box, Grid, Chip, Paper } from "@mui/material";
import { useState } from "react";
import { Cake } from "@/types/cake";
import { CakeImageGallery } from "@/app/components/CakeImageGallery";
import { Header } from "@/app/components/Header";
import { BackButton } from "@/app/components/BackButton";
import { DesignSelector, DesignType } from "@/app/components/DesignSelector";

interface PageProps {
  cake: Cake;
}

export function CakePageClient({ cake }: PageProps) {
  const [designType, setDesignType] = useState<DesignType>("standard");
  const hasIndividualDesigns = Boolean(cake.designs?.individual?.length);
  const currentPrice = designType === "standard" ? cake.pricing.standard : cake.pricing.individual;

  return (
    <>
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 12 } }}>
        <Box sx={{ mb: 4 }}>
          <BackButton />
        </Box>
        <Grid container spacing={6}>
          <Grid item xs={12} md={7}>
            <CakeImageGallery
              designs={cake.designs}
              name={cake.name}
              designType={designType}
              onDesignTypeChange={setDesignType}
              hideDesignSelector
            />
          </Grid>
          <Grid item xs={12} md={5}>
            <Box>
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontFamily: "var(--font-playfair-display)",
                  fontWeight: 600,
                  mb: 2,
                  fontSize: { xs: "2rem", md: "3rem" },
                }}
              >
                {cake.name}
              </Typography>

              <Box sx={{ display: "flex", gap: 1, mb: 4 }}>
                <Chip label={`${cake.size} inch`} color="primary" sx={{ fontWeight: 500 }} />
              </Box>

              {hasIndividualDesigns && (
                <Box sx={{ mb: 4 }}>
                  <DesignSelector
                    hasIndividualDesigns={hasIndividualDesigns}
                    onChange={setDesignType}
                    value={designType}
                  />
                </Box>
              )}

              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  mb: 4,
                  fontSize: "1.1rem",
                  lineHeight: 1.8,
                }}
              >
                {cake.description}
              </Typography>

              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mb: 4,
                  backgroundColor: "grey.50",
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Ingredients
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {cake.ingredients.map((ingredient, index) => (
                    <Chip
                      key={index}
                      label={ingredient}
                      sx={{
                        backgroundColor: "white",
                      }}
                    />
                  ))}
                </Box>

                {cake.allergens && cake.allergens.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: "error.main" }}>
                      Allergens
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {cake.allergens.map((allergen, index) => (
                        <Chip
                          key={index}
                          label={allergen}
                          color="error"
                          sx={{
                            fontWeight: 500,
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Paper>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderTop: "1px solid",
                  borderColor: "divider",
                  pt: 4,
                }}
              >
                <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
                  £{currentPrice}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
