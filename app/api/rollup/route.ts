// app/api/rollup/route.ts

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const municipality = searchParams.get('municipality');
  const weeks = Math.min(parseInt(searchParams.get('weeks') || '4'), 12);
  
  try {
    const supabase = createServerClient();
    
    // Get rollups
    let query = supabase
      .from('weekly_rollups')
      .select('*')
      .order('week_start', { ascending: false })
      .limit(weeks);
    
    if (municipality) {
      query = query.eq('municipality', municipality);
    } else {
      query = query.is('municipality', null);
    }
    
    const { data: rollups, error } = await query;
    
    if (error) throw error;
    
    // Get current week's live stats
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const dayAgo = new Date();
    dayAgo.setDate(dayAgo.getDate() - 1);
    
    const [incidentsWeek, incidentsToday, newsWeek, newsToday] = await Promise.all([
      supabase.from('incidents').select('id', { count: 'exact', head: true }).gte('occurred_at', weekAgo.toISOString()),
      supabase.from('incidents').select('id', { count: 'exact', head: true }).gte('occurred_at', dayAgo.toISOString()),
      supabase.from('news_items').select('id', { count: 'exact', head: true }).gte('published_at', weekAgo.toISOString()),
      supabase.from('news_items').select('id', { count: 'exact', head: true }).gte('published_at', dayAgo.toISOString()),
    ]);
    
    const currentStats = {
      incidents_this_week: incidentsWeek.count || 0,
      incidents_today: incidentsToday.count || 0,
      news_this_week: newsWeek.count || 0,
      news_today: newsToday.count || 0
    };
    
    return NextResponse.json({
      current: currentStats,
      rollups: rollups || [],
      municipality: municipality || 'McHenry County'
    });
  } catch (error) {
    console.error('Rollup API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rollup data' },
      { status: 500 }
    );
  }
}
