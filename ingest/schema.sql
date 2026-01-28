-- Ranger Universal Ingestion Schema v2
-- Supabase + PostGIS for geospatial incident intelligence
-- Run in Supabase SQL Editor
--
-- Key Design Decisions:
-- 1. Three-tier geocoding: parcel → block interpolation → centroid anchor
-- 2. Confidence-based workflow: auto-publish / unverified / HITL queue
-- 3. Linked (not merged) reports: preserves provenance, shows multi-source authority
-- 4. PostGIS native: ST_DWithin for "within X miles" in milliseconds

-- Enable PostGIS (usually already enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS postgis;

-- =============================================================================
-- SOURCES: Where data comes from
-- =============================================================================
CREATE TABLE IF NOT EXISTS sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('html', 'rss', 'api', 'audio', 'manual')),
  url TEXT,
  region TEXT NOT NULL, -- 'mchenry_county', 'lake_county', etc.
  category TEXT NOT NULL CHECK (category IN ('news', 'crime', 'fire', 'permits', 'business')),
  config JSONB DEFAULT '{}', -- Source-specific settings
  is_active BOOLEAN DEFAULT true,
  reliability_score FLOAT DEFAULT 0.8, -- How much we trust this source
  last_fetched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INCIDENTS: Canonical deduplicated incidents (parent)
-- =============================================================================
CREATE TABLE IF NOT EXISTS incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Core identification
  incident_type TEXT NOT NULL, -- 'fire', 'shooting', 'burglary', 'traffic_accident', etc.
  category TEXT NOT NULL CHECK (category IN (
    'violent_crime', 'property_crime', 'fire', 'medical', 
    'traffic', 'drugs', 'missing_person', 'suspicious', 'other'
  )),
  
  -- Severity/urgency (1-10 scale, LLM-assigned)
  urgency_score INTEGER CHECK (urgency_score BETWEEN 1 AND 10),
  
  -- Location - THE KEY FIELD
  location GEOGRAPHY(POINT, 4326), -- PostGIS geography type, WGS84
  address TEXT,
  city TEXT,
  region TEXT NOT NULL, -- 'mchenry_county'
  
  -- Location resolution tracking (for debugging geocode quality)
  location_resolution TEXT DEFAULT 'unknown' CHECK (location_resolution IN (
    'parcel',      -- Tier 1: Exact address match (Geocodio)
    'block',       -- Tier 2: Interpolated from street centerline
    'centroid',    -- Tier 3: Anchored to city/neighborhood center
    'unknown'      -- Not yet resolved
  )),
  location_confidence FLOAT DEFAULT 0.5, -- How confident in the geocode
  
  -- Timing
  occurred_at TIMESTAMPTZ,
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Content
  title TEXT,
  description TEXT,
  
  -- Aggregation stats (for multi-source authority display)
  report_count INTEGER DEFAULT 1, -- How many raw reports linked
  source_types TEXT[] DEFAULT '{}', -- Array of source types for badge display
  
  -- Confidence-based workflow
  -- Auto-calculated from linked reports' extraction confidence
  confidence_score FLOAT DEFAULT 0.5,
  
  -- Review status (drives the HITL workflow)
  review_status TEXT DEFAULT 'pending' CHECK (review_status IN (
    'auto_published',  -- confidence >= 0.9, goes straight to feed
    'unverified',      -- 0.6 <= confidence < 0.9, shown with "unverified" badge
    'needs_review',    -- confidence < 0.6, in HITL queue
    'approved',        -- Human approved from queue
    'rejected'         -- Human rejected (spam, false positive, etc.)
  )),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT, -- User ID of reviewer (future)
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'retracted')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spatial index - THIS IS THE MAGIC FOR "WITHIN X MILES" QUERIES
CREATE INDEX IF NOT EXISTS incidents_location_gist ON incidents USING GIST (location);

-- Time-based queries
CREATE INDEX IF NOT EXISTS incidents_occurred_at ON incidents (occurred_at DESC);
CREATE INDEX IF NOT EXISTS incidents_region_time ON incidents (region, occurred_at DESC);

-- Category filtering
CREATE INDEX IF NOT EXISTS incidents_category ON incidents (category);
CREATE INDEX IF NOT EXISTS incidents_type ON incidents (incident_type);

-- HITL review queue - fast lookup of items needing human review
CREATE INDEX IF NOT EXISTS incidents_needs_review 
  ON incidents (created_at DESC) 
  WHERE review_status = 'needs_review';

-- Unverified items for "show with badge" queries
CREATE INDEX IF NOT EXISTS incidents_unverified
  ON incidents (region, occurred_at DESC)
  WHERE review_status IN ('unverified', 'auto_published', 'approved');

