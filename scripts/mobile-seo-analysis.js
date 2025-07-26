#!/usr/bin/env node

/**
 * Mobile SEO Analysis for Olgish Cakes Home Page
 * Comprehensive analysis of mobile optimization and responsive design
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mobile Analysis Configuration
const CONFIG = {
  mobileBreakpoints: {
    small: 320,
    medium: 768,
    large: 1024,
  },
  mobileKeywords: ["mobile friendly", "responsive", "touch", "swipe", "tap", "mobile optimized"],
};

// Analysis Results
const mobileResults = {
  timestamp: new Date().toISOString(),
  overallScore: 0,
  sections: {},
  recommendations: [],
  strengths: [],
  weaknesses: [],
  criticalIssues: [],
  scoreBreakdown: {},
};

// Utility functions
function log(message, type = "info") {
  const timestamp = new Date().toISOString();
  const prefix =
    type === "error" ? "❌" : type === "warning" ? "⚠️" : type === "success" ? "✅" : "ℹ️";
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function readFile(filePath) {
  try {
    return fs.readFileSync(path.join(process.cwd(), filePath), "utf8");
  } catch (error) {
    return null;
  }
}

function writeFile(filePath, content) {
  fs.writeFileSync(path.join(process.cwd(), filePath), JSON.stringify(content, null, 2));
}

// Mobile Analysis Functions
function analyzeResponsiveDesign(content) {
  log("Analyzing responsive design...");
  const results = {
    score: 0,
    maxScore: 25,
    details: {},
    issues: [],
    strengths: [],
  };

  // Check for Tailwind responsive classes
  const responsiveClasses = [
    "sm:",
    "md:",
    "lg:",
    "xl:",
    "2xl:",
    "flex-col sm:flex-row",
    "text-5xl md:text-7xl",
    "px-6 md:px-8",
    "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  ];

  let responsiveClassCount = 0;
  responsiveClasses.forEach(className => {
    if (content.includes(className)) {
      responsiveClassCount++;
    }
  });

  if (responsiveClassCount >= 5) {
    results.score += 10;
    results.strengths.push("Comprehensive responsive design with Tailwind classes");
  } else if (responsiveClassCount >= 3) {
    results.score += 7;
    results.strengths.push("Good responsive design implementation");
  } else {
    results.issues.push("Should include more responsive design classes");
  }

  // Check for mobile-first approach
  if (content.includes("flex-col sm:flex-row") || content.includes("text-5xl md:text-7xl")) {
    results.score += 5;
    results.strengths.push("Mobile-first responsive approach detected");
  } else {
    results.issues.push("Should implement mobile-first responsive design");
  }

  // Check for proper spacing on mobile
  if (content.includes("px-6 md:px-8") || content.includes("py-12 md:py-24")) {
    results.score += 5;
    results.strengths.push("Proper mobile spacing implemented");
  } else {
    results.issues.push("Should include proper mobile spacing");
  }

  // Check for responsive grid layouts
  if (content.includes("grid-cols-1 md:grid-cols-2") || content.includes("xs={12} md={4}")) {
    results.score += 5;
    results.strengths.push("Responsive grid layouts implemented");
  } else {
    results.issues.push("Should implement responsive grid layouts");
  }

  return results;
}

function analyzeMobileTypography(content) {
  log("Analyzing mobile typography...");
  const results = {
    score: 0,
    maxScore: 20,
    details: {},
    issues: [],
    strengths: [],
  };

  // Check for responsive text sizes
  const responsiveTextPatterns = [
    "text-5xl md:text-7xl",
    "text-xl md:text-2xl",
    "text-lg md:text-xl",
    "text-base md:text-lg",
  ];

  let responsiveTextCount = 0;
  responsiveTextPatterns.forEach(pattern => {
    if (content.includes(pattern)) {
      responsiveTextCount++;
    }
  });

  if (responsiveTextCount >= 3) {
    results.score += 10;
    results.strengths.push("Comprehensive responsive typography implemented");
  } else if (responsiveTextCount >= 2) {
    results.score += 7;
    results.strengths.push("Good responsive typography");
  } else {
    results.issues.push("Should implement more responsive text sizes");
  }

  // Check for readable font sizes on mobile
  if (content.includes("text-5xl") || content.includes("text-4xl")) {
    results.score += 5;
    results.strengths.push("Large, readable headings on mobile");
  } else {
    results.issues.push("Should ensure headings are readable on mobile");
  }

  // Check for proper line height
  if (content.includes("leading-tight") || content.includes("leading-relaxed")) {
    results.score += 5;
    results.strengths.push("Proper line height for mobile readability");
  } else {
    results.issues.push("Should include proper line height for mobile");
  }

  return results;
}

function analyzeMobileNavigation(content) {
  log("Analyzing mobile navigation...");
  const results = {
    score: 0,
    maxScore: 20,
    details: {},
    issues: [],
    strengths: [],
  };

  // Check for mobile-friendly button sizes
  if (content.includes("px-10 py-4") || content.includes("px-8 py-3")) {
    results.score += 5;
    results.strengths.push("Mobile-friendly button sizes");
  } else {
    results.issues.push("Should ensure buttons are large enough for mobile");
  }

  // Check for touch-friendly spacing
  if (content.includes("gap-6") || content.includes("gap-4")) {
    results.score += 5;
    results.strengths.push("Touch-friendly spacing between elements");
  } else {
    results.issues.push("Should include touch-friendly spacing");
  }

  // Check for mobile-optimized call-to-action
  if (content.includes("Get Custom Quote") || content.includes("Explore Our Collection")) {
    results.score += 5;
    results.strengths.push("Clear call-to-action buttons for mobile");
  } else {
    results.issues.push("Should have clear call-to-action buttons");
  }

  // Check for mobile-friendly layout structure
  if (content.includes("flex-col sm:flex-row") || content.includes("text-center")) {
    results.score += 5;
    results.strengths.push("Mobile-friendly layout structure");
  } else {
    results.issues.push("Should optimize layout for mobile viewing");
  }

  return results;
}

function analyzeMobilePerformance(content) {
  log("Analyzing mobile performance...");
  const results = {
    score: 0,
    maxScore: 20,
    details: {},
    issues: [],
    strengths: [],
  };

  // Check for image optimization
  if (content.includes("next/image") || content.includes("Image")) {
    results.score += 5;
    results.strengths.push("Next.js Image component for optimization");
  } else {
    results.issues.push("Should use Next.js Image component for mobile optimization");
  }

  // Check for lazy loading
  if (content.includes('loading="lazy"') || content.includes("lazy")) {
    results.score += 5;
    results.strengths.push("Lazy loading implemented for mobile performance");
  } else {
    results.issues.push("Should implement lazy loading for mobile");
  }

  // Check for optimized animations
  if (content.includes("AnimatedSection") || content.includes("AnimatedDiv")) {
    results.score += 5;
    results.strengths.push("Optimized animations for mobile");
  } else {
    results.issues.push("Should optimize animations for mobile performance");
  }

  // Check for mobile-friendly content loading
  if (content.includes("await Promise.all") || content.includes("getFeaturedCakes")) {
    results.score += 5;
    results.strengths.push("Efficient data loading for mobile");
  } else {
    results.issues.push("Should optimize data loading for mobile");
  }

  return results;
}

function analyzeMobileUserExperience(content) {
  log("Analyzing mobile user experience...");
  const results = {
    score: 0,
    maxScore: 15,
    details: {},
    issues: [],
    strengths: [],
  };

  // Check for testimonials on mobile
  if (content.includes("testimonials") || content.includes("Customer Stories")) {
    results.score += 5;
    results.strengths.push("Testimonials section for mobile trust building");
  } else {
    results.issues.push("Should include testimonials for mobile users");
  }

  // Check for easy contact access
  if (content.includes("Contact") || content.includes("Ready to Order")) {
    results.score += 5;
    results.strengths.push("Easy contact access for mobile users");
  } else {
    results.issues.push("Should make contact information easily accessible on mobile");
  }

  // Check for mobile-friendly content structure
  if (content.includes("Hero Section") || content.includes("Features Section")) {
    results.score += 5;
    results.strengths.push("Well-structured content for mobile consumption");
  } else {
    results.issues.push("Should structure content for mobile consumption");
  }

  return results;
}

function calculateOverallScore(sections) {
  let totalScore = 0;
  let maxTotalScore = 0;

  Object.values(sections).forEach(section => {
    totalScore += section.score;
    maxTotalScore += section.maxScore;
  });

  return Math.round((totalScore / maxTotalScore) * 100);
}

function generateRecommendations(sections) {
  const recommendations = [];

  Object.entries(sections).forEach(([sectionName, section]) => {
    if (section.issues.length > 0) {
      recommendations.push({
        section: sectionName,
        priority: section.score < section.maxScore * 0.5 ? "High" : "Medium",
        issues: section.issues,
      });
    }
  });

  return recommendations.sort((a, b) => {
    const priorityOrder = { High: 3, Medium: 2, Low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

function runMobileSEOAnalysis() {
  log("Starting Mobile SEO Analysis...");

  const homePageContent = readFile("app/page.tsx");
  if (!homePageContent) {
    log("Could not read home page content", "error");
    return;
  }

  // Run all mobile analyses
  mobileResults.sections.responsiveDesign = analyzeResponsiveDesign(homePageContent);
  mobileResults.sections.mobileTypography = analyzeMobileTypography(homePageContent);
  mobileResults.sections.mobileNavigation = analyzeMobileNavigation(homePageContent);
  mobileResults.sections.mobilePerformance = analyzeMobilePerformance(homePageContent);
  mobileResults.sections.mobileUserExperience = analyzeMobileUserExperience(homePageContent);

  // Calculate overall score
  mobileResults.overallScore = calculateOverallScore(mobileResults.sections);

  // Generate recommendations
  mobileResults.recommendations = generateRecommendations(mobileResults.sections);

  // Generate score breakdown
  mobileResults.scoreBreakdown = {
    responsiveDesign: `${mobileResults.sections.responsiveDesign.score}/${mobileResults.sections.responsiveDesign.maxScore}`,
    mobileTypography: `${mobileResults.sections.mobileTypography.score}/${mobileResults.sections.mobileTypography.maxScore}`,
    mobileNavigation: `${mobileResults.sections.mobileNavigation.score}/${mobileResults.sections.mobileNavigation.maxScore}`,
    mobilePerformance: `${mobileResults.sections.mobilePerformance.score}/${mobileResults.sections.mobilePerformance.maxScore}`,
    mobileUserExperience: `${mobileResults.sections.mobileUserExperience.score}/${mobileResults.sections.mobileUserExperience.maxScore}`,
  };

  // Collect all strengths and weaknesses
  Object.values(mobileResults.sections).forEach(section => {
    mobileResults.strengths.push(...section.strengths);
    mobileResults.weaknesses.push(...section.issues);
  });

  // Generate report
  const reportPath = "reports/mobile-seo-analysis.json";
  writeFile(reportPath, mobileResults);

  // Display results
  console.log("\n" + "=".repeat(60));
  console.log("📱 MOBILE SEO ANALYSIS RESULTS");
  console.log("=".repeat(60));
  console.log(`📊 Overall Mobile Score: ${mobileResults.overallScore}/100`);
  console.log("\n📈 Score Breakdown:");
  Object.entries(mobileResults.scoreBreakdown).forEach(([section, score]) => {
    console.log(`   ${section}: ${score}`);
  });

  console.log("\n✅ Mobile Strengths:");
  mobileResults.strengths.forEach(strength => {
    console.log(`   • ${strength}`);
  });

  console.log("\n⚠️ Mobile Areas for Improvement:");
  mobileResults.weaknesses.forEach(weakness => {
    console.log(`   • ${weakness}`);
  });

  console.log("\n🎯 High Priority Mobile Recommendations:");
  mobileResults.recommendations
    .filter(rec => rec.priority === "High")
    .forEach(rec => {
      console.log(`   • ${rec.section}: ${rec.issues.join(", ")}`);
    });

  console.log(`\n📄 Detailed mobile report saved to: ${reportPath}`);
  console.log("=".repeat(60));

  return mobileResults;
}

// Run the analysis
runMobileSEOAnalysis();
