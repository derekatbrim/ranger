// lib/supabase.ts

import { createClient } from '@supabase/supabase-js';

// For server-side usage (ingestion scripts, API routes)
// Uses service role key for full access
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// For client-side usage (React components)
// Uses anon key with RLS policies
let browserClient: ReturnType<typeof createClient> | null = null;

export function createBrowserClient() {
  if (browserClient) return browserClient;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  browserClient = createClient(supabaseUrl, supabaseAnonKey);
  return browserClient;
}

// Database types (generate with: npx supabase gen types typescript)
export type Database = {
  public: {
    Tables: {
      sources: {
        Row: {
          id: string;
          name: string;
          type: 'rss' | 'api' | 'scrape' | 'user';
          url: string;
          category: 'news' | 'crime' | 'permits' | null;
          last_fetched_at: string | null;
          is_active: boolean;
          config: Record<string, any>;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['sources']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['sources']['Insert']>;
      };
      incidents: {
        Row: {
          id: string;
          source_id: string | null;
          external_id: string | null;
          category: string;
          severity: 'critical' | 'high' | 'medium' | 'low' | null;
          title: string;
          description: string | null;
          location_text: string | null;
          latitude: number | null;
          longitude: number | null;
          municipality: string | null;
          occurred_at: string | null;
          reported_at: string | null;
          verification_status: 'verified' | 'unverified' | 'disputed';
          raw_data: Record<string, any> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['incidents']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['incidents']['Insert']>;
      };
      news_items: {
        Row: {
          id: string;
          source_id: string | null;
          external_id: string | null;
          title: string;
          description: string | null;
          content: string | null;
          url: string;
          image_url: string | null;
          author: string | null;
          category: string | null;
          tags: string[];
          municipality: string | null;
          locations_mentioned: string[];
          published_at: string | null;
          raw_data: Record<string, any> | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['news_items']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['news_items']['Insert']>;
      };
      businesses: {
        Row: {
          id: string;
          name: string;
          category: string | null;
          subcategory: string | null;
          description: string | null;
          address: string | null;
          municipality: string | null;
          latitude: number | null;
          longitude: number | null;
          phone: string | null;
          website: string | null;
          status: 'active' | 'closed' | 'coming_soon';
          opened_at: string | null;
          closed_at: string | null;
          is_promoted: boolean;
          promotion_tier: 'featured' | 'sponsored' | null;
          promotion_starts_at: string | null;
          promotion_ends_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['businesses']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['businesses']['Insert']>;
      };
      weekly_rollups: {
        Row: {
          id: string;
          week_start: string;
          municipality: string | null;
          incident_count: number;
          incidents_by_category: Record<string, number>;
          incident_trend: number | null;
          news_count: number;
          news_by_category: Record<string, number>;
          businesses_opened: number;
          businesses_closed: number;
          summary_text: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['weekly_rollups']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['weekly_rollups']['Insert']>;
      };
    };
  };
};
