import { Container, Typography, Box, Grid, Chip, Paper, Button } from "@mui/material";
import { client } from "@/sanity/lib/client";
import { Cake } from "@/types/cake";
import { notFound } from "next/navigation";
import { CakeImageGallery } from "@/app/components/CakeImageGallery";
import { Header } from "@/app/components/Header";
import { BackButton } from "@/app/components/BackButton";

async function getCake(slug: string): Promise<Cake | null> {
  const query = `*[_type == "cake" && slug.current == $slug][0] {
    _id,
    _createdAt,
    name,
    slug,
    description,
    size,
    price,
    images,
    category,
    ingredients,
    allergens
  }`;

  return client.fetch(query, { slug });
}

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function CakePage({ params }: PageProps) {
  const cake = await getCake(params.slug);

  if (!cake) {
    notFound();
  }

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 12 } }}>
        <Box sx={{ mb: 4 }}>
          <BackButton />
        </Box>
        <Grid container spacing={6}>
          <Grid item xs={12} md={6}>
            <CakeImageGallery images={cake.images} name={cake.name} />
          </Grid>
          <Grid item xs={12} md={6}>
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
                  £{cake.price}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
