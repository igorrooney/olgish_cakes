import type { Metadata } from "next";
import { Container, Typography, Box, Paper } from "@mui/material";
import { TestimonialsList } from "./TestimonialsList";
import { client } from "@/sanity/lib/client";
import { testimonialQuery, testimonialCountQuery } from "@/sanity/lib/queries";

export const metadata: Metadata = {
  title: "Customer Testimonials | Olgish Cakes Leeds",
  description:
    "Read what our customers say about their experience with Olgish Cakes. Real reviews and photos from our satisfied customers in Leeds.",
};

export const revalidate = 3600; // Revalidate every hour

export default async function TestimonialsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const pageSize = 6;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  const [testimonials, totalCount] = await Promise.all([
    client.fetch(testimonialQuery, { start, end }),
    client.fetch(testimonialCountQuery),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <>
      <Box
        sx={{
          background: "linear-gradient(to right, #faf7f5, #ffffff, #faf7f5)",
          py: { xs: 6, md: 10 },
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Container maxWidth="lg">
          <Box
            className="text-center"
            sx={{
              maxWidth: "800px",
              mx: "auto",
              px: { xs: 2, md: 0 },
            }}
          >
            <Typography
              component="h1"
              sx={{
                fontFamily: "var(--font-playfair-display)",
                fontSize: { xs: "2.5rem", md: "3.5rem" },
                fontWeight: 600,
                color: "primary.main",
                mb: 3,
                lineHeight: 1.2,
              }}
            >
              Our Happy Customers
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "text.secondary",
                maxWidth: "600px",
                mx: "auto",
                lineHeight: 1.6,
                mb: 4,
              }}
            >
              Discover what makes Olgish Cakes special through the words of our valued customers.
              Real experiences, genuine feedback.
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 3,
                justifyContent: "center",
                flexWrap: "wrap",
                mb: 4,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  px: 3,
                  py: 2,
                  backgroundColor: "rgba(44, 82, 130, 0.1)",
                  borderRadius: 2,
                }}
              >
                <Typography variant="h4" color="primary.main" fontWeight="bold" mb={1}>
                  {totalCount}+
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Happy Customers
                </Typography>
              </Paper>
              <Paper
                elevation={0}
                sx={{
                  px: 3,
                  py: 2,
                  backgroundColor: "rgba(44, 82, 130, 0.1)",
                  borderRadius: 2,
                }}
              >
                <Typography variant="h4" color="primary.main" fontWeight="bold" mb={1}>
                  5.0
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average Rating
                </Typography>
              </Paper>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container
        maxWidth="lg"
        sx={{
          py: { xs: 6, md: 10 },
        }}
      >
        <TestimonialsList testimonials={testimonials} currentPage={page} totalPages={totalPages} />
      </Container>
    </>
  );
}
