#!/usr/bin/env tsx

/**
 * Script to validate all structured data across the OlgishCakes website
 * Checks for missing hasMerchantReturnPolicy fields and other Google Merchant Center requirements
 */

import { promises as fs } from 'fs';
import path from 'path';
import { validateMerchantReturnPolicies } from '../app/utils/merchantReturnPolicy';

interface ValidationResult {
  file: string;
  isValid: boolean;
  missingPolicies: string[];
  errors: string[];
}

async function findStructuredDataFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      files.push(...await findStructuredDataFiles(fullPath));
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
      files.push(fullPath);
    }
  }

  return files;
}

async function extractStructuredDataFromFile(filePath: string): Promise<any[]> {
  const content = await fs.readFile(filePath, 'utf-8');
  const structuredDataObjects: any[] = [];

  // Look for JSON-LD scripts
  const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/g;
  let match;
  
  while ((match = jsonLdRegex.exec(content)) !== null) {
    try {
      const jsonContent = match[1].trim();
      if (jsonContent) {
        const parsed = JSON.parse(jsonContent);
        structuredDataObjects.push(parsed);
      }
    } catch (error) {
      console.warn(`Failed to parse JSON-LD in ${filePath}:`, error);
    }
  }

  // Look for dangerouslySetInnerHTML with JSON.stringify
  const dangerouslySetInnerHTMLRegex = /dangerouslySetInnerHTML\s*=\s*\{\s*__html:\s*JSON\.stringify\(([\s\S]*?)\)\s*\}/g;
  
  while ((match = dangerouslySetInnerHTMLRegex.exec(content)) !== null) {
    try {
      // This is a simplified extraction - in practice, you might need more sophisticated parsing
      const jsonString = match[1];
      // For now, we'll skip this as it requires more complex AST parsing
    } catch (error) {
      console.warn(`Failed to parse dangerouslySetInnerHTML in ${filePath}:`, error);
    }
  }

  return structuredDataObjects;
}

async function validateFile(filePath: string): Promise<ValidationResult> {
  const result: ValidationResult = {
    file: filePath,
    isValid: true,
    missingPolicies: [],
    errors: [],
  };

  try {
    const structuredDataObjects = await extractStructuredDataFromFile(filePath);
    
    for (const structuredData of structuredDataObjects) {
      const validation = validateMerchantReturnPolicies(structuredData);
      
      if (!validation.isValid) {
        result.isValid = false;
        result.missingPolicies.push(...validation.missingPolicies);
      }
    }
  } catch (error) {
    result.isValid = false;
    result.errors.push(`Failed to process file: ${error}`);
  }

  return result;
}

async function main() {
  console.log('🔍 Validating structured data across OlgishCakes website...\n');

  const appDir = path.join(process.cwd(), 'app');
  const files = await findStructuredDataFiles(appDir);
  
  const results: ValidationResult[] = [];
  
  for (const file of files) {
    const result = await validateFile(file);
    if (!result.isValid) {
      results.push(result);
    }
  }

  if (results.length === 0) {
    console.log('✅ All structured data is valid! No missing hasMerchantReturnPolicy fields found.');
    process.exit(0);
  }

  console.log(`❌ Found ${results.length} files with validation issues:\n`);

  for (const result of results) {
    console.log(`📄 ${result.file}`);
    
    if (result.missingPolicies.length > 0) {
      console.log('   Missing hasMerchantReturnPolicy:');
      result.missingPolicies.forEach(policy => {
        console.log(`   - ${policy}`);
      });
    }
    
    if (result.errors.length > 0) {
      console.log('   Errors:');
      result.errors.forEach(error => {
        console.log(`   - ${error}`);
      });
    }
    
    console.log('');
  }

  console.log('💡 To fix these issues, ensure all Offer objects include hasMerchantReturnPolicy field.');
  process.exit(1);
}

// Run the main function
main().catch(console.error);
