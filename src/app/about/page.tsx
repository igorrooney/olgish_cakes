"use client";

import { motion } from "framer-motion";
import { Container, Typography, Box, Grid, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";
import Image from "next/image";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: "16px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
  background: "linear-gradient(145deg, #ffffff, #f5f5f5)",
}));

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

export default function AboutPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <motion.div initial="initial" animate="animate" variants={staggerContainer}>
        <motion.div variants={fadeInUp}>
          <Typography
            variant="h2"
            component="h1"
            align="center"
            gutterBottom
            sx={{
              fontWeight: 700,
              mb: 4,
              background: "linear-gradient(45deg, #FF6B6B, #FF8E53)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            About Olgish Cakes
          </Typography>
        </motion.div>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <motion.div variants={fadeInUp}>
              <StyledPaper>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: "#2D3748" }}>
                  Our Story
                </Typography>
                <Typography variant="body1" paragraph sx={{ color: "#4A5568", lineHeight: 1.8 }}>
                  Founded with a passion for creating unforgettable moments, Olgish Cakes has been
                  crafting exquisite custom cakes since 2010. Our journey began in a small kitchen
                  with a big dream to bring joy to every celebration through our artisanal
                  creations.
                </Typography>
                <Typography variant="body1" sx={{ color: "#4A5568", lineHeight: 1.8 }}>
                  Each cake we create is a masterpiece, blending traditional techniques with
                  innovative designs to deliver a truly unique experience for our clients.
                </Typography>
              </StyledPaper>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={6}>
            <motion.div variants={fadeInUp}>
              <StyledPaper>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: "#2D3748" }}>
                  Our Philosophy
                </Typography>
                <Typography variant="body1" paragraph sx={{ color: "#4A5568", lineHeight: 1.8 }}>
                  We believe that every cake should be as unique as the occasion it celebrates. Our
                  team of skilled pastry chefs combines creativity with precision to create cakes
                  that not only look stunning but taste incredible.
                </Typography>
                <Typography variant="body1" sx={{ color: "#4A5568", lineHeight: 1.8 }}>
                  Quality ingredients, attention to detail, and a commitment to excellence are the
                  cornerstones of our craft.
                </Typography>
              </StyledPaper>
            </motion.div>
          </Grid>

          <Grid item xs={12}>
            <motion.div variants={fadeInUp}>
              <StyledPaper>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: "#2D3748" }}>
                  Our Commitment
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <Box textAlign="center">
                      <Typography variant="h6" sx={{ color: "#FF6B6B", mb: 2 }}>
                        Quality
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#4A5568" }}>
                        Using only the finest ingredients and traditional techniques
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box textAlign="center">
                      <Typography variant="h6" sx={{ color: "#FF6B6B", mb: 2 }}>
                        Creativity
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#4A5568" }}>
                        Custom designs tailored to your vision and preferences
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box textAlign="center">
                      <Typography variant="h6" sx={{ color: "#FF6B6B", mb: 2 }}>
                        Excellence
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#4A5568" }}>
                        Uncompromising standards in every aspect of our work
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </StyledPaper>
            </motion.div>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
}
