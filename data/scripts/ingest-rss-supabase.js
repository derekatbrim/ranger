// data/scripts/ingest-rss-supabase.js

/**
 * Ingest news from RSS feeds into Supabase
 * Run with: npm run ingest:rss
 * 
 * Requires environment variables:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const Parser = require('rss-parser');
const fs = require('fs');
const path = require('path');

// Load configuration
const SOURCES_PATH = path.join(__dirname, '..', 'sources.json');
const sourcesConfig = JSON.parse(fs.readFileSync(SOURCES_PATH, 'utf-8'));
const NEWS_CATEGORIES = sourcesConfig.news_categories;
const MUNICIPALITIES = sourcesConfig.municipalities;

// Initialize Supabase client
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    console.error('❌ Missing environment variables:');
    console.error('   NEXT_PUBLIC_SUPABASE_URL:', url ? '✓' : '✗');
    console.error('   SUPABASE_SERVICE_ROLE_KEY:', key ? '✓' : '✗');
    console.error('\nCreate a .env.local file with these values.');
    process.exit(1);
  }
  
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

/**
 * Classify a news item based on keywords
 */
function classifyNewsItem(title, description) {
  const text = `${title} ${description || ''}`.toLowerCase();
  
  for (const category of NEWS_CATEGORIES) {
    if (category.id === 'other') continue;
    for (const keyword of category.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        return category.id;
      }
    }
  }
  return 'other';
}

/**
 * Extract municipality from text
 */
function extractMunicipality(title, description) {
  const text = `${title} ${description || ''}`;
  
  for (const municipality of MUNICIPALITIES) {
    const regex = new RegExp(`\\b${municipality}\\b`, 'i');
    if (regex.test(text)) {
      return municipality;
    }
  }
  return null;
}

/**
 * Extract all location mentions
 */
function extractLocationsMentioned(title, description) {
  const text = `${title} ${description || ''}`;
  const found = [];
  
  for (const municipality of MUNICIPALITIES) {
    const regex = new RegExp(`\\b${municipality}\\b`, 'gi');
    if (regex.test(text) && !found.includes(municipality)) {
      found.push(municipality);
    }
  }
  
  return found;
}

/**
 * Fetch and parse a single RSS feed
 */
async function fetchFeed(source) {
  const parser = new Parser({
    timeout: 10000,
    headers: {
      'User-Agent': 'Ranger/1.0 (Local Intelligence Platform)'
    }
  });
  
  try {
    console.log(`   Fetching: ${source.name}...`);
    const feed = await parser.parseURL(source.url);
    console.log(`   ✓ Got ${feed.items?.length || 0} items`);
    return { source, feed, error: null };
  } catch (error) {
    console.log(`   ✗ Error: ${error.message}`);
    return { source, feed: null, error: error.message };
  }
}

/**
 * Process feed items and upsert into Supabase
 */
async function processFeedItems(supabase, source, feedItems) {
  let inserted = 0;
  let skipped = 0;
  
  const newsItems = [];
  
  for (const item of feedItems) {
    const externalId = item.guid || item.link || item.id;
    if (!externalId) {
      skipped++;
      continue;
    }
    
    // Get image URL
    let imageUrl = null;
    if (item.enclosure?.url) {
      imageUrl = item.enclosure.url;
    } else if (item['media:content']?.['$']?.url) {
      imageUrl = item['media:content']['$'].url;
    } else if (item['media:thumbnail']?.['$']?.url) {
      imageUrl = item['media:thumbnail']['$'].url;
    }
    
    const title = item.title || '';
    const description = item.contentSnippet || item.content || item.description || '';
    const category = classifyNewsItem(title, description);
    const municipality = extractMunicipality(title, description);
    const locationsMentioned = extractLocationsMentioned(title, description);
    
    let publishedAt = null;
    if (item.pubDate || item.isoDate) {
      const d = new Date(item.pubDate || item.isoDate);
      if (!isNaN(d.getTime())) {
        publishedAt = d.toISOString();
      }
    }
    
    newsItems.push({
      source_id: source.id,
      external_id: externalId,
      title: title,
      description: description.substring(0, 2000),
      url: item.link || '',
      image_url: imageUrl,
      author: item.creator || item.author || null,
      category: category,
      municipality: municipality,
      locations_mentioned: locationsMentioned,
      published_at: publishedAt,
      raw_data: item
    });
  }
  
  if (newsItems.length === 0) {
    return { inserted: 0, skipped: feedItems.length };
  }
  
  // Upsert in batches
  const { data, error } = await supabase
    .from('news_items')
    .upsert(newsItems, {
      onConflict: 'source_id,external_id',
      ignoreDuplicates: true
    })
    .select('id');
  
  if (error) {
    console.error(`   Error inserting: ${error.message}`);
    return { inserted: 0, skipped: newsItems.length };
  }
  
  inserted = data?.length || 0;
  skipped = newsItems.length - inserted;
  
  return { inserted, skipped };
}

