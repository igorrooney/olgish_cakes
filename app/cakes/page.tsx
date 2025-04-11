import { Container, Grid, Typography, Box } from "@mui/material";
import CakeCard from "../components/CakeCard";
import { getAllCakes } from "../utils/fetchCakes";
import Loading from "@/app/components/Loading";
import HeroSection from "./HeroSection";

export default async function CakesPage() {
  const cakes = await getAllCakes();

  return (
    <main className="min-h-screen bg-gray-50">
      <HeroSection />

      {/* Main Content */}
      <Container maxWidth="lg" className="py-16">
        {/* Cakes Grid */}
        {!cakes || cakes.length === 0 ? (
          <Box className="text-center py-16">
            <Typography variant="h4" className="mb-4 text-gray-700 font-light">
              Our Cake Collection
            </Typography>
            <Typography variant="body1" color="text.secondary" className="max-w-md mx-auto">
              We are currently preparing our cake collection. Please check back soon!
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={6} className="mt-8">
            {cakes.map(cake => (
              <Grid item xs={12} sm={6} md={4} key={cake._id}>
                <CakeCard cake={cake} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </main>
  );
}
