# Matching Strategy Comparison

This document compares the three available matching strategies for the PDF bounds matching challenge.

## Overview

| Strategy | Complexity | Accuracy | Speed | Best For |
|----------|------------|----------|-------|----------|
| Partial | Low | Medium | Fast | Simple entities with clear value/label |
| Aggregation | Medium | High | Medium | Combined entities ("X% Y Rate") |
| Fuzzy | High | Variable | Slow | Typos, formatting differences |

---

## Option A: Partial Text Matching

### Approach
Search for individual components of the entity and return the first match.

### Algorithm
```python
def match(entity: str) -> Bounds:
    # Split entity into components
    # e.g., "49.99% On-Time Delivery Rate" -> ["49.99%", "On-Time Delivery Rate"]
    
    # Try to find each component
    for component in components:
        bounds = exact_search(component)
        if bounds:
            return bounds
    
    return None
```

### Pros
- Simple to implement
- Fast execution
- Works well when at least one component exists verbatim

### Cons
- Only returns partial bounds (one component)
- May miss context
- Confidence scoring is simplistic

### Confidence Calculation
```python
confidence = 0.7  # Base confidence for partial match
if found_value_component:
    confidence += 0.2  # Values are more specific
if found_label_component:
    confidence += 0.1  # Labels provide context
```

---

## Option B: Component Aggregation

### Approach
Find all components and create an encompassing bounding box.

### Algorithm
```python
def match(entity: str) -> Bounds:
    # Split entity into components
    components = split_entity(entity)
    
    # Find bounds for each component
    component_bounds = []
    for comp in components:
        bounds = exact_search(comp)
        if bounds:
            component_bounds.append(bounds)
    
    # Merge into single bounding box
    if component_bounds:
        return merge_bounds(component_bounds)
    
    return None
```

### Pros
- More accurate representation
- Captures full entity context
- Better for visualization

### Cons
- More complex implementation
- Slower than partial matching
- May create large bounds if components are far apart

### Confidence Calculation
```python
confidence = len(found_components) / len(total_components)
if all_on_same_line:
    confidence += 0.1
if distance_between_components < threshold:
    confidence += 0.1
```

### Edge Cases
- Components on different lines
- Components on different pages
- Overlapping component bounds

---

## Option C: Fuzzy Matching

### Approach
Use string similarity to find approximate matches.

### Algorithm
```python
def match(entity: str, threshold: float = 0.8) -> Bounds:
    # Get all text blocks from PDF
    text_blocks = extract_all_text_blocks()
    
    best_match = None
    best_score = 0
    
    for block in text_blocks:
        # Calculate similarity
        score = calculate_similarity(entity, block.text)
        
        if score > threshold and score > best_score:
            best_match = block
            best_score = score
    
    if best_match:
        return best_match.bounds
    
    return None
```

### Similarity Metrics
- **Levenshtein Distance**: Character-level edit distance
- **Jaro-Winkler**: Prefix-weighted similarity
- **Token Set Ratio**: Word-level comparison (handles reordering)

### Pros
- Handles typos and formatting differences
- Can match reordered components
- Most flexible approach

### Cons
- Slowest option
- May produce false positives
- Requires tuning threshold

### Confidence Calculation
```python
confidence = similarity_score  # Direct mapping from similarity
```

---

## Recommended Strategy Selection

### By Entity Type

| Entity Type | Primary Strategy | Fallback |
|-------------|-----------------|----------|
| KPI | Aggregation | Partial |
| DATE | Partial | Fuzzy |
| ORGANIZATION | Exact | Fuzzy |

### Decision Tree

```
Try exact match first
    |
    v
Found? --> Return with confidence 1.0
    |
    No
    v
Entity has components (value + label)?
    |
    Yes --> Try Aggregation
    |           |
    |           v
    |       Found both? --> Return merged bounds
    |           |
    |           No
    |           v
    |       Found one? --> Try Partial
    |
    No
    v
Try Fuzzy with threshold 0.8
    |
    v
Found? --> Return with similarity as confidence
    |
    No
    v
Return with confidence 0.0
```

---

## Performance Benchmarks

| Strategy | Avg Time/Entity | Memory |
|----------|----------------|--------|
| Partial | ~5ms | Low |
| Aggregation | ~20ms | Medium |
| Fuzzy | ~100ms | High |

**Target:** < 100ms per entity for all strategies.

---

## Implementation Tips

### Component Splitting
```python
def split_entity(entity: str) -> list[str]:
    # Pattern: "VALUE LABEL" or "LABEL VALUE"
    # Examples:
    # "49.99% On-Time Delivery Rate" -> ["49.99%", "On-Time Delivery Rate"]
    # "Return Rate 24.96%" -> ["Return Rate", "24.96%"]
    
    # Regex to find percentages, numbers, etc.
    value_pattern = r'\d+\.?\d*%?'
    ...
```

### Bounds Merging
```python
def merge_bounds(bounds_list: list[Bounds]) -> Bounds:
    min_x = min(b.x for b in bounds_list)
    min_y = min(b.y for b in bounds_list)
    max_x = max(b.x + b.width for b in bounds_list)
    max_y = max(b.y + b.height for b in bounds_list)
    
    return Bounds(
        page=bounds_list[0].page,  # Assume same page
        x=min_x,
        y=min_y,
        width=max_x - min_x,
        height=max_y - min_y
    )
```

### Caching
```python
class CachedMatcher:
    def __init__(self):
        self._cache = {}
    
    def match(self, entity: str) -> Bounds:
        if entity in self._cache:
            return self._cache[entity]
        
        result = self._do_match(entity)
        self._cache[entity] = result
        return result
```
