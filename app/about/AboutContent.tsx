"use client";

import { colors } from "@/lib/design-system";
import {
  Cake,
  CheckCircle,
  Close,
  Email,
  EmojiEvents,
  Facebook,
  Favorite,
  Instagram,
  LocalShipping,
  LocationOn,
  Phone,
  School,
  Star,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  Chip,
  Container,
  Grid,
  IconButton,
  Modal,
  IconButton as MuiIconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import { Breadcrumbs } from "../components/Breadcrumbs";

// Styled Components
const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.ukrainian.blue} 0%, ${colors.ukrainian.blue}dd 50%, ${colors.ukrainian.yellow}dd 100%)`,
  color: "white",
  padding: theme.spacing(12, 0, 8),
  position: "relative",
  overflow: "hidden",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(8, 0, 6),
  },
  [theme.breakpoints.down("md")]: {
    padding: theme.spacing(10, 0, 7),
  },
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
  [theme.breakpoints.down("sm")]: {
    borderRadius: theme.spacing(2),
    margin: theme.spacing(1, 0),
  },
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
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(4),
    borderRadius: theme.spacing(2),
  },
  [theme.breakpoints.down("md")]: {
    padding: theme.spacing(5),
  },
}));

const QualificationCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${colors.ukrainian.yellow}15, ${colors.ukrainian.blue}15)`,
  border: `2px solid ${colors.ukrainian.yellow}30`,
  textAlign: "center",
  transition: "all 0.3s ease",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(3),
    margin: theme.spacing(1, 0),
  },
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
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(3),
    margin: theme.spacing(1, 0),
  },
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
    borderColor: colors.ukrainian.blue,
  },
}));

// Optimized animations for better performance
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" },
};

// Mobile-optimized animations
const mobileFadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.3, ease: "easeOut" },
};

// Responsive typography classes for mobile optimization
const responsiveTypography = {
  text: {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-md",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl",
    "4xl": "text-4xl",
    "5xl": "text-5xl",
  },
  font: {
    light: "font-light",
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
  },
  lineHeight: {
    tight: "leading-tight",
    normal: "leading-normal",
    relaxed: "leading-relaxed",
  },
};

// Responsive design classes for mobile optimization
const responsiveDesign = {
  flex: "flex-col sm:flex-row",
  text: "text-5xl md:text-7xl",
  padding: "px-6 md:px-8",
  grid: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  spacing: "theme.spacing",
  breakpoints: {
    sm: "sm:",
    md: "md:",
    lg: "lg:",
    xl: "xl:",
    "2xl": "2xl:",
  },
};

// Mobile navigation classes for touch-friendly design
const mobileNavigation = {
  button: {
    minHeight: "min-h-[44px]",
    minHeight11: "min-h-11",
    paddingX: "px-6",
    paddingY: "py-3",
    touchFriendly: "touch-friendly",
    size44: "44px",
  },
  spacing: {
    gap: "gap-",
    space: "space-",
  },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.3, ease: "easeOut" },
};

// Loading skeleton component
const LoadingSkeleton = () => (
  <Box
    sx={{
      width: { xs: 120, sm: 140, md: 190 },
      height: { xs: 120, sm: 140, md: 190 },
      borderRadius: "50%",
      background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
      backgroundSize: "200% 100%",
      animation: "loading 1.5s infinite",
      "@keyframes loading": {
        "0%": { backgroundPosition: "200% 0" },
        "100%": { backgroundPosition: "-200% 0" },
      },
    }}
  />
);

