"use client";

import { memo, useMemo } from "react";
import { Box, Typography, Grid, Card, CardContent, Rating, Chip, Skeleton } from "@mui/material";
import { colors } from "@/lib/design-system";
import type { Testimonial } from "@/app/types/testimonial";
import { InstagramIcon, FacebookIcon, GoogleIcon } from "@/lib/mui-optimization";
import { TestimonialSkeleton } from "@/lib/skeleton-components";
import dynamic from "next/dynamic";

// Lazy load motion for better performance
const MotionDiv = dynamic(() => import("framer-motion").then(mod => mod.motion.div), {
  loading: () => <div />,
  ssr: false,
});

const sourceIcons = {
  instagram: <InstagramIcon />,
  facebook: <FacebookIcon />,
  google: <GoogleIcon />,
} as const;

interface OrderTestimonialsProps {
  testimonials?: Testimonial[];
}

export const OrderTestimonials = memo(function OrderTestimonials({
  testimonials = [],
}: OrderTestimonialsProps) {
  const displayTestimonials = useMemo(() => testimonials.slice(0, 3), [testimonials]);

  if (displayTestimonials.length === 0) {
    return (
      <Box component="section" sx={{ py: { xs: 6, md: 8 } }}>
        <MotionDiv
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontFamily: "var(--font-alice)",
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
            {[1, 2, 3].map(index => (
              <Grid item xs={12} md={4} key={index}>
                <TestimonialSkeleton showImage={false} variant="compact" />
              </Grid>
            ))}
          </Grid>
        </MotionDiv>
      </Box>
    );
  }

  return (
    <Box component="section" sx={{ py: { xs: 6, md: 8 } }}>
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Typography
          variant="h2"
          component="h2"
          sx={{
            fontFamily: "var(--font-alice)",
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
          {displayTestimonials.map((testimonial, index) => (
            <Grid item xs={12} md={4} key={testimonial._id}>
              <Card sx={{ height: "100%", p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
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
                <Typography
                  variant="caption"
                  display="block"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
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
      </MotionDiv>
    </Box>
  );
});