/**
 * Ensure sources exist in database
 */
async function ensureSources(supabase) {
  const sources = sourcesConfig.sources.filter(s => s.enabled && s.type === 'rss');
  
  for (const source of sources) {
    const { data, error } = await supabase
      .from('sources')
      .upsert({
        name: source.name,
        type: source.type,
        url: source.url,
        category: source.category,
        is_active: true,
        config: {
          municipality: source.municipality,
          notes: source.notes
        }
      }, {
        onConflict: 'url'
      })
      .select()
      .single();
    
    if (error && !error.message.includes('duplicate')) {
      console.error(`Error upserting source ${source.name}:`, error.message);
    }
  }
}

/**
 * Main ingestion function
 */
async function ingestRssFeeds() {
  console.log('📰 Ranger RSS Feed Ingestion (Supabase)\n');
  console.log('=' .repeat(50));
  
  const supabase = getSupabase();
  
  // Ensure sources exist
  await ensureSources(supabase);
  
  // Get active RSS sources
  const { data: sources, error } = await supabase
    .from('sources')
    .select('*')
    .eq('type', 'rss')
    .eq('is_active', true);
  
  if (error) {
    console.error('Failed to fetch sources:', error.message);
    process.exit(1);
  }
  
  console.log(`\n📡 Found ${sources.length} active RSS sources\n`);
  
  let totalInserted = 0;
  let totalSkipped = 0;
  let successfulFeeds = 0;
  let failedFeeds = 0;
  
  for (const source of sources) {
    const { feed, error: fetchError } = await fetchFeed(source);
    
    if (fetchError || !feed) {
      failedFeeds++;
      continue;
    }
    
    successfulFeeds++;
    
    const { inserted, skipped } = await processFeedItems(supabase, source, feed.items || []);
    totalInserted += inserted;
    totalSkipped += skipped;
    
    // Update last_fetched_at
    await supabase
      .from('sources')
      .update({ last_fetched_at: new Date().toISOString() })
      .eq('id', source.id);
    
    console.log(`      → ${inserted} new, ${skipped} existing\n`);
  }
  
  // Summary
  console.log('=' .repeat(50));
  console.log('\n📊 Ingestion Summary:');
  console.log(`   Feeds processed: ${successfulFeeds}/${sources.length}`);
  console.log(`   Failed feeds: ${failedFeeds}`);
  console.log(`   New items: ${totalInserted}`);
  console.log(`   Skipped (existing): ${totalSkipped}`);
  
  // Get category breakdown
  const { data: stats } = await supabase
    .from('news_items')
    .select('category')
    .gte('created_at', new Date(Date.now() - 3600000).toISOString());
  
  if (stats && stats.length > 0) {
    const counts = stats.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n   New items by category:');
    for (const [cat, count] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
      console.log(`      ${cat}: ${count}`);
    }
  }
  
  console.log('\n✅ RSS ingestion complete!');
}

// Run
ingestRssFeeds().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
