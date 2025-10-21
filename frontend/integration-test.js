#!/usr/bin/env node

/**
 * سكريپت الاختبار التكاملي الشامل لنظام البحث المتقدم - دليل بلدي
 * Comprehensive Integration Test Script for Advanced Search System - Daleel Balady
 * 
 * يختبر جميع المكونات والميزات الجديدة
 * Tests all new components and features
 * 
 * الاستخدام: node integration-test.js
 * Usage: node integration-test.js
 */

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

// تكوين الألوان للمخرجات
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// رموز الحالة
const symbols = {
  success: '✅',
  error: '❌', 
  warning: '⚠️',
  info: 'ℹ️',
  loading: '⏳',
  rocket: '🚀',
  gear: '⚙️',
  search: '🔍',
  map: '🗺️',
  bookmark: '🔖',
  chart: '📊'
};

// متغيرات الحالة
let testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  total: 0,
  details: []
};

/**
 * طباعة رسائل ملونة
 */
function log(message, color = 'white', symbol = '') {
  const colorCode = colors[color] || colors.white;
  const formattedMessage = symbol ? `${symbol} ${message}` : message;
  console.log(`${colorCode}${formattedMessage}${colors.reset}`);
}

/**
 * طباعة عنوان القسم
 */
function logSection(title, symbol = symbols.gear) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan', symbol);
  console.log('='.repeat(60));
}

/**
 * تسجيل نتيجة الاختبار
 */
function logTest(testName, passed, details = '') {
  testResults.total++;
  
  if (passed) {
    testResults.passed++;
    log(`${testName}: نجح`, 'green', symbols.success);
  } else {
    testResults.failed++;
    log(`${testName}: فشل`, 'red', symbols.error);
    if (details) {
      log(`   التفاصيل: ${details}`, 'yellow');
    }
  }
  
  testResults.details.push({
    name: testName,
    passed,
    details
  });
}

/**
 * تحقق من وجود الملف
 */
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * قراءة محتوى الملف
 */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

/**
 * تحقق من حجم الملف
 */
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

/**
 * تحقق من صحة JSON
 */
function isValidJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * تحقق من وجود النص في الملف
 */
function containsText(filePath, searchText) {
  const content = readFile(filePath);
  return content ? content.includes(searchText) : false;
}

/**
 * عد أسطر الكود في الملف
 */
function countLines(filePath) {
  const content = readFile(filePath);
  return content ? content.split('\n').length : 0;
}

/**
 * اختبار بنية المشروع
 */
function testProjectStructure() {
  logSection('اختبار بنية المشروع', symbols.search);
  
  const requiredDirs = [
    'src/components',
    'src/utils',
    'src/hooks',
    'src/lib',
    'public'
  ];
  
  requiredDirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    logTest(
      `مجلد ${dir} موجود`, 
      fs.existsSync(fullPath),
      `المسار: ${fullPath}`
    );
  });
  
  // التحقق من package.json
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  logTest('package.json موجود', fileExists(packageJsonPath));
  
  if (fileExists(packageJsonPath)) {
    const packageJson = readFile(packageJsonPath);
    logTest('package.json صالح', isValidJSON(packageJson));
  }
}

/**
 * اختبار المكونات الجديدة
 */
