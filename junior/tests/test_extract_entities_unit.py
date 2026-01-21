#!/usr/bin/env python3
"""
Unit tests for deterministic fuzzy extraction (junior challenge).
"""

import sys
from pathlib import Path

# Ensure we can import the script module without requiring package installs.
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from extract_entities import extract_entities  # noqa: E402


def test_extracts_oee_and_delivery_and_return_rate():
    text = """
    OEE (Overall Equipment Effectiveness) | 82% | 78.5% | Below Target
    Our On-Time Delivery rate has fallen to 49.9% this week
    The Return Rate stands at 24.96%
    """
    entities = extract_entities(text)
    kpis = entities["kpis"]
    names = {k["name"].lower() for k in kpis}
    assert any("oee" in n for n in names)
    assert any("delivery" in n for n in names)
    assert any("return" in n for n in names)


def test_confidence_in_0_1_range():
    text = "Gross Margin: 32.4%"
    entities = extract_entities(text)
    for kpi in entities["kpis"]:
        assert 0.0 <= kpi["confidence"] <= 1.0


def test_extracts_week_reference_even_with_typo():
    text = "Gearhead Cycle - Week Fourty-Five, FY2023"
    entities = extract_entities(text)
    assert len(entities["dates"]) >= 1
    assert any("week" in d["text"].lower() for d in entities["dates"])


