// app/api/incidents/route.ts

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500);
  const offset = parseInt(searchParams.get('offset') || '0');
  const category = searchParams.get('category');
  const municipality = searchParams.get('municipality');
  const days = parseInt(searchParams.get('days') || '7');
  
  try {
    const supabase = createServerClient();
    
    // Calculate date threshold
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);
    
    let query = supabase
      .from('incidents')
      .select('id, category, severity, title, description, location_text, latitude, longitude, municipality, occurred_at, verification_status, created_at', { count: 'exact' })
      .gte('occurred_at', dateThreshold.toISOString())
      .order('occurred_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (category) {
      query = query.eq('category', category);
    }
    
    if (municipality) {
      query = query.eq('municipality', municipality);
    }
    
    const { data: incidents, count, error } = await query;
    
    if (error) throw error;
    
    // Get category counts
    const { data: categoryData } = await supabase
      .from('incidents')
      .select('category')
      .gte('occurred_at', dateThreshold.toISOString());
    
    const categoryCounts = categoryData?.reduce((acc: Record<string, number>, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {}) || {};
    
    return NextResponse.json({
      items: incidents,
      total: count,
      limit,
      offset,
      days,
      categoryCounts
    });
  } catch (error) {
    console.error('Incidents API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch incidents' },
      { status: 500 }
    );
  }
}
