#!/usr/bin/env python3
"""
Combined Bounds Matcher - Senior Challenge

Your task: Implement matching strategies for entities that don't exist
as literal text in the PDF document.

Deliverables:
1. Implement at least ONE matching strategy
2. Create a strategy selector with fallback chain
3. Return properly formatted bounds with confidence scores
"""

import json
from pathlib import Path
from typing import Optional

import fitz  # PyMuPDF

from base.pdf_bounds_extractor_base import PDFBoundsExtractor
from base.types import BoundsResult, MatchedEntity, MatchStatistics

# TODO: Import your strategy implementations
# from strategies.partial_matcher import PartialMatcher
# from strategies.aggregation_matcher import AggregationMatcher
# from strategies.fuzzy_matcher import FuzzyMatcher


class CombinedBoundsMatcher:
    """
    Main matcher class that orchestrates different matching strategies.
    
    Your implementation should:
    1. Select appropriate strategy based on entity type
    2. Fall back to alternative strategies if primary fails
    3. Calculate confidence scores
    4. Cache results for repeated searches
    """
    
    def __init__(self, pdf_path: str):
        """
        Initialize the matcher with a PDF document.
        
        Args:
            pdf_path: Path to the PDF file
        """
        self.pdf_path = Path(pdf_path)
        self.pdf_doc = fitz.open(str(self.pdf_path))
        self.base_extractor = PDFBoundsExtractor(str(self.pdf_path))
        
        # TODO: Initialize your strategies
        # self.strategies = {
        #     "partial": PartialMatcher(),
        #     "aggregation": AggregationMatcher(),
        #     "fuzzy": FuzzyMatcher()
        # }
        
        # TODO: Initialize cache
        # self._cache = {}
    
    def match_entity(self, entity_name: str, entity_type: str) -> MatchedEntity:
        """
        Match a single entity and return its bounds.
        
        Args:
            entity_name: The entity text to match (e.g., "49.99% On-Time Delivery Rate")
            entity_type: The type of entity (e.g., "KPI", "DATE", "ORGANIZATION")
            
        Returns:
            MatchedEntity with bounds and confidence
        """
        # TODO: Implement matching logic
        #
        # Suggested approach:
        # 1. Check cache first
        # 2. Try exact match using base extractor
        # 3. If exact match fails, select appropriate strategy
        # 4. Try primary strategy
        # 5. If primary fails, try fallback strategies
        # 6. Calculate confidence score
        # 7. Cache result
        # 8. Return MatchedEntity
        
        return MatchedEntity(
            entity_name=entity_name,
            entity_type=entity_type,
            match_strategy="none",
            confidence=0.0,
            bounds=None,
            component_matches=[]
        )
    
    def match_all(self, entities: list[dict]) -> dict:
        """
        Match all entities and return comprehensive results.
        
        Args:
            entities: List of entity dicts with 'name' and 'type' keys
            
        Returns:
            Dictionary with matched_entities and statistics
        """
        matched_entities = []
        strategies_used = {}
        
        for entity in entities:
            result = self.match_entity(
                entity_name=entity["name"],
                entity_type=entity["type"]
            )
            matched_entities.append(result.to_dict())
            
            # Track strategy usage
            strategy = result.match_strategy
            strategies_used[strategy] = strategies_used.get(strategy, 0) + 1
        
        # Calculate statistics
        matched = sum(1 for e in matched_entities if e["confidence"] > 0.5)
        partial = sum(1 for e in matched_entities if 0 < e["confidence"] <= 0.5)
        unmatched = sum(1 for e in matched_entities if e["confidence"] == 0)
        
        return {
            "matched_entities": matched_entities,
            "statistics": {
                "total_entities": len(entities),
                "matched": matched,
                "partial_matched": partial,
                "unmatched": unmatched,
                "strategies_used": strategies_used
            }
        }
    
    def close(self):
        """Close the PDF document."""
        self.pdf_doc.close()


def main():
    """
    Main entry point - process entities and generate output.
    """
    # Load input entities
    input_path = Path("../../input/entities_to_match.json")
    with open(input_path) as f:
        data = json.load(f)
    
    entities = data["entities"]
    pdf_path = Path("../../input") / data["pdf_file"]
    
    # Process entities
    matcher = CombinedBoundsMatcher(str(pdf_path))
    results = matcher.match_all(entities)
    matcher.close()
    
    # Save output
    output_path = Path("../../output/matched_bounds.json")
    output_path.parent.mkdir(exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"Results saved to {output_path}")
    print(f"Matched: {results['statistics']['matched']}/{results['statistics']['total_entities']}")


if __name__ == "__main__":
    main()
