import { SearchResult, SearchQuery, performSmartSearch, generateSearchAnalytics } from './smartSearchRanking'

// Performance metrics interface
export interface SearchPerformanceMetrics {
  executionTime: number
  memoryUsage: number
  resultsCount: number
  relevanceScore: number
  userSatisfaction: number
  cacheHitRate: number
  apiResponseTime: number
  errorRate: number
  timestamp: number
}

// Test scenarios for search performance
export interface TestScenario {
  id: string
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  searchQuery: SearchQuery
  expectedMinResults: number
  expectedMaxExecutionTime: number // milliseconds
  weight: number // importance weight
}

// Performance optimization suggestions
export interface OptimizationSuggestion {
  type: 'critical' | 'warning' | 'info'
  category: 'performance' | 'relevance' | 'user_experience' | 'technical'
  title: string
  titleAr: string
  description: string
  descriptionAr: string
  impact: 'high' | 'medium' | 'low'
  effort: 'low' | 'medium' | 'high'
  priority: number
}

// Test scenarios for different search types
export const SEARCH_TEST_SCENARIOS: TestScenario[] = [
  {
    id: 'basic_text_search',
    name: 'Basic Text Search',
    nameAr: 'بحث نصي أساسي',
    description: 'Simple keyword search without filters',
    descriptionAr: 'بحث بسيط بكلمات مفتاحية بدون فلاتر',
    searchQuery: {
      query: 'restaurant',
      type: 'all',
      sortBy: 'relevance'
    },
    expectedMinResults: 10,
    expectedMaxExecutionTime: 100,
    weight: 0.3
  },
  {
    id: 'location_based_search',
    name: 'Location-Based Search',
    nameAr: 'بحث جغرافي',
    description: 'Search with location and radius filters',
    descriptionAr: 'بحث مع فلاتر الموقع والمسافة',
    searchQuery: {
      query: 'coffee',
      type: 'shop',
      sortBy: 'distance',
      location: { radius: 5 },
      userLocation: { latitude: 30.0444, longitude: 31.2357 }
    },
    expectedMinResults: 5,
    expectedMaxExecutionTime: 150,
    weight: 0.4
  },
  {
    id: 'filtered_search',
    name: 'Filtered Search',
    nameAr: 'بحث مُفلتر',
    description: 'Search with multiple quality filters',
    descriptionAr: 'بحث مع فلاتر جودة متعددة',
    searchQuery: {
      query: 'dentist',
      type: 'service',
      sortBy: 'rating',
      filters: {
        verified: true,
        hasReviews: true,
        minRating: 4.0
      }
    },
    expectedMinResults: 3,
    expectedMaxExecutionTime: 200,
    weight: 0.5
  },
  {
    id: 'empty_query_browse',
    name: 'Empty Query Browse',
    nameAr: 'تصفح بدون استعلام',
    description: 'Browse without search query (popular results)',
    descriptionAr: 'تصفح بدون كلمات بحث (النتائج الشائعة)',
    searchQuery: {
      type: 'all',
      sortBy: 'popularity'
    },
    expectedMinResults: 20,
    expectedMaxExecutionTime: 80,
    weight: 0.2
  },
  {
    id: 'complex_search',
    name: 'Complex Multi-Filter Search',
    nameAr: 'بحث معقد متعدد الفلاتر',
    description: 'Search with multiple filters and location',
    descriptionAr: 'بحث مع فلاتر متعددة وموقع',
    searchQuery: {
      query: 'beauty salon',
      type: 'service',
      sortBy: 'relevance',
      location: { city: 'Cairo', radius: 10 },
      filters: {
        verified: true,
        hasReviews: true,
        minRating: 3.5,
        priceRange: [50, 500],
        openNow: true
      },
      userLocation: { latitude: 30.0444, longitude: 31.2357 }
    },
    expectedMinResults: 2,
    expectedMaxExecutionTime: 250,
    weight: 0.6
  }
]

/**
 * Measure execution time of a function
 */
export function measureExecutionTime<T>(fn: () => T): { result: T; executionTime: number } {
  const startTime = performance.now()
  const result = fn()
  const endTime = performance.now()
  return {
    result,
    executionTime: endTime - startTime
  }
}

/**
 * Estimate memory usage (simplified)
 */
export function estimateMemoryUsage(data: any): number {
  // Simplified memory estimation
  const jsonString = JSON.stringify(data)
  return jsonString.length * 2 // Rough estimate: 2 bytes per character
}

/**
 * Calculate search relevance quality score
 */
