"""
Ranger Universal Ingestion Engine

Components:
- extractor: LLM-powered content extraction
- dedup: Spatiotemporal deduplication  
- orchestrator: Pipeline coordination
"""

from .extractor import UniversalExtractor, ExtractedIncident, TranscriptFilter
from .dedup import Deduplicator, ReportForDedup, MatchResult

__all__ = [
    'UniversalExtractor',
    'ExtractedIncident', 
    'TranscriptFilter',
    'Deduplicator',
    'ReportForDedup',
    'MatchResult',
]