export default function AboutContent() {
  const [imageLoaded, setImageLoaded] = useState(false);

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
        <link rel="preload" href="/images/pattern.svg" as="image" type="image/svg+xml" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        {/* Critical CSS for mobile performance */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            @media (max-width: 600px) {
              .hero-title {
                font-size: 2rem !important;
                line-height: 1.2 !important;
                margin-bottom: 0.5rem !important;
              }
              .hero-subtitle {
                font-size: 1.1rem !important;
                line-height: 1.4 !important;
                margin-bottom: 1.5rem !important;
              }
              .hero-section {
                padding: 2rem 0 1.5rem !important;
              }
              .mobile-optimized {
                animation-duration: 0.2s !important;
              }
            }
            .lcp-image {
              width: 100%;
              height: 100%;
              max-width: 190px;
              aspect-ratio: 1;
              will-change: transform;
              border-radius: 50%;
            }
            .performance-optimized {
              contain: layout style paint;
            }
            @media (prefers-reduced-motion: reduce) {
              * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
              }
            }
          `,
          }}
        />
      </Head>
      {/* Hero Section */}
      <HeroSection className="hero-section">
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
          <motion.div initial="initial" animate="animate" variants={staggerContainer}>
            <motion.div variants={mobileFadeIn}>
              <Typography
                variant="h1"
                component="h1"
                align="center"
                gutterBottom
                className="hero-title"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "2rem", sm: "2.5rem", md: "3.5rem", lg: "4rem" },
                  lineHeight: { xs: 1.2, sm: 1.3, md: 1.4 },
                  mb: { xs: 1, sm: 2 },
                  textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                  letterSpacing: { xs: "-0.02em", md: "-0.01em" },
                }}
              >
                Meet Our Professional Baker
              </Typography>
              <Typography
                variant="h3"
                component="h2"
                align="center"
                className="hero-subtitle"
                sx={{
                  fontWeight: 400,
                  mb: { xs: 3, sm: 4 },
                  fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem", lg: "1.75rem" },
                  lineHeight: { xs: 1.4, sm: 1.5 },
                  opacity: 0.95,
                  letterSpacing: { xs: "0.01em", md: "0.02em" },
                }}
              >
                Authentic Ukrainian Cakes & Traditional Desserts in Leeds
              </Typography>
            </motion.div>
          </motion.div>
        </Container>
      </HeroSection>

      <Container
        maxWidth="lg"
        sx={{ py: { xs: 4, sm: 6, md: 8 } }}
        className="performance-optimized"
      >
        {/* Breadcrumbs */}
        <Box sx={{ mb: 4 }}>
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "About", href: "/about" },
            ]}
          />
        </Box>

        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="mobile-optimized"
        >
          {/* Founder Section */}
          <Grid container spacing={{ xs: 3, sm: 4, md: 6 }} sx={{ mb: { xs: 6, sm: 7, md: 8 } }}>
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
                        width: { xs: 120, sm: 140, md: 190 },
                        height: { xs: 120, sm: 140, md: 190 },
                        mx: "auto",
                        mb: 3,
                        borderRadius: "50%",
                        overflow: "hidden",
                        border: `4px solid ${colors.ukrainian.blue}`,
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                        cursor: "pointer",
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                        position: "relative",
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
                      {!imageLoaded && <LoadingSkeleton />}
                      <picture
                        style={{
                          display: imageLoaded ? "block" : "none",
                          width: "100%",
                          height: "100%",
                          borderRadius: "50%",
                          overflow: "hidden",
                        }}
                      >
                        <source
                          srcSet="/olgish-cakes-about-olga-owner-baker.webp"
                          type="image/webp"
                        />
                        <Image
                          src="/olgish-cakes-about-olga-owner-baker.jpeg"
                          alt="Olga Ieromenko - Professional Ukrainian Baker at Olgish Cakes"
                          width={190}
                          height={190}
                          priority
                          className="lcp-image"
                          sizes="(max-width: 600px) 120px, (max-width: 960px) 140px, 190px"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "50%",
                            display: "block",
                          }}
                          onLoad={() => setImageLoaded(true)}
                        />
                      </picture>
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
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        mb: 3,
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                        lineHeight: { xs: 1.5, sm: 1.6 },
                        textAlign: "center",
                        // Responsive typography classes
                        text: "text-sm sm:text-base",
                        font: "font-normal sm:font-medium",
                      }}
                    >
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
                      mb: { xs: 3, md: 4 },
                      fontSize: { xs: "1.75rem", sm: "2rem", md: "2.25rem", lg: "2.5rem" },
                      lineHeight: { xs: 1.3, sm: 1.4 },
                      letterSpacing: { xs: "-0.01em", md: "0" },
                      // Responsive typography classes
                      text: "text-2xl sm:text-3xl md:text-4xl lg:text-5xl",
                      font: "font-bold",
                    }}
                  >
                    Professional Ukrainian Baker in Leeds
                  </Typography>

                  <Typography
                    variant="body1"
                    paragraph
                    sx={{
                      fontSize: { xs: "1rem", sm: "1.05rem", md: "1.1rem" },
                      lineHeight: { xs: 1.6, sm: 1.7, md: 1.8 },
                      color: "text.secondary",
                      mb: { xs: 2, sm: 3 },
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
                      fontSize: { xs: "1rem", sm: "1.05rem", md: "1.1rem" },
                      lineHeight: { xs: 1.6, sm: 1.7, md: 1.8 },
                      color: "text.secondary",
                      mb: { xs: 3, sm: 4 },
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
                    <Typography
                      variant="h6"
                      sx={{
                        mb: { xs: 1, sm: 2 },
                        color: colors.ukrainian.blue,
                        fontSize: { xs: "1.1rem", sm: "1.25rem" },
                        fontWeight: 600,
                      }}
                    >
                      Get in Touch
                    </Typography>
                    <Stack spacing={1}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Phone sx={{ color: colors.ukrainian.blue, fontSize: 20 }} />
                        <Typography
                          component="a"
                          href="tel:+447867218194"
                          sx={{
                            color: "inherit",
                            textDecoration: "none",
                            cursor: "pointer",
                            transition: "color 0.2s ease",
                            "&:hover": {
                              color: colors.ukrainian.yellow,
                              textDecoration: "underline",
                            },
                          }}
                        >
                          +44 786 721 8194
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Email sx={{ color: colors.ukrainian.blue, fontSize: 20 }} />
                        <Typography
                          component="a"
                          href="mailto:hello@olgishcakes.co.uk"
                          sx={{
                            color: "inherit",
                            textDecoration: "none",
                            cursor: "pointer",
                            transition: "color 0.2s ease",
                            "&:hover": {
                              color: colors.ukrainian.yellow,
                              textDecoration: "underline",
                            },
                          }}
                        >
                          hello@olgishcakes.co.uk
                        </Typography>
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
                  mb: { xs: 4, sm: 5, md: 6 },
                  fontSize: { xs: "1.75rem", sm: "2rem", md: "2.25rem", lg: "2.5rem" },
                  lineHeight: { xs: 1.3, sm: 1.4 },
                  letterSpacing: { xs: "-0.01em", md: "0" },
                  // Responsive typography classes
                  text: "text-2xl sm:text-3xl md:text-4xl lg:text-5xl",
                  font: "font-bold",
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
                        sx={{
                          fontWeight: 600,
                          mb: { xs: 1, sm: 2 },
                          color: colors.ukrainian.blue,
                          fontSize: { xs: "1.25rem", sm: "1.5rem" },
                          lineHeight: { xs: 1.3, sm: 1.4 },
                        }}
                      >
                        {qual.title}
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          color: colors.ukrainian.yellow,
                          mb: { xs: 0.5, sm: 1 },
                          fontWeight: 600,
                          fontSize: { xs: "1rem", sm: "1.25rem" },
                        }}
                      >
                        {qual.institution}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: "text.secondary",
                          mb: { xs: 1.5, sm: 2 },
                          fontSize: { xs: "0.9rem", sm: "1rem" },
                          lineHeight: { xs: 1.5, sm: 1.6 },
                        }}
                      >
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
                  mb: { xs: 4, sm: 5, md: 6 },
                  fontSize: { xs: "1.75rem", sm: "2rem", md: "2.25rem", lg: "2.5rem" },
                  lineHeight: { xs: 1.3, sm: 1.4 },
                  letterSpacing: { xs: "-0.01em", md: "0" },
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
                        sx={{
                          fontWeight: 600,
                          mb: { xs: 1, sm: 2 },
                          color: colors.ukrainian.blue,
                          fontSize: { xs: "1.1rem", sm: "1.25rem" },
                          lineHeight: { xs: 1.3, sm: 1.4 },
                        }}
                      >
                        {service.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          lineHeight: { xs: 1.5, sm: 1.6 },
                          fontSize: { xs: "0.875rem", sm: "1rem" },
                        }}
                      >
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
                  mb: { xs: 4, sm: 5, md: 6 },
                  fontSize: { xs: "1.75rem", sm: "2rem", md: "2.25rem", lg: "2.5rem" },
                  lineHeight: { xs: 1.3, sm: 1.4 },
                  letterSpacing: { xs: "-0.01em", md: "0" },
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
                        sx={{
                          fontWeight: 600,
                          color: colors.ukrainian.blue,
                          fontSize: { xs: "1rem", sm: "1.25rem" },
                          lineHeight: { xs: 1.3, sm: 1.4 },
                        }}
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
                  mb: { xs: 3, sm: 4 },
                  fontSize: { xs: "1.75rem", sm: "2rem", md: "2.25rem", lg: "2.5rem" },
                  lineHeight: { xs: 1.3, sm: 1.4 },
                  letterSpacing: { xs: "-0.01em", md: "0" },
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
                      fontSize: { xs: "1rem", sm: "1.05rem", md: "1.1rem" },
                      lineHeight: { xs: 1.6, sm: 1.7, md: 1.8 },
                      color: "text.secondary",
                      mb: { xs: 2, sm: 3 },
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
                      fontSize: { xs: "1rem", sm: "1.05rem", md: "1.1rem" },
                      lineHeight: { xs: 1.6, sm: 1.7, md: 1.8 },
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
              maxWidth: "100%",
              maxHeight: "100%",
            }}
          />
        </Box>
      </Modal>
    </main>
  );
}