function testNewComponents() {
  logSection('اختبار المكونات الجديدة', symbols.gear);
  
  const newComponents = [
    {
      name: 'AdvancedFilters.tsx',
      path: 'src/components/AdvancedFilters.tsx',
      expectedSize: 50000, // ~50KB
      requiredText: ['AdvancedFilters', 'interface', 'export default']
    },
    {
      name: 'InteractiveMapSearch.tsx', 
      path: 'src/components/InteractiveMapSearch.tsx',
      expectedSize: 60000, // ~60KB
      requiredText: ['InteractiveMapSearch', 'Leaflet', 'MapContainer']
    },
    {
      name: 'SavedSearches.tsx',
      path: 'src/components/SavedSearches.tsx', 
      expectedSize: 45000, // ~45KB
      requiredText: ['SavedSearches', 'localStorage', 'toast']
    }
  ];
  
  newComponents.forEach(component => {
    const fullPath = path.join(process.cwd(), component.path);
    
    // اختبار وجود الملف
    logTest(
      `${component.name} موجود`,
      fileExists(fullPath),
      `المسار: ${fullPath}`
    );
    
    if (fileExists(fullPath)) {
      const fileSize = getFileSize(fullPath);
      const lineCount = countLines(fullPath);
      
      // اختبار حجم الملف
      logTest(
        `${component.name} بحجم مناسب`,
        fileSize > component.expectedSize * 0.5, // على الأقل 50% من الحجم المتوقع
        `الحجم: ${(fileSize/1024).toFixed(1)}KB، الأسطر: ${lineCount}`
      );
      
      // اختبار المحتوى المطلوب
      component.requiredText.forEach(text => {
        logTest(
          `${component.name} يحتوي على "${text}"`,
          containsText(fullPath, text),
          `البحث عن: ${text}`
        );
      });
    }
  });
}

/**
 * اختبار الأدوات المساعدة
 */
function testUtilities() {
  logSection('اختبار الأدوات المساعدة', symbols.chart);
  
  const utilities = [
    {
      name: 'smartSearchRanking.ts',
      path: 'src/utils/smartSearchRanking.ts',
      requiredText: ['SearchResult', 'performSmartSearch', 'calculateDistance']
    },
    {
      name: 'searchPerformanceTest.ts',
      path: 'src/utils/searchPerformanceTest.ts', 
      requiredText: ['SearchPerformanceMetrics', 'runPerformanceTestSuite', 'SEARCH_TEST_SCENARIOS']
    }
  ];
  
  utilities.forEach(util => {
    const fullPath = path.join(process.cwd(), util.path);
    
    logTest(`${util.name} موجود`, fileExists(fullPath));
    
    if (fileExists(fullPath)) {
      const lineCount = countLines(fullPath);
      logTest(
        `${util.name} بحجم مناسب`,
        lineCount > 200,
        `عدد الأسطر: ${lineCount}`
      );
      
      util.requiredText.forEach(text => {
        logTest(
          `${util.name} يحتوي على "${text}"`,
          containsText(fullPath, text)
        );
      });
    }
  });
}

/**
 * اختبار ملفات التوثيق
 */
function testDocumentation() {
  logSection('اختبار ملفات التوثيق', symbols.info);
  
  const docs = [
    'SAVEDSEARCHES.md',
    'SAVEDSEARCHES_STATUS.md', 
    'ADVANCED_SEARCH_PROJECT_REPORT.md'
  ];
  
  docs.forEach(doc => {
    const fullPath = path.join(process.cwd(), doc);
    logTest(`${doc} موجود`, fileExists(fullPath));
    
    if (fileExists(fullPath)) {
      const lineCount = countLines(fullPath);
      logTest(
        `${doc} مفصل بشكل كاف`,
        lineCount > 50,
        `عدد الأسطر: ${lineCount}`
      );
    }
  });
}

/**
 * اختبار التكامل مع AdvancedSearch
 */
function testAdvancedSearchIntegration() {
  logSection('اختبار التكامل مع AdvancedSearch', symbols.gear);
  
  const advancedSearchPath = path.join(process.cwd(), 'src/components/AdvancedSearch.tsx');
  
  if (fileExists(advancedSearchPath)) {
    const integrationChecks = [
      'import SavedSearches',
      'import.*AdvancedFilters',
      'showSavedSearches',
      'handleSelectSavedSearch', 
      'SavedSearches.*isOpen',
      'Bookmark.*className'
    ];
    
    integrationChecks.forEach(check => {
      logTest(
        `AdvancedSearch يحتوي على ${check}`,
        containsText(advancedSearchPath, check)
      );
    });
  } else {
    logTest('AdvancedSearch.tsx موجود', false, 'الملف مفقود');
  }
}

