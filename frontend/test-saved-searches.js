#!/usr/bin/env node

/**
 * Simple test script for SavedSearches functionality
 * Run with: node test-saved-searches.js
 */

const path = require('path');
const fs = require('fs');

console.log('🔖 SavedSearches Integration Test\n');

// Test 1: Verify component files exist
function testFilesExist() {
  console.log('📂 Testing file existence...');
  
  const files = [
    'src/components/SavedSearches.tsx',
    'SAVEDSEARCHES.md'
  ];
  
  let allFilesExist = true;
  
  files.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
      console.log(`   ✅ ${file} - EXISTS`);
    } else {
      console.log(`   ❌ ${file} - MISSING`);
      allFilesExist = false;
    }
  });
  
  return allFilesExist;
}

// Test 2: Verify imports in AdvancedSearch.tsx
function testAdvancedSearchIntegration() {
  console.log('\n🔍 Testing AdvancedSearch integration...');
  
  const advancedSearchPath = path.join(__dirname, 'src/components/AdvancedSearch.tsx');
  
  if (!fs.existsSync(advancedSearchPath)) {
    console.log('   ❌ AdvancedSearch.tsx not found');
    return false;
  }
  
  const content = fs.readFileSync(advancedSearchPath, 'utf8');
  
  const checks = [
    { name: 'SavedSearches import', pattern: /import SavedSearches from ['"]@\/components\/SavedSearches['"]/ },
    { name: 'Bookmark icon import', pattern: /Bookmark.*History/ },
    { name: 'showSavedSearches state', pattern: /const \[showSavedSearches, setShowSavedSearches\]/ },
    { name: 'SavedSearches component usage', pattern: /<SavedSearches\s/ },
    { name: 'handleSelectSavedSearch function', pattern: /const handleSelectSavedSearch/ },
    { name: 'getCurrentSearchParams function', pattern: /const getCurrentSearchParams/ },
    { name: 'addToSearchHistory function', pattern: /const addToSearchHistory/ }
  ];
  
  let allChecksPassed = true;
  
  checks.forEach(check => {
    if (check.pattern.test(content)) {
      console.log(`   ✅ ${check.name}`);
    } else {
      console.log(`   ❌ ${check.name}`);
      allChecksPassed = false;
    }
  });
  
  return allChecksPassed;
}

// Test 3: Validate SavedSearches component structure
function testSavedSearchesStructure() {
  console.log('\n🧩 Testing SavedSearches component structure...');
  
  const componentPath = path.join(__dirname, 'src/components/SavedSearches.tsx');
  
  if (!fs.existsSync(componentPath)) {
    console.log('   ❌ SavedSearches.tsx not found');
    return false;
  }
  
  const content = fs.readFileSync(componentPath, 'utf8');
  
  const checks = [
    { name: 'TypeScript interfaces', pattern: /interface SavedSearch/ },
    { name: 'React hooks', pattern: /useState.*useEffect/ },
    { name: 'Translation support', pattern: /useTranslation/ },
    { name: 'Framer Motion', pattern: /motion\.div/ },
    { name: 'API integration', pattern: /\/api\/search-cache/ },
    { name: 'Local storage', pattern: /localStorage/ },
    { name: 'Toast notifications', pattern: /toast\(/ },
    { name: 'Modal structure', pattern: /fixed inset-0/ },
    { name: 'Save functionality', pattern: /const saveSearch/ },
    { name: 'Delete functionality', pattern: /const deleteSearch/ },
    { name: 'Copy link functionality', pattern: /const copySearchLink/ },
    { name: 'Search history', pattern: /searchHistory/ }
  ];
  
  let allChecksPassed = true;
  
  checks.forEach(check => {
    if (check.pattern.test(content)) {
      console.log(`   ✅ ${check.name}`);
    } else {
      console.log(`   ❌ ${check.name}`);
      allChecksPassed = false;
    }
  });
  
  return allChecksPassed;
}

// Test 4: Check UI components and dependencies
function testUIComponents() {
  console.log('\n🎨 Testing UI component dependencies...');
  
  const componentPath = path.join(__dirname, 'src/components/SavedSearches.tsx');
  
  if (!fs.existsSync(componentPath)) {
    console.log('   ❌ SavedSearches.tsx not found');
    return false;
  }
  
  const content = fs.readFileSync(componentPath, 'utf8');
  
  const uiComponents = [
    'Card', 'CardContent', 'CardHeader', 'CardTitle',
    'Button', 'Badge', 'Input', 'Label', 'Textarea',
    'Dialog', 'DialogContent', 'DialogHeader', 'DialogTitle', 'DialogFooter',
    'Separator', 'ScrollArea', 'Avatar'
  ];
  
  let allComponentsFound = true;
  
  uiComponents.forEach(component => {
    const pattern = new RegExp(`import.*${component}.*from.*@/components/ui`);
    if (pattern.test(content)) {
      console.log(`   ✅ ${component} component`);
    } else {
      console.log(`   ❌ ${component} component`);
      allComponentsFound = false;
    }
  });
  
  return allComponentsFound;
}

// Test 5: Check for proper error handling
function testErrorHandling() {
  console.log('\n🛡️ Testing error handling...');
  
  const componentPath = path.join(__dirname, 'src/components/SavedSearches.tsx');
  
  if (!fs.existsSync(componentPath)) {
    console.log('   ❌ SavedSearches.tsx not found');
    return false;
  }
  
  const content = fs.readFileSync(componentPath, 'utf8');
  
  const errorHandlingChecks = [
    { name: 'Try-catch blocks', pattern: /try\s*\{[\s\S]*catch\s*\(.*error/g },
    { name: 'Error logging', pattern: /console\.error/ },
    { name: 'Toast error messages', pattern: /variant.*destructive/ },
    { name: 'Loading states', pattern: /setIsLoading/ },
    { name: 'Error states', pattern: /error/ }
  ];
  
  let errorHandlingScore = 0;
  
  errorHandlingChecks.forEach(check => {
    const matches = content.match(check.pattern);
    if (matches && matches.length > 0) {
      console.log(`   ✅ ${check.name} (${matches.length} instances)`);
      errorHandlingScore++;
    } else {
      console.log(`   ⚠️  ${check.name} - not found`);
    }
  });
  
  return errorHandlingScore >= 3; // At least 3 error handling mechanisms
}

// Run all tests
async function runTests() {
  console.log('Starting SavedSearches integration tests...\n');
  
  const tests = [
    { name: 'File Existence', fn: testFilesExist },
    { name: 'AdvancedSearch Integration', fn: testAdvancedSearchIntegration },
    { name: 'Component Structure', fn: testSavedSearchesStructure },
    { name: 'UI Components', fn: testUIComponents },
    { name: 'Error Handling', fn: testErrorHandling }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    try {
      const result = test.fn();
      if (result) {
        console.log(`\n✅ ${test.name} - PASSED\n`);
        passedTests++;
      } else {
        console.log(`\n❌ ${test.name} - FAILED\n`);
      }
    } catch (error) {
      console.log(`\n💥 ${test.name} - ERROR: ${error.message}\n`);
    }
  }
  
  // Summary
  console.log('='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`Tests Passed: ${passedTests}/${totalTests}`);
  console.log(`Success Rate: ${Math.round((passedTests/totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! SavedSearches is ready to use.');
    console.log('\n📋 Next Steps:');
    console.log('   1. Test the UI in the browser');
    console.log('   2. Verify backend API endpoints');
    console.log('   3. Check mobile responsiveness');
    console.log('   4. Test with different browsers');
    console.log('   5. Validate localStorage functionality');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the issues above.');
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check file paths and imports');
    console.log('   2. Verify component integration');
    console.log('   3. Ensure all dependencies are installed');
    console.log('   4. Review component structure');
  }
  
  console.log('\n📚 Documentation: See SAVEDSEARCHES.md for detailed usage instructions.');
  
  return passedTests === totalTests;
}

// Execute tests
if (require.main === module) {
  runTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests };
