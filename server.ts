import 'dotenv/config';
import crypto from 'crypto';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  buildFullStatsPayload,
  computeDbStats,
  getDestinationDetail,
  queryDestinationMapPoints,
  queryDestinationsList,
  suggestDestinations,
} from './src/utils/destinationEngine.ts';
import type {
  BookingRecord,
  DestinationsReportStats,
  IndiaDestination,
  TravelMode,
  UserSession,
  VerificationStatus,
} from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const STORE_PATH = path.join(DATA_DIR, 'wanderly-store.json');
const DESTINATIONS_DB_PATH = path.join(DATA_DIR, 'destinations-db.json');
const FIREBASE_CONFIG_PATH = path.join(__dirname, 'firebase-applet-config.json');

function getFirebaseProjectId(): string {
  if (process.env.FIREBASE_PROJECT_ID) return process.env.FIREBASE_PROJECT_ID;
  try {
    if (fs.existsSync(FIREBASE_CONFIG_PATH)) {
      const cfg = JSON.parse(fs.readFileSync(FIREBASE_CONFIG_PATH, 'utf-8')) as {
        projectId?: string;
      };
      if (cfg.projectId) return cfg.projectId;
    }
  } catch {
    // fallback below
  }
  return 'quick-botany-h3kqt';
}

interface StoredUser {
  name: string;
  email: string;
  passwordHash?: string;
}

interface WanderlyStore {
  bookings: BookingRecord[];
  subscribers: string[];
  users: StoredUser[];
}

interface DestinationsDbFile {
  generatedAt: string;
  stats: DestinationsReportStats;
  destinations: IndiaDestination[];
}

const SESSION_SECRET =
  process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const COOKIE_NAME = 'musafir_session';

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split(':');
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  const keyBuf = Buffer.from(keyHex, 'hex');
  const derived = crypto.scryptSync(password, salt, 64);
  if (keyBuf.length !== derived.length) return false;
  return crypto.timingSafeEqual(keyBuf, derived);
}

function signSessionToken(user: UserSession): string {
  const payload = Buffer.from(
    JSON.stringify({
      name: user.name,
      email: user.email,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    })
  ).toString('base64url');
  const sig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');
  return `${payload}.${sig}`;
}

function verifySessionToken(token: string): UserSession | null {
  try {
    const [payload, sig] = token.split('.');
    if (!payload || !sig) return null;
    const expected = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payload)
      .digest('base64url');
    const sigBuf = Buffer.from(sig);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length) return null;
    if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;
    const decoded = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf-8')
    ) as { name?: string; email?: string; exp?: number };
    if (!decoded.exp || decoded.exp < Date.now()) return null;
    if (!decoded.email || !decoded.name) return null;
    return { name: decoded.name, email: decoded.email };
  } catch {
    return null;
  }
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  const result: Record<string, string> = {};
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = decodeURIComponent(part.slice(idx + 1).trim());
    result[key] = val;
  }
  return result;
}

let cachedCerts: Record<string, string> = {};
let certsExpiresAt = 0;

async function getFirebasePublicCerts(): Promise<Record<string, string>> {
  if (Date.now() < certsExpiresAt && Object.keys(cachedCerts).length > 0) {
    return cachedCerts;
  }
  try {
    const res = await fetch(
      'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'
    );
    if (!res.ok) return cachedCerts;
    const certs = (await res.json()) as Record<string, string>;
    const cc = res.headers.get('cache-control') || '';
    const match = cc.match(/max-age=(\d+)/i);
    const maxAgeSec = match ? Number(match[1]) : 3600;
    cachedCerts = certs;
    certsExpiresAt = Date.now() + Math.max(60, maxAgeSec) * 1000;
    return cachedCerts;
  } catch {
    return cachedCerts;
  }
}