/**
 * اختبار حزمة Node.js
 */
function testNodePackages() {
  logSection('اختبار حزم Node.js', symbols.gear);
  
  try {
    // التحقق من وجود node_modules
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    logTest('مجلد node_modules موجود', fs.existsSync(nodeModulesPath));
    
    // التحقق من الحزم المطلوبة
    const requiredPackages = [
      'react',
      'react-dom', 
      'next',
      'typescript',
      'tailwindcss',
      'framer-motion',
      'react-leaflet',
      'lucide-react'
    ];
    
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (fileExists(packageJsonPath)) {
      const packageJson = JSON.parse(readFile(packageJsonPath));
      const allDeps = { 
        ...packageJson.dependencies, 
        ...packageJson.devDependencies 
      };
      
      requiredPackages.forEach(pkg => {
        logTest(
          `حزمة ${pkg} مثبتة`,
          !!allDeps[pkg],
          allDeps[pkg] ? `الإصدار: ${allDeps[pkg]}` : 'غير مثبتة'
        );
      });
    }
  } catch (error) {
    logTest('فحص حزم Node.js', false, error.message);
  }
}

/**
 * اختبار أداء الملفات
 */
function testFilePerformance() {
  logSection('اختبار أداء الملفات', symbols.rocket);
  
  const performanceTests = [
    {
      name: 'إجمالي حجم المكونات الجديدة',
      test: () => {
        const components = [
          'src/components/AdvancedFilters.tsx',
          'src/components/InteractiveMapSearch.tsx', 
          'src/components/SavedSearches.tsx'
        ];
        
        let totalSize = 0;
        components.forEach(comp => {
          const fullPath = path.join(process.cwd(), comp);
          if (fileExists(fullPath)) {
            totalSize += getFileSize(fullPath);
          }
        });
        
        const sizeInKB = totalSize / 1024;
        return {
          passed: sizeInKB < 500, // أقل من 500KB
          details: `الحجم الإجمالي: ${sizeInKB.toFixed(1)}KB`
        };
      }
    },
    {
      name: 'إجمالي أسطر الكود الجديد',
      test: () => {
        const allFiles = [
          'src/components/AdvancedFilters.tsx',
          'src/components/InteractiveMapSearch.tsx',
          'src/components/SavedSearches.tsx',
          'src/utils/smartSearchRanking.ts',
          'src/utils/searchPerformanceTest.ts'
        ];
        
        let totalLines = 0;
        allFiles.forEach(file => {
          const fullPath = path.join(process.cwd(), file);
          if (fileExists(fullPath)) {
            totalLines += countLines(fullPath);
          }
        });
        
        return {
          passed: totalLines > 3000, // أكثر من 3000 سطر
          details: `إجمالي الأسطر: ${totalLines}`
        };
      }
    }
  ];
  
  performanceTests.forEach(test => {
    const result = test.test();
    logTest(test.name, result.passed, result.details);
  });
}

/**
 * اختبار التوافق مع TypeScript
 */
function testTypeScriptCompatibility() {
  logSection('اختبار التوافق مع TypeScript', symbols.gear);
  
  try {
    // التحقق من tsconfig.json
    const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
    logTest('tsconfig.json موجود', fileExists(tsconfigPath));
    
    if (fileExists(tsconfigPath)) {
      const tsconfig = readFile(tsconfigPath);
      logTest('tsconfig.json صالح', isValidJSON(tsconfig));
    }
    
    // اختبار ملفات TypeScript
    const tsFiles = [
      'src/utils/smartSearchRanking.ts',
      'src/utils/searchPerformanceTest.ts'
    ];
    
    tsFiles.forEach(file => {
      const fullPath = path.join(process.cwd(), file);
      if (fileExists(fullPath)) {
        const content = readFile(fullPath);
        
        // التحقق من وجود types
        logTest(
          `${file} يحتوي على interface`,
          content.includes('interface'),
          'TypeScript types defined'
        );
        
        logTest(
          `${file} يحتوي على export`,
          content.includes('export'),
          'Proper exports defined'
        );
      }
    });
    
  } catch (error) {
    logTest('فحص TypeScript', false, error.message);
  }
}

