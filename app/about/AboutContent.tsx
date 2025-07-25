"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Head from "next/head";
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Card,
  Avatar,
  Chip,
  Button,
  Stack,
  IconButton,
  Modal,
  IconButton as MuiIconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Cake,
  Star,
  LocalShipping,
  School,
  Favorite,
  Instagram,
  Facebook,
  Phone,
  Email,
  LocationOn,
  CheckCircle,
  EmojiEvents,
  Close,
} from "@mui/icons-material";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { colors } from "@/lib/design-system";

// Styled Components
const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.ukrainian.blue} 0%, ${colors.ukrainian.blue}dd 50%, ${colors.ukrainian.yellow}dd 100%)`,
  color: "white",
  padding: theme.spacing(12, 0, 8),
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "url('/images/pattern.svg')",
    opacity: 0.1,
    zIndex: 1,
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  borderRadius: theme.spacing(3),
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  border: `1px solid ${colors.border.light}`,
  transition: "all 0.3s ease-in-out",
  background: "linear-gradient(145deg, #ffffff, #f8f9fa)",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 16px 48px rgba(0, 0, 0, 0.15)",
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6),
  borderRadius: theme.spacing(3),
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
  background: "linear-gradient(145deg, #ffffff, #fafafa)",
  border: `1px solid ${colors.border.light}`,
}));

const QualificationCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${colors.ukrainian.yellow}15, ${colors.ukrainian.blue}15)`,
  border: `2px solid ${colors.ukrainian.yellow}30`,
  textAlign: "center",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "scale(1.02)",
    borderColor: colors.ukrainian.yellow,
  },
}));

const ServiceCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  background: "white",
  border: `1px solid ${colors.border.light}`,
  textAlign: "center",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
    borderColor: colors.ukrainian.blue,
  },
}));

// Optimized animations for better performance
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: "easeOut" },
};

