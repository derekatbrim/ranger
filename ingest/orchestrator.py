# ingest/orchestrator.py
"""
Ranger Ingestion Orchestrator
Coordinates the full pipeline: Fetch → Extract → Geocode → Dedupe → Store

This is the "run every 15 minutes" job that keeps Ranger's data fresh.
"""

import os
import re
import json
import hashlib
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from dataclasses import dataclass
import httpx
from supabase import create_client

from extractor import UniversalExtractor, ExtractedIncident
from dedup import Deduplicator, ReportForDedup


@dataclass
class SourceConfig:
    """Configuration for a data source"""
    id: str
    name: str
    source_type: str  # 'html', 'rss', 'api', 'audio'
    url: str
    region: str
    category: str
    fetch_interval_minutes: int = 15
    css_selector: Optional[str] = None  # For targeting specific page section
    config: Dict[str, Any] = None


class Geocoder:
    """
    Three-Tier Geocoding Strategy:
    
    Tier 1 (Parcel): Exact address → Geocodio (2,500 free/day)
    Tier 2 (Block): "100 block of Main St" → Street centerline interpolation  
    Tier 3 (Anchor): Fallback → City/neighborhood centroid
    
    Better to be "somewhere in Crystal Lake" than "nowhere on Earth"
    """
    
    # Known locations in McHenry County for Tier 3 fallback
    CENTROIDS = {
        'crystal lake': (42.2411, -88.3162),
        'mchenry': (42.3336, -88.2668),
        'woodstock': (42.3147, -88.4487),
        'cary': (42.2120, -88.2378),
        'algonquin': (42.1656, -88.2945),
        'lake in the hills': (42.1828, -88.3310),
        'huntley': (42.1681, -88.4281),
        'harvard': (42.4222, -88.6145),
        'marengo': (42.2495, -88.6084),
        'mchenry county': (42.3239, -88.4506),  # County center fallback
    }
    
    def __init__(self, supabase_client=None, geocodio_api_key: str = None):
        self.supabase = supabase_client
        self.geocodio_key = geocodio_api_key or os.environ.get('GEOCODIO_API_KEY')
    
    async def geocode(
        self, 
        address: str, 
        city: Optional[str] = None,
        region: str = "mchenry_county"
    ) -> tuple:
        """
        Geocode an address using three-tier strategy.
        
        Returns: (latitude, longitude, resolution, confidence)
        - resolution: 'parcel', 'block', or 'centroid'
        - confidence: 0-1
        """
        # Detect if this is a block address
        is_block = bool(re.search(r'\d+\s*block', address or '', re.IGNORECASE))
        
        # Tier 1: Try exact address with Geocodio (if not a block address)
        if not is_block and address and self.geocodio_key:
            result = await self._geocodio_lookup(address, city)
            if result:
                return (*result, 'parcel', 0.95)
        
        # Tier 2: Try block interpolation from street centerlines
        if is_block and self.supabase:
            result = await self._block_interpolation(address, region)
            if result:
                return (*result, 'block', 0.7)
        
        # Tier 3: Fallback to centroid
        centroid = self._get_centroid(city, region)
        if centroid:
            return (*centroid, 'centroid', 0.3)
        
        return None
    
    async def _geocodio_lookup(self, address: str, city: Optional[str]) -> Optional[tuple]:
        """Tier 1: Exact address via Geocodio API (2,500 free/day)"""
        if not self.geocodio_key:
            return None
        
        try:
            full_address = f"{address}, {city}, IL" if city else f"{address}, IL"
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://api.geocod.io/v1.7/geocode",
                    params={
                        "q": full_address,
                        "api_key": self.geocodio_key
                    },
                    timeout=10
                )
                
                data = response.json()
                results = data.get("results", [])
                
                if results and results[0].get("accuracy", 0) >= 0.8:
                    loc = results[0]["location"]
                    return (loc["lat"], loc["lng"])
        except Exception as e:
            print(f"Geocodio error: {e}")
        
        return None
    
    async def _block_interpolation(self, address: str, region: str) -> Optional[tuple]:
        """Tier 2: Interpolate from street centerlines for block addresses"""
        if not self.supabase:
            return None
        
        try:
            result = self.supabase.rpc(
                'geocode_block_address',
                {'block_address': address, 'search_region': region}
            ).execute()
            
            if result.data and len(result.data) > 0:
                # Parse PostGIS point
                loc = result.data[0]['location']
                # Extract lat/lon from geography (implementation depends on format)
                return self._parse_postgis_point(loc)
        except Exception as e:
            print(f"Block interpolation error: {e}")
        
        return None
    
    def _get_centroid(self, city: Optional[str], region: str) -> Optional[tuple]:
        """Tier 3: Return city centroid as last resort"""
        if city:
            city_lower = city.lower().strip()
            if city_lower in self.CENTROIDS:
                return self.CENTROIDS[city_lower]
        
        # Region-level fallback
        region_lower = region.lower().replace('_', ' ')
        if region_lower in self.CENTROIDS:
            return self.CENTROIDS[region_lower]
        
        return None
    
    def _parse_postgis_point(self, geog) -> Optional[tuple]:
        """Parse PostGIS geography to (lat, lon)"""
        # Handle different return formats
        if isinstance(geog, dict):
            return (geog.get('lat'), geog.get('lon'))
        if isinstance(geog, str):
            # WKT format: POINT(-88.3162 42.2411)
            match = re.search(r'POINT\(([-\d.]+)\s+([-\d.]+)\)', geog)
            if match:
                return (float(match.group(2)), float(match.group(1)))  # lat, lon
        return None


