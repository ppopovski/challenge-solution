# Feature Request #FR-2025-001 - Fuzzy Matching Enhancement

**Priority:** High
**Time Limit:** 60 minutes

---

## Background

The Analytics AI platform includes a **Semantic Matcher** that automatically maps document columns to database schema columns during data import. For example, when a user uploads a CSV with a column named "Customer Name", the matcher identifies this should map to the `customer_name` field in the database.

### Current Limitation

The existing implementation uses **exact SequenceMatcher** which fails on:
- **Abbreviations:** "Cust" doesn't match "Customer", "Qty" doesn't match "Quantity"
- **Typos:** "Custmer" doesn't match "Customer"
- **Case variations:** "CUSTOMER_NAME" doesn't match "customer_name"
- **Word reordering:** "Name Customer" doesn't match "Customer Name"

This causes document imports to fail or require manual column mapping, which defeats the purpose of the automatic matching feature.

---

## Your Task

Enhance the `findBestMatches()` function in `semantic_matcher_lite.js` with fuzzy matching capabilities.

### Review the Code

1. Open `semantic_matcher_lite.js`
2. Find the `_calculateFuzzySimilarity()` method - this is your starting point
3. Implement the `TODO` methods to improve matching accuracy

---

## Deliverables

Create or modify the following:

1. **FuzzyMatcher class** or enhanced `_calculateFuzzySimilarity()` method
   - Implement fuzzy string matching that handles the limitations above

2. **`expandAbbreviations()` function**
   - Handle common database abbreviations (cust → customer, qty → quantity, amt → amount, etc.)

3. **`normalizeColumnName()` function**
   - Normalize case, separators (underscores, camelCase, spaces), and formatting

4. **Tests demonstrating improved accuracy**
   - Show before/after matching results
   - Test edge cases (abbreviations, typos, reordering)

5. **APPROACH.md**
   - Document your solution approach
   - Explain trade-offs you considered
   - Note any assumptions made

---

## Getting Started

```bash
# Install dependencies (if needed)
npm install

# Review the semantic matcher
# Open: semantic_matcher_lite.js

# Run tests to see current behavior
node test.js
```

---

## Evaluation Criteria

Your submission will be evaluated on:

1. **Correctness** - Does the fuzzy matching actually work?
2. **Code Quality** - Is the code clean, readable, and maintainable?
3. **Test Coverage** - Do your tests demonstrate the improvements?
4. **Documentation** - Is your APPROACH.md clear and thorough?
5. **Trade-off Awareness** - Did you consider performance vs accuracy?

---

## Tips

- Start by understanding the existing `findBestMatches()` implementation
- Consider using string distance algorithms (Levenshtein, Jaro-Winkler, etc.)
- Think about the order of operations: normalize first, then compare
- A good abbreviation dictionary goes a long way
- Don't over-engineer - focus on the common cases first

---

Good luck!

*Adaptrix Engineering Team*
