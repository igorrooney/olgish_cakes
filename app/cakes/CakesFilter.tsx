"use client";

import { useState } from "react";
import { Grid, TextField, MenuItem, Box, Typography } from "@mui/material";
import { useSearchParams } from "next/navigation";
import CakeCard from "../components/CakeCard";
import { Cake } from "../utils/fetchCakes";

const categories = ["All", "Birthday", "Wedding", "Custom", "Seasonal"];

interface CakesFilterProps {
  cakes: Cake[];
}

export default function CakesFilter({ cakes }: CakesFilterProps) {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [priceRange, setPriceRange] = useState(searchParams.get("price") || "All");

  const filteredCakes = cakes.filter(cake => {
    const matchesSearch =
      cake.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cake.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === "All" || cake.category === category;
    const matchesPrice =
      priceRange === "All" ||
      (priceRange === "Under 50" && cake.price < 50) ||
      (priceRange === "50-100" && cake.price >= 50 && cake.price <= 100) ||
      (priceRange === "Over 100" && cake.price > 100);
    return matchesSearch && matchesCategory && matchesPrice;
  });

  return (
    <>
      <Box className="mb-8">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search cakes"
              variant="outlined"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Category"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              {categories.map(cat => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Price Range"
              value={priceRange}
              onChange={e => setPriceRange(e.target.value)}
            >
              <MenuItem value="All">All Prices</MenuItem>
              <MenuItem value="Under 50">Under £50</MenuItem>
              <MenuItem value="50-100">£50 - £100</MenuItem>
              <MenuItem value="Over 100">Over £100</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Box>

      {/* Cake Grid */}
      <Grid container spacing={4}>
        {filteredCakes.length > 0 ? (
          filteredCakes.map(cake => (
            <Grid item xs={12} sm={6} md={4} key={cake._id}>
              <CakeCard cake={cake} />
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography variant="h6" className="text-center py-8">
              No cakes found matching your criteria
            </Typography>
          </Grid>
        )}
      </Grid>
    </>
  );
}
