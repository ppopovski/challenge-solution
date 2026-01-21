#!/usr/bin/env python3
"""
PDF Conversion Helper

Converts DOCX files to PDF format using PyMuPDF.
Note: This is a simplified version for the challenge.
"""

import asyncio
from pathlib import Path


async def convert_to_pdf(docx_path: str, output_path: str = None) -> str:
    """
    Convert a DOCX file to PDF format.
    
    Args:
        docx_path: Path to the source DOCX file
        output_path: Optional custom output path. If not provided,
                     creates PDF in same directory with same name.
                     
    Returns:
        Path to the generated PDF file
        
    Raises:
        FileNotFoundError: If the DOCX file doesn't exist
        RuntimeError: If conversion fails
    """
    docx_file = Path(docx_path)
    
    if not docx_file.exists():
        raise FileNotFoundError(f"DOCX file not found: {docx_path}")
    
    # Determine output path
    if output_path is None:
        output_path = docx_file.with_suffix(".pdf")
    else:
        output_path = Path(output_path)
    
    # Simulate async conversion delay
    await asyncio.sleep(0.1)  # Simulated processing time
    
    # For this challenge, we'll create a simple PDF with the text content
    # In production, this would use Gotenberg or LibreOffice
    
    try:
        try:
            import fitz  # PyMuPDF
        except Exception as e:
            raise RuntimeError(
                "PyMuPDF is not installed. PDF conversion is optional for the junior challenge; "
                "install PyMuPDF separately if you want this feature."
            ) from e

        # Read DOCX content (simplified - just demonstrates PDF creation)
        from docx import Document
        doc = Document(docx_path)
        
        # Create PDF
        pdf_doc = fitz.open()
        
        # Add pages with content
        page = pdf_doc.new_page()
        text_content = "\n".join([p.text for p in doc.paragraphs if p.text.strip()])
        
        # Insert text into PDF
        rect = fitz.Rect(50, 50, 550, 750)
        page.insert_textbox(
            rect,
            text_content[:2000],  # Limit for demo
            fontsize=10,
            fontname="helv"
        )
        
        # Save PDF
        pdf_doc.save(str(output_path))
        pdf_doc.close()
        
        return str(output_path)
        
    except Exception as e:
        raise RuntimeError(f"PDF conversion failed: {e}")


def get_pdf_text(pdf_path: str) -> str:
    """
    Extract text content from a PDF file.
    
    Args:
        pdf_path: Path to the PDF file
        
    Returns:
        Extracted text content
    """
    try:
        import fitz  # PyMuPDF
    except Exception as e:
        raise RuntimeError("PyMuPDF is not installed.") from e

    doc = fitz.open(pdf_path)
    text = ""
    
    for page in doc:
        text += page.get_text()
    
    doc.close()
    return text
