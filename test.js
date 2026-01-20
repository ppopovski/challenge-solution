/**
 * SemanticMatcher Test Runner
 *
 * Tests the SemanticMatcher module against predefined test cases in test_data.json.
 * Run with: node test.js
 *
 * This test runner:
 * - Loads test cases from test_data.json
 * - Runs each source column through SemanticMatcher.findBestMatches()
 * - Compares actual scores against expected thresholds
 * - Reports PASS/FAIL for each test case
 * - Shows summary statistics at the end
 *
 * Note: The base implementation uses only SequenceMatcher without fuzzy matching,
 * so many tests will FAIL until candidates implement the additional matching algorithms.
 */

const { SemanticMatcher } = require('./semantic_matcher_lite');
const testData = require('./test_data.json');

// ANSI color codes for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

/**
 * Parses an expected score string and returns the comparison function.
 *
 * @param {string} expectedScoreStr - String like ">0.85" or ">=0.90"
 * @returns {{operator: string, threshold: number, test: function}} Parsed threshold info
 */
function parseExpectedScore(expectedScoreStr) {
  const match = expectedScoreStr.match(/^([><=]+)(\d+\.?\d*)$/);

  if (!match) {
    throw new Error(`Invalid expected score format: ${expectedScoreStr}`);
  }

  const operator = match[1];
  const threshold = parseFloat(match[2]);

  let test;
  switch (operator) {
    case '>':
      test = (score) => score > threshold;
      break;
    case '>=':
      test = (score) => score >= threshold;
      break;
    case '<':
      test = (score) => score < threshold;
      break;
    case '<=':
      test = (score) => score <= threshold;
      break;
    case '=':
    case '==':
      test = (score) => Math.abs(score - threshold) < 0.001;
      break;
    default:
      throw new Error(`Unknown operator: ${operator}`);
  }

  return { operator, threshold, test };
}

/**
 * Finds the score for a specific column in the matches array.
 *
 * @param {Array} matches - Array of match results from findBestMatches()
 * @param {string} expectedColumn - The column name to find
 * @returns {number|null} The score for the column, or null if not found
 */
function findScoreForColumn(matches, expectedColumn) {
  const match = matches.find(m => m.column === expectedColumn);
  return match ? match.score : null;
}

/**
 * Runs all test cases and reports results.
 */
function runTests() {
  console.log(`${colors.bold}=== SemanticMatcher Test Suite ===${colors.reset}\n`);

  // Load schema columns and create matcher
  const schemaColumns = testData.schema_columns;
  const testCases = testData.test_cases;

  console.log(`${colors.cyan}Schema columns:${colors.reset} ${schemaColumns.length} columns loaded`);
  console.log(`${colors.cyan}Test cases:${colors.reset} ${testCases.length} tests to run\n`);

  const matcher = new SemanticMatcher(schemaColumns);

  let passed = 0;
  let failed = 0;
  const results = [];

  console.log(`${colors.bold}--- Running Tests ---${colors.reset}\n`);

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    const { source, expected_match, category, expected_score } = testCase;

    // Get all matches (threshold 0 to get everything)
    const matches = matcher.findBestMatches(source, 0);

    // Find the score for the expected match
    const actualScore = findScoreForColumn(matches, expected_match);

    // Parse and check expected score
    const expectedParsed = parseExpectedScore(expected_score);
    const meetsThreshold = actualScore !== null && expectedParsed.test(actualScore);

    // Determine pass/fail
    const isPassing = meetsThreshold;

    if (isPassing) {
      passed++;
    } else {
      failed++;
    }

    // Store result for output
    const result = {
      testNum: i + 1,
      source,
      expected_match,
      category,
      actualScore,
      expected_score,
      isPassing
    };
    results.push(result);

    // Output test result
    const statusColor = isPassing ? colors.green : colors.red;
    const statusText = isPassing ? 'PASS' : 'FAIL';

    const actualScoreDisplay = actualScore !== null
      ? actualScore.toFixed(3)
      : 'N/A (not in top 5)';

    console.log(
      `Test ${i + 1}: ${colors.cyan}${source}${colors.reset} -> ${expected_match}`
    );
    console.log(
      `  Category: ${category}`
    );
    console.log(
      `  Score: ${actualScoreDisplay} (expected: ${expected_score})`
    );
    console.log(
      `  ${statusColor}${colors.bold}[${statusText}]${colors.reset}\n`
    );
  }

  // Summary
  console.log(`${colors.bold}--- Summary ---${colors.reset}\n`);

  const passColor = passed === testCases.length ? colors.green : colors.yellow;
  console.log(`${passColor}${passed} of ${testCases.length} tests passed${colors.reset}`);

  if (failed > 0) {
    console.log(`${colors.red}${failed} tests failed${colors.reset}`);
  }

  // Category breakdown
  console.log(`\n${colors.bold}Results by Category:${colors.reset}`);
  const categories = {};
  results.forEach(r => {
    if (!categories[r.category]) {
      categories[r.category] = { passed: 0, total: 0 };
    }
    categories[r.category].total++;
    if (r.isPassing) {
      categories[r.category].passed++;
    }
  });

  for (const [category, stats] of Object.entries(categories)) {
    const catColor = stats.passed === stats.total ? colors.green : colors.red;
    console.log(`  ${category}: ${catColor}${stats.passed}/${stats.total}${colors.reset}`);
  }

  // Final note about expectations
  console.log(`\n${colors.yellow}${colors.bold}Note:${colors.reset} ${colors.yellow}The base implementation only uses SequenceMatcher.`);
  console.log(`Most tests will FAIL until fuzzy matching, abbreviation expansion,`);
  console.log(`and column normalization are implemented.${colors.reset}\n`);

  console.log(`${colors.bold}=== Test Run Complete ===${colors.reset}`);

  // Return exit code (0 if all passed, 1 if any failed)
  return failed === 0 ? 0 : 1;
}

// Run tests if this file is executed directly
if (require.main === module) {
  const exitCode = runTests();
  process.exit(exitCode);
}

module.exports = { runTests, parseExpectedScore, findScoreForColumn };