export function calculateRelevanceQuality(results: SearchResult[], searchQuery: SearchQuery): number {
  if (results.length === 0) return 0
  
  let qualityScore = 0
  let factors = 0
  
  // Check if results are relevant to query
  if (searchQuery.query) {
    const queryTerms = searchQuery.query.toLowerCase().split(/\s+/)
    const relevantResults = results.filter(result => {
      const name = result.name.toLowerCase()
      const description = result.description?.toLowerCase() || ''
      const category = result.category?.toLowerCase() || ''
      
      return queryTerms.some(term => 
        name.includes(term) || description.includes(term) || category.includes(term)
      )
    })
    
    qualityScore += (relevantResults.length / results.length) * 100
    factors++
  }
  
  // Check if results meet filter criteria
  if (searchQuery.filters?.verified) {
    const verifiedResults = results.filter(r => r.verified)
    qualityScore += (verifiedResults.length / results.length) * 100
    factors++
  }
  
  if (searchQuery.filters?.hasReviews) {
    const reviewedResults = results.filter(r => r.reviewCount && r.reviewCount > 0)
    qualityScore += (reviewedResults.length / results.length) * 100
    factors++
  }
  
  if (searchQuery.filters?.minRating) {
    const ratedResults = results.filter(r => r.rating && r.rating >= searchQuery.filters!.minRating!)
    qualityScore += (ratedResults.length / results.length) * 100
    factors++
  }
  
  // Check sorting correctness
  let sortingScore = 100 // Assume correct by default
  if (searchQuery.sortBy === 'rating' && results.length > 1) {
    let isSorted = true
    for (let i = 0; i < results.length - 1; i++) {
      const currentRating = results[i].rating || 0
      const nextRating = results[i + 1].rating || 0
      if (currentRating < nextRating) {
        isSorted = false
        break
      }
    }
    sortingScore = isSorted ? 100 : 50
  }
  
  qualityScore += sortingScore
  factors++
  
  return factors > 0 ? qualityScore / factors : 0
}

/**
 * Run performance test for a single scenario
 */
export async function runSearchPerformanceTest(
  scenario: TestScenario,
  searchFunction: (query: SearchQuery) => Promise<SearchResult[]>,
  sampleData: SearchResult[]
): Promise<SearchPerformanceMetrics> {
  
  const startMemory = estimateMemoryUsage(sampleData)
  const startTime = performance.now()
  
  try {
    // Execute search
    const { result: searchResults, executionTime } = measureExecutionTime(() => 
      performSmartSearch(sampleData, scenario.searchQuery)
    )
    
    // Measure API call time (simulated)
    const apiStartTime = performance.now()
    try {
      await searchFunction(scenario.searchQuery)
    } catch (error) {
      console.warn('API call failed during test:', error)
    }
    const apiEndTime = performance.now()
    
    const endMemory = estimateMemoryUsage(searchResults)
    const endTime = performance.now()
    
    // Calculate metrics
    const relevanceScore = calculateRelevanceQuality(searchResults, scenario.searchQuery)
    const analytics = generateSearchAnalytics(searchResults, scenario.searchQuery)
    
    const metrics: SearchPerformanceMetrics = {
      executionTime: executionTime,
      memoryUsage: Math.max(0, endMemory - startMemory),
      resultsCount: searchResults.length,
      relevanceScore: relevanceScore,
      userSatisfaction: calculateUserSatisfaction(searchResults, scenario),
      cacheHitRate: 0, // Would be implemented with actual cache
      apiResponseTime: apiEndTime - apiStartTime,
      errorRate: 0, // No errors in this test
      timestamp: Date.now()
    }
    
    return metrics
    
  } catch (error) {
    console.error('Search performance test failed:', error)
    
    return {
      executionTime: performance.now() - startTime,
      memoryUsage: 0,
      resultsCount: 0,
      relevanceScore: 0,
      userSatisfaction: 0,
      cacheHitRate: 0,
      apiResponseTime: 0,
      errorRate: 100,
      timestamp: Date.now()
    }
  }
}

/**
 * Calculate user satisfaction score based on results quality
 */
