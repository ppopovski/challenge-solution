/**
 * Semantic Matcher Lite Module
 *
 * This module provides semantic column matching capabilities for data integration
 * tasks. It helps map source columns to target schema columns using various
 * similarity algorithms.
 *
 * HIRING CHALLENGE: Some methods are intentionally left as stubs for candidates
 * to implement. Look for methods that throw "Not implemented - your task!" errors.
 *
 * @module SemanticMatcherLite
 * @version 1.0.0
 */

/**
 * SemanticMatcher class for finding best column matches between source and target schemas.
 *
 * Uses multiple similarity algorithms to find the best matches:
 * - Name similarity (SequenceMatcher algorithm) - IMPLEMENTED
 * - Fuzzy similarity - TODO: Implement
 * - Abbreviation expansion - TODO: Implement
 * - Column name normalization - TODO: Implement
 *
 * @example
 * const matcher = new SemanticMatcher(['customer_id', 'first_name', 'last_name', 'email_address']);
 * const matches = matcher.findBestMatches('cust_id');
 * // Returns: [{ column: 'customer_id', score: 0.75, algorithm: 'name_similarity' }, ...]
 */
class SemanticMatcher {
  /**
   * Creates a new SemanticMatcher instance.
   *
   * @param {string[]} schemaColumns - Array of target schema column names to match against
   * @throws {TypeError} If schemaColumns is not an array
   *
   * @example
   * const matcher = new SemanticMatcher(['id', 'name', 'email', 'created_at']);
   */
  constructor(schemaColumns) {
    if (!Array.isArray(schemaColumns)) {
      throw new TypeError('schemaColumns must be an array of strings');
    }

    /**
     * Target schema columns to match against
     * @type {string[]}
     * @private
     */
    this._schemaColumns = schemaColumns.map(col => String(col));

    /**
     * Cache for computed similarity scores
     * @type {Map<string, number>}
     * @private
     */
    this._cache = new Map();
  }

  /**
   * Finds the best matching columns for a given source column name.
   *
   * This method compares the source column against all target schema columns
   * using multiple similarity algorithms and returns the top matches.
   *
   * @param {string} sourceColumn - The source column name to find matches for
   * @param {number} [threshold=0.5] - Minimum similarity score (0-1) to include in results
   * @returns {Array<{column: string, score: number, algorithm: string}>} Array of matches
   *   sorted by score in descending order. Each match contains:
   *   - column: The matching target column name
   *   - score: Similarity score between 0 and 1
   *   - algorithm: Name of the algorithm that produced this score
   *
   * @example
   * const matches = matcher.findBestMatches('customer_email', 0.6);
   * // Returns top 5 matches with score >= 0.6
   */
  findBestMatches(sourceColumn, threshold = 0.5) {
    if (!sourceColumn || typeof sourceColumn !== 'string') {
      return [];
    }

    const matches = [];
    const sourceNormalized = sourceColumn.toLowerCase().trim();

    for (const targetColumn of this._schemaColumns) {
      const targetNormalized = targetColumn.toLowerCase().trim();

      // Calculate name similarity using SequenceMatcher algorithm
      const nameScore = this._calculateNameSimilarity(sourceNormalized, targetNormalized);

      if (nameScore >= threshold) {
        matches.push({
          column: targetColumn,
          score: nameScore,
          algorithm: 'name_similarity'
        });
      }
    }

    // Sort by score descending and return top 5
    return matches
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }

  /**
   * Calculates name similarity between two strings using the SequenceMatcher algorithm.
   *
   * This implements a simplified version of Python's difflib.SequenceMatcher ratio.
   * The algorithm finds the longest contiguous matching subsequence and calculates
   * the similarity as: 2 * M / T, where M is the number of matches and T is the
   * total number of elements in both sequences.
   *
   * @param {string} source - First string to compare
   * @param {string} target - Second string to compare
   * @returns {number} Similarity score between 0 and 1
   *
   * @example
   * matcher._calculateNameSimilarity('customer', 'customer_id');
   * // Returns ~0.8 (high similarity)
   *
   * @private
   */
  _calculateNameSimilarity(source, target) {
    if (!source || !target) {
      return 0;
    }

    if (source === target) {
      return 1.0;
    }

    // Calculate matching characters using longest common subsequence approach
    const matches = this._countMatchingBlocks(source, target);
    const totalLength = source.length + target.length;

    if (totalLength === 0) {
      return 1.0;
    }

    // SequenceMatcher ratio: 2 * M / T
    return (2.0 * matches) / totalLength;
  }

