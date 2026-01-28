// app/api/news/route.ts

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
  const offset = parseInt(searchParams.get('offset') || '0');
  const category = searchParams.get('category');
  const municipality = searchParams.get('municipality');
  
  try {
    const supabase = createServerClient();
    
    let query = supabase
      .from('news_items')
      .select('id, title, description, url, image_url, author, category, municipality, published_at, created_at', { count: 'exact' })
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (category) {
      query = query.eq('category', category);
    }
    
    if (municipality) {
      query = query.eq('municipality', municipality);
    }
    
    const { data: news, count, error } = await query;
    
    if (error) throw error;
    
    return NextResponse.json({
      items: news,
      total: count,
      limit,
      offset
    });
  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}
