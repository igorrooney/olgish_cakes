"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Rating,
  Chip,
} from "@mui/material";
import { motion } from "framer-motion";
import { colors } from "@/lib/design-system";
import { getFeaturedTestimonials } from "@/app/utils/fetchTestimonials";
import type { Testimonial } from "@/app/types/testimonial";
import { Instagram, Facebook, Google } from "@mui/icons-material";

const sourceIcons = {
  instagram: <Instagram />,
  facebook: <Facebook />,
  google: <Google />,
} as const;

export function OrderTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const featuredTestimonials = await getFeaturedTestimonials(3);
        setTestimonials(featuredTestimonials);
      } catch (error) {
        console.error("Error fetching testimonials:", error);
        // Fallback to empty array if fetch fails
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTestimonials();
  }, []);

  if (loading) {
    return (
      <Box component="section" sx={{ py: { xs: 6, md: 8 } }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontFamily: "var(--font-playfair-display)",
              fontWeight: 600,
              fontSize: { xs: "2rem", md: "2.5rem" },
              textAlign: "center",
              mb: 2,
            }}
          >
            What Our Customers Say
          </Typography>
          <Typography
            variant="h3"
            component="p"
            sx={{
              fontSize: "1.25rem",
              textAlign: "center",
              mb: 6,
              color: "text.secondary",
            }}
          >
            Join hundreds of satisfied customers who trust us with their special occasions
          </Typography>
          <Grid container spacing={4}>
            {[1, 2, 3].map((index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{ height: "100%", p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Rating value={5} readOnly sx={{ color: colors.secondary.main }} />
                  </Box>
                  <Typography variant="body1" sx={{ mb: 2, fontStyle: "italic" }}>
                    Loading testimonial...
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Loading...
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Loading...
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Box>
    );
  }

  if (testimonials.length === 0) {
    return null; // Don't show testimonials section if no testimonials available
  }

  return (
    <Box component="section" sx={{ py: { xs: 6, md: 8 } }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Typography
          variant="h2"
          component="h2"
          sx={{
            fontFamily: "var(--font-playfair-display)",
            fontWeight: 600,
            fontSize: { xs: "2rem", md: "2.5rem" },
            textAlign: "center",
            mb: 2,
          }}
        >
          What Our Customers Say
        </Typography>
        <Typography
          variant="h3"
          component="p"
          sx={{
            fontSize: "1.25rem",
            textAlign: "center",
            mb: 6,
            color: "text.secondary",
          }}
        >
          Join hundreds of satisfied customers who trust us with their special occasions
        </Typography>

        <Grid container spacing={4}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} md={4} key={testimonial._id}>
              <Card sx={{ height: "100%", p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                  <Rating
                    value={testimonial.rating}
                    readOnly
                    precision={0.5}
                    sx={{
                      "& .MuiRating-iconFilled": {
                        color: colors.secondary.main,
                      },
                    }}
                  />
                  {testimonial.source && testimonial.source in sourceIcons && (
                    <Chip
                      icon={sourceIcons[testimonial.source as keyof typeof sourceIcons]}
                      label={testimonial.source}
                      size="small"
                      sx={{
                        backgroundColor: "rgba(44, 82, 130, 0.1)",
                        "& .MuiChip-icon": {
                          color: colors.primary.main,
                        },
                      }}
                    />
                  )}
                </Box>
                <Typography variant="body1" sx={{ mb: 2, fontStyle: "italic" }}>
                  "{testimonial.text}"
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {testimonial.customerName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {testimonial.cakeType} Customer
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                  {new Date(testimonial.date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </motion.div>
    </Box>
  );
} 