  /**
   * Counts matching characters between two strings using a simplified
   * longest common subsequence (LCS) approach.
   *
   * This finds all matching blocks between the two strings and sums their lengths.
   *
   * @param {string} source - First string
   * @param {string} target - Second string
   * @returns {number} Total number of matching characters
   * @private
   */
  _countMatchingBlocks(source, target) {
    // Use dynamic programming to find matching blocks
    // This is a simplified SequenceMatcher implementation
    const m = source.length;
    const n = target.length;

    // Create a matrix to track matching blocks
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    let totalMatches = 0;
    const matched = new Set();

    // Find all matching substrings (greedy approach similar to SequenceMatcher)
    let i = 0;
    while (i < m) {
      let bestLength = 0;
      let bestJ = -1;

      // Find the longest match starting at position i
      for (let j = 0; j < n; j++) {
        if (matched.has(j)) continue;

        let length = 0;
        let si = i;
        let tj = j;

        while (si < m && tj < n && source[si] === target[tj] && !matched.has(tj)) {
          length++;
          si++;
          tj++;
        }

        if (length > bestLength) {
          bestLength = length;
          bestJ = j;
        }
      }

      if (bestLength > 0) {
        // Mark these positions as matched
        for (let k = 0; k < bestLength; k++) {
          matched.add(bestJ + k);
        }
        totalMatches += bestLength;
        i += bestLength;
      } else {
        i++;
      }
    }

    return totalMatches;
  }

  /**
   * Calculates fuzzy similarity between two strings.
   *
   * TODO: Implement this method!
   *
   * This method should use fuzzy matching techniques to handle:
   * - Typos and misspellings
   * - Character transpositions
   * - Missing or extra characters
   *
   * Suggested approaches:
   * - Levenshtein distance (edit distance)
   * - Jaro-Winkler similarity
   * - N-gram similarity
   *
   * @param {string} source - First string to compare
   * @param {string} target - Second string to compare
   * @returns {number} Similarity score between 0 and 1
   * @throws {Error} Not implemented - your task!
   *
   * @example
   * // Should return high score for minor typos:
   * matcher._calculateFuzzySimilarity('custoemr', 'customer'); // ~0.85
   */
  _calculateFuzzySimilarity(source, target) {
    // TODO: Implement fuzzy matching algorithm
    // Hint: Consider using Levenshtein distance or Jaro-Winkler similarity
    throw new Error('Not implemented - your task!');
  }

  /**
   * Expands common abbreviations in column names.
   *
   * TODO: Implement this method!
   *
   * This method should expand common data abbreviations to their full forms:
   * - 'cust' -> 'customer'
   * - 'addr' -> 'address'
   * - 'amt' -> 'amount'
   * - 'qty' -> 'quantity'
   * - 'dt' -> 'date'
   * - 'num' -> 'number'
   * - 'desc' -> 'description'
   * - etc.
   *
   * @param {string} columnName - Column name potentially containing abbreviations
   * @returns {string} Column name with abbreviations expanded
   * @throws {Error} Not implemented - your task!
   *
   * @example
   * matcher.expandAbbreviations('cust_addr'); // 'customer_address'
   * matcher.expandAbbreviations('order_amt'); // 'order_amount'
   */
  expandAbbreviations(columnName) {
    // TODO: Implement abbreviation expansion
    // Hint: Create a dictionary of common abbreviations and their expansions
    // Hint: Consider word boundaries (e.g., 'cust_id' vs 'custom')
    throw new Error('Not implemented - your task!');
  }

