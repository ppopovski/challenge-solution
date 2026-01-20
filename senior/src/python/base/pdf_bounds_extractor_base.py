#!/usr/bin/env python3
"""
PDF Bounds Extractor - Base Implementation

This module provides exact text matching for PDF documents.
Note: This implementation has known limitations with combined entities.

WARNING: This code contains intentional bugs for the challenge.
Review carefully before using.
"""

from pathlib import Path
from typing import Optional

import fitz  # PyMuPDF

from .types import Bounds, BoundsResult, ComponentMatch


class PDFBoundsExtractor:
    """
    Extracts bounding boxes for text found in PDF documents.
    
    Uses PyMuPDF's text search functionality for exact matching.
    """
    
    def __init__(self, pdf_path: str):
        """
        Initialize the extractor with a PDF document.
        
        Args:
            pdf_path: Path to the PDF file
        """
        self.pdf_path = Path(pdf_path)
        if not self.pdf_path.exists():
            raise FileNotFoundError(f"PDF not found: {pdf_path}")
        
        self.pdf_doc = fitz.open(str(self.pdf_path))
        self._text_cache = {}
    
    def find_exact_bounds(self, search_text: str) -> Optional[Bounds]:
        """
        Find exact text in PDF and return normalized bounds.
        
        Args:
            search_text: The exact text to search for
            
        Returns:
            Bounds if found, None otherwise
        """
        # Search each page
        for page_num in range(len(self.pdf_doc)):
            page = self.pdf_doc[page_num]
            instances = page.search_for(search_text)
            
            if instances:
                rect = instances[0]  # Take first match
                return self._normalize_bounds(rect, page, page_num)
        
        return None
    
    def _normalize_bounds(self, rect: fitz.Rect, page: fitz.Page, page_num: int) -> Bounds:
        """
        Convert PyMuPDF rect to normalized coordinates.
        
        Args:
            rect: PyMuPDF rectangle
            page: The page object
            page_num: Page number (0-indexed internally, but output uses 1-indexed)
            
        Returns:
            Normalized Bounds object
        """
        page_width = page.rect.width
        page_height = page.rect.height
        
        # BUG: Page numbers should be 1-indexed for output, but we're using 0-indexed
        return Bounds(
            page=page_num,  # Should be page_num + 1
            x=rect.x0 / page_width,
            y=rect.y0 / page_height,
            width=(rect.x1 - rect.x0) / page_width,
            height=(rect.y1 - rect.y0) / page_height
        )
    
    def get_page_text(self, page_num: int) -> str:
        """
        Get all text from a specific page.
        
        Args:
            page_num: Page number (0-indexed)
            
        Returns:
            All text content from the page
        """
        if page_num not in self._text_cache:
            page = self.pdf_doc[page_num]
            self._text_cache[page_num] = page.get_text()
        
        return self._text_cache[page_num]
    
    def search_with_context(self, search_text: str, context_chars: int = 50) -> list[dict]:
        """
        Search for text and return matches with surrounding context.
        
        Args:
            search_text: Text to search for
            context_chars: Number of characters of context to include
            
        Returns:
            List of matches with context
        """
        matches = []
        
        for page_num in range(len(self.pdf_doc)):
            page_text = self.get_page_text(page_num)
            
            # Find all occurrences
            start = 0
            while True:
                idx = page_text.find(search_text, start)
                if idx == -1:
                    break
                
                # Extract context
                context_start = max(0, idx - context_chars)
                context_end = min(len(page_text), idx + len(search_text) + context_chars)
                
                matches.append({
                    "page": page_num,  # BUG: Should be page_num + 1 for consistency
                    "position": idx,
                    "context": page_text[context_start:context_end],
                    "bounds": self.find_exact_bounds(search_text)
                })
                
                start = idx + 1
        
        return matches
    
    def extract_all_text_blocks(self, page_num: int) -> list[dict]:
        """
        Extract all text blocks with their bounds from a page.
        
        Args:
            page_num: Page number (0-indexed)
            
        Returns:
            List of text blocks with bounds
        """
        page = self.pdf_doc[page_num]
        blocks = page.get_text("dict")["blocks"]
        
        result = []
        for block in blocks:
            if "lines" not in block:
                continue
            
            for line in block["lines"]:
                for span in line["spans"]:
                    text = span["text"].strip()
                    if text:
                        bbox = span["bbox"]
                        result.append({
                            "text": text,
                            "bounds": Bounds(
                                page=page_num,  # BUG: Should be page_num + 1
                                x=bbox[0],  # BUG: Not normalized! Should divide by page width
                                y=bbox[1],  # BUG: Not normalized! Should divide by page height
                                width=bbox[2] - bbox[0],  # BUG: Not normalized
                                height=bbox[3] - bbox[1]   # BUG: Not normalized
                            )
                        })
        
        return result
    
    def close(self):
        """Close the PDF document."""
        self.pdf_doc.close()
