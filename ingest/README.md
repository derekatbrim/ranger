# Ranger Universal Ingestion Engine

## The Core Insight

**LLMs are universal parsers.** Instead of writing brittle CSS selectors for every news site, 
we pass raw HTML to Claude Haiku and get structured JSON back. When Shaw Local redesigns 
their site, we don't rewrite scrapers—the LLM adapts.

This means: **Add a new county by adding a URL to sources.json. Zero code changes.**

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SOURCE ADAPTERS                               │
├──────────────┬──────────────┬──────────────┬───────────────────────┤
│  HTML Fetch  │  RSS/Atom    │  Broadcastify │  ArcGIS/APIs         │
│  (any site)  │  (if exists) │  (audio)      │  (structured)        │
└──────┬───────┴──────┬───────┴──────┬────────┴───────────┬──────────┘
       │              │              │                    │
       ▼              ▼              ▼                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     NORMALIZER LAYER                                 │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  LLM Extraction Engine (Claude Haiku)                        │   │
│  │  - HTML → Structured JSON                                    │   │
│  │  - Transcript → Incident flags                               │   │
│  │  - Consistent schema regardless of source                    │   │
│  └─────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     DEDUPLICATION LAYER                              │
│  - Spatiotemporal matching (300m radius / 3hr window)               │
│  - LINK (not merge): preserves provenance                           │
│  - Confidence aggregation from multiple sources                     │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     CONFIDENCE WORKFLOW                              │
│  ≥0.9  → Auto-publish to feed                                       │
│  0.6-0.9 → Show with "Unverified" badge                             │
│  <0.6  → HITL review queue                                          │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     SUPABASE + POSTGIS                               │
│  - incidents (canonical, deduplicated)                               │
│  - incident_reports (raw observations, linked to parent)            │
│  - street_centerlines (for block-level geocoding)                   │
│  - Geospatial indexing: "within 1 mile" in <10ms                   │
└─────────────────────────────────────────────────────────────────────┘
```

## Risk Mitigations (Built In)

### 1. Geocoding: Three-Tier Resolution
```
Tier 1 (Parcel):   "452 Main St" → Geocodio (2,500 free/day, 95% confidence)
Tier 2 (Block):    "100 block Main" → Street centerline interpolation (70% confidence)
Tier 3 (Anchor):   Unknown → City centroid (30% confidence, but on the map)
```
Better to be "somewhere in Crystal Lake" than "nowhere on Earth."

### 2. LLM Extraction: Confidence-Based Workflow
```python
if confidence >= 0.9:
    auto_publish()  # Goes straight to feed
elif confidence >= 0.6:
    show_with_badge("Unverified")  # User sees but knows it's preliminary
else:
    add_to_review_queue()  # You click Approve/Reject
```
No hallucinations reach users without a checkpoint.

### 3. Audio Costs: VAD + Trigger Model
```
Audio Segment → VAD (skip silence) → Transcribe 15s preview only
    ↓
Quick keyword scan ("shots fired"? "structure fire"?)
    ↓
If triggered → Full transcription + extraction
If not → Discard (90% of traffic)
```
Cost savings: ~90% vs continuous transcription.

### 4. Deduplication: Link, Don't Merge
```
Scanner report (2:31 AM) ──┐
                          ├──→ Canonical Incident
News article (6:00 AM) ───┘    "2 sources, 92% confidence"
```
UI shows: **"Active Scene: 1 Scanner, 1 News"** — multi-source authority.

## Components

### `extractor.py` - LLM-Powered Extraction
```python
extractor = UniversalExtractor()
incidents = extractor.extract(html, source_type="html", region="mchenry_county")
# Returns: incident_type, category, address, city, timestamp, urgency_score, confidence
```

### `dedup.py` - Spatiotemporal Linking
```python
dedup = Deduplicator(supabase)
result = dedup.process_report(report)
# result.is_new_incident or result.match_score with linked incident_id
```

### `schema.sql` - PostGIS + Workflow
```sql
-- All incidents within 1 mile:
SELECT * FROM incidents_within_radius(42.2411, -88.3162, 1609, 168);

-- HITL review queue:
SELECT * FROM incidents WHERE review_status = 'needs_review';

-- Recalculate confidence after linking:
SELECT recalculate_incident_confidence('incident-uuid');
```

### `orchestrator.py` - Pipeline Coordinator
```python
orchestrator = IngestionOrchestrator()
results = await orchestrator.run_ingestion_cycle()
```

## Adding a New County (Zero Code)

```json
// sources.json
{
  "name": "Kane County Chronicle",
  "source_type": "html",
  "url": "https://www.kcchronicle.com/local-news/",
  "region": "kane_county",
  "category": "news"
}
```

Done. The LLM handles the rest.

## Cost Estimate

| Component | Cost |
|-----------|------|
| Claude Haiku extraction | ~$0.50/day (6 sources × 4/hr) |
| Geocodio | Free (2,500/day) |
| Supabase | Free tier |
| **At scale (50 counties)** | **~$15/day** |

## Files

```
ingest/
├── __init__.py           # Package exports
├── README.md             # This file
├── requirements.txt      # Python dependencies
├── schema.sql            # PostGIS schema + workflow functions
├── sources.json          # Source configuration
├── extractor.py          # LLM extraction + audio pipeline
├── dedup.py              # Spatiotemporal linking
└── orchestrator.py       # Pipeline coordinator

app/api/admin/
└── review-queue/route.ts # HITL review API

components/
└── IncidentCard.tsx      # Multi-source authority badge UI
```
