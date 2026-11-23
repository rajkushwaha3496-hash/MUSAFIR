import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { haversineDistanceKm, STARTING_CITIES } from './src/data/indianCities.ts';
import { calculateStudentBudgetBreakdown } from './src/utils/budgetCalculator.ts';
import type {
  BookingRecord,
  DestinationsReportStats,
  IndiaDestination,
  TravelMode,
  VerificationStatus,
} from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const STORE_PATH = path.join(DATA_DIR, 'wanderly-store.json');
const DESTINATIONS_DB_PATH = path.join(DATA_DIR, 'destinations-db.json');

interface WanderlyStore {
  bookings: BookingRecord[];
  subscribers: string[];
  users: Array<{ name: string; email: string }>;
}

interface DestinationsDbFile {
  generatedAt: string;
  stats: DestinationsReportStats;
  destinations: IndiaDestination[];
}

function readStore(): WanderlyStore {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(STORE_PATH)) {
    const initial: WanderlyStore = {
      bookings: [],
      subscribers: [],
      users: [],
    };
    fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    return JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8')) as WanderlyStore;
  } catch {
    return { bookings: [], subscribers: [], users: [] };
  }
}

function writeStore(store: WanderlyStore): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
}

let cachedDb: DestinationsDbFile | null = null;
let cachedMtimeMs = 0;

