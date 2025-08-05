"use client";

import { Container, Typography, Box } from "@mui/material";
import AnimatedWrapper from "../components/AnimatedWrapper";

export default function HeroSection() {
  return (
    <Box
      className="relative w-full"
      sx={{
        background:
          "linear-gradient(to bottom, rgba(245, 245, 244, 0.5), rgba(255, 255, 255, 0.8))",
        borderBottom: "1px solid rgba(231, 229, 228, 0.3)",
        backdropFilter: "blur(8px)",
        py: { xs: 8, sm: 10, md: 12, lg: 16 },
      }}
    >
      {/* Decorative elements */}
      <Box
        className="absolute inset-0 overflow-hidden pointer-events-none"
        sx={{
          "&::before": {
            content: '""',
            position: "absolute",
            top: "50%",
            left: "0",
            right: "0",
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.03), transparent)",
          },
        }}
      >
        <Box
          className="absolute inset-0"
          sx={{
            background: "radial-gradient(circle at 50% 50%, rgba(0,0,0,0.02) 0%, transparent 50%)",
          }}
        />
      </Box>

      <Container
        maxWidth="lg"
        sx={{
          px: { xs: 2, sm: 3, md: 4 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AnimatedWrapper
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Box
            className="text-center"
            sx={{
              maxWidth: { xs: "100%", sm: "85%", md: "800px" },
              mx: "auto",
              px: { xs: 2, sm: 0 },
            }}
          >
            <Typography
              variant="overline"
              sx={{
                color: "text.secondary",
                letterSpacing: "0.2em",
                fontFamily: "'Inter', sans-serif",
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                fontWeight: 500,
                mb: { xs: 3, sm: 4 },
                opacity: 0.85,
              }}
            >
              ARTISANAL COLLECTION
            </Typography>

            <Typography
              variant="h1"
              sx={{
                fontFamily: "'Playfair Display', serif",
                fontSize: {
                  xs: "2rem",
                  sm: "2.5rem",
                  md: "3.25rem",
                  lg: "3.75rem",
                },
                fontWeight: 500,
                lineHeight: { xs: 1.3, sm: 1.2 },
                letterSpacing: "-0.02em",
                mb: { xs: 3, sm: 4 },
                maxWidth: { sm: "90%", md: "44rem" },
                mx: "auto",
                background: "linear-gradient(to right, #1c1917, #44403c)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                px: { xs: 1, sm: 0 },
              }}
            >
              Discover Our Collection of Artisanal Cakes
            </Typography>

            <Typography
              variant="subtitle1"
              sx={{
                color: "text.secondary",
                fontSize: {
                  xs: "0.975rem",
                  sm: "1.125rem",
                },
                lineHeight: { xs: 1.6, sm: 1.75 },
                fontFamily: "'Inter', sans-serif",
                fontWeight: 400,
                maxWidth: { xs: "100%", sm: "90%", md: "36rem" },
                mx: "auto",
                opacity: 0.85,
                mb: { xs: 4, sm: 5 },
              }}
            >
              Each cake is a masterpiece, handcrafted with precision and care to bring your
              celebrations to life
            </Typography>
          </Box>
        </AnimatedWrapper>
      </Container>
    </Box>
  );
}
