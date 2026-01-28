// data/scripts/weekly-rollup-supabase.js

/**
 * Generate weekly intelligence rollups in Supabase
 * Run with: npm run rollup:weekly
 */

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const { startOfWeek, endOfWeek, subWeeks, format } = require('date-fns');

// Initialize Supabase client
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    console.error('❌ Missing environment variables');
    process.exit(1);
  }
  
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

/**
 * Get incident statistics for a week
 */
async function getIncidentStats(supabase, weekStart, weekEnd, municipality = null) {
  let query = supabase
    .from('incidents')
    .select('category')
    .gte('occurred_at', weekStart)
    .lt('occurred_at', weekEnd);
  
  if (municipality) {
    query = query.eq('municipality', municipality);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching incidents:', error.message);
    return [];
  }
  
  // Aggregate by category
  const counts = data.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});
  
  return Object.entries(counts).map(([category, count]) => ({ category, count }));
}

/**
 * Get news statistics for a week
 */
async function getNewsStats(supabase, weekStart, weekEnd, municipality = null) {
  let query = supabase
    .from('news_items')
    .select('category')
    .gte('published_at', weekStart)
    .lt('published_at', weekEnd);
  
  if (municipality) {
    query = query.eq('municipality', municipality);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching news:', error.message);
    return [];
  }
  
  const counts = data.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});
  
  return Object.entries(counts).map(([category, count]) => ({ category, count }));
}

/**
 * Calculate percentage change
 */
function calcTrend(current, previous) {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Generate a text summary
 */
function generateSummary(stats) {
  const parts = [];
  
  if (stats.incidentCount > 0) {
    const trendWord = stats.incidentTrend > 0 ? 'up' : stats.incidentTrend < 0 ? 'down' : 'unchanged';
    const trendPct = Math.abs(stats.incidentTrend);
    parts.push(
      `${stats.incidentCount} incidents reported this week` +
      (stats.incidentTrend !== 0 ? ` (${trendWord} ${trendPct}% from last week)` : '') +
      '.'
    );
    
    const topCategories = Object.entries(stats.incidentsByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    if (topCategories.length > 0) {
      const catList = topCategories
        .map(([cat, count]) => `${cat.replace('_', ' ')} (${count})`)
        .join(', ');
      parts.push(`Top categories: ${catList}.`);
    }
  } else {
    parts.push('No incidents reported this week.');
  }
  
  if (stats.newsCount > 0) {
    parts.push(`${stats.newsCount} local news stories tracked.`);
    
    const businessCount = stats.newsByCategory?.business || 0;
    if (businessCount > 0) {
      parts.push(`${businessCount} business-related stories.`);
    }
  }
  
  return parts.join(' ');
}

/**
 * Generate rollup for a specific week
 */
async function generateRollup(supabase, weekStartDate, municipality = null) {
  const weekStart = weekStartDate.toISOString();
  const weekEnd = endOfWeek(weekStartDate, { weekStartsOn: 1 }).toISOString();
  const weekStartStr = format(weekStartDate, 'yyyy-MM-dd');
  
  // Get current week stats
  const incidentStats = await getIncidentStats(supabase, weekStart, weekEnd, municipality);
  const incidentCount = incidentStats.reduce((sum, s) => sum + s.count, 0);
  const incidentsByCategory = Object.fromEntries(
    incidentStats.map(s => [s.category, s.count])
  );
  
  const newsStats = await getNewsStats(supabase, weekStart, weekEnd, municipality);
  const newsCount = newsStats.reduce((sum, s) => sum + s.count, 0);
  const newsByCategory = Object.fromEntries(
    newsStats.map(s => [s.category, s.count])
  );
  
  // Get previous week for trend
  const prevWeekStart = subWeeks(weekStartDate, 1);
  const prevWeekEnd = weekStartDate.toISOString();
  const prevIncidentStats = await getIncidentStats(supabase, prevWeekStart.toISOString(), prevWeekEnd, municipality);
  const prevIncidentCount = prevIncidentStats.reduce((sum, s) => sum + s.count, 0);
  const incidentTrend = calcTrend(incidentCount, prevIncidentCount);
  
  // Generate summary
  const stats = {
    incidentCount,
    incidentsByCategory,
    incidentTrend,
    newsCount,
    newsByCategory
  };
  const summaryText = generateSummary(stats);
  
  // Upsert rollup
  const { error } = await supabase
    .from('weekly_rollups')
    .upsert({
      week_start: weekStartStr,
      municipality: municipality,
      incident_count: incidentCount,
      incidents_by_category: incidentsByCategory,
      incident_trend: incidentTrend,
      news_count: newsCount,
      news_by_category: newsByCategory,
      summary_text: summaryText
    }, {
      onConflict: 'week_start,municipality'
    });
  
  if (error) {
    console.error('Error upserting rollup:', error.message);
  }
  
  return stats;
}

/**
 * Main function
 */
async function generateWeeklyRollups() {
  console.log('📊 Ranger Weekly Rollup Generator (Supabase)\n');
  console.log('=' .repeat(50));
  
  const supabase = getSupabase();
  
  // Get current week's Monday
  const now = new Date();
  const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  
  console.log(`\n📅 Week of ${format(currentWeekStart, 'yyyy-MM-dd')}\n`);
  
  // Get unique municipalities from data
  const { data: municipalityData } = await supabase
    .from('incidents')
    .select('municipality')
    .not('municipality', 'is', null);
  
  const { data: newsMunicipalityData } = await supabase
    .from('news_items')
    .select('municipality')
    .not('municipality', 'is', null);
  
  const municipalities = [...new Set([
    ...(municipalityData || []).map(r => r.municipality),
    ...(newsMunicipalityData || []).map(r => r.municipality)
  ])];
  
  // Generate county-wide rollup
  console.log('🌍 McHenry County (overall):');
  const countyStats = await generateRollup(supabase, currentWeekStart, null);
  console.log(`   Incidents: ${countyStats.incidentCount} (${countyStats.incidentTrend >= 0 ? '+' : ''}${countyStats.incidentTrend}%)`);
  console.log(`   News items: ${countyStats.newsCount}\n`);
  
  // Generate per-municipality rollups
  if (municipalities.length > 0) {
    console.log('🏘️  By municipality:');
    for (const municipality of municipalities) {
      const stats = await generateRollup(supabase, currentWeekStart, municipality);
      if (stats.incidentCount > 0 || stats.newsCount > 0) {
        console.log(`   ${municipality}: ${stats.incidentCount} incidents, ${stats.newsCount} news`);
      }
    }
  }
  
  // Also generate last week's rollup
  const lastWeekStart = subWeeks(currentWeekStart, 1);
  console.log(`\n📅 Previous week (${format(lastWeekStart, 'yyyy-MM-dd')}):`);
  const lastWeekStats = await generateRollup(supabase, lastWeekStart, null);
  console.log(`   Incidents: ${lastWeekStats.incidentCount}`);
  console.log(`   News items: ${lastWeekStats.newsCount}`);
  
  console.log('\n✅ Weekly rollups generated!');
}

// Run
generateWeeklyRollups().catch(error => {
  console.error('❌ Error generating rollups:', error);
  process.exit(1);
});
