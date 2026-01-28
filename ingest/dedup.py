"""
Ranger Deduplication Engine
Merges incident reports from multiple sources into canonical incidents.

The Problem:
- Scanner at 2:31 AM: "Shots fired, 100 block North Main"
- News at 6:00 AM: "Two arrested after shooting in Crystal Lake"
- These are the SAME incident. We need to link them.

The Solution:
- Spatiotemporal clustering: 300m radius, 3-hour window
- Type similarity boost
- Confidence aggregation from multiple sources
"""

import json
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Tuple, Any
from dataclasses import dataclass
import math


@dataclass
class ReportForDedup:
    """A report to be deduplicated"""
    id: str
    incident_type: str
    category: str
    latitude: float
    longitude: float
    occurred_at: datetime
    source_type: str  # 'audio', 'news', 'api'
    confidence: float
    description: str


@dataclass
class MatchResult:
    """Result of matching a report to existing incidents"""
    incident_id: Optional[str]
    match_score: float
    distance_meters: float
    time_diff_minutes: float
    is_new_incident: bool


class Deduplicator:
    """
    Deduplication engine using spatiotemporal clustering.
    
    Algorithm:
    1. For each new report, find candidates within distance/time thresholds
    2. Score each candidate by: distance, time, type match, source diversity
    3. If best score > threshold, merge into existing incident
    4. Otherwise, create new canonical incident
    """
    
    # Thresholds
    DISTANCE_THRESHOLD_METERS = 300  # Max distance to consider same incident
    TIME_THRESHOLD_HOURS = 3  # Max time difference
    MATCH_THRESHOLD = 0.5  # Minimum score to merge
    
    # Scoring weights
    WEIGHT_DISTANCE = 0.35
    WEIGHT_TIME = 0.35
    WEIGHT_TYPE = 0.20
    WEIGHT_SOURCE_DIVERSITY = 0.10
    
    # Type similarity matrix (simplified - would be more detailed)
    TYPE_GROUPS = {
        'shooting': 'violent',
        'stabbing': 'violent',
        'assault': 'violent',
        'robbery': 'violent',
        'burglary': 'property',
        'theft': 'property',
        'vehicle_breakin': 'property',
        'vandalism': 'property',
        'house_fire': 'fire',
        'structure_fire': 'fire',
        'vehicle_fire': 'fire',
        'car_accident': 'traffic',
        'traffic_accident': 'traffic',
        'hit_and_run': 'traffic',
    }
    
    def __init__(self, supabase_client=None):
        """
        Initialize with Supabase client for DB operations.
        Can also run in-memory for testing.
        """
        self.supabase = supabase_client
        self._memory_incidents: Dict[str, Dict] = {}  # For testing without DB
    
    @staticmethod
    def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculate distance between two points in meters.
        """
        R = 6371000  # Earth's radius in meters
        
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)
        
        a = math.sin(delta_phi/2)**2 + \
            math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda/2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        
        return R * c
    
    def type_similarity(self, type1: str, type2: str) -> float:
        """
        Calculate similarity between two incident types.
        Returns 1.0 for exact match, 0.5 for same group, 0 for different.
        """
        if type1 == type2:
            return 1.0
        
        group1 = self.TYPE_GROUPS.get(type1.lower(), type1)
        group2 = self.TYPE_GROUPS.get(type2.lower(), type2)
        
        if group1 == group2:
            return 0.5
        
        return 0.0
    
    def calculate_match_score(
        self,
        report: ReportForDedup,
        candidate: Dict[str, Any]
    ) -> Tuple[float, float, float]:
        """
        Calculate match score between a report and a candidate incident.
        
        Returns: (score, distance_meters, time_diff_minutes)
        """
        # Distance component
        distance = self.haversine_distance(
            report.latitude, report.longitude,
            candidate['latitude'], candidate['longitude']
        )
        
        if distance > self.DISTANCE_THRESHOLD_METERS:
            return (0.0, distance, float('inf'))
        
        distance_score = 1 - (distance / self.DISTANCE_THRESHOLD_METERS)
        
        # Time component
        candidate_time = candidate['occurred_at']
        if isinstance(candidate_time, str):
            candidate_time = datetime.fromisoformat(candidate_time.replace('Z', '+00:00'))
        
        time_diff = abs((report.occurred_at - candidate_time).total_seconds() / 60)
        max_minutes = self.TIME_THRESHOLD_HOURS * 60
        
        if time_diff > max_minutes:
            return (0.0, distance, time_diff)
        
        time_score = 1 - (time_diff / max_minutes)
        
        # Type similarity
        type_score = self.type_similarity(report.incident_type, candidate['incident_type'])
        
        # Source diversity bonus (different source types = more confident)
        source_diversity = 0.0
        existing_sources = candidate.get('source_types', [])
        if report.source_type not in existing_sources:
            source_diversity = 1.0
        
        # Combined score
        score = (
            self.WEIGHT_DISTANCE * distance_score +
            self.WEIGHT_TIME * time_score +
            self.WEIGHT_TYPE * type_score +
            self.WEIGHT_SOURCE_DIVERSITY * source_diversity
        )
        
        return (score, distance, time_diff)
    
    def find_candidates_sql(
        self,
        report: ReportForDedup
    ) -> List[Dict[str, Any]]:
        """
        Find candidate incidents from Supabase using PostGIS.
        """
        if not self.supabase:
            return self._find_candidates_memory(report)
        
        # Use the PostGIS function we defined in schema
        result = self.supabase.rpc(
            'find_potential_duplicates',
            {
                'report_location': f'SRID=4326;POINT({report.longitude} {report.latitude})',
                'report_time': report.occurred_at.isoformat(),
                'report_type': report.incident_type,
                'distance_meters': self.DISTANCE_THRESHOLD_METERS,
                'time_window_hours': self.TIME_THRESHOLD_HOURS
            }
        ).execute()
        
        return result.data or []
    
    def _find_candidates_memory(
        self,
        report: ReportForDedup
    ) -> List[Dict[str, Any]]:
        """
        In-memory candidate search for testing.
        """
        candidates = []
        
        for incident_id, incident in self._memory_incidents.items():
            distance = self.haversine_distance(
                report.latitude, report.longitude,
                incident['latitude'], incident['longitude']
            )
            
            if distance <= self.DISTANCE_THRESHOLD_METERS:
                incident_time = incident['occurred_at']
                if isinstance(incident_time, str):
                    incident_time = datetime.fromisoformat(incident_time)
                
                time_diff = abs((report.occurred_at - incident_time).total_seconds() / 3600)
                
                if time_diff <= self.TIME_THRESHOLD_HOURS:
                    candidates.append({**incident, 'id': incident_id})
        
        return candidates
    
    def process_report(self, report: ReportForDedup) -> MatchResult:
        """
        Process a single report through deduplication.
        
        Returns MatchResult indicating whether this matched an existing
        incident or created a new one.
        """
        # Find candidates
        candidates = self.find_candidates_sql(report)
        
        if not candidates:
            # No candidates - create new incident
            incident_id = self._create_incident(report)
            return MatchResult(
                incident_id=incident_id,
                match_score=0.0,
                distance_meters=0.0,
                time_diff_minutes=0.0,
                is_new_incident=True
            )
        
        # Score each candidate
        best_match = None
        best_score = 0.0
        best_distance = 0.0
        best_time_diff = 0.0
        
        for candidate in candidates:
            score, distance, time_diff = self.calculate_match_score(report, candidate)
            
            if score > best_score:
                best_score = score
                best_match = candidate
                best_distance = distance
                best_time_diff = time_diff
        
        # Check threshold
        if best_score >= self.MATCH_THRESHOLD and best_match:
            # Merge into existing incident
            self._merge_into_incident(best_match['id'], report)
            return MatchResult(
                incident_id=best_match['id'],
                match_score=best_score,
                distance_meters=best_distance,
                time_diff_minutes=best_time_diff,
                is_new_incident=False
            )
        else:
            # Score too low - create new incident
            incident_id = self._create_incident(report)
            return MatchResult(
                incident_id=incident_id,
                match_score=best_score,
                distance_meters=best_distance,
                time_diff_minutes=best_time_diff,
                is_new_incident=True
            )
    
    def _create_incident(self, report: ReportForDedup) -> str:
        """Create a new canonical incident from a report."""
        import uuid
        
        incident_id = str(uuid.uuid4())
        
        incident = {
            'id': incident_id,
            'incident_type': report.incident_type,
            'category': report.category,
            'latitude': report.latitude,
            'longitude': report.longitude,
            'occurred_at': report.occurred_at.isoformat(),
            'description': report.description,
            'report_count': 1,
            'confidence_score': report.confidence,
            'source_types': [report.source_type],
            'created_at': datetime.now().isoformat()
        }
        
        if self.supabase:
            # Insert with PostGIS point
            self.supabase.table('incidents').insert({
                **incident,
                'location': f'SRID=4326;POINT({report.longitude} {report.latitude})'
            }).execute()
        else:
            self._memory_incidents[incident_id] = incident
        
        return incident_id
    
    def _merge_into_incident(self, incident_id: str, report: ReportForDedup):
        """
        Link a report to an existing incident (not destructive merge).
        
        Key insight: We LINK, not MERGE. The report keeps its identity.
        The incident aggregates confidence from all linked reports.
        UI shows: "Active Scene: 2 Police Reports, 1 Radio Dispatch"
        """
        
        if self.supabase:
            # Link report to incident
            self.supabase.table('incident_reports').update({
                'incident_id': incident_id,
                'dedup_status': 'matched',
                'dedup_processed_at': datetime.now().isoformat()
            }).eq('id', report.id).execute()
            
            # Recalculate incident confidence from all linked reports
            # This uses the SQL function that aggregates confidence + source diversity
            self.supabase.rpc(
                'recalculate_incident_confidence',
                {'incident_uuid': incident_id}
            ).execute()
            
            # Update source_types array for badge display
            result = self.supabase.table('incidents').select('source_types').eq('id', incident_id).single().execute()
            current_types = result.data.get('source_types', []) or []
            
            if report.source_type not in current_types:
                current_types.append(report.source_type)
                self.supabase.table('incidents').update({
                    'source_types': current_types
                }).eq('id', incident_id).execute()
            
        else:
            # Memory update for testing
            incident = self._memory_incidents[incident_id]
            incident['report_count'] += 1
            
            # Confidence increases with corroboration (diminishing returns)
            base_confidence = incident['confidence_score']
            corroboration_bonus = (1 - base_confidence) * 0.15
            source_bonus = 0.1 if report.source_type not in incident['source_types'] else 0
            
            incident['confidence_score'] = min(0.99, base_confidence + corroboration_bonus + source_bonus)
            
            if report.source_type not in incident['source_types']:
                incident['source_types'].append(report.source_type)


# =============================================================================
# EXAMPLE / TEST
# =============================================================================

if __name__ == "__main__":
    # Test deduplication without database
    dedup = Deduplicator()
    
    # Scanner report at 2:31 AM
    scanner_report = ReportForDedup(
        id="report-1",
        incident_type="shooting",
        category="violent_crime",
        latitude=42.2411,
        longitude=-88.3162,
        occurred_at=datetime(2024, 1, 15, 2, 31),
        source_type="audio",
        confidence=0.7,
        description="Shots fired, 100 block North Main"
    )
    
    result1 = dedup.process_report(scanner_report)
    print(f"Scanner report: new_incident={result1.is_new_incident}, id={result1.incident_id}")
    
    # News report at 6:00 AM (same incident, ~200m away, 3.5 hours later)
    news_report = ReportForDedup(
        id="report-2",
        incident_type="shooting",
        category="violent_crime",
        latitude=42.2415,  # ~45m north
        longitude=-88.3158,  # ~30m east
        occurred_at=datetime(2024, 1, 15, 6, 0),
        source_type="news",
        confidence=0.9,
        description="Two arrested after shots fired in Crystal Lake"
    )
    
    result2 = dedup.process_report(news_report)
    print(f"News report: new_incident={result2.is_new_incident}, " +
          f"score={result2.match_score:.2f}, distance={result2.distance_meters:.0f}m")
    
    # Unrelated burglary same night (should be NEW incident)
    burglary_report = ReportForDedup(
        id="report-3",
        incident_type="burglary",
        category="property_crime",
        latitude=42.2611,  # ~2km away
        longitude=-88.2962,
        occurred_at=datetime(2024, 1, 15, 3, 0),
        source_type="news",
        confidence=0.85,
        description="Burglary reported at Cary residence"
    )
    
    result3 = dedup.process_report(burglary_report)
    print(f"Burglary report: new_incident={result3.is_new_incident}")
    
    # Print final state
    print(f"\nCanonical incidents: {len(dedup._memory_incidents)}")
    for inc_id, inc in dedup._memory_incidents.items():
        print(f"  - {inc['incident_type']}: {inc['report_count']} reports, " +
              f"confidence={inc['confidence_score']:.2f}, sources={inc['source_types']}")
