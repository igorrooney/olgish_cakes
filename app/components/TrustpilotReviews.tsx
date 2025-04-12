"use client";

import {
  Box,
  Container,
  Paper,
  Typography,
  Rating,
  Avatar,
  CircularProgress,
  Alert,
} from "@mui/material";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { fetchTrustpilotReviews } from "@/app/lib/trustpilot";

interface Review {
  id: string;
  author: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  location?: string;
}

interface TrustpilotReviewsProps {
  productName: string;
}

export function TrustpilotReviews({ productName }: TrustpilotReviewsProps) {
  const [reviews, setReviews] = useState<Review[] | null>(null);

  useEffect(() => {
    async function loadReviews() {
      const data = await fetchTrustpilotReviews(productName);
      setReviews(data || null);
    }

    loadReviews();
  }, [productName]);

  // Don't render anything if there are no reviews
  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 8, mb: 8 }}>
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography
          variant="h4"
          component="h2"
          sx={{
            fontFamily: "var(--font-playfair-display)",
            fontWeight: 600,
            color: "primary.main",
            mb: 2,
          }}
        >
          Customer Reviews
        </Typography>
        <Box
          component="img"
          src="https://cdn.trustpilot.net/brand-assets/4.1.0/logo-black.svg"
          alt="Trustpilot"
          sx={{ height: 24, mb: 4 }}
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          gap: 4,
        }}
      >
        {reviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                bgcolor: "grey.50",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar sx={{ width: 48, height: 48, mr: 2, bgcolor: "primary.main" }}>
                  {review.author[0]}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {review.author}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {review.location && `${review.location} • `}
                    {new Date(review.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </Typography>
                </Box>
              </Box>

              <Rating value={review.rating} readOnly sx={{ mb: 2 }} />

              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                {review.title}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  flex: 1,
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {review.content}
              </Typography>
            </Paper>
          </motion.div>
        ))}
      </Box>

      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="body2" color="text.secondary">
          These reviews are from verified purchases on Trustpilot
        </Typography>
      </Box>
    </Container>
  );
}
