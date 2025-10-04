import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import Link from "next/link";
import { Breadcrumbs } from "../components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Charity Events | Ukrainian Cake Fundraisers",
  description:
    "Learn about charity events and fundraisers supported by Olgish Cakes. Join our Ukrainian cake charity events and help support good causes in Leeds.",
  keywords:
    "charity events, cake fundraisers, Ukrainian charity Leeds, cake charity events, Olgish Cakes charity",
  openGraph: {
    title: "Charity Events | Ukrainian Cake Fundraisers",
    description:
      "Learn about charity events and fundraisers supported by Olgish Cakes. Join our Ukrainian cake charity events and help support good causes in Leeds.",
    url: "https://olgishcakes.co.uk/charity-events",
    images: ["https://olgishcakes.co.uk/images/charity-events.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Charity Events | Ukrainian Cake Fundraisers",
    description:
      "Learn about charity events and fundraisers supported by Olgish Cakes. Join our Ukrainian cake charity events and help support good causes in Leeds.",
    images: ["https://olgishcakes.co.uk/images/charity-events.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/charity-events",
  },
};

export default function CharityEventsPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Charity Events",
    description: "Supporting local charities and community events in Leeds",
    url: "https://olgishcakes.co.uk/charity-events",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Box
        sx={{
          background: "linear-gradient(135deg, #FFF5E6 0%, #FFFFFF 50%, #FFF5E6 100%)",
          minHeight: "100vh",
          py: { xs: 4, md: 8 },
        }}
      >
        <Container maxWidth="lg">
          {/* Breadcrumbs */}
          <Box sx={{ mb: 3 }}>
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Charity Events" }]} />
          </Box>

          {/* Hero Section */}
          <Box sx={{ textAlign: "center", mb: { xs: 4, md: 8 } }}>
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontSize: { xs: "2.5rem", md: "3.5rem" },
                fontWeight: "bold",
                mb: 2,
                color: "#005BBB",
              }}
            >
              Charity Events
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: "1.2rem", md: "1.5rem" },
                color: "text.secondary",
                mb: 3,
                maxWidth: "800px",
                mx: "auto",
              }}
            >
              Join our Ukrainian cake charity events and help support good causes in Leeds and West
              Yorkshire.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Chip label="Charity" color="primary" />
              <Chip label="Fundraisers" color="secondary" />
              <Chip label="Community" color="primary" />
              <Chip label="Events" color="secondary" />
            </Box>
          </Box>
          {/* Introduction */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              mb: 6,
            }}
          >
            <Typography
              variant="body1"
              sx={{ mb: 4, textAlign: "center", maxWidth: "900px", mx: "auto", lineHeight: 1.7 }}
            >
              Giving back to the community is very important to me. Through my Ukrainian cakes and baking skills,
              I have the opportunity to support local charities, help families in need, and bring joy to people
              who are going through difficult times. Every charity event I participate in is a chance to share
              the warmth and comfort that Ukrainian cakes can bring to any celebration.
            </Typography>
          </Paper>

          {/* My Charity Mission */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              mb: 6,
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontFamily: "var(--font-playfair-display)",
                fontSize: { xs: "1.8rem", md: "2.2rem" },
                fontWeight: 600,
                color: "primary.main",
                mb: 4,
                textAlign: "center",
              }}
            >
              My Charity Mission
            </Typography>
            <Typography
              variant="body1"
              sx={{ mb: 4, textAlign: "center", maxWidth: "900px", mx: "auto", lineHeight: 1.7 }}
            >
              I believe that food, especially traditional Ukrainian cakes, has the power to bring people together,
              comfort those in need, and create moments of joy even during difficult times. My charity work focuses
              on supporting local communities, helping families, and sharing the cultural heritage of Ukrainian baking.
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: "center", p: 3 }}>
                  <Typography variant="h4" sx={{ fontSize: "3rem", mb: 2 }}>🏠</Typography>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Local Community Support
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    I work with local charities in Leeds and Yorkshire to provide cakes for community events,
                    family celebrations, and special occasions. My goal is to make sure everyone can enjoy
                    beautiful, delicious cakes regardless of their circumstances.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: "center", p: 3 }}>
                  <Typography variant="h4" sx={{ fontSize: "3rem", mb: 2 }}>🇺🇦</Typography>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Ukrainian Community
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    I support Ukrainian families and refugees in the UK by providing cakes for cultural events,
                    community gatherings, and special celebrations. This helps keep Ukrainian traditions alive
                    and brings comfort to families far from home.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: "center", p: 3 }}>
                  <Typography variant="h4" sx={{ fontSize: "3rem", mb: 2 }}>❤️</Typography>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Family Support
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    Through partnerships with local organizations, I provide birthday cakes and celebration
                    cakes for families who might not otherwise be able to afford them. Every child deserves
                    a beautiful cake on their special day.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Upcoming Charity Events */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              mb: 6,
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontFamily: "var(--font-playfair-display)",
                fontSize: { xs: "1.8rem", md: "2.2rem" },
                fontWeight: 600,
                color: "primary.main",
                mb: 4,
                textAlign: "center",
              }}
            >
              Upcoming Charity Events
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Ukrainian Cake Bake Sale for Refugee Support
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    <strong>Date:</strong> Monthly at Leeds Market<br />
                    <strong>Purpose:</strong> Raising funds to support Ukrainian refugees and families in need<br />
                    <strong>What I provide:</strong> Traditional Medovik, Kyiv Cake, and Napoleon Cake slices<br />
                    <strong>How to help:</strong> Visit our stall, buy cakes, or volunteer to help with sales
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Charity Cake Auction
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    <strong>Date:</strong> Quarterly events at local community centers<br />
                    <strong>Purpose:</strong> Raising money for local children's charities and family support services<br />
                    <strong>What I provide:</strong> Custom-designed cakes, gift vouchers, and baking classes<br />
                    <strong>How to help:</strong> Bid on cakes, donate prizes, or attend the auction
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Community Fundraiser for Ukraine
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    <strong>Date:</strong> Special events throughout the year<br />
                    <strong>Purpose:</strong> Supporting humanitarian aid and cultural preservation in Ukraine<br />
                    <strong>What I provide:</strong> Traditional Ukrainian cakes, cultural demonstrations, and recipe sharing<br />
                    <strong>How to help:</strong> Attend events, learn about Ukrainian culture, and make donations
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Holiday Cake Drive
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    <strong>Date:</strong> Christmas, Easter, and other major holidays<br />
                    <strong>Purpose:</strong> Bringing joy to families during difficult times<br />
                    <strong>What I provide:</strong> Special holiday cakes, gift packages, and surprise deliveries<br />
                    <strong>How to help:</strong> Sponsor a family, donate ingredients, or help with deliveries
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* How to Get Involved */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              mb: 6,
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontFamily: "var(--font-playfair-display)",
                fontSize: { xs: "1.8rem", md: "2.2rem" },
                fontWeight: 600,
                color: "primary.main",
                mb: 4,
                textAlign: "center",
              }}
            >
              How You Can Get Involved
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Volunteer at Our Events
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    I always need volunteers to help with cake sales, event setup, and customer service.
                    Whether you have a few hours or a whole day to give, your help makes a real difference.
                    Volunteers get to meet amazing people and learn about Ukrainian baking traditions.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Donate Cakes or Ingredients
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    If you are a baker or have access to quality ingredients, consider donating cakes or
                    supplies for our charity events. Every contribution helps us reach more families and
                    raise more money for good causes.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Spread the Word
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    Follow me on social media and share information about upcoming charity events.
                    The more people who know about our work, the more families we can help.
                    Word of mouth is still the best way to reach people who need support.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Attend Our Fundraisers
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    Come to our charity events, buy cakes, and support good causes while enjoying
                    authentic Ukrainian flavors. Every purchase helps fund our charitable work and
                    supports families in need in our community.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Past Success Stories */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              mb: 6,
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontFamily: "var(--font-playfair-display)",
                fontSize: { xs: "1.8rem", md: "2.2rem" },
                fontWeight: 600,
                color: "primary.main",
                mb: 4,
                textAlign: "center",
              }}
            >
              Our Charity Success Stories
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Christmas 2023: 50 Families Helped
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    Last Christmas, we raised over £2,000 through cake sales and donations, providing
                    special holiday cakes and treats to 50 families who were struggling financially.
                    The joy on children's faces when they received their surprise Christmas cakes
                    made all the hard work worthwhile.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Ukrainian Community Events
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    We regularly support Ukrainian cultural events in Leeds, providing traditional cakes
                    for Independence Day celebrations, cultural festivals, and community gatherings.
                    These events help keep Ukrainian traditions alive and bring comfort to families
                    who are far from their homeland.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Local School Partnership
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    We partner with local schools to provide birthday cakes for children whose families
                    cannot afford them. This ensures every child can celebrate their special day with
                    a beautiful cake, regardless of their family's financial situation.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Emergency Response
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    When local families face emergencies or difficult times, we often provide free cakes
                    for special occasions. Whether it is a child's birthday during a family crisis or
                    a celebration after overcoming challenges, we believe everyone deserves moments of joy.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Contact for Charity Work */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              mb: 6,
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontFamily: "var(--font-playfair-display)",
                fontSize: { xs: "1.8rem", md: "2.2rem" },
                fontWeight: 600,
                color: "primary.main",
                mb: 4,
                textAlign: "center",
              }}
            >
              Contact Me About Charity Work
            </Typography>
            <Typography
              variant="body1"
              sx={{ mb: 4, textAlign: "center", maxWidth: "800px", mx: "auto", lineHeight: 1.7 }}
            >
              If you are a charity, community organization, or know of a family in need, please contact me.
              I am always looking for new ways to help and support my community through my Ukrainian baking skills.
              Together, we can make a real difference in people's lives.
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: "center", p: 3 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Email Me
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    hello@olgishcakes.co.uk<br />
                    I respond to all charity inquiries within 24 hours
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: "center", p: 3 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Call Me
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    +44 786 721 8194<br />
                    Available Monday to Sunday, 9 AM - 8 PM
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: "center", p: 3 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Visit Me
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    Allerton Grange, Leeds, LS17<br />
                    By appointment for charity discussions
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>
    </>
  );
}
