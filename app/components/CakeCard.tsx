"use client";

import { Card, CardContent, Typography, Button, Box, Chip } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { Cake } from "../utils/fetchCakes";
import { urlFor } from "@/sanity/lib/image";
import { useState } from "react";

interface CakeCardProps {
  cake: Cake;
  variant?: "featured" | "catalog";
}

export default function CakeCard({ cake, variant = "catalog" }: CakeCardProps): JSX.Element {
  const [isHovered, setIsHovered] = useState(false);
  const price = cake.pricing?.standard || 0;
  const formattedPrice = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(price);

  const mainImage =
    cake.designs?.standard?.find(img => img.isMain && img.asset?._ref) ||
    cake.designs?.standard?.find(img => img.asset?._ref) ||
    cake.designs?.standard?.[0];

  const placeholderUrl = `https://placehold.co/600x400/e2e8f0/1e293b?text=${encodeURIComponent(
    `${cake.name}\n${cake.category}`
  )}`;

  const imageUrl = mainImage?.asset?._ref
    ? urlFor(mainImage).width(800).height(800).url()
    : placeholderUrl;

  return (
    <Card
      className="group h-full flex flex-col bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500"
      elevation={0}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        border: "1px solid rgba(231, 229, 228, 0.8)",
      }}
    >
      {/* Image Container with Overlay */}
      <Link
        href={`/cakes/${cake.slug.current}`}
        className="relative aspect-square overflow-hidden bg-stone-50"
      >
        <Image
          src={imageUrl}
          alt={cake.name}
          fill
          className={`object-cover transition-all duration-700 ${
            isHovered ? "scale-105 brightness-95" : "scale-100 brightness-100"
          }`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={variant === "featured"}
        />

        {/* Elegant Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Featured Badge */}
        {variant === "featured" && (
          <Box className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm border border-stone-100">
            <Typography variant="caption" className="font-medium text-stone-800">
              Featured
            </Typography>
          </Box>
        )}
      </Link>

      {/* Content */}
      <CardContent className="flex-grow flex flex-col p-6 space-y-3">
        {/* Category and Price */}
        <div className="flex items-center justify-between mb-1">
          <Chip
            label={cake.category || "Cake"}
            size="small"
            className="bg-stone-50 text-stone-600 font-medium px-1"
            sx={{
              borderRadius: "4px",
              height: "24px",
            }}
          />
          <Typography
            variant="h6"
            className="font-serif text-stone-800"
            sx={{
              fontFamily: "'Playfair Display', serif",
            }}
          >
            {formattedPrice}
          </Typography>
        </div>

        {/* Title */}
        <Typography
          variant="h6"
          component="h3"
          className="font-serif text-stone-800 line-clamp-1 group-hover:text-stone-900 transition-colors duration-300"
          sx={{
            fontFamily: "'Playfair Display', serif",
          }}
        >
          {cake.name}
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          className="text-stone-600 line-clamp-2 min-h-[3rem] italic font-light"
        >
          {cake.shortDescription ||
            cake.description ||
            "A delightful artisanal cake crafted with the finest ingredients"}
        </Typography>

        {/* Action Button */}
        <Button
          variant="outlined"
          component={Link}
          href={`/cakes/${cake.slug.current}`}
          className="mt-auto py-3 border-stone-200 text-stone-800 hover:bg-stone-50 hover:border-stone-300 transition-all duration-300 normal-case font-medium"
          fullWidth
          sx={{
            borderWidth: "1px",
            "&:hover": {
              borderWidth: "1px",
            },
          }}
        >
          Order Now
        </Button>
      </CardContent>
    </Card>
  );
}
