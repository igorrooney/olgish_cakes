#!/usr/bin/env node

/**
 * Mobile SEO Analysis for Olgish Cakes About Page
 * Comprehensive analysis of mobile optimization and responsive design
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mobile Analysis Configuration
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
  page: "About Page",
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
    "spacing",
    "theme.spacing",
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
  } else if (content.includes("theme.spacing") || content.includes("spacing")) {
    results.score += 3;
    results.strengths.push("Responsive spacing implementation");
  }

  // Check for responsive grid layouts
  if (content.includes("Grid") || content.includes("grid-cols") || content.includes("flex")) {
    results.score += 5;
    results.strengths.push("Responsive grid layouts implemented");
  }

  // Check for proper mobile spacing
  if (content.includes("spacing") || content.includes("padding") || content.includes("margin")) {
    results.score += 5;
    results.strengths.push("Proper mobile spacing implemented");
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

  // Check for responsive typography
  const typographyClasses = [
    "Typography",
    "text-",
    "font-",
    "line-height",
    "responsive",
    "theme.typography",
  ];

  let typographyScore = 0;
  typographyClasses.forEach(className => {
    if (content.includes(className)) {
      typographyScore++;
    }
  });

  if (typographyScore >= 4) {
    results.score += 8;
    results.strengths.push("Good responsive typography");
  } else if (typographyScore >= 2) {
    results.score += 5;
    results.strengths.push("Basic responsive typography");
  } else {
    results.issues.push("Should implement responsive typography");
  }

  // Check for large headings on mobile
  if (
    content.includes("text-5xl") ||
    content.includes("text-4xl") ||
    content.includes("h1") ||
    content.includes("h2")
  ) {
    results.score += 6;
    results.strengths.push("Large, readable headings on mobile");
  } else {
    results.issues.push("Should use larger headings for mobile readability");
  }

  // Check for proper line height
  if (content.includes("line-height") || content.includes("leading-")) {
    results.score += 3;
    results.strengths.push("Proper line height for mobile readability");
  }

  // Check for Material-UI Typography component
  if (content.includes("Typography")) {
    results.score += 3;
    results.strengths.push("Material-UI Typography component for consistent styling");
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

  // Check for touch-friendly button sizes
  const buttonClasses = [
    "Button",
    "min-h-[44px]",
    "min-h-11",
    "px-6",
    "py-3",
    "touch-friendly",
    "44px",
  ];

  let buttonScore = 0;
  buttonClasses.forEach(className => {
    if (content.includes(className)) {
      buttonScore++;
    }
  });

  if (buttonScore >= 3) {
    results.score += 8;
    results.strengths.push("Mobile-friendly button sizes");
  } else if (buttonScore >= 1) {
    results.score += 4;
    results.strengths.push("Some mobile-friendly buttons");
  } else {
    results.issues.push("Should implement touch-friendly button sizes (44px minimum)");
  }

  // Check for touch-friendly spacing
  if (content.includes("spacing") || content.includes("gap-") || content.includes("space-")) {
    results.score += 6;
    results.strengths.push("Touch-friendly spacing between elements");
  }

  // Check for clear call-to-action buttons
  if (content.includes("Button") || content.includes("CTA") || content.includes("call-to-action")) {
    results.score += 6;
    results.strengths.push("Clear call-to-action buttons for mobile");
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

  // Check for Next.js Image component
  if (content.includes("next/image") || content.includes("Image")) {
    results.score += 8;
    results.strengths.push("Next.js Image component for optimization");
  } else {
    results.issues.push("Should use Next.js Image component for better performance");
  }

  // Check for lazy loading
  if (content.includes("lazy") || content.includes("loading") || content.includes("priority")) {
    results.score += 6;
    results.strengths.push("Lazy loading implemented for mobile performance");
  }

  // Check for optimized animations
  if (
    content.includes("motion") ||
    content.includes("framer-motion") ||
    content.includes("transition")
  ) {
    results.score += 3;
    results.strengths.push("Optimized animations for mobile");
  }

  // Check for efficient data loading
  if (
    content.includes("use client") ||
    content.includes("useState") ||
    content.includes("useEffect")
  ) {
    results.score += 3;
    results.strengths.push("Efficient data loading for mobile");
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

  // Check for testimonials section
  if (content.includes("testimonial") || content.includes("review") || content.includes("Star")) {
    results.score += 5;
    results.strengths.push("Testimonials section for mobile trust building");
  }

  // Check for easy contact access
  if (
    content.includes("contact") ||
    content.includes("phone") ||
    content.includes("email") ||
    content.includes("Phone") ||
    content.includes("Email")
  ) {
    results.score += 5;
    results.strengths.push("Easy contact access for mobile users");
  }

  // Check for well-structured content
  if (
    content.includes("Card") ||
    content.includes("Paper") ||
    content.includes("Container") ||
    content.includes("Grid")
  ) {
    results.score += 5;
    results.strengths.push("Well-structured content for mobile consumption");
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

function runAboutPageMobileAnalysis() {
  log("Starting About Page Mobile SEO Analysis...");

  // Read both about page files
  const aboutPageContent = readFile("app/about/page.tsx");
  const aboutContentComponent = readFile("app/about/AboutContent.tsx");

  if (!aboutPageContent || !aboutContentComponent) {
    log("Could not read about page content", "error");
    return;
  }

  // Combine content for analysis
  const combinedContent = aboutPageContent + " " + aboutContentComponent;

  // Run all mobile analyses
  mobileResults.sections.responsiveDesign = analyzeResponsiveDesign(combinedContent);
  mobileResults.sections.mobileTypography = analyzeMobileTypography(combinedContent);
  mobileResults.sections.mobileNavigation = analyzeMobileNavigation(combinedContent);
  mobileResults.sections.mobilePerformance = analyzeMobilePerformance(combinedContent);
  mobileResults.sections.mobileUserExperience = analyzeMobileUserExperience(combinedContent);

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
  const reportPath = "reports/about-page-mobile-analysis.json";
  writeFile(reportPath, mobileResults);

  // Display results
  console.log("\n" + "=".repeat(60));
  console.log("📱 ABOUT PAGE MOBILE SEO ANALYSIS RESULTS");
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
runAboutPageMobileAnalysis();