export function calculateUserSatisfaction(results: SearchResult[], scenario: TestScenario): number {
  let satisfaction = 0
  
  // Results count satisfaction
  if (results.length >= scenario.expectedMinResults) {
    satisfaction += 30 // 30 points for meeting minimum results
  }
  
  // Quality satisfaction
  const avgRating = results.reduce((sum, r) => sum + (r.rating || 0), 0) / results.length
  satisfaction += (avgRating / 5) * 25 // 25 points for quality
  
  // Relevance satisfaction
  const avgRelevance = results.reduce((sum, r) => sum + (r.relevanceScore || 0), 0) / results.length
  satisfaction += Math.min(avgRelevance / 10, 25) // 25 points for relevance
  
  // Verification satisfaction
  const verifiedRatio = results.filter(r => r.verified).length / results.length
  satisfaction += verifiedRatio * 20 // 20 points for verification
  
  return Math.min(satisfaction, 100)
}

/**
 * Run comprehensive performance test suite
 */
export async function runPerformanceTestSuite(
  searchFunction: (query: SearchQuery) => Promise<SearchResult[]>,
  sampleData: SearchResult[]
): Promise<{
  overallScore: number
  metrics: Record<string, SearchPerformanceMetrics>
  suggestions: OptimizationSuggestion[]
  summary: {
    totalTests: number
    passedTests: number
    avgExecutionTime: number
    avgRelevanceScore: number
    avgUserSatisfaction: number
  }
}> {
  
  console.log('🚀 Starting comprehensive search performance test suite...')
  
  const results: Record<string, SearchPerformanceMetrics> = {}
  let totalScore = 0
  let passedTests = 0
  
  // Run each test scenario
  for (const scenario of SEARCH_TEST_SCENARIOS) {
    console.log(`🔍 Testing scenario: ${scenario.name}`)
    
    const metrics = await runSearchPerformanceTest(scenario, searchFunction, sampleData)
    results[scenario.id] = metrics
    
    // Calculate weighted score for this scenario
    let scenarioScore = 0
    
    // Execution time score (0-100)
    const timeScore = Math.max(0, 100 - (metrics.executionTime / scenario.expectedMaxExecutionTime) * 100)
    scenarioScore += timeScore * 0.3
    
    // Results count score (0-100)
    const resultsScore = metrics.resultsCount >= scenario.expectedMinResults ? 100 : 
      (metrics.resultsCount / scenario.expectedMinResults) * 100
    scenarioScore += resultsScore * 0.2
    
    // Relevance score (0-100)
    scenarioScore += metrics.relevanceScore * 0.3
    
    // User satisfaction score (0-100)
    scenarioScore += metrics.userSatisfaction * 0.2
    
    // Check if test passed
    if (metrics.executionTime <= scenario.expectedMaxExecutionTime && 
        metrics.resultsCount >= scenario.expectedMinResults &&
        metrics.errorRate === 0) {
      passedTests++
    }
    
    totalScore += scenarioScore * scenario.weight
    
    console.log(`✅ ${scenario.name}: Score ${scenarioScore.toFixed(1)}/100`)
  }
  
  // Calculate overall metrics
  const allMetrics = Object.values(results)
  const avgExecutionTime = allMetrics.reduce((sum, m) => sum + m.executionTime, 0) / allMetrics.length
  const avgRelevanceScore = allMetrics.reduce((sum, m) => sum + m.relevanceScore, 0) / allMetrics.length
  const avgUserSatisfaction = allMetrics.reduce((sum, m) => sum + m.userSatisfaction, 0) / allMetrics.length
  
  const overallScore = totalScore / SEARCH_TEST_SCENARIOS.reduce((sum, s) => sum + s.weight, 0)
  
  // Generate optimization suggestions
  const suggestions = generateOptimizationSuggestions(results, overallScore)
  
  const summary = {
    totalTests: SEARCH_TEST_SCENARIOS.length,
    passedTests,
    avgExecutionTime,
    avgRelevanceScore,
    avgUserSatisfaction
  }
  
  console.log(`🎯 Overall Performance Score: ${overallScore.toFixed(1)}/100`)
  console.log(`📊 Tests Passed: ${passedTests}/${SEARCH_TEST_SCENARIOS.length}`)
  console.log(`⏱️ Average Execution Time: ${avgExecutionTime.toFixed(1)}ms`)
  console.log(`🎯 Average Relevance Score: ${avgRelevanceScore.toFixed(1)}%`)
  console.log(`😊 Average User Satisfaction: ${avgUserSatisfaction.toFixed(1)}%`)
  
  return {
    overallScore,
    metrics: results,
    suggestions,
    summary
  }
}

/**
 * Generate optimization suggestions based on test results
 */
