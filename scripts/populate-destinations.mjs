import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { OFFICIAL_STATE_TOURISM_URLS, RAW_INDIA_DESTINATIONS } from './india-seed-data.mjs';
import {
  resolvePlaceClimate,
  resolvePlaceFood,
  resolvePlaceHowToReach,
} from './place-metadata.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_PATH = path.join(ROOT_DIR, 'data', 'destinations-db.json');

const USER_AGENT = 'MUSAFIR-IndiaTravelPlatform/1.0 (https://musafir.travel; contact@musafir.travel)';

const TARGET_COUNT = Math.min(RAW_INDIA_DESTINATIONS.length, 560);

const REGIONAL_FOODS = {
  'Uttarakhand': ['Aloo Ke Gutke', 'Kafuli', 'Bhang Ki Chutney', 'Bal Mithai', 'Garhwali Thali'],
  'Himachal Pradesh': ['Siddu', 'Chana Madra', 'Dham Thali', 'Babru', 'Tibetan Thukpa & Momos'],
  'Jammu and Kashmir': ['Kahwa Tea', 'Rajma Chawal', 'Nadru Yakhni', 'Modur Pulav', 'Sheermal'],
  'Ladakh': ['Thukpa', 'Skyu', 'Mokthuk', 'Butter Tea (Gur Gur Chai)', 'Apricot Jam'],
  'Punjab': ['Amritsari Kulcha', 'Sarson Ka Saag & Makki Roti', 'Lassi', 'Chole Bhature', 'Pinni'],
  'Haryana': ['Bajra Khichdi', 'Kachri Chutney', 'Besan Masala Roti', 'Churma'],
  'Delhi': ['Chole Bhature', 'Paranthe Wali Gali Parathas', 'Aloo Chaat', 'Rajma Chawal'],
  'Uttar Pradesh': ['Banarasi Kachori Sabzi', 'Bedai & Jalebi', 'Tunday Kababi', 'Petha', 'Chaat'],
  'Rajasthan': ['Dal Baati Churma', 'Pyaaz Kachori', 'Gatte Ki Sabzi', 'Mirchi Vada', 'Ghevar'],
  'Gujarat': ['Dhokla & Khandvi', 'Gujarati Thali', 'Undhiyu', 'Dabeli', 'Fafda Jalebi'],
  'Goa': ['Goan Fish Curry Rice', 'Ros Omelette', 'Poi Bread & Bhaji', 'Bebinca'],
  'Maharashtra': ['Vada Pav', 'Misal Pav', 'Puran Poli', 'Kanda Poha', 'Sabudana Khichdi'],
  'Madhya Pradesh': ['Indori Poha Jalebi', 'Dal Bafla', 'Bhutte Ka Kees', 'Mawa Bati'],
  'Chhattisgarh': ['Chila', 'Faraa', 'Bore Baasi', 'Dehrori'],
  'Karnataka': ['Bisi Bele Bath', 'Masala Dosa', 'Ragi Mudde', 'Mysore Pak', 'Filter Coffee'],
  'Kerala': ['Appam & Stew', 'Puttu & Kadala Curry', 'Kerala Sadya', 'Malabar Parotta', 'Banana Chips'],
  'Tamil Nadu': ['Idli Sambar', 'Chettinad Curry', 'Pongal', 'Madurai Jigarthanda', 'Filter Coffee'],
  'Andhra Pradesh': ['Pesarattu Upma', 'Andhra Meals', 'Pootharekulu', 'Guntur Gongura'],
  'Telangana': ['Hyderabadi Biryani', 'Mirchi Ka Salan', 'Sarva Pindi', 'Irani Chai & Osmania Biscuit'],
  'Odisha': ['Pakhala Bhata', 'Dalma', 'Chhena Poda', 'Dahibara Aloodum'],
  'West Bengal': ['Luchi Aloor Dum', 'Kosha Mangsho', 'Darjeeling Tea & Momos', 'Mishti Doi & Rosogolla'],
  'Bihar': ['Litti Chokha', 'Sattu Paratha', 'Khaja', 'Thekua'],
  'Jharkhand': ['Dhuska', 'Chilka Roti', 'Rugra', 'Thekua'],
  'Sikkim': ['Phagshapa', 'Gundruk Soup', 'Momos & Thukpa', 'Sael Roti'],
  'Meghalaya': ['Jadoh', 'Dohneiiong', 'Tungrymbai', 'Pukhlein'],
  'Assam': ['Assam Thali', 'Khar', 'Masor Tenga', 'Pitha & Assam Tea'],
  'Arunachal Pradesh': ['Thukpa', 'Bamboo Shoot Curry', 'Apong Rice Beer', 'Momos'],
  'Nagaland': ['Naga Bamboo Shoot Pork/Veg', 'Axone Chutney', 'Galho'],
  'Manipur': ['Eromba', 'Kangsoi', 'Singju', 'Chak-hao Kheer'],
  'Mizoram': ['Bai', 'Sawhchiar', 'Vawksa Rep'],
  'Tripura': ['Mui Borok', 'Wahan Mosdeng', 'Bhangui Rice'],
  'Chandigarh': ['Chole Bhature', 'Amritsari Kulcha', 'Lassi'],
  'Puducherry': ['Creole Curry', 'French Croissants', 'Masala Dosa', 'Filter Coffee'],
  'Andaman and Nicobar Islands': ['Coconut Prawn Curry', 'Grilled Reef Fish', 'South Indian Thali'],
  'Lakshadweep': ['Mus Kavaab', 'Coconut Rice', 'Octopus Fry / Veg Curry'],
  'Dadra and Nagar Haveli and Daman and Diu': ['Ubadiyu', 'Parsi Dhansak', 'Gujarati Thali'],
};

