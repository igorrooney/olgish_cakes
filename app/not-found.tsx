import { Container, Typography, Button, Box } from "@mui/material";
import Link from "next/link";

export default function NotFound() {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          textAlign: "center",
          gap: 3,
        }}
      >
        <Typography variant="h1" component="h1" sx={{ fontSize: { xs: "2.5rem", md: "4rem" } }}>
          404
        </Typography>
        <Typography variant="h2" sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }}>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary">
          The page you are looking for doesn't exist or has been moved.
        </Typography>
        <Link href="/" style={{ textDecoration: 'none' }}>
              <Button variant="contained" size="large" sx={{ mt: 2 }}>
          Return Home
        </Button>
            </Link>
      </Box>
    </Container>
  );
}
