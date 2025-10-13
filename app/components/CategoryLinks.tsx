'use client';

import React from 'react';
import Link from 'next/link';
import { Box, Typography, Chip, Stack } from '@mui/material';

interface CategoryLinksProps {
  currentCategory?: string;
  categories: string[];
}

export function CategoryLinks({ currentCategory, categories }: CategoryLinksProps) {
  // Define category mappings with SEO-friendly URLs
  const categoryMappings: Record<string, { url: string; label: string; description: string }> = {
    'wedding-cakes': {
      url: '/wedding-cakes',
      label: 'Wedding Cakes',
      description: 'Explore our stunning wedding cake collection'
    },
    'birthday-cakes': {
      url: '/birthday-cakes',
      label: 'Birthday Cakes',
      description: 'Discover perfect birthday cake designs'
    },
    'custom-cakes': {
      url: '/custom-cake-design',
      label: 'Custom Cakes',
      description: 'Create your unique custom cake design'
    },
    'ukrainian-cakes': {
      url: '/traditional-ukrainian-cakes',
      label: 'Ukrainian Cakes',
      description: 'Authentic Ukrainian cake traditions'
    },
    'honey-cake': {
      url: '/honey-cake-history',
      label: 'Honey Cake',
      description: 'Learn about our famous honey cake'
    },
    'corporate-cakes': {
      url: '/corporate-cakes-leeds',
      label: 'Corporate Cakes',
      description: 'Professional cakes for business events'
    },
    'seasonal-cakes': {
      url: '/seasonal-cakes',
      label: 'Seasonal Cakes',
      description: 'Cakes for every season and occasion'
    }
  };

  // Filter out current category and get related categories
  const relatedCategories = categories
    .filter(cat => cat !== currentCategory)
    .slice(0, 4); // Show maximum 4 related categories

  if (relatedCategories.length === 0) return null;

  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      <Typography
        variant="h4"
        sx={{
          fontSize: { xs: "1.25rem", md: "1.5rem" },
          fontWeight: 600,
          color: "#1e293b",
          mb: 2,
        }}
      >
        Explore More Categories
      </Typography>

      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
        {relatedCategories.map((category) => {
          const mapping = categoryMappings[category.toLowerCase()];
          if (!mapping) return null;

          return (
            <Link
              key={category}
              href={mapping.url}
              aria-label={`Browse ${mapping.label} cakes`}
              style={{ textDecoration: 'none' }}
            >
              <Chip
                label={mapping.label}
                sx={{
                  backgroundColor: '#f8fafc',
                  color: '#2E3192',
                  border: '1px solid #e2e8f0',
                  fontWeight: 500,
                  px: 2,
                  py: 1,
                  height: 'auto',
                  '&:hover': {
                    backgroundColor: '#2E3192',
                    color: 'white',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(46, 49, 146, 0.15)',
                  },
                  transition: 'all 0.2s ease',
                }}
                title={mapping.description}
              />
            </Link>
          );
        })}
      </Stack>

      <Typography
        variant="body2"
        sx={{
          color: '#64748b',
          mt: 2,
          fontStyle: 'italic',
        }}
      >
        Discover more cake categories and find the perfect design for your special occasion.
      </Typography>
    </Box>
  );
}
