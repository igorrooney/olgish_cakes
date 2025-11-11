import type { Metadata } from "next";
import Link from "next/link";
import { Container, Typography, Box, Button, Grid } from "@/lib/mui-optimization";
import TextField from "@mui/material/TextField";
import { getAllCakes } from "@/app/utils/fetchCakes";
import { getAllGiftHampers } from "@/app/utils/fetchGiftHampers";
import { borderRadius } from "@/lib/design-system";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";

export const metadata: Metadata = {
  title: "Search | Olgish Cakes",
  description: "Search Olgish Cakes site for cakes, services and information.",
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
  alternates: { canonical: "https://olgishcakes.co.uk/search" },
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const resolvedParams = await searchParams;
  const query = (resolvedParams?.q || "").toString().trim();

  const suggestions = [
    { label: "All Cakes", href: "/cakes" },
    { label: "Wedding Cakes", href: "/wedding-cakes" },
    { label: "Birthday Cakes", href: "/birthday-cakes" },
    { label: "Gift Hampers", href: "/gift-hampers" },
    { label: "How to Order", href: "/how-to-order" },
    { label: "Contact", href: "/contact" },
  ];

  // Basic content search across cakes and gift hampers (name, category, ingredients)
  const [allCakes, allHampers] = await Promise.all([getAllCakes(), getAllGiftHampers()]);

  function matches(texts: Array<string | undefined>, q: string): boolean {
    const hay = texts.filter(Boolean).join(" ").toLowerCase();
    return hay.includes(q.toLowerCase());
  }

  const cakeResults = query
    ? allCakes
        .filter(c =>
          matches([c.name, c.category, ...(c.ingredients || []), ...(c.allergens || [])], query)
        )
        .map(c => ({
          _id: c._id,
          type: "cake" as const,
          title: c.name,
          href: `/cakes/${c.slug.current}`,
          badge: "Cake",
          subtitle: c.category,
        }))
    : [];

  const hamperResults = query
    ? allHampers
        .filter(h => matches([h.name, h.category, ...(h.ingredients || [])], query))
        .map(h => ({
          _id: h._id,
          type: "hamper" as const,
          title: h.name,
          href: `/gift-hampers/${h.slug.current}`,
          badge: "Gift Hamper",
          subtitle: h.category,
        }))
    : [];

  const results = [...cakeResults, ...hamperResults];

  return (
    <main className="min-h-screen bg-gray-50">
      <Container sx={{ py: 8 }}>
        <Typography component="h1" variant="h2" className="text-3xl md:text-4xl font-bold mb-4">
          Site Search
        </Typography>
        <Typography variant="body1" className="text-gray-600 mb-6">
          {query ? `Results for "${query}"` : "Type a query in the box below."}
        </Typography>

        <Box component="form" method="GET" action="/search" sx={{ display: "flex", gap: 2, mb: 6 }}>
          <TextField
            name="q"
            defaultValue={query}
            placeholder="Search cakes, services, articles..."
            variant="outlined"
            fullWidth
            inputProps={{ "aria-label": "Search query" }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: borderRadius.lg,
                backgroundColor: "#fff",
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton type="submit" aria-label="Submit search">
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button type="submit" variant="contained" color="primary">
            Search
          </Button>
        </Box>

        {query && (
          <>
            <Typography component="h2" variant="h4" className="font-semibold mb-3">
              {results.length} result{results.length === 1 ? "" : "s"}
            </Typography>
            <Grid container spacing={3} sx={{ mb: 6 }}>
              {results.map(r => (
                <Grid item xs={12} md={6} lg={4} key={r._id}>
                  <Box className="border rounded-xl p-4 bg-white">
                    <Typography variant="h6" className="mb-1">
                      <Link href={r.href} aria-label={`View ${r.title}`}>{r.title}</Link>
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      {r.subtitle}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </>
        )}

        <Typography component="h2" variant="h4" className="font-semibold mb-3">Quick links</Typography>
        <Grid container spacing={2}>
          {suggestions.map(link => (
            <Grid item xs={12} sm={6} md={4} key={link.href}>
              <Link href={link.href} style={{ textDecoration: 'none', display: 'block' }}>
                <Button variant="outlined" color="primary" fullWidth>
                  {link.label}
                </Button>
              </Link>
            </Grid>
          ))}
        </Grid>
      </Container>
    </main>
  );
}

