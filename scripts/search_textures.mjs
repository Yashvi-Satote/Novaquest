#!/usr/bin/env node
/**
 * Search NASA Image & Video Library API for equirectangular global surface maps.
 * Prints candidate nasa_id + title + description snippet for review.
 * Usage: node scripts/search_textures.mjs
 */
const SEARCHES = {
  moon: 'lunar global mosaic cylindrical map',
  mercury: 'mercury global mosaic color map MESSENGER',
  venus: 'venus global map radar Magellan cylindrical',
  mars: 'mars global color mosaic viking cylindrical',
  jupiter: 'jupiter global cylindrical map cassini',
  saturn: 'saturn global cylindrical map cassini',
  uranus: 'uranus global map voyager cylindrical',
  neptune: 'neptune global map voyager cylindrical',
  pluto: 'pluto global map new horizons',
  charon: 'charon global map new horizons',
  io: 'io global map galileo cylindrical',
  europa: 'europa global map galileo cylindrical',
  ganymede: 'ganymede global map galileo cylindrical',
  callisto: 'callisto global map galileo cylindrical',
  titan: 'titan global map cassini cylindrical',
  triton: 'triton global map voyager cylindrical',
  phobos: 'phobos global map mosaic',
  deimos: 'deimos global map mosaic mars express'
};

async function search(query) {
  const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Novaquest-Texture-Curator/1.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${query}`);
  const json = await res.json();
  return (json.collection && json.collection.items) || [];
}

for (const [body, query] of Object.entries(SEARCHES)) {
  console.log(`\n===== ${body.toUpperCase()} :: ${query} =====`);
  try {
    const items = await search(query);
    let shown = 0;
    for (const item of items) {
      if (shown >= 5) break;
      const data = item.data && item.data[0];
      if (!data || !data.nasa_id) continue;
      const title = (data.title || '').replace(/\s+/g, ' ').trim();
      const desc = (data.description || '').replace(/\s+/g, ' ').trim().slice(0, 160);
      // Prefer results that mention map/mosaic/global in title
      console.log(`  ${data.nasa_id} | ${title} | ${desc}`);
      shown++;
    }
  } catch (err) {
    console.log(`  ERROR: ${err.message}`);
  }
}