"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { Testimonial } from "../types/testimonial";
import {
  InstagramIcon,
  FacebookIcon,
  GoogleIcon,
  CakeOutlinedIcon,
  ZoomInIcon,
  CloseIcon,
} from "@/lib/mui-optimization";
import { useRouter } from "next/navigation";
import { urlFor } from "@/sanity/lib/image";
import { useState, memo } from "react";
import { designTokens } from "@/lib/design-system";
import { BodyText } from "@/lib/ui-components";
import { AccessibleIconButton } from "@/lib/ui-components";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Modal,
  Rating,
  Typography,
} from "@/lib/mui-optimization";
import { Pagination, Fade } from "@mui/material";

const MotionCard = motion.create(Card);

const sourceIcons = {
  instagram: <InstagramIcon />,
  facebook: <FacebookIcon />,
  google: <GoogleIcon />,
} as const;

interface TestimonialsListProps {
  testimonials: Testimonial[];
  currentPage: number;
  totalPages: number;
}

export function TestimonialsList({ testimonials, currentPage, totalPages }: TestimonialsListProps) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState<{ [key: string]: boolean }>({});

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    router.push(`/testimonials?page=${page}`);
  };

  const handleImageLoad = (id: string) => {
    setImageLoading(prev => ({ ...prev, [id]: false }));
  };

  const handleImageLoadStart = (id: string) => {
    setImageLoading(prev => ({ ...prev, [id]: true }));
  };

  const getImageUrl = (testimonial: Testimonial) => {
    try {
      if (testimonial.cakeImage?.url) {
        return testimonial.cakeImage.url;
      }
      if (testimonial.cakeImage?.asset) {
        return urlFor(testimonial.cakeImage).width(800).height(600).fit("crop").quality(90).url();
      }
      return null;
    } catch (error) {
      console.error("Error generating image URL:", error);
      return null;
    }
  };

  return (
    <>
      <Grid container spacing={4} className="mb-8">
        {testimonials.map((testimonial, index) => {
          const imageUrl = getImageUrl(testimonial);
          const isLoading = imageLoading[testimonial._id];

          return (
            <Grid item xs={12} md={6} key={testimonial._id}>
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="h-full shadow-md hover:shadow-lg transition-shadow duration-300"
                sx={{
                  background: "linear-gradient(to bottom right, #ffffff, #faf7f5)",
                  borderRadius: "12px",
                }}
              >
                <CardContent className="space-y-4">
                  {imageUrl ? (
                    <div className="relative h-64 w-full mb-4 rounded-lg overflow-hidden group">
                      <Fade in={isLoading} timeout={200}>
                        <Box
                          className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100"
                          sx={{ display: isLoading ? "flex" : "none" }}
                        >
                          <div className="w-8 h-8 border-4 border-primary rounded-full border-t-transparent animate-spin" />
                        </Box>
                      </Fade>
                      <Image
                        src={imageUrl}
                        alt={testimonial.cakeImage?.alt || `${testimonial.customerName}'s cake`}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        onLoadStart={() => handleImageLoadStart(testimonial._id)}
                        onLoad={() => handleImageLoad(testimonial._id)}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                        <AccessibleIconButton
                          onClick={() => setSelectedImage(imageUrl)}
                          ariaLabel="View larger image"
                          title="View larger image"
                          sx={{
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            opacity: 0,
                            transform: "scale(0.8)",
                            transition: "all 0.2s ease-in-out",
                            "&:hover": {
                              backgroundColor: "rgba(255, 255, 255, 1)",
                              transform: "scale(1.1)",
                            },
                            ".group:hover &": {
                              opacity: 1,
                              transform: "scale(1)",
                            },
                          }}
                        >
                          <ZoomInIcon />
                        </AccessibleIconButton>
                      </div>
                    </div>
                  ) : (
                    <div className="h-32 w-full mb-4 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                      <CakeOutlinedIcon sx={{ fontSize: 48, color: "#2c5282" }} />
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <Typography
                      variant="h3"
                      component="h3"
                      sx={{
                        fontFamily: "var(--font-playfair-display)",
                        color: "#2c5282",
                      }}
                    >
                      {testimonial.customerName}
                    </Typography>
                    {testimonial.source && testimonial.source in sourceIcons && (
                      <Chip
                        icon={sourceIcons[testimonial.source as keyof typeof sourceIcons]}
                        label={testimonial.source}
                        size="small"
                        className="capitalize"
                        sx={{
                          backgroundColor: "rgba(44, 82, 130, 0.1)",
                          "& .MuiChip-icon": {
                            color: "#2c5282",
                          },
                        }}
                      />
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Rating
                      value={testimonial.rating}
                      readOnly
                      precision={0.5}
                      sx={{
                        "& .MuiRating-iconFilled": {
                          color: "#2c5282",
                        },
                      }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {new Date(testimonial.date).toLocaleDateString()}
                    </Typography>
                  </div>
                  <Typography
                    variant="body1"
                    className="italic"
                    sx={{
                      color: "#4a5568",
                      lineHeight: 1.7,
                    }}
                  >
                    "{testimonial.text}"
                  </Typography>
                </CardContent>
              </MotionCard>
            </Grid>
          );
        })}
      </Grid>

      {totalPages > 1 && (
        <Box className="flex justify-center mt-8">
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
            sx={{
              "& .MuiPaginationItem-root": {
                color: "#2c5282",
                "&.Mui-selected": {
                  backgroundColor: "#2c5282",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#1a365d",
                  },
                },
              },
            }}
          />
        </Box>
      )}

      {/* Full Image Modal */}
      <Modal
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        closeAfterTransition
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Fade in={!!selectedImage}>
          <Box
            sx={{
              position: "relative",
              maxWidth: "90vw",
              maxHeight: "90vh",
              borderRadius: 2,
              overflow: "hidden",
              backgroundColor: "background.paper",
              boxShadow: 24,
            }}
          >
            <AccessibleIconButton
              onClick={() => setSelectedImage(null)}
              ariaLabel="Close image view"
              title="Close image view"
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 1)",
                },
                zIndex: 1,
              }}
            >
              <CloseIcon />
            </AccessibleIconButton>
            {selectedImage && (
              <Image
                src={selectedImage}
                alt="Full size cake"
                width={1200}
                height={800}
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "90vh",
                  objectFit: "contain",
                }}
              />
            )}
          </Box>
        </Fade>
      </Modal>
    </>
  );
}