-- =============================================================================
-- INCIDENT_REPORTS: Raw observations from sources (children, linked to parent)
-- =============================================================================
-- Key insight: Never merge/destroy data. Link reports to canonical incidents.
-- UI shows: "Active Scene: 2 Police Reports, 1 Radio Dispatch, 1 News Snippet"
CREATE TABLE IF NOT EXISTS incident_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Link to canonical incident (nullable until dedup runs)
  incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
  
  -- Source tracking
  source_id UUID REFERENCES sources(id),
  external_id TEXT, -- Original ID from source
  source_url TEXT, -- Link to original
  
  -- Raw extracted data
  incident_type TEXT,
  address TEXT,
  city TEXT,
  
  -- Location (may be less precise than canonical)
  location GEOGRAPHY(POINT, 4326),
  
  -- Timing
  occurred_at TIMESTAMPTZ,
  ingested_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Content
  raw_text TEXT, -- Original text/transcript
  extracted_data JSONB, -- Full LLM extraction output
  
  -- Processing metadata
  extraction_model TEXT, -- 'claude-3-haiku', 'gemini-flash', etc.
  extraction_confidence FLOAT,
  
  -- Deduplication
  dedup_status TEXT DEFAULT 'pending' CHECK (dedup_status IN ('pending', 'matched', 'new_incident', 'rejected')),
  dedup_processed_at TIMESTAMPTZ,
  
  UNIQUE(source_id, external_id)
);

-- For deduplication queries: find reports near a point within time window
CREATE INDEX IF NOT EXISTS reports_location_gist ON incident_reports USING GIST (location);
CREATE INDEX IF NOT EXISTS reports_occurred_at ON incident_reports (occurred_at DESC);
CREATE INDEX IF NOT EXISTS reports_dedup_status ON incident_reports (dedup_status) WHERE dedup_status = 'pending';

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Find all incidents within X meters of a point
CREATE OR REPLACE FUNCTION incidents_within_radius(
  lat FLOAT,
  lon FLOAT,
  radius_meters INTEGER DEFAULT 1609, -- 1 mile default
  since_hours INTEGER DEFAULT 168 -- 1 week default
)
RETURNS SETOF incidents AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM incidents
  WHERE ST_DWithin(
    location,
    ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography,
    radius_meters
  )
  AND occurred_at > NOW() - (since_hours || ' hours')::interval
  ORDER BY occurred_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Find potential duplicate reports for a new report
