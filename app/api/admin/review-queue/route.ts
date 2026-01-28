// app/api/admin/review-queue/route.ts
// HITL (Human-in-the-Loop) Review Queue API
// Returns incidents that need manual review (confidence < 0.6)

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/admin/review-queue
// Returns incidents needing review, with linked reports for context
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
  const offset = parseInt(searchParams.get('offset') || '0');
  
  // Get incidents in needs_review status
  const { data: incidents, error, count } = await supabase
    .from('incidents')
    .select(`
      *,
      incident_reports (
        id,
        source_id,
        raw_text,
        extracted_data,
        extraction_confidence,
        source_url,
        sources (
          name,
          source_type
        )
      )
    `, { count: 'exact' })
    .eq('review_status', 'needs_review')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({
    queue: incidents,
    total: count,
    pagination: { limit, offset }
  });
}

// POST /api/admin/review-queue
// Approve or reject an incident
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { incident_id, action, notes } = body;
  
  if (!incident_id || !['approve', 'reject'].includes(action)) {
    return NextResponse.json(
      { error: 'Missing incident_id or invalid action' },
      { status: 400 }
    );
  }
  
  const newStatus = action === 'approve' ? 'approved' : 'rejected';
  
  const { error } = await supabase
    .from('incidents')
    .update({
      review_status: newStatus,
      reviewed_at: new Date().toISOString(),
      // reviewed_by: user.id (would come from auth)
    })
    .eq('id', incident_id);
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  // If rejected, also update linked reports
  if (action === 'reject') {
    await supabase
      .from('incident_reports')
      .update({ dedup_status: 'rejected' })
      .eq('incident_id', incident_id);
  }
  
  return NextResponse.json({ 
    success: true, 
    incident_id,
    new_status: newStatus
  });
}
