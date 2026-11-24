#!/usr/bin/env node
/**
 * Resumable Unsplash image retrieval + unique selection for Simatu Discovery.
 * Run locally from the repository root; reads .env.local and never exposes the key.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const TAXONOMY = path.join(ROOT, 'src/systems/homepage/discover/discovery-taxonomy.ts');
const CACHE_FILE = path.join(ROOT, '.unsplash-discovery-cache.json');
const OUTPUT_FILE = path.join(ROOT, 'discovery-image-catalogue.generated.json');
const MAX_REQUESTS = Number(process.env.UNSPLASH_BATCH_LIMIT || 45);
const ACCESS_KEY = readEnv('UNSPLASH_ACCESS_KEY') || readEnv('VITE_UNSPLASH_ACCESS_KEY');

if (!ACCESS_KEY) {
  console.error('Missing UNSPLASH_ACCESS_KEY in .env.local (Access Key only; Secret Key is not used for public photo search).');
  process.exit(1);
}

const source = fs.readFileSync(TAXONOMY, 'utf8');
const cache = loadCache();
const entries = parseTaxonomy(source);
const pending = entries.filter((entry) => !cache.search[entry.queryKey]);
let requested = 0;

for (const entry of pending) {
  if (requested >= MAX_REQUESTS) break;
  const url = new URL('https://api.unsplash.com/search/photos');
  url.searchParams.set('query', entry.query);
  url.searchParams.set('per_page', '30');
  url.searchParams.set('orientation', 'landscape');
  url.searchParams.set('content_filter', 'high');
  const response = await fetch(url, { headers: { Authorization: 'Client-ID ' + ACCESS_KEY, 'Accept-Version': 'v1' } });
  if (!response.ok) {
    console.error('Unsplash search failed for', entry.query, response.status, await response.text());
    if (response.status === 429) break;
    continue;
  }
  const body = await response.json();
  cache.search[entry.queryKey] = (body.results || []).map((photo) => ({
    id: photo.id,
    url: photo.urls?.regular || photo.urls?.small,
    description: photo.alt_description || photo.description || '',
    photographer: photo.user?.name || '',
    photographerUrl: photo.user?.links?.html || '',
    photoUrl: photo.links?.html || '',
    tags: (photo.tags || []).map((tag) => tag.title).filter(Boolean),
    color: photo.color || '',
  })).filter((photo) => photo.id && photo.url);
  requested += 1;
  saveCache(cache);
  console.log('Fetched', entry.query, '(' + requested + '/' + MAX_REQUESTS + ')');
}

const selected = {};
const usedPhotoIds = new Set();
for (const entry of entries) {
  const candidates = cache.search[entry.queryKey] || [];
  const ranked = candidates
    .map((photo) => ({ photo, score: scorePhoto(photo, entry.query) }))
    .sort((a, b) => b.score - a.score);
  const choice = ranked.find(({ photo }) => !usedPhotoIds.has(photo.id));
  if (!choice) continue;
  usedPhotoIds.add(choice.photo.id);
  selected[entry.id] = { ...choice.photo, query: entry.query, category: entry.category, title: entry.title, relevanceScore: choice.score };
}

const catalogue = {
  generatedAt: new Date().toISOString(),
  totalEntries: entries.length,
  fetchedEntries: Object.keys(cache.search).length,
  selectedUniquePhotos: Object.keys(selected).length,
  remainingQueries: entries.filter((entry) => !cache.search[entry.queryKey]).map((entry) => entry.query),
  photos: selected,
};
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(catalogue, null, 2) + '\\n');
saveCache(cache);
console.log('\\nCatalogue:', OUTPUT_FILE);
console.log('Unique selected:', catalogue.selectedUniquePhotos + '/' + entries.length);
console.log('Queries still pending:', catalogue.remainingQueries.length);
console.log('Run again to continue the next batch. Review and curate before applying to the UI.');

function parseTaxonomy(text) {
  const result = [];
  const marketMap = new Map();
  const mainPattern = /\\{ id: '([^']+)', image: image\\('[^']+'\\), alt: '([^']+)', category: '([^']+)', title: '([^']+)' \\}/g;
  for (const match of text.matchAll(mainPattern)) {
    const [, id, alt, category, title] = match;
    const query = category + ' ' + title;
    const queryKey = 'market:' + id;
    result.push({ id, category, title, query, queryKey });
    marketMap.set(id, category);
  }
  const subPattern = /tile\\('([^']+)', '([^']+)', 'photo-[^']+', '([^']+)'/g;
  let activeMarket = '';
  const sectionPattern = /  ([a-z-]+): \\[/g;
  const sectionStarts = [...text.matchAll(sectionPattern)];
  for (let i = 0; i < sectionStarts.length; i++) {
    activeMarket = sectionStarts[i][1];
    const start = sectionStarts[i].index + sectionStarts[i][0].length;
    const end = i + 1 < sectionStarts.length ? sectionStarts[i + 1].index : text.length;
    const block = text.slice(start, end);
    const category = marketMap.get(activeMarket) || activeMarket;
    for (const match of block.matchAll(subPattern)) {
      const [, id, title, description] = match;
      const query = category + ' ' + title + ' ' + description;
      const queryKey = 'subcategory:' + activeMarket + ':' + id;
      result.push({ id: queryKey, category, title, query, queryKey });
    }
  }
  return result;
}

function scorePhoto(photo, query) {
  const words = tokenize(query);
  const text = tokenize([photo.description, ...(photo.tags || [])].join(' '));
  let score = 0;
  for (const word of words) if (text.has(word)) score += 3;
  if (photo.description) score += 1;
  return score;
}
function tokenize(value) {
  return new Set(String(value).toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 2));
}
function loadCache() {
  try { return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')); } catch { return { search: {} }; }
}
function saveCache(value) { fs.writeFileSync(CACHE_FILE, JSON.stringify(value, null, 2) + '\\n'); }
function readEnv(name) {
  if (process.env[name]) return process.env[name];
  const envPath = path.join(ROOT, '.env.local');
  if (!fs.existsSync(envPath)) return '';
  const line = fs.readFileSync(envPath, 'utf8').split(/\\r?\\n/).find((row) => row.trim().startsWith(name + '='));
  return line ? line.slice(line.indexOf('=') + 1).trim().replace(/^['"]|['"]$/g, '') : '';
}