export function generateOptimizationSuggestions(
  testResults: Record<string, SearchPerformanceMetrics>,
  overallScore: number
): OptimizationSuggestion[] {
  
  const suggestions: OptimizationSuggestion[] = []
  const metrics = Object.values(testResults)
  const avgExecutionTime = metrics.reduce((sum, m) => sum + m.executionTime, 0) / metrics.length
  const avgRelevanceScore = metrics.reduce((sum, m) => sum + m.relevanceScore, 0) / metrics.length
  
  // Performance suggestions
  if (avgExecutionTime > 150) {
    suggestions.push({
      type: 'critical',
      category: 'performance',
      title: 'Slow Search Performance',
      titleAr: 'أداء البحث بطيء',
      description: 'Search execution time is above optimal threshold. Consider implementing caching, database indexing, or result pagination.',
      descriptionAr: 'وقت تنفيذ البحث أعلى من الحد الأمثل. فكر في تطبيق التخزين المؤقت أو فهرسة قاعدة البيانات أو ترقيم الصفحات.',
      impact: 'high',
      effort: 'medium',
      priority: 95
    })
  }
  
  if (avgExecutionTime > 100) {
    suggestions.push({
      type: 'warning',
      category: 'performance',
      title: 'Optimize Search Algorithm',
      titleAr: 'تحسين خوارزمية البحث',
      description: 'Consider implementing search result caching, pre-computed indexes, or async processing for better performance.',
      descriptionAr: 'فكر في تطبيق تخزين نتائج البحث مؤقتاً أو الفهارس المحسوبة مسبقاً أو المعالجة غير المتزامنة للحصول على أداء أفضل.',
      impact: 'medium',
      effort: 'high',
      priority: 80
    })
  }
  
  // Relevance suggestions
  if (avgRelevanceScore < 70) {
    suggestions.push({
      type: 'critical',
      category: 'relevance',
      title: 'Improve Search Relevance',
      titleAr: 'تحسين دقة البحث',
      description: 'Search results relevance is below acceptable threshold. Review ranking algorithm weights and text matching logic.',
      descriptionAr: 'دقة نتائج البحث أقل من الحد المقبول. راجع أوزان خوارزمية الترتيب ومنطق مطابقة النصوص.',
      impact: 'high',
      effort: 'medium',
      priority: 90
    })
  }
  
  // Memory usage suggestions
  const avgMemoryUsage = metrics.reduce((sum, m) => sum + m.memoryUsage, 0) / metrics.length
  if (avgMemoryUsage > 1000000) { // > 1MB
    suggestions.push({
      type: 'warning',
      category: 'performance',
      title: 'High Memory Usage',
      titleAr: 'استخدام ذاكرة عالي',
      description: 'Search operations are using significant memory. Consider implementing result streaming or pagination.',
      descriptionAr: 'عمليات البحث تستخدم ذاكرة كبيرة. فكر في تطبيق تدفق النتائج أو ترقيم الصفحات.',
      impact: 'medium',
      effort: 'medium',
      priority: 70
    })
  }
  
  // User experience suggestions
  const lowSatisfactionTests = metrics.filter(m => m.userSatisfaction < 60).length
  if (lowSatisfactionTests > 0) {
    suggestions.push({
      type: 'warning',
      category: 'user_experience',
      title: 'Improve User Satisfaction',
      titleAr: 'تحسين رضا المستخدم',
      description: 'Some search scenarios show low user satisfaction scores. Consider improving result quality and relevance.',
      descriptionAr: 'بعض سيناريوهات البحث تظهر درجات رضا منخفضة للمستخدم. فكر في تحسين جودة ودقة النتائج.',
      impact: 'medium',
      effort: 'low',
      priority: 75
    })
  }
  
  // Technical suggestions
  if (overallScore < 80) {
    suggestions.push({
      type: 'info',
      category: 'technical',
      title: 'Implement Search Analytics',
      titleAr: 'تطبيق تحليلات البحث',
      description: 'Add comprehensive search analytics to monitor performance trends and user behavior patterns.',
      descriptionAr: 'أضف تحليلات شاملة للبحث لمراقبة اتجاهات الأداء وأنماط سلوك المستخدم.',
      impact: 'low',
      effort: 'medium',
      priority: 60
    })
  }
  
  // Sort suggestions by priority
  suggestions.sort((a, b) => b.priority - a.priority)
  
  return suggestions
}

/**
 * Generate performance report
 */