  /**
   * Normalizes a column name for comparison.
   *
   * TODO: Implement this method!
   *
   * This method should normalize column names by:
   * - Converting to lowercase
   * - Replacing separators (-, _, spaces, camelCase) with a consistent format
   * - Removing common prefixes/suffixes (e.g., 'tbl_', '_col', 'fld_')
   * - Handling camelCase and PascalCase conversion
   *
   * @param {string} columnName - Column name to normalize
   * @returns {string} Normalized column name
   * @throws {Error} Not implemented - your task!
   *
   * @example
   * matcher.normalizeColumnName('CustomerFirstName'); // 'customer_first_name'
   * matcher.normalizeColumnName('tbl_customer-id');   // 'customer_id'
   * matcher.normalizeColumnName('CUST_EMAIL_ADDR');   // 'cust_email_addr'
   */
  normalizeColumnName(columnName) {
    // TODO: Implement column name normalization
    // Hint: Use regex to handle different naming conventions
    // Hint: Consider camelCase, snake_case, kebab-case, SCREAMING_SNAKE_CASE
    throw new Error('Not implemented - your task!');
  }

  /**
   * Gets the list of schema columns this matcher was initialized with.
   *
   * @returns {string[]} Copy of the schema columns array
   */
  getSchemaColumns() {
    return [...this._schemaColumns];
  }

  /**
   * Clears the internal cache of computed similarities.
   * Call this if you've updated the schema columns.
   */
  clearCache() {
    this._cache.clear();
  }
}

// Self-test when run directly
if (require.main === module) {
  console.log('=== SemanticMatcher Self-Test ===\n');

  // Test data
  const schemaColumns = [
    'customer_id',
    'first_name',
    'last_name',
    'email_address',
    'phone_number',
    'created_at',
    'updated_at',
    'order_total',
    'shipping_address'
  ];

  const matcher = new SemanticMatcher(schemaColumns);

  // Test 1: Exact match
  console.log('Test 1: Exact match for "customer_id"');
  const exactMatch = matcher.findBestMatches('customer_id');
  console.log('Results:', JSON.stringify(exactMatch, null, 2));
  console.log('');

  // Test 2: Partial match
  console.log('Test 2: Partial match for "cust_id"');
  const partialMatch = matcher.findBestMatches('cust_id', 0.3);
  console.log('Results:', JSON.stringify(partialMatch, null, 2));
  console.log('');

  // Test 3: Similar match
  console.log('Test 3: Similar match for "email"');
  const similarMatch = matcher.findBestMatches('email', 0.3);
  console.log('Results:', JSON.stringify(similarMatch, null, 2));
  console.log('');

  // Test 4: Name similarity calculation
  console.log('Test 4: Direct name similarity calculations');
  const testPairs = [
    ['customer', 'customer'],
    ['customer', 'customer_id'],
    ['email', 'email_address'],
    ['abc', 'xyz'],
    ['first_name', 'firstname']
  ];

  for (const [source, target] of testPairs) {
    const score = matcher._calculateNameSimilarity(source, target);
    console.log(`  "${source}" vs "${target}": ${score.toFixed(3)}`);
  }
  console.log('');

  // Test 5: Verify stub methods throw errors
  console.log('Test 5: Verifying stub methods throw expected errors');

  try {
    matcher._calculateFuzzySimilarity('test', 'test');
    console.log('  ERROR: _calculateFuzzySimilarity should have thrown');
  } catch (e) {
    console.log(`  _calculateFuzzySimilarity: "${e.message}" [OK]`);
  }

  try {
    matcher.expandAbbreviations('test');
    console.log('  ERROR: expandAbbreviations should have thrown');
  } catch (e) {
    console.log(`  expandAbbreviations: "${e.message}" [OK]`);
  }

  try {
    matcher.normalizeColumnName('test');
    console.log('  ERROR: normalizeColumnName should have thrown');
  } catch (e) {
    console.log(`  normalizeColumnName: "${e.message}" [OK]`);
  }

  console.log('\n=== Self-Test Complete ===');
}

module.exports = { SemanticMatcher };
