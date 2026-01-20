# Input Files

## entities_to_match.json

List of entities extracted by the LLM that need bounding box matching.

**Note:** Some entities contain formatting differences from the actual PDF text:
- Extra spaces
- Inverted word order
- Hyphenation differences

These are intentional and part of the challenge.

## gearhead_report.pdf

The PDF document to search. This file should be created from the Junior Challenge's DOCX content.

To create the PDF:
1. Get the DOCX from the Junior Challenge repo
2. Convert to PDF using LibreOffice, Word, or any PDF converter
3. Save as `gearhead_report.pdf` in this directory

### Expected Content

The PDF contains a weekly operations report with:
- KPIs: OEE 78.5%, OTD ~50%, Return Rate 24.96%
- Dates: Week 45, November 6-12, 2023
- Organizations: Gearhead Cycles, Pacific Components Ltd.
