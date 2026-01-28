"""
Ranger Universal Extraction Engine
Uses LLMs to extract structured incident data from any text source.
No site-specific scrapers - the LLM IS the parser.
"""

import json
import hashlib
from datetime import datetime
from typing import Optional, List, Dict, Any
from dataclasses import dataclass, asdict
from enum import Enum
import anthropic
import re


class IncidentCategory(Enum):
    VIOLENT_CRIME = "violent_crime"
    PROPERTY_CRIME = "property_crime"
    FIRE = "fire"
    MEDICAL = "medical"
    TRAFFIC = "traffic"
    DRUGS = "drugs"
    MISSING_PERSON = "missing_person"
    SUSPICIOUS = "suspicious"
    OTHER = "other"


@dataclass
class ExtractedIncident:
    """Structured incident data extracted by LLM"""
    incident_type: str  # 'shooting', 'burglary', 'house_fire', etc.
    category: IncidentCategory
    address: Optional[str]
    city: Optional[str]
    timestamp: Optional[datetime]
    description: str
    urgency_score: int  # 1-10
    confidence: float  # 0-1, how confident the LLM is
    raw_text: str
    
    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        d['category'] = self.category.value
        d['timestamp'] = self.timestamp.isoformat() if self.timestamp else None
        return d


class UniversalExtractor:
    """
    LLM-powered extraction engine.
    Feed it any text (HTML, transcript, etc.) and get structured incidents.
    """
    
    EXTRACTION_PROMPT = """You are an incident extraction system for a local intelligence platform.
Extract ALL incidents from the provided text. For each incident, provide:

1. incident_type: Specific type (e.g., "shooting", "burglary", "house_fire", "car_accident", "drug_arrest")
2. category: One of: violent_crime, property_crime, fire, medical, traffic, drugs, missing_person, suspicious, other
3. address: Street address if mentioned (e.g., "1200 block of Main St")
4. city: City/municipality name if mentioned
5. timestamp: Date/time of incident if mentioned (ISO format)
6. description: 1-2 sentence summary
7. urgency_score: 1-10 scale:
   - 10: Active shooter, ongoing violence, imminent threat to life
   - 8-9: Shooting with injuries, major fire, armed robbery in progress
   - 6-7: Burglary, assault, structure fire
   - 4-5: Vehicle theft, drug arrest, minor accident
   - 1-3: Vandalism, suspicious activity, routine traffic
8. confidence: 0-1, how certain you are this is a real incident (not speculation, not from a different jurisdiction)

RULES:
- Extract EVERY distinct incident, even if multiple are in one article
- If no specific address, use landmarks or cross streets
- If no timestamp, leave null
- For HTML: ignore navigation, ads, boilerplate - focus on article content
- For scanner transcripts: extract only confirmed incidents, not "checking on" or "en route"
- Be conservative with urgency - most incidents are 3-6

Respond with a JSON array of incidents. If no incidents found, return empty array [].
"""

    def __init__(self, api_key: Optional[str] = None, model: str = "claude-3-haiku-20240307"):
        """
        Initialize extractor with Anthropic API.
        
        Args:
            api_key: Anthropic API key (or set ANTHROPIC_API_KEY env var)
            model: Model to use. Haiku is fast/cheap for extraction.
        """
        self.client = anthropic.Anthropic(api_key=api_key)
        self.model = model
    
    def clean_html(self, html: str) -> str:
        """
        Strip HTML to plain text, keeping structure hints.
        We don't need beautiful parsing - LLM handles messy text fine.
        """
        # Remove script/style content
        html = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL | re.IGNORECASE)
        html = re.sub(r'<style[^>]*>.*?</style>', '', html, flags=re.DOTALL | re.IGNORECASE)
        
        # Convert block elements to newlines
        html = re.sub(r'</(p|div|h[1-6]|li|tr)>', '\n', html, flags=re.IGNORECASE)
        html = re.sub(r'<br\s*/?>', '\n', html, flags=re.IGNORECASE)
        
        # Remove remaining tags
        html = re.sub(r'<[^>]+>', ' ', html)
        
        # Clean up whitespace
        html = re.sub(r'[ \t]+', ' ', html)
        html = re.sub(r'\n\s*\n', '\n\n', html)
        
        # Decode entities
        html = html.replace('&amp;', '&')
        html = html.replace('&lt;', '<')
        html = html.replace('&gt;', '>')
        html = html.replace('&quot;', '"')
        html = html.replace('&#39;', "'")
        html = html.replace('&nbsp;', ' ')
        
        return html.strip()
    
    def extract(
        self, 
        text: str, 
        source_type: str = "html",
        region: str = "mchenry_county",
        max_tokens: int = 2000
    ) -> List[ExtractedIncident]:
        """
        Extract incidents from any text source.
        
        Args:
            text: Raw HTML, transcript, or plain text
            source_type: 'html', 'transcript', 'text' - affects cleaning
            region: Geographic context for the LLM
            max_tokens: Max response tokens
            
        Returns:
            List of ExtractedIncident objects
        """
        # Clean based on source type
        if source_type == "html":
            cleaned = self.clean_html(text)
        else:
            cleaned = text
        
        # Truncate if too long (Haiku context is 200k but we want fast)
        if len(cleaned) > 15000:
            cleaned = cleaned[:15000] + "\n\n[TRUNCATED]"
        
        # Build prompt with context
        user_prompt = f"""Source type: {source_type}
Region: {region}

TEXT TO ANALYZE:
---
{cleaned}
---

Extract all incidents as JSON array:"""

        # Call LLM
        response = self.client.messages.create(
            model=self.model,
            max_tokens=max_tokens,
            messages=[
                {"role": "user", "content": self.EXTRACTION_PROMPT + "\n\n" + user_prompt}
            ]
        )
        
        # Parse response
        response_text = response.content[0].text
        
        # Extract JSON from response (handle markdown code blocks)
        json_match = re.search(r'\[[\s\S]*\]', response_text)
        if not json_match:
            return []
        
        try:
            incidents_data = json.loads(json_match.group())
        except json.JSONDecodeError:
            return []
        
        # Convert to ExtractedIncident objects
        incidents = []
        for item in incidents_data:
            try:
                # Parse timestamp if present
                timestamp = None
                if item.get('timestamp'):
                    try:
                        timestamp = datetime.fromisoformat(item['timestamp'].replace('Z', '+00:00'))
                    except:
                        pass
                
                # Map category
                category_str = item.get('category', 'other').lower()
                try:
                    category = IncidentCategory(category_str)
                except ValueError:
                    category = IncidentCategory.OTHER
                
                incident = ExtractedIncident(
                    incident_type=item.get('incident_type', 'unknown'),
                    category=category,
                    address=item.get('address'),
                    city=item.get('city'),
                    timestamp=timestamp,
                    description=item.get('description', ''),
                    urgency_score=min(10, max(1, int(item.get('urgency_score', 5)))),
                    confidence=min(1.0, max(0.0, float(item.get('confidence', 0.5)))),
                    raw_text=cleaned[:1000]  # Store truncated source
                )
                incidents.append(incident)
            except Exception as e:
                print(f"Error parsing incident: {e}")
                continue
        
        return incidents
    
    def extract_from_url(self, url: str, region: str = "mchenry_county") -> List[ExtractedIncident]:
        """
        Fetch URL and extract incidents.
        
        Args:
            url: URL to fetch
            region: Geographic context
            
        Returns:
            List of ExtractedIncident objects
        """
        import httpx
        
        response = httpx.get(url, follow_redirects=True, timeout=30)
        response.raise_for_status()
        
        return self.extract(response.text, source_type="html", region=region)


