/**
 * Local SEO Domination Strategy for Leeds Market Leadership
 * Advanced local search optimization for #1 Google Maps ranking
 */

// Comprehensive local keyword strategy
export const LOCAL_SEO_STRATEGY = {
  primaryMarket: {
    city: "Leeds",
    population: 789194,
    marketSize: "Large urban center",
    competition: "Medium-High",
    keywords: [
      "cakes leeds",
      "wedding cakes leeds",
      "birthday cakes leeds",
      "custom cakes leeds",
      "cake delivery leeds",
      "ukrainian bakery leeds",
      "cake shop leeds",
      "leeds cake maker",
      "cake decorator leeds",
      "specialty cakes leeds",
    ],
  },
  secondaryMarkets: [
    {
      city: "York",
      distance: "24 miles",
      keywords: ["cake delivery york", "wedding cakes york", "custom cakes york"],
      marketPotential: "High - Tourist destination",
    },
    {
      city: "Bradford",
      distance: "9 miles",
      keywords: ["cakes bradford", "wedding cakes bradford", "cake delivery bradford"],
      marketPotential: "Medium - Large population",
    },
    {
      city: "Halifax",
      distance: "15 miles",
      keywords: ["cakes halifax", "custom cakes halifax", "cake delivery halifax"],
      marketPotential: "Medium - Growing market",
    },
    {
      city: "Huddersfield",
      distance: "18 miles",
      keywords: ["cakes huddersfield", "wedding cakes huddersfield", "cake delivery huddersfield"],
      marketPotential: "Medium - University town",
    },
    {
      city: "Wakefield",
      distance: "12 miles",
      keywords: ["cakes wakefield", "custom cakes wakefield", "cake delivery wakefield"],
      marketPotential: "Medium - Residential area",
    },
  ],
  neighborhoods: [
    // Leeds neighborhoods for hyper-local targeting
    "City Centre",
    "Headingley",
    "Chapel Allerton",
    "Roundhay",
    "Horsforth",
    "Meanwood",
    "Kirkstall",
    "Armley",
    "Bramley",
    "Pudsey",
    "Garforth",
    "Wetherby",
    "Otley",
    "Ilkley",
    "Guiseley",
    "Yeadon",
    "Morley",
  ],
};

// Advanced Google My Business optimization
export function generateGMBOptimization() {
  return {
    businessName: "Olgish Cakes - Ukrainian Bakery Leeds",
    categories: {
      primary: "Bakery",
      secondary: ["Custom Cake Designer", "Wedding Cake Service", "Catering Service"],
    },
    description: `Award-winning Ukrainian bakery in Leeds specializing in authentic honey cakes, custom wedding cakes, and traditional Eastern European desserts. Using traditional family recipes passed down through generations, we create bespoke cakes for weddings, birthdays, and special occasions. Same-day delivery available throughout Leeds and West Yorkshire. Book your free consultation today!`,

    attributes: [
      "Women-owned business",
      "Accepts custom orders",
      "Delivery available",
      "Wheelchair accessible",
      "Free Wi-Fi",
      "Accepts credit cards",
      "Takes reservations",
      "Good for groups",
      "LGBTQ+ friendly",
      "Family-friendly",
    ],

    products: [
      {
        name: "Ukrainian Honey Cake (Medovik)",
        description: "Authentic traditional honey cake with delicate layers and sour cream filling",
        price: "From £25",
        category: "Specialty Cakes",
      },
      {
        name: "Custom Wedding Cakes",
        description: "Bespoke wedding cake designs tailored to your special day",
        price: "From £150",
        category: "Wedding Cakes",
      },
      {
        name: "Birthday Cakes",
        description: "Personalized birthday cakes for all ages and celebrations",
        price: "From £30",
        category: "Celebration Cakes",
      },
    ],

    services: [
      {
        name: "Cake Consultation",
        description: "Free consultation to design your perfect custom cake",
        duration: "30 minutes",
        price: "Free",
      },
      {
        name: "Cake Delivery",
        description: "Professional delivery service throughout Leeds and surrounding areas",
        areas: ["Leeds", "York", "Bradford", "Halifax", "Huddersfield"],
        price: "From £5",
      },
      {
        name: "Wedding Cake Setup",
        description: "Professional setup and presentation at your wedding venue",
        price: "From £25",
      },
    ],

    posts: {
      weekly: [
        "Featured cake of the week",
        "Customer spotlight and testimonial",
        "Behind-the-scenes baking process",
        "Seasonal cake offerings",
        "Baking tips and techniques",
      ],
      monthly: [
        "New product launches",
        "Special promotions and offers",
        "Community event participation",
        "Award announcements",
        "Seasonal menu updates",
      ],
    },
  };
}