export default function AboutContent() {
  const qualifications = [
    {
      title: "Level 2 Patisserie",
      institution: "Leeds City College",
      description: "Professional Patisserie and Confectionery",
      year: "2022-2023",
      icon: <School sx={{ fontSize: 40, color: colors.ukrainian.blue }} />,
    },
    {
      title: "Level 3 Patisserie",
      institution: "Leeds City College",
      description: "Advanced Patisserie and Confectionery",
      year: "2023-2024",
      icon: <EmojiEvents sx={{ fontSize: 40, color: colors.ukrainian.yellow }} />,
    },
  ];

  const services = [
    {
      title: "Traditional Ukrainian Cakes",
      description:
        "Authentic honey cake (Medovik), Kyiv cake with cashew nuts, Sacher Torte with apricot jam, and Napoleon cake with fresh cream.",
      icon: <Cake sx={{ fontSize: 40, color: colors.ukrainian.blue }} />,
    },
    {
      title: "Premium Handmade Cakes",
      description:
        "Each cake is carefully crafted using time-honored recipes and high-quality ingredients for exceptional taste and presentation.",
      icon: <Favorite sx={{ fontSize: 40, color: colors.ukrainian.yellow }} />,
    },
    {
      title: "Custom Celebration Cakes",
      description:
        "Bespoke wedding cakes, birthday cakes, anniversary cakes, and special occasion cakes designed to your specifications.",
      icon: <Star sx={{ fontSize: 40, color: colors.ukrainian.blue }} />,
    },
    {
      title: "Same-Day Delivery",
      description:
        "Fast delivery across Leeds, York, Bradford, Halifax, Huddersfield, Wakefield, and surrounding areas.",
      icon: <LocalShipping sx={{ fontSize: 40, color: colors.ukrainian.yellow }} />,
    },
  ];

  const achievements = [
    "5★ Customer Rating",
    "127+ Happy Customers",
    "Same-Day Delivery Service",
    "Traditional Ukrainian Recipes",
    "Professional Qualifications",
    "Custom Design Service",
    "Seasonal Specialties",
    "Wedding & Celebration Cakes",
  ];

  const [openModal, setOpenModal] = useState(false);
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  return (
    <main>
      <Head>
        <link
          rel="preload"
          href="/olgish-cakes-about-olga-owner-baker.jpeg"
          as="image"
          type="image/jpeg"
        />
      </Head>
      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
          <motion.div initial="initial" animate="animate" variants={staggerContainer}>
            <motion.div variants={fadeInUp}>
              <Typography
                variant="h1"
                component="h1"
                align="center"
                gutterBottom
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "2.5rem", md: "4rem" },
                  mb: 2,
                  textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                }}
              >
                Meet Our Professional Baker
              </Typography>
              <Typography
                variant="h3"
                component="h2"
                align="center"
                sx={{
                  fontWeight: 400,
                  mb: 4,
                  fontSize: { xs: "1.25rem", md: "1.75rem" },
                  opacity: 0.95,
                }}
              >
                Authentic Ukrainian Cakes & Traditional Desserts in Leeds
              </Typography>
            </motion.div>
          </motion.div>
        </Container>
      </HeroSection>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Breadcrumbs */}
        <Box sx={{ mb: 4 }}>
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "About", href: "/about" },
            ]}
          />
        </Box>

        <motion.div initial="initial" animate="animate" variants={staggerContainer}>
          {/* Founder Section */}
          <Grid container spacing={6} sx={{ mb: 8 }}>
            <Grid item xs={12} md={5}>
              <motion.div variants={scaleIn}>
                <Box
                  sx={{
                    position: "relative",
                    height: { xs: 400, md: 600 },
                    borderRadius: 4,
                    overflow: "hidden",
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
                    background: `linear-gradient(135deg, ${colors.ukrainian.blue}20, ${colors.ukrainian.yellow}20)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `3px solid ${colors.ukrainian.blue}30`,
                  }}
                >
                  <Box sx={{ textAlign: "center", p: 4 }}>
                    <Box
                      sx={{
                        width: { xs: 150, md: 200 },
                        height: { xs: 150, md: 200 },
                        mx: "auto",
                        mb: 3,
                        borderRadius: "50%",
                        overflow: "hidden",
                        border: `4px solid ${colors.ukrainian.blue}`,
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                        cursor: "pointer",
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                        "&:hover": {
                          transform: "scale(1.05)",
                          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.3)",
                        },
                      }}
                      onClick={handleOpenModal}
                      role="button"
                      tabIndex={0}
                      aria-label="Click to view full size photo of Olga Ieromenko"
                      onKeyDown={e => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleOpenModal();
                        }
                      }}
                    >
                      <img
                        src="/olgish-cakes-about-olga-owner-baker.jpeg"
                        alt="Olga Ieromenko - Professional Ukrainian Baker at Olgish Cakes"
                        loading="lazy"
                        decoding="async"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </Box>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 600,
                        mb: 2,
                        color: colors.ukrainian.blue,
                        fontSize: { xs: "1.5rem", md: "2rem" },
                      }}
                    >
                      Olga Ieromenko
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        color: "text.secondary",
                        mb: 3,
                        fontSize: { xs: "1rem", md: "1.25rem" },
                      }}
                    >
                      Professional Ukrainian Baker
                    </Typography>
                    <Chip
                      label="Level 3 Patisserie Qualified"
                      sx={{
                        bgcolor: colors.ukrainian.yellow,
                        color: colors.ukrainian.blue,
                        fontWeight: 600,
                        mb: 2,
                      }}
                    />
                    <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
                      Traditional Ukrainian baking with modern expertise
                    </Typography>
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <IconButton
                        href="https://www.instagram.com/olgish_cakes/"
                        target="_blank"
                        sx={{ color: colors.ukrainian.blue }}
                      >
                        <Instagram />
                      </IconButton>
                      <IconButton
                        href="https://www.facebook.com/p/Olgish-Cakes-61557043820222/?locale=en_GB"
                        target="_blank"
                        sx={{ color: colors.ukrainian.blue }}
                      >
                        <Facebook />
                      </IconButton>
                    </Stack>
                  </Box>
                </Box>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={7}>
              <motion.div variants={fadeInUp}>
                <StyledPaper>
                  <Typography
                    variant="h3"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      color: colors.ukrainian.blue,
                      mb: 4,
                      fontSize: { xs: "2rem", md: "2.5rem" },
                    }}
                  >
                    Professional Ukrainian Baker in Leeds
                  </Typography>

                  <Typography
                    variant="body1"
                    paragraph
                    sx={{
                      fontSize: "1.1rem",
                      lineHeight: 1.8,
                      color: "text.secondary",
                      mb: 3,
                    }}
                  >
                    I am <strong>Olga Ieromenko</strong>, a professionally-trained Ukrainian baker
                    who moved to Leeds in 2022. My passion for authentic Ukrainian baking led me to
                    complete both Level 2 and Level 3 Patisserie courses at Leeds City College,
                    where I honed my skills in traditional and contemporary baking techniques.
                  </Typography>

                  <Typography
                    variant="body1"
                    paragraph
                    sx={{
                      fontSize: "1.1rem",
                      lineHeight: 1.8,
                      color: "text.secondary",
                      mb: 4,
                    }}
                  >
                    My mission is to share the rich heritage of Ukrainian baking with the UK,
                    offering a unique blend of traditional recipes and contemporary presentation.
                    From authentic Ukrainian honey cake (Medovik) and Kyiv cake to seasonal
                    specialties and custom celebration cakes, each creation is a celebration of both
                    Ukrainian culture and modern patisserie excellence. Our traditional Medovik
                    recipe has been passed down through generations, ensuring the authentic taste of
                    Ukrainian honey cake delivery across Yorkshire.
                  </Typography>

                  {/* Contact Information */}
                  <Box
                    sx={{
                      background: `linear-gradient(135deg, ${colors.ukrainian.blue}10, ${colors.ukrainian.yellow}10)`,
                      p: 3,
                      borderRadius: 2,
                      border: `1px solid ${colors.ukrainian.blue}20`,
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 2, color: colors.ukrainian.blue }}>
                      Get in Touch
                    </Typography>
                    <Stack spacing={1}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Phone sx={{ color: colors.ukrainian.blue, fontSize: 20 }} />
                        <Typography>+44 786 721 8194</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Email sx={{ color: colors.ukrainian.blue, fontSize: 20 }} />
                        <Typography>hello@olgishcakes.co.uk</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <LocationOn sx={{ color: colors.ukrainian.blue, fontSize: 20 }} />
                        <Typography>Leeds, West Yorkshire</Typography>
                      </Box>
                    </Stack>
                  </Box>
                </StyledPaper>
              </motion.div>
            </Grid>
          </Grid>

          {/* Qualifications Section */}
          <motion.div variants={fadeInUp}>
            <StyledPaper sx={{ mb: 8 }}>
              <Typography
                variant="h3"
                align="center"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  color: colors.ukrainian.blue,
                  mb: 6,
                  fontSize: { xs: "2rem", md: "2.5rem" },
                }}
              >
                Professional Qualifications
              </Typography>

              <Grid container spacing={4}>
                {qualifications.map((qual, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <QualificationCard>
                      <Box sx={{ mb: 3 }}>{qual.icon}</Box>
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: 600, mb: 2, color: colors.ukrainian.blue }}
                      >
                        {qual.title}
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ color: colors.ukrainian.yellow, mb: 1, fontWeight: 600 }}
                      >
                        {qual.institution}
                      </Typography>
                      <Typography variant="body1" sx={{ color: "text.secondary", mb: 2 }}>
                        {qual.description}
                      </Typography>
                      <Chip
                        label={qual.year}
                        sx={{
                          bgcolor: colors.ukrainian.blue,
                          color: "white",
                          fontWeight: 600,
                        }}
                      />
                    </QualificationCard>
                  </Grid>
                ))}
              </Grid>
            </StyledPaper>
          </motion.div>

          {/* Services Section */}
          <motion.div variants={fadeInUp}>
            <StyledPaper sx={{ mb: 8 }}>
              <Typography
                variant="h3"
                align="center"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  color: colors.ukrainian.blue,
                  mb: 6,
                  fontSize: { xs: "2rem", md: "2.5rem" },
                }}
              >
                Our Professional Services
              </Typography>

              <Grid container spacing={4}>
                {services.map((service, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <ServiceCard>
                      <Box sx={{ mb: 3 }}>{service.icon}</Box>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, mb: 2, color: colors.ukrainian.blue }}
                      >
                        {service.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.6 }}>
                        {service.description}
                      </Typography>
                    </ServiceCard>
                  </Grid>
                ))}
              </Grid>
            </StyledPaper>
          </motion.div>

          {/* Achievements Section */}
          <motion.div variants={fadeInUp}>
            <StyledPaper sx={{ mb: 8 }}>
              <Typography
                variant="h3"
                align="center"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  color: colors.ukrainian.blue,
                  mb: 6,
                  fontSize: { xs: "2rem", md: "2.5rem" },
                }}
              >
                Why Choose Olgish Cakes?
              </Typography>

              <Grid container spacing={3}>
                {achievements.map((achievement, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        p: 2,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${colors.ukrainian.yellow}15, ${colors.ukrainian.blue}15)`,
                        border: `1px solid ${colors.ukrainian.yellow}30`,
                      }}
                    >
                      <CheckCircle sx={{ color: colors.ukrainian.blue, fontSize: 28 }} />
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, color: colors.ukrainian.blue }}
                      >
                        {achievement}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </StyledPaper>
          </motion.div>

          {/* Heritage Section */}
          <motion.div variants={fadeInUp}>
            <StyledPaper sx={{ mb: 8 }}>
              <Typography
                variant="h3"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  color: colors.ukrainian.blue,
                  mb: 4,
                  fontSize: { xs: "2rem", md: "2.5rem" },
                }}
              >
                Our Ukrainian Heritage
              </Typography>

              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Typography
                    variant="body1"
                    paragraph
                    sx={{
                      fontSize: "1.1rem",
                      lineHeight: 1.8,
                      color: "text.secondary",
                      mb: 3,
                    }}
                  >
                    Rooted in Ukrainian culinary traditions, Olgish Cakes represents a fusion of
                    time-honored recipes and innovative techniques. Our journey began with a passion
                    for bringing authentic Ukrainian flavors to Leeds, where baking is not just a
                    craft but a cherished cultural tradition.
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: "1.1rem",
                      lineHeight: 1.8,
                      color: "text.secondary",
                    }}
                  >
                    The name "Olgish" embodies our philosophy: combining my name, Olga, with the
                    essence of deliciousness. This represents our commitment to creating not just
                    visually stunning, but exceptionally flavorful confections that honor both
                    Ukrainian heritage and contemporary tastes.
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      background: `linear-gradient(135deg, ${colors.ukrainian.blue}10, ${colors.ukrainian.yellow}10)`,
                      p: 4,
                      borderRadius: 3,
                      border: `2px solid ${colors.ukrainian.blue}20`,
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{ mb: 3, color: colors.ukrainian.blue, fontWeight: 600 }}
                    >
                      Traditional Ukrainian Specialties
                    </Typography>
                    <Stack spacing={2}>
                      {[
                        "Honey Cake (Medovik) - Our signature traditional dessert",
                        "Kyiv Cake - Premium handmade Ukrainian cake with cashew nuts",
                        "Sacher Torte - Rich chocolate cake with apricot jam",
                        "Napoleon Cake - Traditional layered cake with fresh cream",
                        "Seasonal Cakes - Christmas, Easter, and holiday specialties",
                        "Custom Celebration Cakes - Weddings, birthdays, and events",
                      ].map((item, index) => (
                        <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Cake sx={{ color: colors.ukrainian.yellow, fontSize: 20 }} />
                          <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            {item}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </StyledPaper>
          </motion.div>

          {/* Call to Action */}
          <motion.div variants={fadeInUp}>
            <Box
              sx={{
                textAlign: "center",
                p: 6,
                borderRadius: 4,
                background: `linear-gradient(135deg, ${colors.ukrainian.blue}, ${colors.ukrainian.blue}dd)`,
                color: "white",
              }}
            >
              <Typography variant="h3" sx={{ mb: 3, fontWeight: 700 }}>
                Ready to Experience Authentic Ukrainian Baking?
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                Order your traditional Ukrainian cakes or custom celebration cake today
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
                <Button
                  variant="contained"
                  size="large"
                  href="/cakes"
                  sx={{
                    bgcolor: colors.ukrainian.yellow,
                    color: colors.ukrainian.blue,
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    "&:hover": {
                      bgcolor: colors.ukrainian.yellow,
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  View Our Cakes
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  href="/contact"
                  sx={{
                    borderColor: colors.ukrainian.yellow,
                    color: colors.ukrainian.yellow,
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    "&:hover": {
                      borderColor: colors.ukrainian.yellow,
                      bgcolor: colors.ukrainian.yellow,
                      color: colors.ukrainian.blue,
                    },
                  }}
                >
                  Get in Touch
                </Button>
              </Stack>
            </Box>
          </motion.div>
        </motion.div>
      </Container>

      {/* Modal for the photo */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(0, 0, 0, 0.9)",
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: { xs: "95vw", sm: "80vw" },
            height: { xs: "70vh", sm: "80vh" },
            maxWidth: "800px",
            maxHeight: "600px",
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
          }}
        >
          <MuiIconButton
            onClick={handleCloseModal}
            sx={{
              position: "absolute",
              top: { xs: 4, sm: 8 },
              right: { xs: 4, sm: 8 },
              bgcolor: "rgba(0, 0, 0, 0.5)",
              color: "white",
              zIndex: 1,
              width: { xs: 40, sm: 32 },
              height: { xs: 40, sm: 32 },
              "&:hover": {
                bgcolor: "rgba(0, 0, 0, 0.7)",
              },
            }}
          >
            <Close sx={{ fontSize: { xs: 24, sm: 20 } }} />
          </MuiIconButton>
          <img
            src="/olgish-cakes-about-olga-owner-baker.jpeg"
            alt="Olga Ieromenko - Professional Ukrainian Baker at Olgish Cakes"
            loading="eager"
            decoding="async"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
            }}
          />
        </Box>
      </Modal>
    </main>
  );
}