CREATE OR REPLACE FUNCTION find_potential_duplicates(
  report_location GEOGRAPHY,
  report_time TIMESTAMPTZ,
  report_type TEXT,
  distance_meters INTEGER DEFAULT 300,
  time_window_hours INTEGER DEFAULT 3
)
RETURNS TABLE (
  incident_id UUID,
  distance_meters FLOAT,
  time_diff_minutes FLOAT,
  match_score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id as incident_id,
    ST_Distance(i.location, report_location) as distance_meters,
    EXTRACT(EPOCH FROM (report_time - i.occurred_at)) / 60 as time_diff_minutes,
    -- Match score: closer in space and time = higher score
    (1 - ST_Distance(i.location, report_location) / distance_meters) * 0.5 +
    (1 - ABS(EXTRACT(EPOCH FROM (report_time - i.occurred_at))) / (time_window_hours * 3600)) * 0.3 +
    CASE WHEN i.incident_type = report_type THEN 0.2 ELSE 0 END as match_score
  FROM incidents i
  WHERE ST_DWithin(i.location, report_location, distance_meters)
    AND i.occurred_at BETWEEN report_time - (time_window_hours || ' hours')::interval 
                          AND report_time + (time_window_hours || ' hours')::interval
  ORDER BY match_score DESC;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- ROW LEVEL SECURITY (for Supabase)
-- =============================================================================
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;

-- Public read access (only approved/unverified incidents)
CREATE POLICY "Public read published incidents" ON incidents 
  FOR SELECT USING (review_status IN ('auto_published', 'unverified', 'approved'));

CREATE POLICY "Public read sources" ON sources FOR SELECT USING (true);

-- Reports are internal (service role only writes, public can read matched ones)
CREATE POLICY "Public read matched reports" ON incident_reports 
  FOR SELECT USING (dedup_status = 'matched');

-- =============================================================================
-- STREET CENTERLINES (for Tier 2 block-level geocoding)
-- =============================================================================
-- Download from county GIS portal, import with ogr2ogr or QGIS
-- Most counties provide this as free shapefile/GeoJSON
CREATE TABLE IF NOT EXISTS street_centerlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL,
  street_name TEXT NOT NULL,
  street_name_normalized TEXT NOT NULL, -- Lowercase, no suffix (for matching)
  from_address INTEGER,
  to_address INTEGER,
  city TEXT,
  geometry GEOGRAPHY(LINESTRING, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS centerlines_name ON street_centerlines (region, street_name_normalized);
CREATE INDEX IF NOT EXISTS centerlines_geom ON street_centerlines USING GIST (geometry);

-- =============================================================================
-- CONFIDENCE WORKFLOW FUNCTIONS
-- =============================================================================

-- Recalculate incident confidence from linked reports
-- Call this after linking a new report
CREATE OR REPLACE FUNCTION recalculate_incident_confidence(incident_uuid UUID)
RETURNS void AS $$
DECLARE
  avg_confidence FLOAT;
  num_reports INTEGER;
  num_source_types INTEGER;
  new_confidence FLOAT;
  new_status TEXT;
BEGIN
  -- Get aggregate stats from linked reports
  SELECT 
    AVG(extraction_confidence),
    COUNT(*),
    COUNT(DISTINCT s.source_type)
  INTO avg_confidence, num_reports, num_source_types
  FROM incident_reports r
  JOIN sources s ON r.source_id = s.id
  WHERE r.incident_id = incident_uuid;
  
  -- Confidence formula:
  -- Base: average extraction confidence
  -- Bonus: +0.1 for each additional report (diminishing returns)
  -- Bonus: +0.1 for each additional source type (corroboration)
  new_confidence := LEAST(0.99, 
    COALESCE(avg_confidence, 0.5) + 
    (LEAST(num_reports - 1, 3) * 0.05) +  -- Up to +0.15 for multiple reports
    (LEAST(num_source_types - 1, 2) * 0.1)  -- Up to +0.2 for source diversity
  );
  
  -- Determine review status based on confidence
  IF new_confidence >= 0.9 THEN
    new_status := 'auto_published';
  ELSIF new_confidence >= 0.6 THEN
    new_status := 'unverified';
  ELSE
    new_status := 'needs_review';
  END IF;
  
  -- Update incident
  UPDATE incidents SET
    confidence_score = new_confidence,
    report_count = num_reports,
    review_status = CASE 
      WHEN review_status IN ('approved', 'rejected') THEN review_status  -- Don't override human decisions
      ELSE new_status
    END,
    updated_at = NOW()
  WHERE id = incident_uuid;
END;
$$ LANGUAGE plpgsql;

-- Geocode "100 block of Main St" using street centerlines
CREATE OR REPLACE FUNCTION geocode_block_address(
  block_address TEXT,  -- e.g., "100 block of Main St"
  search_region TEXT
)
RETURNS TABLE (
  location GEOGRAPHY,
  confidence FLOAT,
  resolution TEXT
) AS $$
DECLARE
  block_num INTEGER;
  street_name TEXT;
  normalized_name TEXT;
BEGIN
  -- Extract block number and street name
  -- Pattern: "100 block of Main St" or "100 block Main Street"
  SELECT 
    (regexp_matches(block_address, '(\d+)\s*block', 'i'))[1]::INTEGER,
    regexp_replace(
      regexp_replace(block_address, '^\d+\s*block\s*(of\s*)?', '', 'i'),
      '\s+(st|street|ave|avenue|rd|road|dr|drive|ln|lane|ct|court|blvd|boulevard)\.?$',
      '',
      'i'
    )
  INTO block_num, street_name;
  
  normalized_name := lower(trim(street_name));
  
  -- Find matching street segment
  RETURN QUERY
  SELECT 
    -- Interpolate to midpoint of the block
    ST_LineInterpolatePoint(sc.geometry::geometry, 0.5)::geography as location,
    0.7 as confidence,  -- Block-level is medium confidence
    'block'::TEXT as resolution
  FROM street_centerlines sc
  WHERE sc.region = search_region
    AND sc.street_name_normalized LIKE '%' || normalized_name || '%'
    AND sc.from_address <= block_num
    AND sc.to_address >= block_num
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Get incident summary for UI display
-- Returns the multi-source badge data: "2 Police Reports, 1 News"
CREATE OR REPLACE FUNCTION get_incident_source_summary(incident_uuid UUID)
RETURNS TABLE (
  source_type TEXT,
  source_count BIGINT,
  source_names TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.source_type,
    COUNT(*) as source_count,
    array_agg(DISTINCT s.name) as source_names
  FROM incident_reports r
  JOIN sources s ON r.source_id = s.id
  WHERE r.incident_id = incident_uuid
  GROUP BY s.source_type
  ORDER BY source_count DESC;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- EXAMPLE QUERIES
-- =============================================================================

-- All incidents within 1 mile of Crystal Lake downtown in past week:
-- SELECT * FROM incidents_within_radius(42.2411, -88.3162, 1609, 168);

-- Find what might be duplicates of a new report:
-- SELECT * FROM find_potential_duplicates(
--   ST_SetSRID(ST_MakePoint(-88.3162, 42.2411), 4326)::geography,
--   NOW(),
--   'burglary',
--   300,
--   3
-- );

-- Heatmap data: incident counts by grid cell
-- SELECT 
--   ST_SnapToGrid(location::geometry, 0.01) as grid_cell,
--   COUNT(*) as incident_count,
--   array_agg(DISTINCT incident_type) as types
-- FROM incidents
-- WHERE occurred_at > NOW() - interval '30 days'
-- GROUP BY grid_cell;