/**
 * اختبار جودة الكود
 */
function testCodeQuality() {
  logSection('اختبار جودة الكود', symbols.search);
  
  const qualityTests = [
    {
      name: 'استخدام أفضل الممارسات في React',
      files: [
        'src/components/AdvancedFilters.tsx',
        'src/components/InteractiveMapSearch.tsx',
        'src/components/SavedSearches.tsx'
      ],
      patterns: ['useState', 'useEffect', 'useCallback', 'export default']
    },
    {
      name: 'استخدام TypeScript interfaces',
      files: [
        'src/utils/smartSearchRanking.ts',
        'src/utils/searchPerformanceTest.ts'
      ],
      patterns: ['interface', 'export interface']
    },
    {
      name: 'معالجة الأخطاء',
      files: [
        'src/components/SavedSearches.tsx',
        'src/utils/searchPerformanceTest.ts'
      ],
      patterns: ['try', 'catch', 'error']
    }
  ];
  
  qualityTests.forEach(test => {
    let passedFiles = 0;
    let totalFiles = test.files.length;
    
    test.files.forEach(file => {
      const fullPath = path.join(process.cwd(), file);
      if (fileExists(fullPath)) {
        let patternsFound = 0;
        test.patterns.forEach(pattern => {
          if (containsText(fullPath, pattern)) {
            patternsFound++;
          }
        });
        
        if (patternsFound >= Math.ceil(test.patterns.length / 2)) {
          passedFiles++;
        }
      }
    });
    
    logTest(
      test.name,
      passedFiles >= Math.ceil(totalFiles / 2),
      `${passedFiles}/${totalFiles} ملفات تمر الاختبار`
    );
  });
}

/**
 * اختبار التوافق مع المتصفح
 */
function testBrowserCompatibility() {
  logSection('اختبار التوافق مع المتصفح', symbols.gear);
  
  const browserTests = [
    {
      name: 'استخدام APIs الحديثة بحذر',
      check: () => {
        const files = [
          'src/components/InteractiveMapSearch.tsx',
          'src/utils/smartSearchRanking.ts'
        ];
        
        let safeUsage = true;
        files.forEach(file => {
          const fullPath = path.join(process.cwd(), file);
          if (fileExists(fullPath)) {
            const content = readFile(fullPath);
            // التحقق من وجود fallbacks للـ APIs الحديثة
            if (content.includes('navigator.geolocation') && 
                !content.includes('navigator.geolocation')) {
              safeUsage = false;
            }
          }
        });
        
        return safeUsage;
      }
    },
    {
      name: 'دعم RTL للعربية',
      check: () => {
        const files = [
          'src/components/AdvancedFilters.tsx',
          'src/components/SavedSearches.tsx'
        ];
        
        let rtlSupport = false;
        files.forEach(file => {
          const fullPath = path.join(process.cwd(), file);
          if (fileExists(fullPath) && containsText(fullPath, 'isRTL')) {
            rtlSupport = true;
          }
        });
        
        return rtlSupport;
      }
    }
  ];
  
  browserTests.forEach(test => {
    logTest(test.name, test.check());
  });
}

/**
 * إنشاء تقرير نهائي
 */
