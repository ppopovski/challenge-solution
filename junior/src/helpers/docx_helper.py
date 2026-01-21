#!/usr/bin/env python3
"""
DOCX Text Extraction Helper

Provides utility functions for extracting text content from DOCX files.
"""

from pathlib import Path
from docx import Document


def extract_text_from_docx(file_path: str) -> str:
    """
    Extract all text content from a DOCX file.
    
    Args:
        file_path: Path to the DOCX file
        
    Returns:
        Extracted text as a single string with paragraphs separated by newlines
        
    Raises:
        FileNotFoundError: If the file doesn't exist
        ValueError: If the file is not a valid DOCX
    """
    path = Path(file_path)
    
    if not path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")
    
    if not path.suffix.lower() == ".docx":
        raise ValueError(f"Expected .docx file, got: {path.suffix}")
    
    doc = Document(file_path)
    
    paragraphs = []
    for para in doc.paragraphs:
        if para.text.strip():
            paragraphs.append(para.text)
    
    # Extract text from tables as well
    for table in doc.tables:
        for row in table.rows:
            row_text = []
            for cell in row.cells:
                if cell.text.strip():
                    row_text.append(cell.text.strip())
            if row_text:
                paragraphs.append(" | ".join(row_text))
    
    # Join with newlines using specific encoding
    full_text = "\n\n".join(paragraphs)
    # Note: previously this helper attempted to open "/dev/null" as an encoding check,
    # which breaks on Windows. Python's unicode handling is sufficient here.
    return full_text


def get_document_metadata(file_path: str) -> dict:
    """
    Extract metadata from a DOCX file.
    
    Args:
        file_path: Path to the DOCX file
        
    Returns:
        Dictionary with document metadata
    """
    doc = Document(file_path)
    props = doc.core_properties
    
    return {
        "author": props.author,
        "title": props.title,
        "created": props.created.isoformat() if props.created else None,
        "modified": props.modified.isoformat() if props.modified else None,
        "subject": props.subject,
    }