class TranscriptFilter:
    """
    Filters scanner transcripts to flag high-value incidents.
    Designed to process streaming Whisper output.
    """
    
    FILTER_PROMPT = """You are filtering police/fire scanner transcripts for a local alert system.

Your job is to identify HIGH-VALUE incidents that residents would want to know about:
- Shootings, stabbings, violent crimes in progress
- Structure fires
- Major accidents with injuries
- Armed suspects, pursuits
- Missing persons (especially children/elderly)

IGNORE routine traffic:
- Traffic stops
- Routine patrols
- Minor fender benders
- "Checking on" or "en route" without incident
- Administrative radio traffic

For each HIGH-VALUE incident you identify, extract:
1. incident_type
2. location (if mentioned)
3. urgency_score (1-10)
4. key_details

Respond with JSON array. Empty array [] if nothing high-value.
Be SELECTIVE - only flag things that would merit a push notification."""

    def __init__(self, api_key: Optional[str] = None):
        self.client = anthropic.Anthropic(api_key=api_key)
    
    def filter_transcript_chunk(
        self, 
        transcript: str,
        context: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Filter a chunk of transcript for high-value incidents.
        
        Args:
            transcript: Whisper-transcribed text (could be 30s-5min chunk)
            context: Optional previous context for continuity
            
        Returns:
            List of flagged incidents (empty if nothing notable)
        """
        prompt = self.FILTER_PROMPT
        if context:
            prompt += f"\n\nPrevious context: {context}"
        
        prompt += f"\n\nTRANSCRIPT:\n{transcript}\n\nFlagged incidents (JSON array):"
        
        response = self.client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=500,
            messages=[{"role": "user", "content": prompt}]
        )
        
        response_text = response.content[0].text
        
        try:
            json_match = re.search(r'\[[\s\S]*\]', response_text)
            if json_match:
                return json.loads(json_match.group())
        except:
            pass
        
        return []


class AudioPipeline:
    """
    Cost-Efficient Audio Ingestion Pipeline
    
    Key insight: Don't transcribe silence. Don't transcribe routine traffic.
    
    Strategy (The "Trigger" Model):
    1. VAD (Voice Activity Detection) segments audio into speech chunks
    2. Transcribe only first 10-15 seconds of each dispatch
    3. LLM filter checks for high-value keywords
    4. Only if triggered, transcribe full segment and extract incident
    
    Cost savings: ~90% reduction vs continuous transcription
    """
    
    # High-value triggers that warrant full transcription
    TRIGGER_KEYWORDS = [
        'shots fired', 'shooting', 'stabbing', 'active shooter',
        'structure fire', 'house fire', 'building fire',
        'major accident', 'fatality', 'entrapment',
        'pursuit', 'armed', 'weapon',
        'missing child', 'amber alert', 'missing person',
        'robbery in progress', 'burglary in progress',
    ]
    
    def __init__(self):
        self.filter = TranscriptFilter()
        self.extractor = UniversalExtractor()
        self.buffer = []  # Rolling context buffer
    
    def quick_trigger_check(self, transcript_preview: str) -> bool:
        """
        Fast keyword scan before calling LLM.
        If any trigger keyword found, return True immediately.
        """
        lower = transcript_preview.lower()
        return any(kw in lower for kw in self.TRIGGER_KEYWORDS)
    
    async def process_audio_segment(
        self, 
        audio_bytes: bytes,
        sample_duration_seconds: int = 15
    ) -> List[ExtractedIncident]:
        """
        Process an audio segment with cost-efficient trigger model.
        
        1. VAD to detect speech (skip silence)
        2. Transcribe first N seconds only
        3. Quick keyword check (free)
        4. If no keywords, LLM filter check (cheap)
        5. If triggered, full transcription + extraction (expensive, but rare)
        """
        incidents = []
        
        # Step 1: VAD - skip if no speech detected
        # In production: use webrtcvad or silero-vad
        has_speech = self._detect_speech(audio_bytes)
        if not has_speech:
            return incidents
        
        # Step 2: Transcribe preview (first N seconds only)
        preview_audio = self._truncate_audio(audio_bytes, sample_duration_seconds)
        preview_transcript = await self._transcribe(preview_audio)
        
        if not preview_transcript:
            return incidents
        
        # Step 3: Quick keyword check (instant, free)
        if self.quick_trigger_check(preview_transcript):
            # High-value keyword found - full transcription
            full_transcript = await self._transcribe(audio_bytes)
            incidents = await self._extract_incidents(full_transcript)
            return incidents
        
        # Step 4: LLM filter check (cheap, catches things keywords miss)
        context = " ".join(self.buffer[-3:]) if self.buffer else None
        flagged = self.filter.filter_transcript_chunk(preview_transcript, context)
        
        # Update rolling buffer
        self.buffer.append(preview_transcript)
        if len(self.buffer) > 10:
            self.buffer.pop(0)
        
        # Step 5: If LLM flagged, do full transcription
        if flagged:
            full_transcript = await self._transcribe(audio_bytes)
            incidents = await self._extract_incidents(full_transcript)
        
        return incidents
    
    def _detect_speech(self, audio_bytes: bytes) -> bool:
        """
        Voice Activity Detection - returns True if speech present.
        
        In production, use:
        - webrtcvad (Google's VAD, very fast)
        - silero-vad (more accurate, still fast)
        """
        # Placeholder - would use actual VAD library
        return len(audio_bytes) > 1000
    
    def _truncate_audio(self, audio_bytes: bytes, seconds: int) -> bytes:
        """Truncate audio to first N seconds."""
        # Placeholder - would use pydub or similar
        # Assuming 16kHz mono: 16000 * 2 bytes * seconds
        byte_limit = 16000 * 2 * seconds
        return audio_bytes[:byte_limit]
    
    async def _transcribe(self, audio_bytes: bytes) -> str:
        """
        Transcribe audio using Whisper.
        
        In production, use:
        - OpenAI Whisper API ($0.006/minute)
        - Local whisper.cpp (free but needs GPU)
        - Deepgram ($0.0043/minute)
        """
        # Placeholder - would use actual Whisper
        return "[Transcribed audio content]"
    
    async def _extract_incidents(self, transcript: str) -> List[ExtractedIncident]:
        """Extract structured incidents from transcript."""
        incidents = []
        
        # Use the LLM extractor
        extracted = self.extractor.extract(
            transcript, 
            source_type="transcript",
            region="mchenry_county"
        )
        
        # Scanner sources get lower confidence (less verified than news)
        for inc in extracted:
            inc.confidence = min(inc.confidence, 0.7)
        
        return extracted


# =============================================================================
# EXAMPLE USAGE
# =============================================================================

if __name__ == "__main__":
    # Test extraction from HTML
    sample_html = """
    <html>
    <head><title>Local News</title></head>
    <body>
    <nav>Home | News | Sports</nav>
    <article>
        <h1>Two arrested after shots fired in Crystal Lake</h1>
        <p>CRYSTAL LAKE – Two men were arrested early Sunday morning following 
        a shots fired call in the 100 block of North Main Street.</p>
        <p>Police responded around 2:30 a.m. to reports of gunfire. No injuries 
        were reported. Officers located two suspects fleeing on foot near 
        Dole Avenue and took them into custody.</p>
        <p>John Smith, 24, of McHenry, and James Johnson, 22, of Crystal Lake,
        were each charged with reckless discharge of a firearm.</p>
    </article>
    <article>
        <h2>Vehicle break-ins reported in Cary</h2>
        <p>CARY – Police are investigating a series of vehicle break-ins 
        that occurred overnight in the Fox Trails subdivision.</p>
        <p>At least six vehicles were targeted between 11 p.m. Saturday 
        and 5 a.m. Sunday. Residents are reminded to lock their vehicles.</p>
    </article>
    </body>
    </html>
    """
    
    extractor = UniversalExtractor()
    incidents = extractor.extract(sample_html, source_type="html", region="mchenry_county")
    
    print("Extracted incidents:")
    for inc in incidents:
        print(json.dumps(inc.to_dict(), indent=2))