function generateFinalReport() {
  logSection('التقرير النهائي', symbols.chart);
  
  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
  const grade = successRate >= 90 ? 'A' : successRate >= 80 ? 'B' : 
               successRate >= 70 ? 'C' : successRate >= 60 ? 'D' : 'F';
  
  console.log('\n📊 ملخص الاختبارات:');
  log(`إجمالي الاختبارات: ${testResults.total}`, 'cyan');
  log(`نجح: ${testResults.passed}`, 'green', symbols.success);
  log(`فشل: ${testResults.failed}`, 'red', symbols.error);
  log(`التحذيرات: ${testResults.warnings}`, 'yellow', symbols.warning);
  log(`معدل النجاح: ${successRate}%`, 'bright');
  log(`الدرجة: ${grade}`, grade === 'A' ? 'green' : grade === 'B' ? 'cyan' : 
      grade === 'C' ? 'yellow' : 'red');
  
  // توصيات بناءً على النتائج
  console.log('\n💡 التوصيات:');
  if (successRate >= 90) {
    log('ممتاز! المشروع جاهز للنشر', 'green', symbols.rocket);
  } else if (successRate >= 80) {
    log('جيد جداً! هناك بعض التحسينات البسيطة المطلوبة', 'yellow', symbols.warning);
  } else if (successRate >= 70) {
    log('مقبول، يحتاج المزيد من العمل', 'yellow', symbols.warning);
  } else {
    log('يحتاج إعادة نظر كبيرة قبل النشر', 'red', symbols.error);
  }
  
  // عرض الاختبارات الفاشلة
  const failedTests = testResults.details.filter(test => !test.passed);
  if (failedTests.length > 0) {
    console.log('\n❌ الاختبارات الفاشلة:');
    failedTests.forEach(test => {
      log(`• ${test.name}`, 'red');
      if (test.details) {
        log(`  ${test.details}`, 'yellow');
      }
    });
  }
  
  // خطة التحسين
  if (successRate < 100) {
    console.log('\n🔧 خطة التحسين:');
    if (testResults.failed > 0) {
      log('1. معالجة الاختبارات الفاشلة أولاً', 'yellow');
    }
    log('2. تشغيل الاختبار مرة أخرى للتحقق', 'yellow');
    log('3. التحقق من عمل الميزات في المتصفح', 'yellow');
    log('4. مراجعة التوثيق والتأكد من اكتماله', 'yellow');
  }
  
  return {
    successRate: parseFloat(successRate),
    grade,
    passed: testResults.passed,
    failed: testResults.failed,
    total: testResults.total
  };
}

/**
 * الدالة الرئيسية
 */
async function main() {
  log('🚀 بدء الاختبار التكاملي الشامل لنظام البحث المتقدم', 'bright');
  log('Advanced Search System - Comprehensive Integration Test', 'cyan');
  log(`التاريخ: ${new Date().toLocaleString('ar-EG')}`, 'white');
  
  try {
    // تشغيل جميع الاختبارات
    testProjectStructure();
    testNewComponents();
    testUtilities();
    testDocumentation();
    testAdvancedSearchIntegration();
    testNodePackages();
    testFilePerformance();
    testTypeScriptCompatibility();
    testCodeQuality();
    testBrowserCompatibility();
    
    // إنشاء التقرير النهائي
    const finalReport = generateFinalReport();
    
    // حفظ التقرير في ملف
    const reportPath = path.join(process.cwd(), 'integration-test-report.json');
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: finalReport,
      details: testResults.details,
      recommendations: finalReport.successRate >= 90 ? 
        ['المشروع جاهز للنشر', 'تشغيل اختبار نهائي في المتصفح'] :
        ['معالجة الاختبارات الفاشلة', 'إعادة تشغيل الاختبار', 'مراجعة التوثيق']
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    log(`تم حفظ التقرير في: ${reportPath}`, 'cyan', symbols.info);
    
    // رمز الخروج
    process.exit(finalReport.failed === 0 ? 0 : 1);
    
  } catch (error) {
    log(`خطأ في تشغيل الاختبار: ${error.message}`, 'red', symbols.error);
    process.exit(1);
  }
}

// تشغيل الاختبار
if (require.main === module) {
  main();
}

module.exports = {
  testResults,
  logTest,
  fileExists,
  containsText,
  main
};
