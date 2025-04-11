import { Container, Grid, Typography, Box } from "@mui/material";
import CakeCard from "../components/CakeCard";
import { getAllCakes } from "../utils/fetchCakes";

export default async function CakesPage() {
  const cakes = await getAllCakes();
  console.log("Cakes from Sanity:", JSON.stringify(cakes, null, 2));

  if (!cakes || cakes.length === 0) {
    return (
      <Container className="py-8">
        <Box className="text-center">
          <Typography variant="h2" className="mb-4">
            Our Cakes
          </Typography>
          <Typography variant="body1" color="text.secondary">
            We are currently preparing our cake collection. Please check back soon!
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <Typography variant="h2" className="text-center mb-8">
        Our Cakes
      </Typography>
      <Grid container spacing={4}>
        {cakes.map(cake => (
          <Grid item xs={12} sm={6} md={4} key={cake._id}>
            <CakeCard cake={cake} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