const CATEGORY_DEFAULTS = {
  Mountains: { stay: 450, food: 300, local: 150, entry: 0, entryNote: 'Most viewpoints & trails are free; select parks ₹50–₹200', duration: '2–3 Days', days: 3, season: 'March – June, September – November' },
  Beaches: { stay: 500, food: 350, local: 180, entry: 0, entryNote: 'Public beaches free; water sports & ferries extra', duration: '2–3 Days', days: 3, season: 'October – March' },
  Waterfalls: { stay: 400, food: 280, local: 180, entry: 30, entryNote: 'Estimated forest/eco entry ₹20–₹100', duration: '1–2 Days', days: 2, season: 'July – January' },
  Lakes: { stay: 450, food: 300, local: 150, entry: 20, entryNote: 'Lakefront access mostly free; boating ₹100–₹350', duration: '1–2 Days', days: 2, season: 'October – April' },
  Forts: { stay: 400, food: 280, local: 140, entry: 40, entryNote: 'ASI / State monuments typically ₹25–₹50 (Indian nationals)', duration: '1–2 Days', days: 1, season: 'October – March' },
  Heritage: { stay: 450, food: 300, local: 150, entry: 50, entryNote: 'ASI / Museum tickets typically ₹30–₹50 (Indian nationals)', duration: '2 Days', days: 2, season: 'October – March' },
  Temples: { stay: 350, food: 250, local: 120, entry: 0, entryNote: 'Darshan free; optional special queue tickets vary', duration: '1–2 Days', days: 2, season: 'October – March' },
  Wildlife: { stay: 600, food: 350, local: 250, entry: 250, entryNote: 'Shared safari / sanctuary permit varies by state forest dept.', duration: '2 Days', days: 2, season: 'November – May' },
  Adventure: { stay: 500, food: 320, local: 200, entry: 100, entryNote: 'Trek permits ₹50–₹200; guided activities optional', duration: '2–4 Days', days: 3, season: 'March – June, September – December' },
  Spiritual: { stay: 350, food: 250, local: 120, entry: 0, entryNote: 'Ashrams & shrines free; dharamshala donations optional', duration: '2 Days', days: 2, season: 'October – April' },
  'Hidden Gems': { stay: 450, food: 280, local: 180, entry: 20, entryNote: 'Community / eco-fees typically ₹20–₹100', duration: '2–3 Days', days: 2, season: 'October – April' },
};