class IngestionOrchestrator:
    """
    Main orchestrator for the ingestion pipeline.
    
    Usage:
        orchestrator = IngestionOrchestrator()
        await orchestrator.run_ingestion_cycle()
    """
    
    def __init__(self):
        # Initialize components
        self.supabase = create_client(
            os.environ['NEXT_PUBLIC_SUPABASE_URL'],
            os.environ['SUPABASE_SERVICE_ROLE_KEY']
        )
        self.extractor = UniversalExtractor()
        self.deduplicator = Deduplicator(self.supabase)
        self.geocoder = Geocoder()
        self.http_client = httpx.AsyncClient(timeout=30)
    
    async def close(self):
        """Cleanup resources"""
        await self.http_client.aclose()
    
    def get_active_sources(self) -> List[SourceConfig]:
        """Get all active sources from database"""
        result = self.supabase.table('sources').select('*').eq('is_active', True).execute()
        
        sources = []
        for row in result.data:
            sources.append(SourceConfig(
                id=row['id'],
                name=row['name'],
                source_type=row['source_type'],
                url=row['url'],
                region=row['region'],
                category=row['category'],
                config=row.get('config', {})
            ))
        
        return sources
    
    async def fetch_source(self, source: SourceConfig) -> Optional[str]:
        """Fetch content from a source"""
        try:
            response = await self.http_client.get(source.url, follow_redirects=True)
            response.raise_for_status()
            return response.text
        except Exception as e:
            print(f"Error fetching {source.name}: {e}")
            return None
    
    def content_hash(self, content: str) -> str:
        """Generate hash of content for change detection"""
        return hashlib.sha256(content.encode()).hexdigest()[:16]
    
    async def process_source(self, source: SourceConfig) -> int:
        """
        Process a single source through the full pipeline.
        
        Returns: Number of incidents created/updated
        """
        print(f"\n--- Processing: {source.name} ---")
        
        # 1. Fetch
        content = await self.fetch_source(source)
        if not content:
            return 0
        
        # 2. Check if content changed (skip if identical to last fetch)
        content_hash = self.content_hash(content)
        # In production, would check against stored hash
        
        # 3. Extract incidents using LLM
        incidents = self.extractor.extract(
            content,
            source_type=source.source_type,
            region=source.region
        )
        
        print(f"  Extracted {len(incidents)} incidents")
        
        if not incidents:
            return 0
        
        # 4. Process each incident
        processed = 0
        for incident in incidents:
            try:
                # 4a. Geocode if needed
                lat, lon = None, None
                if incident.address or incident.city:
                    coords = await self.geocoder.geocode(incident.address, incident.city)
                    if coords:
                        lat, lon = coords
                
                if not lat or not lon:
                    # Can't process without location
                    print(f"  Skipping (no geocode): {incident.incident_type}")
                    continue
                
                # 4b. Create report record
                report_id = self._create_report(source, incident, lat, lon)
                
                # 4c. Run deduplication
                report = ReportForDedup(
                    id=report_id,
                    incident_type=incident.incident_type,
                    category=incident.category.value,
                    latitude=lat,
                    longitude=lon,
                    occurred_at=incident.timestamp or datetime.now(),
                    source_type=source.source_type,
                    confidence=incident.confidence,
                    description=incident.description
                )
                
                result = self.deduplicator.process_report(report)
                
                action = "NEW" if result.is_new_incident else f"MERGED (score={result.match_score:.2f})"
                print(f"  {action}: {incident.incident_type} at {incident.city or 'unknown'}")
                
                processed += 1
                
            except Exception as e:
                print(f"  Error processing incident: {e}")
                continue
        
        # 5. Update source last_fetched_at
        self.supabase.table('sources').update({
            'last_fetched_at': datetime.now().isoformat()
        }).eq('id', source.id).execute()
        
        return processed
    
    def _create_report(
        self,
        source: SourceConfig,
        incident: ExtractedIncident,
        lat: float,
        lon: float
    ) -> str:
        """Create an incident_report record"""
        import uuid
        
        report_id = str(uuid.uuid4())
        
        # Generate external_id from content hash for dedup
        external_id = hashlib.sha256(
            f"{incident.incident_type}:{incident.address}:{incident.description[:50]}".encode()
        ).hexdigest()[:16]
        
        self.supabase.table('incident_reports').upsert({
            'id': report_id,
            'source_id': source.id,
            'external_id': external_id,
            'incident_type': incident.incident_type,
            'address': incident.address,
            'city': incident.city,
            'location': f'SRID=4326;POINT({lon} {lat})',
            'occurred_at': incident.timestamp.isoformat() if incident.timestamp else None,
            'raw_text': incident.raw_text,
            'extracted_data': incident.to_dict(),
            'extraction_model': 'claude-3-haiku',
            'extraction_confidence': incident.confidence,
            'dedup_status': 'pending'
        }, on_conflict='source_id,external_id').execute()
        
        return report_id
    
    async def run_ingestion_cycle(self) -> Dict[str, int]:
        """
        Run a full ingestion cycle across all active sources.
        
        Returns: Dict of source_name -> incidents_processed
        """
        print("=" * 60)
        print(f"INGESTION CYCLE: {datetime.now().isoformat()}")
        print("=" * 60)
        
        sources = self.get_active_sources()
        print(f"Active sources: {len(sources)}")
        
        results = {}
        total = 0
        
        for source in sources:
            count = await self.process_source(source)
            results[source.name] = count
            total += count
        
        print("\n" + "=" * 60)
        print(f"CYCLE COMPLETE: {total} incidents processed")
        print("=" * 60)
        
        return results


# =============================================================================
# CLI ENTRY POINT
# =============================================================================

async def main():
    """Run ingestion cycle"""
    from dotenv import load_dotenv
    load_dotenv('.env.local')
    
    orchestrator = IngestionOrchestrator()
    
    try:
        results = await orchestrator.run_ingestion_cycle()
        print("\nResults by source:")
        for source, count in results.items():
            print(f"  {source}: {count}")
    finally:
        await orchestrator.close()


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