// Local citation strategy for authority building
export const CITATION_STRATEGY = {
  tier1: [
    // High-authority national directories
    "Google My Business",
    "Bing Places",
    "Apple Maps",
    "Facebook Business",
    "Yelp",
    "TripAdvisor",
    "Yellow Pages",
    "192.com",
    "Scoot",
    "Thomson Local",
  ],
  tier2: [
    // Industry-specific directories
    "Bridebook",
    "Hitched.co.uk",
    "WeddingWire",
    "The Knot",
    "Confetti.co.uk",
    "Cake Designers Directory",
    "Local Wedding Vendors",
    "Catering Directory UK",
    "British Baker Magazine",
    "Guild of Bakers",
  ],
  tier3: [
    // Local directories and chambers
    "Leeds Chamber of Commerce",
    "Yorkshire Business Directory",
    "Leeds Business Listings",
    "West Yorkshire Directory",
    "Leeds Food Guide",
    "Yorkshire Wedding Directory",
    "Local Newspaper Directories",
    "Community Board Listings",
    "Neighborhood Apps (Nextdoor)",
    "Local Facebook Groups",
  ],

  citationFormat: {
    businessName: "Olgish Cakes",
    address: "123 Example Street, Leeds, West Yorkshire, LS1 1XX", // Replace with actual
    phone: "+44 113 XXX XXXX", // Replace with actual
    website: "https://olgishcakes.co.uk",
    email: "hello@olgishcakes.co.uk",
    description: "Ukrainian bakery specializing in authentic honey cakes and custom designs",
    categories: ["Bakery", "Wedding Cakes", "Custom Cakes", "Ukrainian Food"],
  },
};

// Local content strategy for geographic dominance
export function generateLocalContentStrategy() {
  return {
    locationPages: [
      {
        url: "/cakes-leeds",
        title: "Custom Cakes Leeds | Ukrainian Bakery | Same Day Delivery",
        targetKeywords: ["cakes leeds", "custom cakes leeds", "cake delivery leeds"],
        content: {
          heroSection: "Premium cake delivery throughout Leeds",
          serviceAreas: "City Centre, Headingley, Chapel Allerton, Roundhay...",
          localTestimonials: "Testimonials from Leeds customers",
          landmarks: "Near Leeds City Centre, University of Leeds, Leeds Castle",
          deliveryInfo: "Same-day delivery throughout Leeds postal districts",
        },
      },
      {
        url: "/wedding-cakes-leeds",
        title: "Wedding Cakes Leeds | Bespoke Designs | Free Consultation",
        targetKeywords: [
          "wedding cakes leeds",
          "bridal cakes leeds",
          "wedding cake designer leeds",
        ],
        content: {
          venuePartnerships: "Partnered with top Leeds wedding venues",
          portfolioLocal: "Wedding cakes delivered across Leeds",
          planningGuide: "Leeds wedding planning timeline",
          testimonials: "Real Leeds weddings featuring our cakes",
        },
      },
    ],

    neighborhoodTargeting: {
      strategy: "Create dedicated sections for each major Leeds neighborhood",
      implementation: [
        "Add neighborhood-specific delivery information",
        "Include local landmark references",
        "Create neighborhood customer testimonials",
        "Target postcode-specific keywords",
        "Partner with local businesses in each area",
      ],
    },

    localEvents: {
      annual: [
        "Leeds Food Festival participation",
        "Wedding fairs in Leeds area",
        "Ukrainian cultural events",
        "Local business awards",
        "Charity fundraising events",
      ],
      seasonal: [
        "Leeds Christmas Markets",
        "Summer food festivals",
        "Valentine's Day promotions",
        "Mother's Day campaigns",
        "Halloween themed events",
      ],
    },
  };
}

