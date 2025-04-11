"use client";

import { motion } from "framer-motion";
import { Container, Typography, Box, Grid, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";

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

export default function AboutContent() {
  return (
    <main>
      <Box
        sx={{
          background: "linear-gradient(to bottom, #fff5f0 0%, #ffffff 100%)",
          minHeight: "100vh",
          py: 8,
        }}
      >
        <Container maxWidth="lg">
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
              <Typography
                variant="h4"
                component="h2"
                align="center"
                gutterBottom
                sx={{
                  color: "text.secondary",
                  mb: 6,
                  fontFamily: "var(--font-playfair-display)",
                }}
              >
                Artisan Ukrainian Patisserie in Leeds
              </Typography>
            </motion.div>

            <Grid container spacing={4}>
              <Grid item xs={12} md={5}>
                <motion.div variants={fadeInUp}>
                  <Box
                    sx={{
                      position: "relative",
                      height: { xs: 400, md: 600 },
                      borderRadius: 4,
                      overflow: "hidden",
                      boxShadow: 3,
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "primary.light",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          color: "primary.contrastText",
                          textAlign: "center",
                          px: 4,
                        }}
                      >
                        Photo of Olga coming soon
                      </Typography>
                    </Box>
                  </Box>
                </motion.div>
              </Grid>

              <Grid item xs={12} md={7}>
                <motion.div variants={fadeInUp}>
                  <StyledPaper>
                    <Typography
                      variant="h5"
                      gutterBottom
                      sx={{ fontWeight: 600, color: "#2D3748" }}
                    >
                      Meet Our Founder
                    </Typography>
                    <Typography
                      variant="body1"
                      paragraph
                      sx={{ color: "#4A5568", lineHeight: 1.8 }}
                    >
                      I am Olga Ieromenko, a professionally-trained baker specializing in Ukrainian
                      confectionery. After moving to Leeds in 2022, I pursued my passion for baking
                      by completing both Level 2 and Level 3 Patisserie courses at Leeds City
                      College, where I honed my skills in traditional and contemporary baking
                      techniques.
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#4A5568", lineHeight: 1.8 }}>
                      My mission is to share the rich heritage of Ukrainian baking with the UK,
                      offering a unique blend of traditional recipes and contemporary presentation.
                      Each creation is a celebration of both Ukrainian culture and modern patisserie
                      excellence.
                    </Typography>
                  </StyledPaper>
                </motion.div>
              </Grid>

              <Grid item xs={12}>
                <motion.div variants={fadeInUp}>
                  <StyledPaper>
                    <Typography
                      variant="h5"
                      gutterBottom
                      sx={{ fontWeight: 600, color: "#2D3748" }}
                    >
                      Our Heritage
                    </Typography>
                    <Typography
                      variant="body1"
                      paragraph
                      sx={{ color: "#4A5568", lineHeight: 1.8 }}
                    >
                      Rooted in Ukrainian culinary traditions, Olgish Cakes represents a fusion of
                      time-honored recipes and innovative techniques. Our journey began with a
                      passion for bringing authentic Ukrainian flavors to Leeds, where baking is not
                      just a craft but a cherished cultural tradition.
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#4A5568", lineHeight: 1.8 }}>
                      The name "Olgish" embodies our philosophy: combining my name, Olga, with the
                      essence of deliciousness. This represents our commitment to creating not just
                      visually stunning, but exceptionally flavorful confections that honor both
                      Ukrainian heritage and contemporary tastes.
                    </Typography>
                  </StyledPaper>
                </motion.div>
              </Grid>

              <Grid item xs={12}>
                <motion.div variants={fadeInUp}>
                  <StyledPaper>
                    <Typography
                      variant="h5"
                      gutterBottom
                      sx={{ fontWeight: 600, color: "#2D3748" }}
                    >
                      Professional Qualifications
                    </Typography>
                    <Grid container spacing={3}>
                      {[
                        {
                          title: "Level 2 Patisserie",
                          description:
                            "Leeds City College - Professional Patisserie and Confectionery",
                          image: "Certificate placeholder",
                        },
                        {
                          title: "Level 3 Patisserie",
                          description: "Leeds City College - Advanced Patisserie and Confectionery",
                          image: "Certificate placeholder",
                        },
                      ].map((item, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                          <Box textAlign="center" sx={{ p: 2 }}>
                            <Box
                              sx={{
                                height: 200,
                                backgroundColor: "grey.100",
                                borderRadius: 2,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mb: 2,
                              }}
                            >
                              <Typography variant="body2" color="text.secondary">
                                {item.image}
                              </Typography>
                            </Box>
                            <Typography variant="h6" sx={{ color: "#FF6B6B", mb: 1 }}>
                              {item.title}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#4A5568" }}>
                              {item.description}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </StyledPaper>
                </motion.div>
              </Grid>

              <Grid item xs={12}>
                <motion.div variants={fadeInUp}>
                  <StyledPaper>
                    <Typography
                      variant="h5"
                      gutterBottom
                      sx={{ fontWeight: 600, color: "#2D3748" }}
                    >
                      Our Commitment to Excellence
                    </Typography>
                    <Grid container spacing={3}>
                      {[
                        {
                          title: "Artisan Craftsmanship",
                          description:
                            "Each creation is meticulously handcrafted using traditional Ukrainian techniques and modern patisserie methods.",
                        },
                        {
                          title: "Premium Ingredients",
                          description:
                            "We source only the finest, locally-sourced ingredients, ensuring exceptional quality and taste in every bite.",
                        },
                        {
                          title: "Cultural Authenticity",
                          description:
                            "Our recipes preserve the authentic flavors and techniques of traditional Ukrainian baking.",
                        },
                        {
                          title: "Custom Excellence",
                          description:
                            "We offer bespoke consultation services to create personalized masterpieces for your special occasions.",
                        },
                        {
                          title: "Innovative Design",
                          description:
                            "While honoring tradition, we incorporate contemporary design elements to create visually stunning presentations.",
                        },
                        {
                          title: "Sustainable Practices",
                          description:
                            "We are committed to environmentally responsible practices, from sourcing to packaging.",
                        },
                      ].map((item, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Box textAlign="center" sx={{ p: 2 }}>
                            <Typography variant="h6" sx={{ color: "#FF6B6B", mb: 2 }}>
                              {item.title}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#4A5568" }}>
                              {item.description}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </StyledPaper>
                </motion.div>
              </Grid>
            </Grid>
          </motion.div>
        </Container>
      </Box>
    </main>
  );
}
