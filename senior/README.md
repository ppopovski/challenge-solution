# Adaptrix Senior Developer Challenge

## PDF Bounds Matching for Combined Entities

**Time Limit:** 30 minutes  
**Difficulty:** Senior  
**AI Assistance:** Allowed (and encouraged!)

---

## Challenge Overview

Implement a sophisticated text matching system that finds PDF bounding boxes for entities that **don't exist as literal text** in the document.

### The Problem

When an LLM extracts the entity `"49.99% On-Time Delivery Rate"`, this combined text doesn't appear verbatim in the document. Instead, the document contains phrases like:

> "On-Time Delivery rate has fallen to 49.99%"

Your task is to implement a matching strategy that:
1. Locates the component parts ("49.99%" and "On-Time Delivery")
2. Creates meaningful bounding boxes for visualization
3. Returns confidence scores based on match quality

This is a **real pending feature** from our production entity extraction system.

---

## Deliverables

1. **Python module** (`src/python/combined_bounds_matcher.py`) - Implement at least ONE strategy
2. **TypeScript module** (`src/typescript/boundsMerger.ts`) - Client-side bounds visualization
3. **Strategy selection logic** - Auto-select best strategy with fallback chain
4. **Unit tests** for both modules

---

## Strategy Options

Choose **at least ONE** strategy to implement:

### Option A: Partial Text Matching
Find bounding rect for either the value OR label component.

```python
class PartialMatcher:
    def match(self, entity: str, pdf_text: str) -> BoundsResult:
        # Extract components (e.g., "49.99%", "On-Time Delivery Rate")
        # Search for each component
        # Return bounds of first found component
```

### Option B: Component Aggregation
Find both components and create encompassing bounds.

```python
class AggregationMatcher:
    def match(self, entity: str, pdf_text: str) -> BoundsResult:
        # Find bounds for value component
        # Find bounds for label component  
        # Create synthetic bounds encompassing both
```

### Option C: Fuzzy Matching
Use similarity matching with configurable threshold.

```python
class FuzzyMatcher:
    def match(self, entity: str, pdf_text: str, threshold: float = 0.8) -> BoundsResult:
        # Split PDF text into searchable segments
        # Calculate similarity scores
        # Return best match above threshold
```

---

## Getting Started

1. Clone this repository
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   npm install
   ```
3. Review the input files in `input/`
4. Review the architecture document: [ARCHITECTURE.md](ARCHITECTURE.md)
5. Study the base implementation: `src/python/base/pdf_bounds_extractor_base.py`
6. Complete your implementation
7. Run tests: `pytest tests/python/` and `npm test`

---

## Input Files

### `input/entities_to_match.json`
List of extracted entities that need bounding box matching.

### `input/gearhead_report.pdf`
The PDF document to search for entity bounds.

---

## Output Format

Your output must match this structure (see `output/matched_bounds.json.template`):

```json
{
  "matched_entities": [
    {
      "entity_name": "49.99% On-Time Delivery Rate",
      "entity_type": "KPI",
      "match_strategy": "partial",
      "confidence": 0.85,
      "bounds": {
        "page": 1,
        "x": 0.15,
        "y": 0.42,
        "width": 0.25,
        "height": 0.03
      },
      "component_matches": [
        {
          "text": "49.99%",
          "bounds": { "page": 1, "x": 0.15, "y": 0.42, "width": 0.08, "height": 0.03 }
        }
      ]
    }
  ],
  "statistics": {
    "total_entities": 8,
    "matched": 6,
    "partial_matched": 1,
    "unmatched": 1,
    "strategies_used": { "partial": 4, "aggregation": 2, "fuzzy": 1 }
  }
}
```

---

## Evaluation Criteria

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Strategy Implementation | 25% | At least one complete, working strategy |
| Multi-language Integration | 20% | Python + TypeScript work together correctly |
| Design Patterns | 20% | Strategy pattern, factory pattern, proper abstractions |
| Edge Case Handling | 15% | Handles multiline, missing components, page boundaries |
| Performance | 10% | Efficient matching (< 100ms per entity) |
| Test Coverage | 10% | Meaningful unit tests for core logic |

---

## Architectural Requirements

Your implementation should demonstrate:

1. **Strategy Pattern** - Pluggable matching algorithms
2. **Factory Pattern** - Entity matcher factory for different entity types
3. **Interface Definition** - Python Protocol/ABC + TypeScript interfaces
4. **Caching** - Bounds cache to avoid re-searching same text
5. **Confidence Scoring** - Weighted confidence based on match quality
6. **Error Recovery** - Graceful degradation when components are partially found

---

## TypeScript Component

The `boundsMerger.ts` module should:

1. Accept matched bounds from Python
2. Merge overlapping bounding boxes
3. Calculate visual coordinates for SVG overlay
4. Export functions usable by React components

See `src/typescript/components/PDFBoundsOverlay.tsx` for the React component that will consume your output.

---

## Known Issues in Provided Code

The base implementation has intentional bugs for you to identify and work around:

- Review `src/python/base/pdf_bounds_extractor_base.py` carefully
- Review `src/typescript/components/PDFBoundsOverlay.tsx` for TypeScript issues

---

## Submission

1. Complete your Python and TypeScript implementations
2. Ensure all tests pass
3. Generate `output/matched_bounds.json` with your results
4. Add a brief explanation of your approach at the bottom of this README

---

## Your Approach (Complete This Section)

<!-- 
Add 3-5 sentences explaining:
1. Which strategy/strategies you implemented
2. Your design decisions
3. Bugs you found and how you worked around them
4. Performance optimizations
-->