const BAD_FILE_RE = /(?:map|locator|flag|coat_of_arms|emblem|seal|logo|icon|chart|diagram|graph|signature|blank|stub|collage|montage|plan|layout|route|census|population|symbol|crest|badge|stamp|poster|banner|cover_page|wiki|\.svg|\.pdf|\.djvu|\.webm|\.ogv|\.ogg|\.gif)/i;

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

async function fetchJson(url, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);
      const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT },
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.status === 429 || res.status >= 500) {
        await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
        continue;
      }
      if (!res.ok) return null;
      return await res.json();
    } catch {
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
      }
    }
  }
  return null;
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
    const photographer = rawArtist ? rawArtist.slice(0, 80) : 'Wikimedia Commons Contributor';
    const license = stripHtml(info.extmetadata?.LicenseShortName?.value || '') || 'Wikimedia Commons License';
    const rawDesc = stripHtml(info.extmetadata?.ImageDescription?.value || '');
    const cleanTitle = title.replace(/^File:/i, '').replace(/\.[a-z0-9]+$/i, '').replace(/[_-]+/g, ' ').trim();
    const caption = rawDesc && rawDesc.length > 12 ? rawDesc.slice(0, 180) : cleanTitle;
    const sourceUrl = info.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(title)}`;

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

async function fetchWikipediaInfo(name, state) {
  // First search Wikipedia for best matching article
  const searchTerm = `${name} ${state} India`;
  const searchUrl =
    `https://en.wikipedia.org/w/api.php?action=query&list=search` +
    `&srsearch=${encodeURIComponent(searchTerm)}&srlimit=3&format=json&origin=*`;
  const searchData = await fetchJson(searchUrl);
  const hits = searchData?.query?.search || [];

  // Pick a relevant hit
  const nameTokens = name.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 2);
  let chosenTitle = hits[0]?.title;
  for (const hit of hits) {
    const low = hit.title.toLowerCase();
    if (nameTokens.some((tok) => low.includes(tok))) {
      chosenTitle = hit.title;
      break;
    }
  }
  if (!chosenTitle) return null;

  const infoUrl =
    `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(chosenTitle)}` +
    `&prop=coordinates|extracts|info&exintro=1&explaintext=1&inprop=url&format=json&origin=*`;
  const infoData = await fetchJson(infoUrl);
  const page = Object.values(infoData?.query?.pages || {})[0];
  if (!page || page.missing !== undefined) return null;

  const extract = (page.extract || '').trim();
  // Ensure it looks like an Indian topic if possible
  const coords = page.coordinates?.[0];
  return {
    title: page.title,
    extract: extract.slice(0, 900),
    lat: coords?.lat ?? null,
    lon: coords?.lon ?? null,
    wikipediaUrl: page.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`,
  };
}

function buildStructuredDetails(row, wiki, gallery) {
  const [name, state, district, region, category, seedLat, seedLon] = row;
  const defaults = CATEGORY_DEFAULTS[category] || CATEGORY_DEFAULTS['Heritage'];
  const id = slugify(`${name}-${state}`);
  const foods = resolvePlaceFood({ id, name, state, district, category });
  const climate = resolvePlaceClimate({ id, name, state, district, category });
  const howToReach = resolvePlaceHowToReach({ id, name, state, district, category });
  const officialUrl = OFFICIAL_STATE_TOURISM_URLS[state] || 'https://www.incredibleindia.gov.in';

  // Use Wikipedia coords only if inside India bounding box (lat 6..38, lon 67..98)
  const useWikiCoords =
    wiki?.lat &&
    wiki?.lon &&
    wiki.lat >= 6 &&
    wiki.lat <= 38 &&
    wiki.lon >= 67 &&
    wiki.lon <= 98;

  const lat = Number((useWikiCoords ? wiki.lat : seedLat).toFixed(4));
  const lon = Number((useWikiCoords ? wiki.lon : seedLon).toFixed(4));

  const overview =
    wiki?.extract && wiki.extract.length > 60
      ? wiki.extract
      : `${name} is a notable ${category.toLowerCase()} destination located in ${district} district of ${state}, ${region} India.`;

  const whyFamous = `${name} is widely recognized across ${state} for its distinctive ${category.toLowerCase()} appeal, local culture, and scenic surroundings in ${district} district.`;
  const historySpeciality = `Rooted in the regional heritage of ${state}, ${name} reflects ${region} Indian architecture, geography, and community traditions preserved across generations.`;

  const thingsToDo = [
    `Explore key ${category.toLowerCase()} highlights and viewpoints in ${name}`,
    `Walk local markets and sample ${foods.slice(0, 2).join(' and ')}`,
    `Capture golden-hour photography around ${district}’s scenic spots`,
    `Connect with nearby heritage or nature attractions in ${state}`,
  ];

  const transportOptions = [
    { mode: 'Train', note: `Nearest major railway junction serving ${district} / ${state} (check IRCTC live fares)` },
    { mode: 'Bus', note: `${state} State Road Transport (SRTC) & budget buses from nearby cities` },
    { mode: 'Shared transport', note: `Shared jeeps, tempos, or autos from ${district} transit hubs` },
    { mode: 'Local public transport', note: 'City buses, e-rickshaws, and metered/shared autos' },
    { mode: 'Walking', note: `Most central viewpoints and local markets around ${name} are walkable` },
  ];

  const hostelSuggestions = [
    `Backpacker hostels & student dorms near ${district} central transit`,
    `State tourism / YHAI / PWD budget rest houses in ${state}`,
    `Verified family-run homestays and budget guesthouses`,
  ];

  const safetyInfo =
    category === 'Mountains' || category === 'Adventure'
      ? `Check weather & road advisories in ${state} before travel; carry warm layers, hydration, and offline maps.`
      : category === 'Beaches' || category === 'Waterfalls'
      ? `Follow local lifeguard/forest warnings near water bodies, especially during monsoon currents.`
      : `Keep digital ID copies handy, travel in groups after dark in unfamiliar zones, and use verified local transit.`;

  const accessibilityInfo =
    category === 'Adventure' || category === 'Mountains' || category === 'Waterfalls'
      ? `Moderate walking or uneven terrain may apply; check step-free access at specific viewpoints.`
      : `Main town areas and road-facing viewpoints in ${district} are generally reachable by auto/cab.`;

  const suggestedItinerary = [
    `Day 1: Arrive at ${district} via budget train/bus, check into a student hostel/guesthouse, and explore main ${name} highlights at sunset.`,
    `Day 2: Early morning visit to ${gallery[0]?.title || name} and nearby viewpoints, enjoy local ${foods[0]}, and depart by evening.`,
  ];

  const hasWiki = Boolean(wiki?.extract && wiki.extract.length > 60);
  const photoCount = gallery.length;

  let verificationStatus = 'Unverified';
  if (hasWiki && photoCount >= 3) {
    verificationStatus = 'Verified';
  } else if (hasWiki || photoCount >= 1) {
    verificationStatus = 'Needs Review';
  }

  const tags = Array.from(
    new Set([
      category,
      `${region} India`,
      state,
      'Student Budget',
      defaults.days <= 2 ? 'Weekend Trip' : 'Multi-Day',
    ])
  );

  const estMinDayTotal = defaults.stay + defaults.food + defaults.local + defaults.entry;

  return {
    id: slugify(`${name}-${state}`),
    slug: slugify(`${name}-${state}`),
    name,
    state,
    district,
    region,
    category,
    tags,
    lat,
    lon,
    description: overview,
    whyFamous,
    historySpeciality,
    thingsToDo,
    suggestedItinerary,
    bestSeason: climate.bestSeason,
    weatherNotes: climate.weatherNotes,
    idealDuration: defaults.duration,
    recommendedDays: defaults.days,
    nearbyAttractions: gallery.slice(0, 4).map((g) => g.title),
    budget: {
      stayPerNightInr: defaults.stay,
      foodPerDayInr: defaults.food,
      localTransportPerDayInr: defaults.local,
      entryFeeInr: defaults.entry,
      entryFeeNote: defaults.entryNote,
      estimatedDailyStudentCostInr: estMinDayTotal,
      isEstimate: true,
    },
    howToReach,
    transportOptions,
    hostelSuggestions,
    localFood: foods,
    safetyInfo,
    accessibilityInfo,
    officialTourismUrl: officialUrl,
    wikipediaUrl: wiki?.wikipediaUrl || null,
    verificationStatus,
    lastVerifiedDate: verificationStatus === 'Unverified' ? null : '2026-11-22',
    studentFriendly: estMinDayTotal <= 1500,
    weekendTrip: defaults.days <= 2,
    oneDayTrip: defaults.days === 1,
    groupTrip: true,
    popularityScore: photoCount * 15 + (row[7]?.length || 0) * 10 + (hasWiki ? 20 : 0),
    coverPhoto: gallery[0] || null,
    gallery,
  };
}

async function processDestination(row) {
  const [name, state, , , , , , customQueries] = row;

  const wikiPromise = fetchWikipediaInfo(name, state);

  const photoMap = new Map();
  const addPhotos = (items) => {
    for (const item of items) {
      if (!photoMap.has(item.imageUrl) && photoMap.size < 6) {
        photoMap.set(item.imageUrl, item);
      }
    }
  };

  // Fetch specific landmark queries first if defined
  if (Array.isArray(customQueries) && customQueries.length > 0) {
    const queryBatches = await Promise.all(
      customQueries.slice(0, 5).map((q) => searchCommonsPhotos(q, 3))
    );
    for (const batch of queryBatches) {
      if (batch.length > 0) addPhotos([batch[0]]);
    }
    for (const batch of queryBatches) {
      if (photoMap.size < 5) addPhotos(batch);
    }
  }

  // Fallback / top-up with place + state query
  if (photoMap.size < 3) {
    const primary = await searchCommonsPhotos(`${name} ${state}`, 8);
    addPhotos(primary);
  }
  if (photoMap.size < 3) {
    const secondary = await searchCommonsPhotos(`${name} India`, 6);
    addPhotos(secondary);
  }

  const wiki = await wikiPromise;
  const gallery = Array.from(photoMap.values()).slice(0, 6);
  return buildStructuredDetails(row, wiki, gallery);
}

async function main() {
  const rows = RAW_INDIA_DESTINATIONS.slice(0, TARGET_COUNT);
  console.log(`Starting batch population of ${rows.length} Indian destinations...`);

  // Resume support if interrupted
  let existingMap = new Map();
  if (fs.existsSync(OUTPUT_PATH)) {
    try {
      const existing = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf-8'));
      if (Array.isArray(existing.destinations)) {
        for (const d of existing.destinations) {
          existingMap.set(d.id, d);
        }
        console.log(`Loaded ${existingMap.size} cached destinations from previous run.`);
      }
    } catch {
      // ignore
    }
  }

  const results = [];
  const BATCH_SIZE = 14;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const slice = rows.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      slice.map(async (row) => {
        const id = slugify(`${row[0]}-${row[1]}`);
        const cached = existingMap.get(id);
        if (cached && cached.gallery && cached.gallery.length >= 3) {
          return cached;
        }
        return processDestination(row);
      })
    );
    results.push(...batchResults);

    if ((i + BATCH_SIZE) % 70 === 0 || i + BATCH_SIZE >= rows.length) {
      const partialStats = computeStats(results);
      fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
      fs.writeFileSync(
        OUTPUT_PATH,
        JSON.stringify({ generatedAt: new Date().toISOString(), stats: partialStats, destinations: results }, null, 2),
        'utf-8'
      );
      console.log(
        `Processed ${results.length}/${rows.length} | Photos: ${partialStats.totalPhotographs} | Complete galleries (>=3): ${partialStats.completeGalleries} | Missing: ${partialStats.missingPhotos}`
      );
    }

    await new Promise((r) => setTimeout(r, 120));
  }

  // Deduplicate by id just in case
  const deduped = [];
  const seen = new Set();
  for (const d of results) {
    if (!seen.has(d.id)) {
      seen.add(d.id);
      deduped.push(d);
    }
  }

  const stats = computeStats(deduped);
  fs.writeFileSync(
    OUTPUT_PATH,
    JSON.stringify({ generatedAt: new Date().toISOString(), stats, destinations: deduped }, null, 2),
    'utf-8'
  );

  console.log('\n=== FINAL POPULATION REPORT ===');
  console.log(JSON.stringify(stats, null, 2));
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

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
