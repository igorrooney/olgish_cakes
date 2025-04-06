import { Container, Typography, Box, Button, Grid } from "@mui/material";
import { Cake } from "@mui/icons-material";

export default function Home() {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          my: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
        }}
      >
        <Typography variant="h1" component="h1" gutterBottom>
          Welcome to Olgish Cakes
        </Typography>
        <Typography variant="h2" component="h2" color="primary">
          Delicious Homemade Treats
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                p: 3,
                textAlign: "center",
                bgcolor: "background.paper",
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              <Cake sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
              <Typography variant="h3" gutterBottom>
                Custom Cakes
              </Typography>
              <Typography variant="body1" paragraph>
                Beautiful and delicious custom cakes for any occasion
              </Typography>
              <Button variant="contained" color="primary">
                Order Now
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