// Local link building strategy
export const LOCAL_LINK_BUILDING = {
  strategies: [
    {
      type: "Venue Partnerships",
      targets: [
        "Wedding venues in Leeds",
        "Event centers",
        "Hotels with event spaces",
        "Conference centers",
        "Private clubs",
      ],
      approach: "Offer preferred vendor partnerships in exchange for website links",
      linkValue: "High - relevant industry links",
    },
    {
      type: "Local Business Network",
      targets: [
        "Wedding photographers",
        "Florists",
        "Event planners",
        "Catering companies",
        "Music venues",
      ],
      approach: "Cross-promotional partnerships and referral programs",
      linkValue: "Medium-High - related services",
    },
    {
      type: "Community Involvement",
      targets: [
        "Local charities",
        "School fundraisers",
        "Community events",
        "Sports clubs",
        "Cultural organizations",
      ],
      approach: "Sponsor events and donate services for publicity",
      linkValue: "Medium - community authority",
    },
    {
      type: "Media Coverage",
      targets: [
        "Yorkshire Evening Post",
        "Leeds Live",
        "Yorkshire Life Magazine",
        "Local food bloggers",
        "Wedding magazines",
      ],
      approach: "Press releases, story pitches, expert commentary",
      linkValue: "High - media authority",
    },
  ],

  outreachTemplates: {
    venuePartnership: `
      Subject: Partnership Opportunity - Premium Cake Services for [Venue Name]
      
      Hi [Name],
      
      I hope this message finds you well. I'm reaching out from Olgish Cakes, Leeds' premier Ukrainian bakery specializing in bespoke wedding and celebration cakes.
      
      We'd love to discuss a partnership opportunity with [Venue Name]. Many of our clients are already choosing your beautiful venue for their special occasions, and we believe a formal partnership could benefit both our businesses.
      
      What we offer:
      • Exclusive discount for [Venue Name] clients
      • Professional cake setup and presentation
      • Flexible delivery scheduling
      • Custom designs to match your venue's aesthetic
      
      In return, we'd appreciate:
      • Inclusion in your preferred vendor list
      • Link from your website to ours
      • Joint marketing opportunities
      
      Would you be interested in discussing this further? I'd be happy to arrange a tasting session for your team.
      
      Best regards,
      [Your Name]
      Olgish Cakes
    `,
  },
};

// Review generation and management strategy
export function generateReviewStrategy() {
  return {
    platforms: [
      {
        name: "Google My Business",
        priority: "Highest",
        target: "50+ reviews with 4.8+ average",
        strategy: "Post-delivery follow-up emails with direct review links",
      },
      {
        name: "Facebook",
        priority: "High",
        target: "30+ reviews with 4.9+ average",
        strategy: "Social media engagement and story sharing",
      },
      {
        name: "Yelp",
        priority: "Medium",
        target: "20+ reviews with 4.7+ average",
        strategy: "Encourage food enthusiasts and event planners",
      },
      {
        name: "TripAdvisor",
        priority: "Medium",
        target: "15+ reviews focusing on tourist/visitor appeal",
        strategy: "Target destination wedding and tourist customers",
      },
    ],

    reviewRequestProcess: {
      timing: [
        "24 hours after successful delivery",
        "1 week after wedding/event completion",
        "Follow-up with satisfied consultation clients",
        "During peak satisfaction moments",
      ],
      methods: [
        "Personalized email with direct review links",
        "SMS follow-up for mobile users",
        "QR codes on business cards and receipts",
        "In-person requests during consultations",
        "Social media story prompts",
      ],
      incentives: [
        "10% discount on next order for verified reviews",
        "Entry into monthly cake giveaway",
        "Featured customer spotlight",
        "Exclusive access to new products",
      ],
    },

    responseStrategy: {
      positiveReviews: [
        "Thank customer by name",
        "Mention specific details from their order",
        "Invite them to share photos",
        "Encourage future business",
        "Share on social media (with permission)",
      ],
      negativeReviews: [
        "Respond quickly and professionally",
        "Acknowledge concerns publicly",
        "Move detailed resolution offline",
        "Follow up to ensure satisfaction",
        "Use as learning opportunities",
      ],
    },
  };
}

// Local SEO monitoring and reporting
export function generateLocalSEOMonitoring() {
  return {
    keyMetrics: [
      {
        metric: "Google Maps Ranking",
        targets: ["cakes leeds", "wedding cakes leeds", "custom cakes leeds"],
        goal: "#1-3 position",
        checkFrequency: "Daily",
      },
      {
        metric: "Local Pack Visibility",
        queries: ["cake shop near me", "wedding cakes near me"],
        goal: "Appear in top 3",
        checkFrequency: "Weekly",
      },
      {
        metric: "Google My Business Insights",
        kpis: ["Views", "Calls", "Direction requests", "Website clicks"],
        goal: "20% monthly increase",
        checkFrequency: "Weekly",
      },
      {
        metric: "Review Acquisition",
        target: "4+ new reviews per month",
        goal: "Maintain 4.8+ average rating",
        checkFrequency: "Daily",
      },
    ],

    tools: [
      "BrightLocal for local rank tracking",
      "Google My Business Insights",
      "Google Search Console",
      "Local citation tracking tools",
      "Review monitoring platforms",
      "Competitor analysis tools",
    ],

    reportingSchedule: {
      daily: ["GMB insights check", "New reviews monitoring"],
      weekly: ["Local ranking positions", "Citation consistency"],
      monthly: ["Full local SEO audit", "Competitor analysis", "Strategy refinement"],
      quarterly: ["Market expansion opportunities", "Citation building campaigns"],
    },
  };
}