export function generatePerformanceReport(testResults: {
  overallScore: number
  metrics: Record<string, SearchPerformanceMetrics>
  suggestions: OptimizationSuggestion[]
  summary: any
}): string {
  
  const { overallScore, metrics, suggestions, summary } = testResults
  
  let report = `
# Search Performance Test Report
Generated: ${new Date().toLocaleString()}

## Summary
- **Overall Score**: ${overallScore.toFixed(1)}/100
- **Tests Passed**: ${summary.passedTests}/${summary.totalTests}
- **Average Execution Time**: ${summary.avgExecutionTime.toFixed(1)}ms
- **Average Relevance Score**: ${summary.avgRelevanceScore.toFixed(1)}%
- **Average User Satisfaction**: ${summary.avgUserSatisfaction.toFixed(1)}%

## Detailed Results
`
  
  // Add detailed results for each scenario
  SEARCH_TEST_SCENARIOS.forEach(scenario => {
    const metric = metrics[scenario.id]
    if (metric) {
      report += `
### ${scenario.name}
- **Execution Time**: ${metric.executionTime.toFixed(1)}ms (limit: ${scenario.expectedMaxExecutionTime}ms)
- **Results Count**: ${metric.resultsCount} (minimum: ${scenario.expectedMinResults})
- **Relevance Score**: ${metric.relevanceScore.toFixed(1)}%
- **User Satisfaction**: ${metric.userSatisfaction.toFixed(1)}%
- **Memory Usage**: ${(metric.memoryUsage / 1024).toFixed(1)}KB
- **Status**: ${metric.executionTime <= scenario.expectedMaxExecutionTime && metric.resultsCount >= scenario.expectedMinResults ? '✅ PASSED' : '❌ FAILED'}
`
    }
  })
  
  // Add optimization suggestions
  if (suggestions.length > 0) {
    report += `
## Optimization Suggestions

`
    suggestions.forEach((suggestion, index) => {
      const priorityEmoji = suggestion.type === 'critical' ? '🔴' : suggestion.type === 'warning' ? '🟡' : 'ℹ️'
      report += `
### ${index + 1}. ${priorityEmoji} ${suggestion.title}
- **Category**: ${suggestion.category}
- **Impact**: ${suggestion.impact} | **Effort**: ${suggestion.effort}
- **Priority**: ${suggestion.priority}/100

${suggestion.description}
`
    })
  }
  
  report += `
## Recommendations

Based on the test results:

1. **If Overall Score < 70**: Focus on critical issues first, especially performance and relevance improvements.
2. **If Overall Score 70-85**: Address warning-level suggestions to optimize user experience.
3. **If Overall Score > 85**: Consider implementing advanced features and analytics.

---
*Report generated by Daleel Balady Search Performance Test Suite*
`
  
  return report
}

/**
 * Quick performance benchmark for development
 */
export async function quickPerformanceBenchmark(sampleData: SearchResult[]): Promise<{
  basicSearchTime: number
  filteredSearchTime: number
  locationSearchTime: number
  memorySizeKB: number
  recommendation: string
}> {
  
  // Basic search test
  const basicQuery: SearchQuery = { query: 'test', sortBy: 'relevance' }
  const { executionTime: basicSearchTime } = measureExecutionTime(() => 
    performSmartSearch(sampleData.slice(0, 100), basicQuery)
  )
  
  // Filtered search test
  const filteredQuery: SearchQuery = { 
    query: 'restaurant', 
    sortBy: 'rating',
    filters: { verified: true, hasReviews: true, minRating: 4.0 }
  }
  const { executionTime: filteredSearchTime } = measureExecutionTime(() => 
    performSmartSearch(sampleData.slice(0, 100), filteredQuery)
  )
  
  // Location search test
  const locationQuery: SearchQuery = { 
    query: 'coffee', 
    sortBy: 'distance',
    userLocation: { latitude: 30.0444, longitude: 31.2357 }
  }
  const { executionTime: locationSearchTime } = measureExecutionTime(() => 
    performSmartSearch(sampleData.slice(0, 100), locationQuery)
  )
  
  // Memory usage
  const memorySizeKB = estimateMemoryUsage(sampleData) / 1024
  
  // Generate recommendation
  let recommendation = 'Performance is optimal.'
  const avgTime = (basicSearchTime + filteredSearchTime + locationSearchTime) / 3
  
  if (avgTime > 200) {
    recommendation = 'Performance needs improvement. Consider caching and indexing.'
  } else if (avgTime > 100) {
    recommendation = 'Performance is acceptable but could be optimized.'
  }
  
  return {
    basicSearchTime,
    filteredSearchTime,
    locationSearchTime,
    memorySizeKB,
    recommendation
  }
}
