# System Architecture

## Entity Extraction Pipeline Context

This challenge is based on a production entity extraction system that processes business documents.

## Pipeline Overview

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   DOCX      │───▶│   PDF       │───▶│   LLM       │───▶│   Bounds    │
│   Upload    │    │ Conversion  │    │ Extraction  │    │  Matching   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                                │
                                                                ▼
                                              ┌─────────────────────────┐
                                              │   Visualization         │
                                              │   (PDF + SVG Overlay)   │
                                              └─────────────────────────┘
```

## The Bounds Matching Problem

### Current Implementation

The current `pdf_bounds_extractor_base.py` uses **exact text matching**:

```python
def find_text_bounds(pdf_doc, search_text):
    for page in pdf_doc:
        instances = page.search_for(search_text)
        if instances:
            return normalize_bounds(instances[0], page)
    return None
```

### The Gap

LLM-extracted entities often **don't exist verbatim** in the document:

| Extracted Entity | Document Text |
|-----------------|---------------|
| `49.99% On-Time Delivery Rate` | "On-Time Delivery rate has fallen to 49.99%" |
| `78.5% OEE` | "OEE (Overall Equipment Effectiveness): 78.5%" |
| `Return Rate 24.96%` | "The Return Rate stands at 24.96%" |

### Your Task

Implement matching strategies that bridge this gap:

1. **Partial Matching**: Find either component
2. **Aggregation**: Find both and merge bounds
3. **Fuzzy Matching**: Similarity-based search

## Coordinate System

### PDF Coordinates (PyMuPDF)
- Origin: Top-left of page
- Units: Points (1/72 inch)
- Page size varies (typically 612 x 792 for US Letter)

### Normalized Coordinates (Output)
- Origin: Top-left of page
- Units: 0.0 to 1.0 (percentage of page dimensions)
- Consistent across all page sizes

### Conversion Formula

```python
def normalize_bounds(rect, page):
    page_width = page.rect.width
    page_height = page.rect.height
    
    return {
        "x": rect.x0 / page_width,
        "y": rect.y0 / page_height,
        "width": (rect.x1 - rect.x0) / page_width,
        "height": (rect.y1 - rect.y0) / page_height
    }
```

## TypeScript Integration

### Data Flow

```
Python (Backend)              TypeScript (Frontend)
─────────────────            ────────────────────
combined_bounds_matcher.py   boundsMerger.ts
        │                           │
        ▼                           ▼
matched_bounds.json  ────▶   PDFBoundsOverlay.tsx
                                    │
                                    ▼
                             SVG Overlay on PDF
```

### boundsMerger.ts Responsibilities

1. **Parse** matched bounds from JSON
2. **Merge** overlapping bounding boxes
3. **Scale** coordinates to actual pixel dimensions
4. **Export** data for React component consumption

## Performance Requirements

| Metric | Target |
|--------|--------|
| Matching per entity | < 100ms |
| Total processing (8 entities) | < 1s |
| Memory usage | < 100MB |

## Error Handling

Your implementation should handle:

1. **Entity not found**: Return with `confidence: 0`, `match_strategy: "none"`
2. **Partial match**: Return with lower confidence, document what was found
3. **Multi-page entities**: Handle text spanning page boundaries
4. **Invalid PDF**: Graceful error with informative message

## Design Patterns Expected

### Strategy Pattern
```python
class MatchStrategy(Protocol):
    def match(self, entity: str, pdf_doc: Document) -> BoundsResult: ...

class PartialMatcher(MatchStrategy): ...
class AggregationMatcher(MatchStrategy): ...
class FuzzyMatcher(MatchStrategy): ...
```

### Factory Pattern
```python
class MatcherFactory:
    @staticmethod
    def create_matcher(entity_type: str) -> MatchStrategy:
        if entity_type == "KPI":
            return AggregationMatcher()
        elif entity_type == "DATE":
            return PartialMatcher()
        else:
            return FuzzyMatcher()
```

## File Structure

```
src/
├── python/
│   ├── combined_bounds_matcher.py   # YOUR MAIN IMPLEMENTATION
│   ├── base/
│   │   ├── pdf_bounds_extractor_base.py  # Provided (has bugs)
│   │   └── types.py                      # Type definitions
│   └── strategies/
│       ├── __init__.py
│       ├── partial_matcher.py       # Option A
│       ├── aggregation_matcher.py   # Option B
│       └── fuzzy_matcher.py         # Option C
└── typescript/
    ├── boundsMerger.ts              # YOUR IMPLEMENTATION
    ├── types.ts                     # Type definitions
    └── components/
        └── PDFBoundsOverlay.tsx     # Provided (has bugs)
```
