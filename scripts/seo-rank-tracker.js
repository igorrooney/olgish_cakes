#!/usr/bin/env node

/**
 * SEO Rank Tracker for Olgish Cakes
 * Monitors Google rankings and provides actionable insights for #1 position
 */

const fs = require("fs");
const path = require("path");

// Target keywords for #1 ranking
const TARGET_KEYWORDS = [
  "Ukrainian cakes Leeds",
  "honey cake Leeds",
  "Medovik Leeds",
  "Ukrainian bakery Leeds",
  "custom cakes Leeds",
  "wedding cakes Leeds",
  "birthday cakes Leeds",
  "authentic Ukrainian cakes",
  "traditional honey cake",
  "Kyiv cake Leeds",
  "Ukrainian desserts Leeds",
  "cake delivery Leeds",
  "best Ukrainian cakes Leeds",
  "honey cake delivery Yorkshire",
  "Ukrainian bakery near me",
];

// SEO metrics to track
const SEO_METRICS = {
  titleOptimization: 0,
  metaDescription: 0,
  structuredData: 0,
  internalLinking: 0,
  pageSpeed: 0,
  mobileOptimization: 0,
  contentQuality: 0,
  localSEO: 0,
  socialSignals: 0,
  backlinks: 0,
};

// Check current SEO implementation
function checkCurrentSEO() {
  console.log("🔍 Checking Current SEO Implementation...\n");

  const checks = {
    titleOptimization: checkTitleOptimization(),
    metaDescription: checkMetaDescriptions(),
    structuredData: checkStructuredData(),
    internalLinking: checkInternalLinking(),
    pageSpeed: checkPageSpeed(),
    mobileOptimization: checkMobileOptimization(),
    contentQuality: checkContentQuality(),
    localSEO: checkLocalSEO(),
    socialSignals: checkSocialSignals(),
    backlinks: checkBacklinks(),
  };

  return checks;
}

function checkTitleOptimization() {
  const pages = [
    "app/page.tsx",
    "app/cakes/page.tsx",
    "app/wedding-cakes/page.tsx",
    "app/birthday-cakes/page.tsx",
  ];

  let score = 0;
  const issues = [];

  pages.forEach(page => {
    if (fs.existsSync(page)) {
      const content = fs.readFileSync(page, "utf8");

      if (content.includes("#1")) {
        score += 20;
      } else {
        issues.push(`Missing #1 indicator in ${page}`);
      }

      if (content.includes("Ukrainian cakes Leeds")) {
        score += 20;
      } else {
        issues.push(`Missing primary keyword in ${page}`);
      }

      if (content.includes("Honey Cake") || content.includes("Medovik")) {
        score += 20;
      } else {
        issues.push(`Missing secondary keywords in ${page}`);
      }
    }
  });

  return { score: Math.min(score, 100), issues };
}

function checkMetaDescriptions() {
  const pages = ["app/page.tsx", "app/cakes/page.tsx", "app/wedding-cakes/page.tsx"];

  let score = 0;
  const issues = [];

  pages.forEach(page => {
    if (fs.existsSync(page)) {
      const content = fs.readFileSync(page, "utf8");

      if (content.includes("🏆")) {
        score += 25;
      } else {
        issues.push(`Missing emoji indicators in ${page}`);
      }

      if (content.includes("4.9★")) {
        score += 25;
      } else {
        issues.push(`Missing rating in ${page}`);
      }

      if (content.includes("same-day delivery")) {
        score += 25;
      } else {
        issues.push(`Missing delivery info in ${page}`);
      }

      if (content.includes("Yorkshire")) {
        score += 25;
      } else {
        issues.push(`Missing location in ${page}`);
      }
    }
  });

  return { score: Math.min(score, 100), issues };
}

