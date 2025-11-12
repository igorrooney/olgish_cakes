#!/usr/bin/env node

/**
 * Home Page SEO Analysis for Olgish Cakes
 * Comprehensive analysis of the home page SEO performance
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SEO Analysis Configuration
const CONFIG = {
  targetKeywords: [
    "Ukrainian cakes Leeds",
    "honey cake",
    "Medovik",
    "Ukrainian bakery Leeds",
    "custom cakes Leeds",
    "wedding cakes Leeds",
    "birthday cakes Leeds",
    "cake delivery Leeds",
    "traditional Ukrainian desserts",
    "authentic Ukrainian cakes",
  ],
  competitors: [
    "https://www.cakebakeandroll.co.uk",
    "https://www.cakesbykate.co.uk",
    "https://www.leedsbakery.com",
  ],
};

// Analysis Results
const analysisResults = {
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

// SEO Analysis Functions
function analyzeMetaTags(content) {
  log("Analyzing meta tags...");
  const results = {
    score: 0,
    maxScore: 25,
    details: {},
    issues: [],
    strengths: [],
  };

  // Check title tag
  const titleMatch = content.match(/title:\s*"([^"]+)"/);
  if (titleMatch) {
    const title = titleMatch[1];
    results.details.title = title;

    if (title.length >= 50 && title.length <= 60) {
      results.score += 5;
      results.strengths.push("Title length is optimal (50-60 characters)");
    } else if (title.length > 30 && title.length < 70) {
      results.score += 3;
      results.strengths.push("Title length is acceptable");
    } else {
      results.issues.push("Title length should be between 50-60 characters");
    }

    // Check for target keywords
    const keywordMatches = CONFIG.targetKeywords.filter(keyword =>
      title.toLowerCase().includes(keyword.toLowerCase())
    );
    if (keywordMatches.length > 0) {
      results.score += 5;
      results.strengths.push(`Title contains target keywords: ${keywordMatches.join(", ")}`);
    } else {
      results.issues.push("Title should include target keywords");
    }
  } else {
    results.issues.push("Title tag not found");
  }

  // Check description
  const descMatch = content.match(/description:\s*"([^"]+)"/);
  if (descMatch) {
    const description = descMatch[1];
    results.details.description = description;

    if (description.length >= 150 && description.length <= 160) {
      results.score += 5;
      results.strengths.push("Description length is optimal (150-160 characters)");
    } else if (description.length > 120 && description.length < 200) {
      results.score += 3;
      results.strengths.push("Description length is acceptable");
    } else {
      results.issues.push("Description should be between 150-160 characters");
    }

    // Check for call-to-action
    if (
      description.includes("Order") ||
      description.includes("Get") ||
      description.includes("Contact")
    ) {
      results.score += 2;
      results.strengths.push("Description includes call-to-action");
    }
  } else {
    results.issues.push("Meta description not found");
  }

  // Check Open Graph tags
  const ogTitleMatch = content.match(/openGraph:\s*{[^}]*title:\s*"([^"]+)"/);
  const ogDescMatch = content.match(/openGraph:\s*{[^}]*description:\s*"([^"]+)"/);
  const ogImageMatch = content.match(/openGraph:\s*{[^}]*images:\s*\[[^\]]*url:\s*"([^"]+)"/);

  if (ogTitleMatch && ogDescMatch && ogImageMatch) {
    results.score += 5;
    results.strengths.push("Complete Open Graph tags implemented");
  } else {
    results.issues.push("Open Graph tags should be complete");
  }

  // Check Twitter Card tags
  const twitterCardMatch = content.match(/twitter:\s*{[^}]*card:\s*"([^"]+)"/);
  if (twitterCardMatch) {
    results.score += 3;
    results.strengths.push("Twitter Card tags implemented");
  } else {
    results.issues.push("Twitter Card tags missing");
  }

  return results;
}

function analyzeStructuredData(content) {
  log("Analyzing structured data...");
  const results = {
    score: 0,
    maxScore: 20,
    details: {},
    issues: [],
    strengths: [],
  };

  // Check for structured data
  if (content.includes('"@context": "https://schema.org"')) {
    results.score += 10;
    results.strengths.push("Structured data implemented");
  } else {
    results.issues.push("Structured data not found");
  }

  // Check for specific schema types
  const schemaTypes = ["WebPage", "Organization", "Product", "BreadcrumbList", "ItemList"];

  schemaTypes.forEach(type => {
    if (content.includes(`"@type": "${type}"`)) {
      results.score += 2;
      results.strengths.push(`${type} schema implemented`);
    }
  });

  return results;
}

function analyzeContentOptimization(content) {
  log("Analyzing content optimization...");
  const results = {
    score: 0,
    maxScore: 25,
    details: {},
    issues: [],
    strengths: [],
  };

  // Check for target keywords in content
  const keywordMatches = CONFIG.targetKeywords.filter(keyword =>
    content.toLowerCase().includes(keyword.toLowerCase())
  );

  if (keywordMatches.length >= 5) {
    results.score += 8;
    results.strengths.push(`Content includes ${keywordMatches.length} target keywords`);
  } else if (keywordMatches.length >= 3) {
    results.score += 5;
    results.strengths.push(`Content includes ${keywordMatches.length} target keywords`);
  } else {
    results.issues.push("Content should include more target keywords");
  }

  // Check heading structure
  const h1Count = (content.match(/variant="h1"/g) || []).length;
  const h2Count = (content.match(/variant="h2"/g) || []).length;

  if (h1Count === 1) {
    results.score += 3;
    results.strengths.push("Proper H1 structure (single H1)");
  } else {
    results.issues.push("Should have exactly one H1 tag");
  }

  if (h2Count >= 3) {
    results.score += 3;
    results.strengths.push("Good H2 structure for content organization");
  } else {
    results.issues.push("Should have more H2 tags for content structure");
  }

  // Check content length
  const textContent = content
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (textContent.length >= 1000) {
    results.score += 5;
    results.strengths.push("Content length is substantial");
  } else {
    results.issues.push("Content should be longer for better SEO");
  }

  // Check for internal links
  const internalLinks = (content.match(/href="\/[^"]*"/g) || []).length;
  if (internalLinks >= 5) {
    results.score += 3;
    results.strengths.push("Good internal linking structure");
  } else {
    results.issues.push("Should include more internal links");
  }

  // Check for call-to-action buttons
  const ctaButtons = (
    content.match(/Get Custom Quote|Explore Our Collection|Order Now|Contact Us/g) || []
  ).length;
  if (ctaButtons >= 2) {
    results.score += 3;
    results.strengths.push("Multiple call-to-action buttons present");
  } else {
    results.issues.push("Should include more call-to-action buttons");
  }

  return results;
}

function analyzeTechnicalSEO(content) {
  log("Analyzing technical SEO...");
  const results = {
    score: 0,
    maxScore: 20,
    details: {},
    issues: [],
    strengths: [],
  };

  // Check for canonical URL
  if (content.includes('canonical: "https://olgishcakes.co.uk"')) {
    results.score += 5;
    results.strengths.push("Canonical URL properly set");
  } else {
    results.issues.push("Canonical URL should be set");
  }

  // Check for robots meta
  if (content.includes("robots:") && content.includes("index: true")) {
    results.score += 3;
    results.strengths.push("Robots meta tag properly configured");
  } else {
    results.issues.push("Robots meta tag should be configured");
  }

  // Check for metadata base
  if (content.includes('metadataBase: new URL("https://olgishcakes.co.uk")')) {
    results.score += 3;
    results.strengths.push("Metadata base URL properly set");
  } else {
    results.issues.push("Metadata base URL should be set");
  }

  // Check for geo-targeting
  if (content.includes('"geo.region": "GB-ENG"') && content.includes('"geo.placename": "Leeds"')) {
    results.score += 3;
    results.strengths.push("Geo-targeting implemented");
  } else {
    results.issues.push("Geo-targeting should be implemented");
  }

  // Check for business information
  if (content.includes('"business:contact_data:')) {
    results.score += 3;
    results.strengths.push("Business contact information in metadata");
  } else {
    results.issues.push("Business contact information should be in metadata");
  }

  // Check for rating information
  if (content.includes('rating: "4.9"')) {
    results.score += 3;
    results.strengths.push("Rating information in metadata");
  } else {
    results.issues.push("Rating information should be in metadata");
  }

  return results;
}

function analyzeUserExperience(content) {
  log("Analyzing user experience...");
  const results = {
    score: 0,
    maxScore: 10,
    details: {},
    issues: [],
    strengths: [],
  };

  // Check for testimonials
  if (content.includes("testimonials") || content.includes("Customer Stories")) {
    results.score += 3;
    results.strengths.push("Testimonials section present");
  } else {
    results.issues.push("Should include testimonials section");
  }

  // Check for features/benefits
  if (content.includes("Why Choose") || content.includes("Features")) {
    results.score += 3;
    results.strengths.push("Features/benefits section present");
  } else {
    results.issues.push("Should include features/benefits section");
  }

  // Check for clear navigation
  if (content.includes("Explore Our Collection") && content.includes("Get Custom Quote")) {
    results.score += 2;
    results.strengths.push("Clear call-to-action buttons");
  } else {
    results.issues.push("Should have clear call-to-action buttons");
  }

  // Check for contact information
  if (content.includes("Contact") || content.includes("Ready to Order")) {
    results.score += 2;
    results.strengths.push("Contact information accessible");
  } else {
    results.issues.push("Should make contact information easily accessible");
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

function runHomePageSEOAnalysis() {
  log("Starting Home Page SEO Analysis...");

  const homePageContent = readFile("app/page.tsx");
  if (!homePageContent) {
    log("Could not read home page content", "error");
    return;
  }

  // Run all analyses
  analysisResults.sections.metaTags = analyzeMetaTags(homePageContent);
  analysisResults.sections.structuredData = analyzeStructuredData(homePageContent);
  analysisResults.sections.contentOptimization = analyzeContentOptimization(homePageContent);
  analysisResults.sections.technicalSEO = analyzeTechnicalSEO(homePageContent);
  analysisResults.sections.userExperience = analyzeUserExperience(homePageContent);

  // Calculate overall score
  analysisResults.overallScore = calculateOverallScore(analysisResults.sections);

  // Generate recommendations
  analysisResults.recommendations = generateRecommendations(analysisResults.sections);

  // Generate score breakdown
  analysisResults.scoreBreakdown = {
    metaTags: `${analysisResults.sections.metaTags.score}/${analysisResults.sections.metaTags.maxScore}`,
    structuredData: `${analysisResults.sections.structuredData.score}/${analysisResults.sections.structuredData.maxScore}`,
    contentOptimization: `${analysisResults.sections.contentOptimization.score}/${analysisResults.sections.contentOptimization.maxScore}`,
    technicalSEO: `${analysisResults.sections.technicalSEO.score}/${analysisResults.sections.technicalSEO.maxScore}`,
    userExperience: `${analysisResults.sections.userExperience.score}/${analysisResults.sections.userExperience.maxScore}`,
  };

  // Collect all strengths and weaknesses
  Object.values(analysisResults.sections).forEach(section => {
    analysisResults.strengths.push(...section.strengths);
    analysisResults.weaknesses.push(...section.issues);
  });

  // Generate report
  const reportPath = "reports/home-page-seo-analysis.json";
  writeFile(reportPath, analysisResults);

  // Display results
  console.log("\n" + "=".repeat(60));
  console.log("🏠 HOME PAGE SEO ANALYSIS RESULTS");
  console.log("=".repeat(60));
  console.log(`📊 Overall SEO Score: ${analysisResults.overallScore}/100`);
  console.log("\n📈 Score Breakdown:");
  Object.entries(analysisResults.scoreBreakdown).forEach(([section, score]) => {
    console.log(`   ${section}: ${score}`);
  });

  console.log("\n✅ Strengths:");
  analysisResults.strengths.forEach(strength => {
    console.log(`   • ${strength}`);
  });

  console.log("\n⚠️ Areas for Improvement:");
  analysisResults.weaknesses.forEach(weakness => {
    console.log(`   • ${weakness}`);
  });

  console.log("\n🎯 High Priority Recommendations:");
  analysisResults.recommendations
    .filter(rec => rec.priority === "High")
    .forEach(rec => {
      console.log(`   • ${rec.section}: ${rec.issues.join(", ")}`);
    });

  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  console.log("=".repeat(60));

  return analysisResults;
}

// Run the analysis
runHomePageSEOAnalysis();
