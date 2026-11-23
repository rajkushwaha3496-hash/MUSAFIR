import dns from 'dns';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dns.setDefaultResultOrder('ipv4first');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, '..', 'data', 'destinations-db.json');
const USER_AGENT =
  'MUSAFIR-IndiaTravelPlatform/1.0 (https://musafir.travel; contact@musafir.travel)';

const BAD_FILE_RE =
  /(?:map|locator|flag|coat_of_arms|emblem|seal|logo|icon|chart|diagram|graph|signature|blank|stub|collage|montage|plan|layout|route|census|population|symbol|crest|badge|stamp|poster|banner|cover_page|wiki|\.svg|\.pdf|\.djvu|\.webm|\.ogv|\.ogg|\.gif)/i;

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchJson(url) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function searchCommonsPhotos(query, limit = 6) {
  const url =
    `https://commons.wikimedia.org/w/api.php?action=query&generator=search` +
    `&gsrsearch=${encodeURIComponent(query)}` +
    `&gsrnamespace=6&gsrlimit=${limit}` +
    `&prop=imageinfo&iiprop=url|extmetadata|mime|size&iiurlwidth=960&format=json&origin=*`;

  const data = await fetchJson(url);
  const pages = Object.values(data?.query?.pages || {});
  const results = [];

  for (const page of pages) {
    const title = page.title || '';
    if (BAD_FILE_RE.test(title)) continue;

    const info = page.imageinfo?.[0];
    if (!info) continue;
    const mime = info.mime || '';
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(mime)) continue;
    if ((info.width && info.width < 450) || (info.height && info.height < 280)) continue;

    const imageUrl = info.thumburl || info.url;
    if (!imageUrl) continue;

    const rawArtist = stripHtml(info.extmetadata?.Artist?.value || '');
    const photographer = rawArtist
      ? rawArtist.slice(0, 80)
      : 'Wikimedia Commons Contributor';
    const license =
      stripHtml(info.extmetadata?.LicenseShortName?.value || '') ||
      'Wikimedia Commons License';
    const rawDesc = stripHtml(info.extmetadata?.ImageDescription?.value || '');
    const cleanTitle = title
      .replace(/^File:/i, '')
      .replace(/\.[a-z0-9]+$/i, '')
      .replace(/[_-]+/g, ' ')
      .trim();
    const caption =
      rawDesc && rawDesc.length > 12 ? rawDesc.slice(0, 180) : cleanTitle;
    const sourceUrl =
      info.descriptionurl ||
      `https://commons.wikimedia.org/wiki/${encodeURIComponent(title)}`;

    results.push({
      id: slugify(cleanTitle).slice(0, 48) || `photo-${results.length + 1}`,
      title: cleanTitle.slice(0, 90),
      caption,
      imageUrl,
      thumbUrl: imageUrl,
      photographer,
      sourceUrl,
      license,
    });
  }

  return results;
}

async function tryCleanQueries(dest) {
  const existing = new Map((dest.gallery || []).map((p) => [p.imageUrl, p]));
  const stripped = dest.name.replace(/\([^)]*\)/g, ' ').trim();
  const parts = stripped
    .split(/\s*&\s*|\s*\/\s*|\s*,\s*/)
    .map((p) => p.trim())
    .filter((p) => p.length > 2);

  const queries = [];
  for (const part of parts) {
    queries.push(part);
    queries.push(`${part} ${dest.state}`);
  }
  const parenMatch = dest.name.match(/\(([^)]+)\)/);
  if (parenMatch && parenMatch[1]) {
    queries.push(parenMatch[1].trim());
  }

  const seenQ = new Set();
  for (const q of queries) {
    if (existing.size >= 5) break;
    const key = q.toLowerCase();
    if (seenQ.has(key)) continue;
    seenQ.add(key);

    const hits = await searchCommonsPhotos(q, 5);
    for (const ph of hits) {
      if (!existing.has(ph.imageUrl) && existing.size < 6) {
        existing.set(ph.imageUrl, ph);
      }
    }
  }

  dest.gallery = Array.from(existing.values()).slice(0, 6);
  dest.coverPhoto = dest.gallery[0] || null;
}

function computeStats(destinations) {
  let totalPhotographs = 0;
  let completeGalleries = 0;
  let partialGalleries = 0;
  let missingPhotos = 0;
  let completeDescriptions = 0;
  let verifiedCount = 0;
  let needsReviewCount = 0;
  let unverifiedCount = 0;
  const statesSet = new Set();

  for (const d of destinations) {
    statesSet.add(d.state);
    const count = d.gallery?.length || 0;
    totalPhotographs += count;
    if (count >= 3) completeGalleries++;
    else if (count >= 1) partialGalleries++;
    else missingPhotos++;

    if (d.description && d.description.length > 60) completeDescriptions++;
    if (d.verificationStatus === 'Verified') verifiedCount++;
    else if (d.verificationStatus === 'Needs Review') needsReviewCount++;
    else unverifiedCount++;
  }

  return {
    totalDestinations: destinations.length,
    statesAndUTsCovered: statesSet.size,
    totalPhotographs,
    completeGalleries,
    partialGalleries,
    missingPhotos,
    completeDescriptions,
    verifiedCount,
    needsReviewCount,
    unverifiedCount,
  };
}

async function main() {
  const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  const dests = db.destinations || [];

  const needTopUp = dests.filter((d) => !d.gallery || d.gallery.length < 3);
  console.log(`Enriching ${needTopUp.length} partial/missing galleries...`);
  for (let i = 0; i < needTopUp.length; i += 10) {
    const slice = needTopUp.slice(i, i + 10);
    await Promise.all(slice.map((d) => tryCleanQueries(d)));
  }

  for (const dest of dests) {
    dest.coverPhoto = dest.gallery?.[0] || null;
    const count = dest.gallery?.length || 0;
    if (count === 0) {
      dest.verificationStatus = 'Unverified';
      dest.lastVerifiedDate = null;
    } else if (count < 3) {
      dest.verificationStatus = 'Needs Review';
      dest.lastVerifiedDate =
        dest.lastVerifiedDate || new Date().toISOString().slice(0, 10);
    } else if (dest.officialTourismUrl && dest.description?.length > 60) {
      dest.verificationStatus = 'Verified';
      dest.lastVerifiedDate =
        dest.lastVerifiedDate || new Date().toISOString().slice(0, 10);
    }
  }

  const stats = computeStats(dests);
  fs.writeFileSync(
    DB_PATH,
    JSON.stringify(
      { generatedAt: new Date().toISOString(), stats, destinations: dests },
      null,
      2
    ),
    'utf-8'
  );
  console.log('\n=== ENRICHED & VERIFIED DATABASE REPORT ===');
  console.log(JSON.stringify(stats, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