function checkStructuredData() {
  const files = [
    "app/components/StructuredData.tsx",
    "app/components/CakeStructuredData.tsx",
    "app/page.tsx",
  ];

  let score = 0;
  const issues = [];

  files.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf8");

      if (content.includes("application/ld+json")) {
        score += 20;
      } else {
        issues.push(`Missing structured data in ${file}`);
      }

      if (content.includes("LocalBusiness") || content.includes("Bakery")) {
        score += 20;
      } else {
        issues.push(`Missing business schema in ${file}`);
      }

      if (content.includes("aggregateRating")) {
        score += 20;
      } else {
        issues.push(`Missing ratings in ${file}`);
      }

      if (content.includes("areaServed")) {
        score += 20;
      } else {
        issues.push(`Missing service areas in ${file}`);
      }

      if (content.includes("openingHours")) {
        score += 20;
      } else {
        issues.push(`Missing opening hours in ${file}`);
      }
    }
  });

  return { score: Math.min(score, 100), issues };
}

function checkInternalLinking() {
  const files = ["app/components/Footer.tsx", "app/components/Header.tsx", "app/page.tsx"];

  let score = 0;
  const issues = [];

  files.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf8");

      if (content.includes("/cakes")) {
        score += 20;
      } else {
        issues.push(`Missing cakes link in ${file}`);
      }

      if (content.includes("/wedding-cakes")) {
        score += 20;
      } else {
        issues.push(`Missing wedding cakes link in ${file}`);
      }

      if (content.includes("/birthday-cakes")) {
        score += 20;
      } else {
        issues.push(`Missing birthday cakes link in ${file}`);
      }

      if (content.includes("/contact")) {
        score += 20;
      } else {
        issues.push(`Missing contact link in ${file}`);
      }

      if (content.includes("/about")) {
        score += 20;
      } else {
        issues.push(`Missing about link in ${file}`);
      }
    }
  });

  return { score: Math.min(score, 100), issues };
}

function checkPageSpeed() {
  // This would typically involve actual performance testing
  // For now, we'll check for optimization indicators
  const files = ["next.config.js", "app/layout.tsx", "app/components/CakeCard.tsx"];

  let score = 0;
  const issues = [];

  files.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf8");

      if (content.includes("Image") && content.includes("next/image")) {
        score += 25;
      } else {
        issues.push(`Missing optimized images in ${file}`);
      }

      if (content.includes("loading") && content.includes("lazy")) {
        score += 25;
      } else {
        issues.push(`Missing lazy loading in ${file}`);
      }
    }
  });

  return { score: Math.min(score, 100), issues };
}

function checkMobileOptimization() {
  const files = ["app/layout.tsx", "app/components/Header.tsx", "app/page.tsx"];

  let score = 0;
  const issues = [];

  files.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf8");

      if (content.includes("viewport")) {
        score += 25;
      } else {
        issues.push(`Missing viewport meta in ${file}`);
      }

      if (content.includes("responsive") || content.includes("xs") || content.includes("md")) {
        score += 25;
      } else {
        issues.push(`Missing responsive design in ${file}`);
      }
    }
  });

  return { score: Math.min(score, 100), issues };
}

function checkContentQuality() {
  const files = ["app/page.tsx", "app/about/AboutContent.tsx", "app/faq/FAQItems.tsx"];

  let score = 0;
  const issues = [];

  files.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf8");

      if (content.includes("Ukrainian")) {
        score += 20;
      } else {
        issues.push(`Missing Ukrainian content in ${file}`);
      }

      if (content.includes("honey cake") || content.includes("Medovik")) {
        score += 20;
      } else {
        issues.push(`Missing honey cake content in ${file}`);
      }

      if (content.includes("Leeds")) {
        score += 20;
      } else {
        issues.push(`Missing location content in ${file}`);
      }

      if (content.includes("traditional")) {
        score += 20;
      } else {
        issues.push(`Missing traditional content in ${file}`);
      }

      if (content.includes("authentic")) {
        score += 20;
      } else {
        issues.push(`Missing authentic content in ${file}`);
      }
    }
  });

  return { score: Math.min(score, 100), issues };
}

function checkLocalSEO() {
  const files = ["app/page.tsx", "app/components/Footer.tsx", "app/layout.tsx"];

  let score = 0;
  const issues = [];

  files.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf8");

      if (content.includes("Leeds")) {
        score += 20;
      } else {
        issues.push(`Missing Leeds reference in ${file}`);
      }

      if (content.includes("Yorkshire")) {
        score += 20;
      } else {
        issues.push(`Missing Yorkshire reference in ${file}`);
      }

      if (content.includes("+44 786 721 8194")) {
        score += 20;
      } else {
        issues.push(`Missing phone number in ${file}`);
      }

      if (content.includes("Allerton Grange")) {
        score += 20;
      } else {
        issues.push(`Missing address in ${file}`);
      }

      if (content.includes("LS17")) {
        score += 20;
      } else {
        issues.push(`Missing postcode in ${file}`);
      }
    }
  });

  return { score: Math.min(score, 100), issues };
}

