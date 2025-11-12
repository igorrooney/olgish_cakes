"use client";

import Image from "next/image";
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
import { useState, memo, useCallback, useMemo, Suspense } from "react";
import { BodyText } from "@/lib/ui-components";
import { AccessibleIconButton } from "@/lib/ui-components";
import { TestimonialSkeleton } from "@/lib/skeleton-components";
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
  Skeleton,
} from "@/lib/mui-optimization";
import { Pagination, Fade } from "@mui/material";
import dynamic from "next/dynamic";

// Lazy load motion components for better initial performance
const MotionCard = dynamic(() => import("framer-motion").then(mod => mod.motion.create(Card)), {
  loading: () => <Card />,
  ssr: false,
});

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

export const TestimonialsList = memo(function TestimonialsList({
  testimonials,
  currentPage,
  totalPages,
}: TestimonialsListProps) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState<{ [key: string]: boolean }>({});

  // Memoize handlers to prevent unnecessary re-renders
  const handlePageChange = useCallback(
    (_: React.ChangeEvent<unknown>, page: number) => {
      router.push(`/testimonials?page=${page}`);
    },
    [router]
  );

  const handleImageLoad = useCallback((id: string) => {
    setImageLoading(prev => ({ ...prev, [id]: false }));
  }, []);

  const handleImageLoadStart = useCallback((id: string) => {
    setImageLoading(prev => ({ ...prev, [id]: true }));
  }, []);

  // Memoize image URL generation to avoid repeated calculations
  const getImageUrl = useCallback((testimonial: Testimonial) => {
    try {
      if (testimonial.cakeImage?.url) {
        return testimonial.cakeImage.url;
      }
      if (testimonial.cakeImage?.asset) {
        return urlFor(testimonial.cakeImage).width(600).height(400).fit("crop").quality(85).url();
      }
      return null;
    } catch (error) {
      console.error("Error generating image URL:", error);
      return null;
    }
  }, []);

  // Pre-compute image URLs for better performance
  const testimonialsWithImages = useMemo(
    () =>
      testimonials.map(testimonial => ({
        ...testimonial,
        imageUrl: getImageUrl(testimonial),
      })),
    [testimonials, getImageUrl]
  );

  return (
    <>
      <Grid container spacing={4} className="mb-8">
        {testimonialsWithImages.map((testimonial, index) => {
          const isLoading = imageLoading[testimonial._id];

          return (
            <Grid item xs={12} md={6} key={testimonial._id}>
              <Suspense fallback={<TestimonialSkeleton showImage={true} variant="full" />}>
                <MotionCard
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(index * 0.05, 0.3) }}
                  className="h-full shadow-md hover:shadow-lg transition-shadow duration-200"
                  sx={{
                    background: "linear-gradient(to bottom right, #ffffff, #faf7f5)",
                    borderRadius: "12px",
                  }}
                >
                  <CardContent className="space-y-4">
                    {testimonial.imageUrl ? (
                      <div className="relative h-64 w-full mb-4 rounded-lg overflow-hidden group">
                        {isLoading && (
                          <Skeleton
                            variant="rectangular"
                            width="100%"
                            height={256}
                            animation="wave"
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              zIndex: 10,
                              borderRadius: "8px",
                            }}
                          />
                        )}
                        <Image
                          src={testimonial.imageUrl}
                          alt={testimonial.cakeImage?.alt || `${testimonial.customerName}'s cake`}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover transition-transform duration-200 group-hover:scale-102"
                          onLoadStart={() => handleImageLoadStart(testimonial._id)}
                          onLoad={() => handleImageLoad(testimonial._id)}
                          loading="lazy"
                          placeholder="blur"
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                          <AccessibleIconButton
                            onClick={() => setSelectedImage(testimonial.imageUrl)}
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
                      <Skeleton
                        variant="rectangular"
                        width="100%"
                        height={128}
                        animation="wave"
                        sx={{
                          mb: 2,
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <CakeOutlinedIcon sx={{ fontSize: 48, color: "#2c5282" }} />
                      </Skeleton>
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
              </Suspense>
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
                minWidth: "44px", // WCAG touch target requirement
                minHeight: "44px", // WCAG touch target requirement
                "&.Mui-selected": {
                  backgroundColor: "#2c5282",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#1a365d",
                  },
                },
                "&:focus": {
                  outline: `2px solid #2c5282`,
                  outlineOffset: "2px",
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
                minWidth: "48px", // Larger touch target for close button
                minHeight: "48px", // Larger touch target for close button
                width: "48px",
                height: "48px",
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
});
