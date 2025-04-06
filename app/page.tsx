import { Container, Typography, Grid, Box } from "@mui/material";
import { client } from "@/sanity/lib/client";
import { CakeCard } from "./components/CakeCard";
import { Cake } from "@/types/cake";
import { Header } from "./components/Header";

async function getCakes(): Promise<Cake[]> {
  const query = `*[_type == "cake"] | order(_createdAt desc) {
    _id,
    _createdAt,
    name,
    slug,
    description,
    size,
    pricing,
    designs,
    category,
    ingredients,
    allergens
  }`;

  return client.fetch(query);
}

export default async function Home() {
  const cakes = await getCakes();

  return (
    <>
      <Header />
      <Box
        sx={{
          bgcolor: "background.paper",
          pt: { xs: 6, md: 12 },
          pb: { xs: 8, md: 16 },
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              textAlign: "center",
              mb: { xs: 6, md: 10 },
            }}
          >
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: "2.5rem", md: "4rem" },
                fontFamily: "var(--font-playfair-display)",
                fontWeight: 600,
                color: "text.primary",
                maxWidth: "800px",
                lineHeight: 1.2,
              }}
            >
              Authentic Ukrainian Cakes in Leeds
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: "1.25rem", md: "1.5rem" },
                color: "text.secondary",
                maxWidth: "600px",
                mb: 2,
              }}
            >
              Handcrafted with love by Olga Ieromenko
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {cakes.map(cake => (
              <Grid item key={cake._id} xs={12} sm={6} md={4}>
                <CakeCard cake={cake} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </>
  );
}
