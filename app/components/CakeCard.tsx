"use client";

import { Card, CardContent, Typography, Button, Box } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { Cake } from "../utils/fetchCakes";
import { urlFor } from "@/sanity/lib/image";

interface CakeCardProps {
  cake: Cake;
  variant?: "featured" | "catalog";
}

export default function CakeCard({ cake, variant = "catalog" }: CakeCardProps): JSX.Element {
  const price = cake.pricing?.standard || 0;
  const formattedPrice = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(price);

  // Get the first image from designs.standard that has a valid asset reference
  const mainImage =
    cake.designs?.standard?.find(img => img.isMain && img.asset?._ref) ||
    cake.designs?.standard?.find(img => img.asset?._ref) ||
    cake.designs?.standard?.[0];

  // Create a placeholder URL with the cake name and category
  const placeholderUrl = `https://placehold.co/600x400/e2e8f0/1e293b?text=${encodeURIComponent(
    `${cake.name}\n${cake.category}`
  )}`;

  // Use the Sanity image if available, otherwise use the placeholder
  const imageUrl = mainImage?.asset?._ref
    ? urlFor(mainImage).width(800).height(800).url()
    : placeholderUrl;

  return (
    <Card
      className="h-full flex flex-col bg-white rounded-2xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
      elevation={0}
    >
      <div className="relative aspect-[4/3] overflow-hidden group">
        <Image
          src={imageUrl}
          alt={cake.name}
          fill
          className="object-cover transform transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {variant === "featured" && (
          <Box className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
            <Typography variant="caption" className="font-medium text-primary">
              Featured
            </Typography>
          </Box>
        )}
      </div>
      <CardContent className="flex-grow flex flex-col p-6">
        <div className="flex items-center justify-between mb-3">
          <Typography
            variant="caption"
            className="text-sm font-medium px-3 py-1 rounded-full bg-primary/10 text-primary"
          >
            {cake.category || "Cake"}
          </Typography>
          <Typography variant="h6" color="primary" className="font-bold">
            {formattedPrice}
          </Typography>
        </div>
        <Typography variant="h6" component="h3" className="font-bold mb-2 text-gray-900">
          {cake.name}
        </Typography>
        <Typography variant="body2" className="mb-6 text-gray-600 line-clamp-2">
          {cake.description || "A delicious cake made with love"}
        </Typography>
        <Button
          variant={variant === "featured" ? "outlined" : "contained"}
          color="primary"
          component={Link}
          href={`/cakes/${cake.slug.current}`}
          className={`mt-auto py-2.5 ${
            variant === "featured"
              ? "border-2 hover:bg-primary hover:text-white"
              : "shadow-md hover:shadow-lg"
          }`}
          fullWidth
        >
          {variant === "featured" ? "View Details" : "Order Now"}
        </Button>
      </CardContent>
    </Card>
  );
}