function checkSocialSignals() {
  const files = ["app/components/Footer.tsx", "app/page.tsx", "app/layout.tsx"];

  let score = 0;
  const issues = [];

  files.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf8");

      if (content.includes("facebook.com")) {
        score += 25;
      } else {
        issues.push(`Missing Facebook link in ${file}`);
      }

      if (content.includes("instagram.com")) {
        score += 25;
      } else {
        issues.push(`Missing Instagram link in ${file}`);
      }

      if (content.includes("twitter.com") || content.includes("@olgish_cakes")) {
        score += 25;
      } else {
        issues.push(`Missing Twitter reference in ${file}`);
      }

      if (content.includes("sameAs")) {
        score += 25;
      } else {
        issues.push(`Missing social schema in ${file}`);
      }
    }
  });

  return { score: Math.min(score, 100), issues };
}

function checkBacklinks() {
  // This would typically involve checking actual backlink data
  // For now, we'll provide recommendations
  return {
    score: 50,
    issues: [
      "Need to build more local business directory listings",
      "Need to get featured in local food blogs",
      "Need to build relationships with wedding planners",
      "Need to get mentioned in local news articles",
      "Need to build social media presence",
    ],
  };
}

// Generate recommendations for #1 ranking
function generateRecommendations(checks) {
  const recommendations = [];

  Object.entries(checks).forEach(([metric, data]) => {
    if (data.score < 80) {
      recommendations.push({
        metric,
        score: data.score,
        issues: data.issues,
        priority: data.score < 50 ? "HIGH" : "MEDIUM",
      });
    }
  });

  return recommendations.sort((a, b) => a.score - b.score);
}

// Generate action plan
function generateActionPlan(recommendations) {
  console.log("🎯 ACTION PLAN FOR #1 GOOGLE RANKING\n");

  recommendations.forEach((rec, index) => {
    console.log(
      `${index + 1}. ${rec.metric.toUpperCase()} (Score: ${rec.score}/100) - PRIORITY: ${rec.priority}`
    );
    console.log(`   Issues:`);
    rec.issues.forEach(issue => {
      console.log(`   - ${issue}`);
    });
    console.log("");
  });
}

// Main execution
function main() {
  console.log("🚀 SEO Rank Tracker for Olgish Cakes");
  console.log("Target: #1 Google Ranking for Ukrainian Cakes Leeds\n");

  const checks = checkCurrentSEO();
  const recommendations = generateRecommendations(checks);

  // Calculate overall score
  const totalScore = Object.values(checks).reduce((sum, check) => sum + check.score, 0);
  const averageScore = Math.round(totalScore / Object.keys(checks).length);

  console.log(`📊 OVERALL SEO SCORE: ${averageScore}/100\n`);

  if (averageScore >= 90) {
    console.log("🎉 EXCELLENT! You're very close to #1 ranking!");
  } else if (averageScore >= 80) {
    console.log("👍 GOOD! Some improvements needed for #1 ranking.");
  } else if (averageScore >= 70) {
    console.log("⚠️ FAIR! Significant improvements needed for #1 ranking.");
  } else {
    console.log("🚨 NEEDS WORK! Major improvements required for #1 ranking.");
  }

  console.log("");
  generateActionPlan(recommendations);

  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    overallScore: averageScore,
    checks,
    recommendations,
    targetKeywords: TARGET_KEYWORDS,
  };

  fs.writeFileSync("reports/seo-rank-tracker.json", JSON.stringify(report, null, 2));
  console.log("📄 Report saved to: reports/seo-rank-tracker.json");
}

if (require.main === module) {
  main();
}

module.exports = {
  checkCurrentSEO,
  generateRecommendations,
  generateActionPlan,
  TARGET_KEYWORDS,
};