async function verifyFirebaseIdToken(token: string): Promise<UserSession | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const header = JSON.parse(
      Buffer.from(parts[0], 'base64url').toString('utf-8')
    ) as { alg?: string; kid?: string };
    if (header.alg !== 'RS256' || !header.kid) return null;

    const certs = await getFirebasePublicCerts();
    const cert = certs[header.kid];
    if (!cert) return null;

    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(`${parts[0]}.${parts[1]}`);
    verifier.end();
    if (!verifier.verify(cert, parts[2], 'base64url')) return null;

    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString('utf-8')
    ) as {
      email?: string;
      name?: string;
      exp?: number;
      iat?: number;
      aud?: string;
      iss?: string;
      sub?: string;
    };
    const projectId = getFirebaseProjectId();
    const nowSec = Math.floor(Date.now() / 1000);
    if (
      !payload.sub ||
      !payload.email ||
      payload.aud !== projectId ||
      payload.iss !== `https://securetoken.google.com/${projectId}` ||
      !payload.exp ||
      payload.exp <= nowSec ||
      !payload.iat ||
      payload.iat > nowSec + 300
    ) {
      return null;
    }
    return {
      name: payload.name || payload.email.split('@')[0] || 'Member',
      email: payload.email,
    };
  } catch {
    return null;
  }
}

async function getAuthenticatedSession(
  req: express.Request
): Promise<UserSession | null> {
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    const verifiedLocal = verifySessionToken(token);
    if (verifiedLocal) return verifiedLocal;
    const firebaseIdentity = await verifyFirebaseIdToken(token);
    if (firebaseIdentity) return firebaseIdentity;
  }
  const cookies = parseCookies(req.headers.cookie);
  if (cookies[COOKIE_NAME]) {
    return verifySessionToken(cookies[COOKIE_NAME]);
  }
  return null;
}

function setSessionCookie(
  req: express.Request,
  res: express.Response,
  token: string
) {
  const isHttps =
    req.secure ||
    req.headers['x-forwarded-proto'] === 'https' ||
    process.env.NODE_ENV === 'production';
  const attrs = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    `Max-Age=${7 * 24 * 60 * 60}`,
  ];
  if (isHttps) {
    attrs.push('Secure', 'SameSite=None', 'Partitioned');
  } else {
    attrs.push('SameSite=Lax');
  }
  res.setHeader('Set-Cookie', attrs.join('; '));
}

