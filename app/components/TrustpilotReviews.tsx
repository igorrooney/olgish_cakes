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
import { designTokens } from "@/lib/design-system";
import {
  Container as DesignContainer,
  BodyText,
  SectionHeading,
  ProductCard,
  TouchTargetWrapper,
} from "@/lib/ui-components";

const { colors, typography, spacing, borderRadius, shadows } = designTokens;

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
    <DesignContainer sx={{ mt: spacing["4xl"], mb: spacing["4xl"] }}>
      <Box sx={{ textAlign: "center", mb: spacing["2xl"] }}>
        <SectionHeading
          sx={{
            color: colors.primary.main,
            mb: spacing.md,
          }}
        >
          Customer Reviews
        </SectionHeading>
        <Box
          component="img"
          src="https://cdn.trustpilot.net/brand-assets/4.1.0/logo-black.svg"
          alt="Trustpilot"
          sx={{ height: 24, mb: spacing.xl }}
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          gap: spacing.xl,
        }}
      >
        {reviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <ProductCard
              sx={{
                p: spacing.lg,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                backgroundColor: colors.background.subtle,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: spacing.md }}>
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    mr: spacing.md,
                    backgroundColor: colors.primary.main,
                    fontWeight: typography.fontWeight.semibold,
                  }}
                >
                  {review.author[0]}
                </Avatar>
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                    }}
                  >
                    {review.author}
                  </Typography>
                  <BodyText
                    sx={{
                      color: colors.text.secondary,
                      fontSize: typography.fontSize.sm,
                    }}
                  >
                    {review.location && `${review.location} • `}
                    {new Date(review.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </BodyText>
                </Box>
              </Box>

              <Rating
                value={review.rating}
                readOnly
                sx={{
                  mb: spacing.md,
                  "& .MuiRating-iconFilled": {
                    color: colors.secondary.main,
                  },
                }}
              />

              <Typography
                variant="h6"
                sx={{
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                  mb: spacing.sm,
                }}
              >
                {review.title}
              </Typography>

              <BodyText
                sx={{
                  flex: 1,
                  color: colors.text.secondary,
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: "vertical",
                  lineHeight: typography.lineHeight.relaxed,
                }}
              >
                {review.content}
              </BodyText>
            </ProductCard>
          </motion.div>
        ))}
      </Box>

      <Box sx={{ textAlign: "center", mt: spacing.xl }}>
        <BodyText
          sx={{
            color: colors.text.secondary,
            fontSize: typography.fontSize.sm,
            fontStyle: "italic",
          }}
        >
          These reviews are from verified purchases on Trustpilot
        </BodyText>
      </Box>
    </DesignContainer>
  );
}