function computeDbStats(destinations: IndiaDestination[]): DestinationsReportStats {
  let totalPhotographs = 0;
  let completeGalleries = 0;
  let partialGalleries = 0;
  let missingPhotos = 0;
  let completeDescriptions = 0;
  let verifiedCount = 0;
  let needsReviewCount = 0;
  let unverifiedCount = 0;
  const statesSet = new Set<string>();

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

function readDestinationsDb(): DestinationsDbFile {
  if (!fs.existsSync(DESTINATIONS_DB_PATH)) {
    return {
      generatedAt: new Date().toISOString(),
      stats: {
        totalDestinations: 0,
        statesAndUTsCovered: 0,
        totalPhotographs: 0,
        completeGalleries: 0,
        partialGalleries: 0,
        missingPhotos: 0,
        completeDescriptions: 0,
        verifiedCount: 0,
        needsReviewCount: 0,
        unverifiedCount: 0,
      },
      destinations: [],
    };
  }
  try {
    const stat = fs.statSync(DESTINATIONS_DB_PATH);
    if (!cachedDb || stat.mtimeMs !== cachedMtimeMs) {
      const parsed = JSON.parse(
        fs.readFileSync(DESTINATIONS_DB_PATH, 'utf-8')
      ) as DestinationsDbFile;
      cachedDb = {
        generatedAt: parsed.generatedAt || new Date().toISOString(),
        stats: computeDbStats(parsed.destinations || []),
        destinations: parsed.destinations || [],
      };
      cachedMtimeMs = stat.mtimeMs;
    }
    return cachedDb;
  } catch {
    return {
      generatedAt: new Date().toISOString(),
      stats: computeDbStats([]),
      destinations: [],
    };
  }
}

function writeDestinationsDb(destinations: IndiaDestination[]): DestinationsDbFile {
  const updated: DestinationsDbFile = {
    generatedAt: new Date().toISOString(),
    stats: computeDbStats(destinations),
    destinations,
  };
  fs.writeFileSync(DESTINATIONS_DB_PATH, JSON.stringify(updated, null, 2), 'utf-8');
  const stat = fs.statSync(DESTINATIONS_DB_PATH);
  cachedDb = updated;
  cachedMtimeMs = stat.mtimeMs;
  return updated;
}

const MONTH_INDEX: Record<string, number> = {
  january: 0, jan: 0,
  february: 1, feb: 1,
  march: 2, mar: 2,
  april: 3, apr: 3,
  may: 4,
  june: 5, jun: 5,
  july: 6, jul: 6,
  august: 7, aug: 7,
  september: 8, sep: 8, sept: 8,
  october: 9, oct: 9,
  november: 10, nov: 10,
  december: 11, dec: 11,
};

function matchesSeasonMonth(bestSeason: string, monthOrSeason: string): boolean {
  const query = monthOrSeason.trim().toLowerCase();
  if (!query || query === 'all') return true;

  // Allow seasonal keywords
  if (query === 'winter') {
    return ['november', 'december', 'january', 'february'].some((m) =>
      matchesSeasonMonth(bestSeason, m)
    );
  }
  if (query === 'summer') {
    return ['march', 'april', 'may', 'june'].some((m) =>
      matchesSeasonMonth(bestSeason, m)
    );
  }
  if (query === 'monsoon') {
    return ['july', 'august', 'september'].some((m) =>
      matchesSeasonMonth(bestSeason, m)
    );
  }

  const targetIdx = MONTH_INDEX[query];
  if (targetIdx === undefined) {
    return bestSeason.toLowerCase().includes(query);
  }

  const segments = bestSeason.toLowerCase().split(/[,;]/);
  for (const seg of segments) {
    const tokens = seg.match(/[a-z]+/g) || [];
    const months = tokens
      .map((t) => MONTH_INDEX[t])
      .filter((v): v is number => v !== undefined);
    if (months.length === 1 && months[0] === targetIdx) return true;
    if (months.length >= 2) {
      const start = months[0];
      const end = months[months.length - 1];
      if (start <= end) {
        if (targetIdx >= start && targetIdx <= end) return true;
      } else {
        if (targetIdx >= start || targetIdx <= end) return true;
      }
    }
  }
  return false;
}

function parseBudgetTierRange(
  tier: string,
  customMax: number | null
): { min: number; max: number | null } {
  switch (tier) {
    case 'under-500':
      return { min: 0, max: 500 };
    case '500-1000':
      return { min: 500, max: 1000 };
    case '1000-2000':
      return { min: 1000, max: 2000 };
    case '2000-3500':
      return { min: 2000, max: 3500 };
    case '3500-5000':
      return { min: 3500, max: 5000 };
    case 'custom':
      return { min: 0, max: customMax && customMax > 0 ? customMax : null };
    default:
      return { min: 0, max: customMax && customMax > 0 ? customMax : null };
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    const db = readDestinationsDb();
    res.json({ ok: true, destinationsLoaded: db.destinations.length });
  });

  app.get('/api/destinations/stats', (_req, res) => {
    const db = readDestinationsDb();
    const byState: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    const byRegion: Record<string, number> = {};

    for (const d of db.destinations) {
      byState[d.state] = (byState[d.state] || 0) + 1;
      byCategory[d.category] = (byCategory[d.category] || 0) + 1;
      byRegion[d.region] = (byRegion[d.region] || 0) + 1;
    }

    res.json({
      generatedAt: db.generatedAt,
      ...db.stats,
      byState,
      byCategory,
      byRegion,
    });
  });

  app.get('/api/destinations/suggest', (req, res) => {
    const q = String(req.query.q || '').trim().toLowerCase();
    const db = readDestinationsDb();
    if (!q) {
      res.json({ suggestions: db.destinations.slice(0, 8).map((d) => ({ id: d.id, name: d.name, state: d.state, category: d.category })) });
      return;
    }
    const matches = db.destinations
      .filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.state.toLowerCase().includes(q) ||
          d.district.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q)
      )
      .slice(0, 8)
      .map((d) => ({
        id: d.id,
        name: d.name,
        state: d.state,
        district: d.district,
        category: d.category,
      }));
    res.json({ suggestions: matches });
  });

  app.get('/api/destinations', (req, res) => {
    const db = readDestinationsDb();
    const q = String(req.query.q || '').trim().toLowerCase();
    const state = String(req.query.state || 'All');
    const region = String(req.query.region || 'All');
    const category = String(req.query.category || 'All');
    const budgetTier = String(req.query.budgetTier || 'all');
    const customMaxBudget = req.query.maxBudget ? Number(req.query.maxBudget) : null;
    const days = Math.max(1, Math.min(15, Number(req.query.days) || 2));
    const travelers = Math.max(1, Math.min(20, Number(req.query.travelers) || 1));
    const travelMode = (String(req.query.travelMode || 'Train') as TravelMode) || 'Train';
    const season = String(req.query.season || 'All');
    const startCityId = String(req.query.startCity || '');
    const maxDistanceKm = req.query.maxDistanceKm ? Number(req.query.maxDistanceKm) : null;
    const verificationStatus = String(req.query.verificationStatus || 'All');
    const studentFriendly = req.query.studentFriendly === 'true';
    const weekendTrip = req.query.weekendTrip === 'true';
    const oneDayTrip = req.query.oneDayTrip === 'true';
    const groupTrip = req.query.groupTrip === 'true';
    const maxDurationDays = req.query.maxDurationDays ? Number(req.query.maxDurationDays) : null;
    const sort = String(req.query.sort || 'best-match');
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(48, Number(req.query.limit) || 18));

    const startCity = STARTING_CITIES.find(
      (c) => c.id === startCityId || c.name.toLowerCase() === startCityId.toLowerCase()
    );

    const { min: budgetMin, max: budgetMax } = parseBudgetTierRange(
      budgetTier,
      customMaxBudget
    );

    const enriched = db.destinations.map((dest) => {
      const distanceKm = startCity
        ? haversineDistanceKm(startCity.lat, startCity.lon, dest.lat, dest.lon)
        : null;
      const estimatedBreakdown = calculateStudentBudgetBreakdown({
        budget: dest.budget,
        days,
        travelers,
        distanceKm,
        travelMode,
      });
      return {
        ...dest,
        distanceKm,
        estimatedBreakdown,
      };
    });

    const filtered = enriched.filter((dest) => {
      if (state !== 'All' && dest.state !== state) return false;
      if (region !== 'All' && dest.region !== region) return false;
      if (category !== 'All' && dest.category !== category) return false;
      if (
        verificationStatus !== 'All' &&
        dest.verificationStatus !== verificationStatus
      ) {
        return false;
      }
      if (studentFriendly && !dest.studentFriendly) return false;
      if (weekendTrip && (!dest.weekendTrip && (dest.distanceKm === null || dest.distanceKm > 380))) {
        return false;
      }
      if (oneDayTrip && !dest.oneDayTrip && (dest.distanceKm === null || dest.distanceKm > 130)) {
        return false;
      }
      if (groupTrip && !dest.groupTrip) return false;
      if (maxDurationDays && dest.recommendedDays > maxDurationDays) return false;

      if (season !== 'All' && !matchesSeasonMonth(dest.bestSeason, season)) {
        return false;
      }

      if (maxDistanceKm && dest.distanceKm !== null && dest.distanceKm > maxDistanceKm) {
        return false;
      }

      // Strict budget affordability rule:
      // Never recommend a destination as affordable if estimated per-person total exceeds selected max budget.
      const perPerson = dest.estimatedBreakdown.perPersonTotalInr;
      if (budgetMax !== null && perPerson > budgetMax) return false;
      if (budgetTier !== 'all' && budgetTier !== 'custom' && budgetTier !== 'under-500' && perPerson < budgetMin) {
        // Keep items that are even cheaper ONLY when user didn't want strictly inside range?
        // Actually for range filters like ₹1,000-₹2,000, allow <= max and >= min * 0.6 or strict min:
        if (perPerson < budgetMin) return false;
      }

      if (q) {
        const haystack = [
          dest.name,
          dest.state,
          dest.district,
          dest.region,
          dest.category,
          dest.description,
          ...dest.tags,
          ...dest.nearbyAttractions,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });

    filtered.sort((a, b) => {
      if (sort === 'cheapest') {
        return (
          a.estimatedBreakdown.perPersonTotalInr -
          b.estimatedBreakdown.perPersonTotalInr
        );
      }
      if (sort === 'shortest-distance') {
        if (a.distanceKm !== null && b.distanceKm !== null) {
          return a.distanceKm - b.distanceKm;
        }
        return b.popularityScore - a.popularityScore;
      }
      if (sort === 'most-popular') {
        return b.popularityScore - a.popularityScore;
      }
      // best-match: prioritize Verified + has photos + popularity + distance proximity
      const score = (d: typeof a) => {
        let s = d.popularityScore;
        if (d.verificationStatus === 'Verified') s += 40;
        if ((d.gallery?.length || 0) >= 3) s += 30;
        if (d.distanceKm !== null) {
          s += Math.max(0, 50 - d.distanceKm / 25);
        }
        return s;
      };
      return score(b) - score(a);
    });

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const startIdx = (safePage - 1) * limit;
    const items = filtered.slice(startIdx, startIdx + limit);

    res.json({
      total,
      page: safePage,
      totalPages,
      limit,
      items,
      stats: db.stats,
    });
  });

  app.get('/api/destinations/:idOrSlug', (req, res) => {
    const db = readDestinationsDb();
    const param = req.params.idOrSlug;
    const dest = db.destinations.find(
      (d) => d.id === param || d.slug === param
    );
    if (!dest) {
      res.status(404).json({ error: 'Destination not found.' });
      return;
    }

    const days = Math.max(1, Math.min(15, Number(req.query.days) || dest.recommendedDays || 2));
    const travelers = Math.max(1, Math.min(20, Number(req.query.travelers) || 1));
    const travelMode = (String(req.query.travelMode || 'Train') as TravelMode) || 'Train';
    const startCityId = String(req.query.startCity || '');
    const startCity = STARTING_CITIES.find((c) => c.id === startCityId);

    const distanceKm = startCity
      ? haversineDistanceKm(startCity.lat, startCity.lon, dest.lat, dest.lon)
      : null;

    const estimatedBreakdown = calculateStudentBudgetBreakdown({
      budget: dest.budget,
      days,
      travelers,
      distanceKm,
      travelMode,
    });

    // Real geographic nearby destinations via Haversine distance
    const nearbyDestinations = db.destinations
      .filter((other) => other.id !== dest.id)
      .map((other) => ({
        id: other.id,
        slug: other.slug,
        name: other.name,
        state: other.state,
        category: other.category,
        coverPhoto: other.coverPhoto,
        verificationStatus: other.verificationStatus,
        distanceKm: haversineDistanceKm(dest.lat, dest.lon, other.lat, other.lon),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 6);

    res.json({
      destination: {
        ...dest,
        distanceKm,
        estimatedBreakdown,
      },
      nearbyDestinations,
    });
  });

  app.patch('/api/destinations/:id', (req, res) => {
    const db = readDestinationsDb();
    const idx = db.destinations.findIndex((d) => d.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Destination not found.' });
      return;
    }

    const body = req.body as Partial<{
      verificationStatus: VerificationStatus;
      officialTourismUrl: string;
      description: string;
      whyFamous: string;
      bestSeason: string;
      safetyInfo: string;
      accessibilityInfo: string;
      stayPerNightInr: number;
      foodPerDayInr: number;
      localTransportPerDayInr: number;
      entryFeeInr: number;
      entryFeeNote: string;
    }>;

    const current = db.destinations[idx];
    const allowedStatuses: VerificationStatus[] = [
      'Verified',
      'Needs Review',
      'Unverified',
    ];
    const nextStatus =
      body.verificationStatus && allowedStatuses.includes(body.verificationStatus)
        ? body.verificationStatus
        : current.verificationStatus;

    const nextStay =
      body.stayPerNightInr !== undefined && Number(body.stayPerNightInr) >= 0
        ? Number(body.stayPerNightInr)
        : current.budget.stayPerNightInr;
    const nextFood =
      body.foodPerDayInr !== undefined && Number(body.foodPerDayInr) >= 0
        ? Number(body.foodPerDayInr)
        : current.budget.foodPerDayInr;
    const nextLocal =
      body.localTransportPerDayInr !== undefined &&
      Number(body.localTransportPerDayInr) >= 0
        ? Number(body.localTransportPerDayInr)
        : current.budget.localTransportPerDayInr;
    const nextEntry =
      body.entryFeeInr !== undefined && Number(body.entryFeeInr) >= 0
        ? Number(body.entryFeeInr)
        : current.budget.entryFeeInr;

    const updatedDest: IndiaDestination = {
      ...current,
      verificationStatus: nextStatus,
      lastVerifiedDate:
        nextStatus === 'Unverified'
          ? null
          : new Date().toISOString().slice(0, 10),
      officialTourismUrl:
        body.officialTourismUrl?.trim() || current.officialTourismUrl,
      description: body.description?.trim() || current.description,
      whyFamous: body.whyFamous?.trim() || current.whyFamous,
      bestSeason: body.bestSeason?.trim() || current.bestSeason,
      safetyInfo: body.safetyInfo?.trim() || current.safetyInfo,
      accessibilityInfo:
        body.accessibilityInfo?.trim() || current.accessibilityInfo,
      budget: {
        ...current.budget,
        stayPerNightInr: nextStay,
        foodPerDayInr: nextFood,
        localTransportPerDayInr: nextLocal,
        entryFeeInr: nextEntry,
        entryFeeNote: body.entryFeeNote?.trim() || current.budget.entryFeeNote,
        estimatedDailyStudentCostInr:
          nextStay + nextFood + nextLocal + nextEntry,
      },
    };

    const nextList = [...db.destinations];
    nextList[idx] = updatedDest;
    const saved = writeDestinationsDb(nextList);

    res.json({ destination: updatedDest, stats: saved.stats });
  });

  app.post('/api/bookings', (req, res) => {
    const {
      destinationName,
      packageTitle,
      checkIn,
      checkOut,
      travelers,
      totalPriceInr,
      guestName,
      guestEmail,
    } = req.body as Omit<BookingRecord, 'id' | 'createdAt'>;

    if (!guestName?.trim() || !guestEmail?.trim() || !destinationName) {
      res
        .status(400)
        .json({ error: 'Please complete your name, email, and destination.' });
      return;
    }

    const store = readStore();
    const record: BookingRecord = {
      id: `MSF-${Math.floor(100000 + Math.random() * 900000)}`,
      destinationName,
      packageTitle: packageTitle || `${destinationName} Curated Escape`,
      checkIn,
      checkOut,
      travelers: Number(travelers) || 2,
      totalPriceInr: Number(totalPriceInr) || 6999,
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim(),
      createdAt: new Date().toISOString(),
    };

    store.bookings.unshift(record);
    writeStore(store);
    res.status(201).json({ booking: record });
  });

  app.post('/api/newsletter', (req, res) => {
    const { email } = req.body as { email?: string };
    const cleanEmail = email?.trim().toLowerCase() ?? '';
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }

    const store = readStore();
    if (!store.subscribers.includes(cleanEmail)) {
      store.subscribers.push(cleanEmail);
      writeStore(store);
    }
    res.status(201).json({ subscribed: true, email: cleanEmail });
  });

  app.post('/api/auth', (req, res) => {
    const { name, email, mode } = req.body as {
      name?: string;
      email?: string;
      mode?: 'login' | 'signup';
    };
    const cleanEmail = email?.trim().toLowerCase() ?? '';
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }

    const store = readStore();
    const existing = store.users.find((u) => u.email === cleanEmail);
    const resolvedName =
      name?.trim() || existing?.name || cleanEmail.split('@')[0] || 'Traveler';

    if (mode === 'signup' || !existing) {
      if (!existing) {
        store.users.push({ name: resolvedName, email: cleanEmail });
        writeStore(store);
      }
    }

    res.json({
      user: {
        name: resolvedName,
        email: cleanEmail,
      },
    });
  });

  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, allowedHosts: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`MUSAFIR server running on http://localhost:${port}`);
  });
}

startServer();