function clearSessionCookie(req: express.Request, res: express.Response) {
  const isHttps =
    req.secure ||
    req.headers['x-forwarded-proto'] === 'https' ||
    process.env.NODE_ENV === 'production';
  const attrs = [`${COOKIE_NAME}=`, 'Path=/', 'HttpOnly', 'Max-Age=0'];
  if (isHttps) {
    attrs.push('Secure', 'SameSite=None', 'Partitioned');
  } else {
    attrs.push('SameSite=Lax');
  }
  res.setHeader('Set-Cookie', attrs.join('; '));
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

function readDestinationsDb(): DestinationsDbFile {
  if (!fs.existsSync(DESTINATIONS_DB_PATH)) {
    return {
      generatedAt: new Date().toISOString(),
      stats: computeDbStats([]),
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
  fs.writeFileSync(
    DESTINATIONS_DB_PATH,
    JSON.stringify(updated, null, 2),
    'utf-8'
  );
  const stat = fs.statSync(DESTINATIONS_DB_PATH);
  cachedDb = updated;
  cachedMtimeMs = stat.mtimeMs;
  return updated;
}

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    const db = readDestinationsDb();
    res.json({ ok: true, destinationsLoaded: db.destinations.length });
  });

  app.get('/api/maps-config', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json({
      apiKey:
        process.env.VITE_GOOGLE_MAPS_API_KEY ||
        process.env.GOOGLE_MAPS_API_KEY ||
        '',
    });
  });

  app.get('/api/destinations/stats', (_req, res) => {
    const db = readDestinationsDb();
    res.json(buildFullStatsPayload(db.destinations, db.generatedAt));
  });

  app.get('/api/destinations/suggest', (req, res) => {
    const q = String(req.query.q || '');
    const db = readDestinationsDb();
    res.json({ suggestions: suggestDestinations(db.destinations, q) });
  });

  app.get('/api/destinations/map-points', (req, res) => {
    const db = readDestinationsDb();
    const userLat = req.query.userLat ? Number(req.query.userLat) : null;
    const userLon = req.query.userLon ? Number(req.query.userLon) : null;
    const points = queryDestinationMapPoints(db.destinations, {
      q: String(req.query.q || ''),
      state: String(req.query.state || 'All'),
      region: String(req.query.region || 'All'),
      category: String(req.query.category || 'All'),
      budgetTier: String(req.query.budgetTier || 'all'),
      maxBudget: req.query.maxBudget ? Number(req.query.maxBudget) : null,
      days: Number(req.query.days) || 2,
      travelers: Number(req.query.travelers) || 1,
      travelMode: (String(req.query.travelMode || 'Train') as TravelMode) || 'Train',
      season: String(req.query.season || 'All'),
      startCity: String(req.query.startCity || ''),
      userLat: userLat !== null && Number.isFinite(userLat) ? userLat : null,
      userLon: userLon !== null && Number.isFinite(userLon) ? userLon : null,
      maxDistanceKm: req.query.maxDistanceKm
        ? Number(req.query.maxDistanceKm)
        : null,
      verificationStatus: String(req.query.verificationStatus || 'All'),
      studentFriendly: req.query.studentFriendly === 'true',
      weekendTrip: req.query.weekendTrip === 'true',
      oneDayTrip: req.query.oneDayTrip === 'true',
      groupTrip: req.query.groupTrip === 'true',
      maxDurationDays: req.query.maxDurationDays
        ? Number(req.query.maxDurationDays)
        : null,
    });
    res.json({ points });
  });

  app.get('/api/destinations', (req, res) => {
    const db = readDestinationsDb();
    const userLat = req.query.userLat ? Number(req.query.userLat) : null;
    const userLon = req.query.userLon ? Number(req.query.userLon) : null;
    const result = queryDestinationsList(db.destinations, {
      q: String(req.query.q || ''),
      state: String(req.query.state || 'All'),
      region: String(req.query.region || 'All'),
      category: String(req.query.category || 'All'),
      budgetTier: String(req.query.budgetTier || 'all'),
      maxBudget: req.query.maxBudget ? Number(req.query.maxBudget) : null,
      days: Number(req.query.days) || 2,
      travelers: Number(req.query.travelers) || 1,
      travelMode: (String(req.query.travelMode || 'Train') as TravelMode) || 'Train',
      season: String(req.query.season || 'All'),
      startCity: String(req.query.startCity || ''),
      userLat: userLat !== null && Number.isFinite(userLat) ? userLat : null,
      userLon: userLon !== null && Number.isFinite(userLon) ? userLon : null,
      maxDistanceKm: req.query.maxDistanceKm
        ? Number(req.query.maxDistanceKm)
        : null,
      verificationStatus: String(req.query.verificationStatus || 'All'),
      studentFriendly: req.query.studentFriendly === 'true',
      weekendTrip: req.query.weekendTrip === 'true',
      oneDayTrip: req.query.oneDayTrip === 'true',
      groupTrip: req.query.groupTrip === 'true',
      maxDurationDays: req.query.maxDurationDays
        ? Number(req.query.maxDurationDays)
        : null,
      sort: String(req.query.sort || 'best-match'),
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 18,
    });
    res.json(result);
  });

  app.get('/api/destinations/:idOrSlug', (req, res) => {
    const db = readDestinationsDb();
    const userLat = req.query.userLat ? Number(req.query.userLat) : null;
    const userLon = req.query.userLon ? Number(req.query.userLon) : null;
    const detail = getDestinationDetail(db.destinations, req.params.idOrSlug, {
      days: req.query.days ? Number(req.query.days) : undefined,
      travelers: req.query.travelers ? Number(req.query.travelers) : undefined,
      travelMode:
        (String(req.query.travelMode || 'Train') as TravelMode) || 'Train',
      startCity: String(req.query.startCity || ''),
      userLat: userLat !== null && Number.isFinite(userLat) ? userLat : null,
      userLon: userLon !== null && Number.isFinite(userLon) ? userLon : null,
    });
    if (!detail) {
      res.status(404).json({ error: 'Destination not found.' });
      return;
    }
    res.json(detail);
  });

  app.patch('/api/destinations/:id', async (req, res) => {
    const session = await getAuthenticatedSession(req);
    if (!session) {
      res
        .status(401)
        .json({ error: 'Please sign in before modifying verification details.' });
      return;
    }

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
      body.verificationStatus &&
      allowedStatuses.includes(body.verificationStatus)
        ? body.verificationStatus
        : current.verificationStatus;

    let nextOfficialUrl = current.officialTourismUrl;
    if (body.officialTourismUrl?.trim()) {
      const trimmedUrl = body.officialTourismUrl.trim();
      let isValidHttpUrl = false;
      try {
        const parsed = new URL(trimmedUrl);
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
          nextOfficialUrl = trimmedUrl;
          isValidHttpUrl = true;
        }
      } catch {
        isValidHttpUrl = false;
      }
      if (!isValidHttpUrl) {
        res
          .status(400)
          .json({ error: 'Official tourism URL must start with http:// or https://.' });
        return;
      }
    }

    const clampCost = (val: unknown, fallback: number) => {
      if (val === undefined) return fallback;
      const n = Number(val);
      if (!Number.isFinite(n) || n < 0 || n > 50000) return fallback;
      return Math.round(n);
    };

    const nextStay = clampCost(body.stayPerNightInr, current.budget.stayPerNightInr);
    const nextFood = clampCost(body.foodPerDayInr, current.budget.foodPerDayInr);
    const nextLocal = clampCost(
      body.localTransportPerDayInr,
      current.budget.localTransportPerDayInr
    );
    const nextEntry = clampCost(body.entryFeeInr, current.budget.entryFeeInr);

    const updatedDest: IndiaDestination = {
      ...current,
      verificationStatus: nextStatus,
      lastVerifiedDate:
        nextStatus === 'Unverified'
          ? null
          : new Date().toISOString().slice(0, 10),
      officialTourismUrl: nextOfficialUrl,
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

    const cleanEmail = guestEmail?.trim().toLowerCase() ?? '';
    if (
      !guestName?.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) ||
      !destinationName?.trim()
    ) {
      res.status(400).json({
        error: 'Please complete your name, a valid email address, and destination.',
      });
      return;
    }

    if (checkIn && checkOut && checkOut < checkIn) {
      res.status(400).json({
        error: 'Check-out date must be on or after check-in date.',
      });
      return;
    }

    const safeTravelers = Math.max(1, Math.min(20, Math.round(Number(travelers) || 2)));
    const safePrice = Number(totalPriceInr);
    if (!Number.isFinite(safePrice) || safePrice <= 0) {
      res.status(400).json({ error: 'Invalid trip price estimate.' });
      return;
    }

    const store = readStore();
    const record: BookingRecord = {
      id: `MSF-${Math.floor(100000 + Math.random() * 900000)}`,
      destinationName: destinationName.trim(),
      packageTitle: packageTitle || `${destinationName} Curated Escape`,
      checkIn: checkIn || '',
      checkOut: checkOut || '',
      travelers: safeTravelers,
      totalPriceInr: Math.round(safePrice),
      guestName: guestName.trim(),
      guestEmail: cleanEmail,
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

  app.get('/api/auth/me', async (req, res) => {
    const session = await getAuthenticatedSession(req);
    res.json({ user: session });
  });

  app.post('/api/auth/logout', (req, res) => {
    clearSessionCookie(req, res);
    res.json({ ok: true });
  });

  app.post('/api/auth', (req, res) => {
    const { name, email, password, mode } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      mode?: 'login' | 'signup';
    };
    const cleanEmail = email?.trim().toLowerCase() ?? '';
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }
    if (!password || password.length < 6) {
      res
        .status(400)
        .json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    const store = readStore();
    const existingIdx = store.users.findIndex((u) => u.email === cleanEmail);
    const existing = existingIdx >= 0 ? store.users[existingIdx] : null;

    if (mode === 'signup') {
      if (existing) {
        res.status(409).json({
          error: 'An account with this email already exists. Please sign in.',
        });
        return;
      }
      const resolvedName =
        name?.trim() || cleanEmail.split('@')[0] || 'Traveler';
      store.users.push({
        name: resolvedName,
        email: cleanEmail,
        passwordHash: hashPassword(password),
      });
      writeStore(store);

      const user: UserSession = { name: resolvedName, email: cleanEmail };
      const token = signSessionToken(user);
      setSessionCookie(req, res, token);
      res.status(201).json({ user, token });
      return;
    }

    // Login mode
    if (!existing) {
      res.status(401).json({
        error: 'No account found with this email. Please create an account first.',
      });
      return;
    }

    if (!existing.passwordHash || !verifyPassword(password, existing.passwordHash)) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const user: UserSession = { name: existing.name, email: existing.email };
    const token = signSessionToken(user);
    setSessionCookie(req, res, token);
    res.json({ user, token });
  });

  // Expose destinations JSON safely for static-fallback/Netlify compatibility
  app.get('/data/destinations-db.json', (_req, res) => {
    if (!fs.existsSync(DESTINATIONS_DB_PATH)) {
      res.status(404).json({ error: 'Dataset not found.' });
      return;
    }
    res.sendFile(DESTINATIONS_DB_PATH);
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
