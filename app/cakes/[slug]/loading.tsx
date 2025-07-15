import { Container, Grid, Box, Skeleton, Paper } from "@mui/material";
import { Header } from "@/app/components/Header";

export default function Loading() {
  return (
    <>
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 12 } }}>
        <Grid container spacing={6}>
          <Grid item xs={12} md={6}>
            {/* Main image skeleton */}
            <Box
              sx={{
                position: "relative",
                height: { xs: 400, md: 600 },
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: 4,
                mb: 3,
                bgcolor: "grey.100",
              }}
            >
              <Skeleton variant="rectangular" width="100%" height="100%" animation="wave" />
            </Box>

            {/* Thumbnail gallery skeleton */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 2,
                height: 200,
              }}
            >
              {[1, 2, 3].map(index => (
                <Skeleton
                  key={index}
                  variant="rectangular"
                  width="100%"
                  height="100%"
                  animation="wave"
                  sx={{ borderRadius: 2 }}
                />
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box>
              {/* Title skeleton */}
              <Skeleton
                variant="rectangular"
                width="80%"
                height={60}
                animation="wave"
                sx={{ mb: 2, borderRadius: 1 }}
              />

              {/* Category and size chips skeleton */}
              <Box sx={{ display: "flex", gap: 1, mb: 4 }}>
                <Skeleton
                  variant="rectangular"
                  width={100}
                  height={32}
                  animation="wave"
                  sx={{ borderRadius: 16 }}
                />
                <Skeleton
                  variant="rectangular"
                  width={100}
                  height={32}
                  animation="wave"
                  sx={{ borderRadius: 16 }}
                />
              </Box>

              {/* Description skeleton */}
              <Box sx={{ mb: 4 }}>
                {[1, 2, 3].map(index => (
                  <Skeleton
                    key={index}
                    variant="text"
                    width="100%"
                    height={24}
                    animation="wave"
                    sx={{ mb: 1 }}
                  />
                ))}
              </Box>

              {/* Ingredients and allergens skeleton */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mb: 4,
                  backgroundColor: "grey.50",
                  borderRadius: 2,
                }}
              >
                <Skeleton
                  variant="rectangular"
                  width={120}
                  height={32}
                  animation="wave"
                  sx={{ mb: 2, borderRadius: 1 }}
                />
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                  {[1, 2, 3, 4, 5].map(index => (
                    <Skeleton
                      key={index}
                      variant="rectangular"
                      width={80}
                      height={32}
                      animation="wave"
                      sx={{ borderRadius: 16 }}
                    />
                  ))}
                </Box>

                <Skeleton
                  variant="rectangular"
                  width={120}
                  height={32}
                  animation="wave"
                  sx={{ mb: 2, borderRadius: 1 }}
                />
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {[1, 2, 3].map(index => (
                    <Skeleton
                      key={index}
                      variant="rectangular"
                      width={80}
                      height={32}
                      animation="wave"
                      sx={{ borderRadius: 16 }}
                    />
                  ))}
                </Box>
              </Paper>

              {/* Price skeleton */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderTop: "1px solid",
                  borderColor: "divider",
                  pt: 4,
                }}
              >
                <Skeleton
                  variant="rectangular"
                  width={120}
                  height={48}
                  animation="wave"
                  sx={{ borderRadius: 1 }}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
