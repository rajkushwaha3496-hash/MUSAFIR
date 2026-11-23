import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import type {
  BookingRecord,
  IndiaDestination,
  TravelMode,
  UserSession,
  VerificationStatus,
} from '../../src/types.ts';
import {
  buildFullStatsPayload,
  getDestinationDetail,
  queryDestinationMapPoints,
  queryDestinationsList,
  suggestDestinations,
} from '../../src/utils/destinationEngine.ts';

interface DbFile {
  generatedAt: string;
  destinations: IndiaDestination[];
}

let cachedDb: DbFile | null = null;

function getDestinationsDb(): DbFile {
  if (cachedDb) return cachedDb;
  const candidates = [
    path.resolve(process.cwd(), 'data', 'destinations-db.json'),
    path.resolve(process.cwd(), 'dist', 'data', 'destinations-db.json'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      const parsed = JSON.parse(fs.readFileSync(p, 'utf-8')) as DbFile;
      cachedDb = {
        generatedAt: parsed.generatedAt || new Date().toISOString(),
        destinations: parsed.destinations || [],
      };
      return cachedDb;
    }
  }
  return { generatedAt: new Date().toISOString(), destinations: [] };
}

function getFirebaseProjectId(): string {
  if (process.env.FIREBASE_PROJECT_ID) return process.env.FIREBASE_PROJECT_ID;
  const candidates = [
    path.resolve(process.cwd(), 'firebase-applet-config.json'),
    path.resolve(process.cwd(), 'dist', 'firebase-applet-config.json'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(p, 'utf-8')) as {
          projectId?: string;
        };
        if (parsed.projectId) return parsed.projectId;
      } catch {
        // continue
      }
    }
  }
  return 'quick-botany-h3kqt';
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}

const SESSION_SECRET =
  process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

function signToken(payload: UserSession): string {
  const data = Buffer.from(
    JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })
  ).toString('base64url');
  const sig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(data)
    .digest('base64url');
  return `${data}.${sig}`;
}

function verifyToken(token: string): UserSession | null {
  try {
    const [data, sig] = token.split('.');
    if (!data || !sig) return null;
    const expected = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(data)
      .digest('base64url');
    const sigBuf = Buffer.from(sig);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length) return null;
    if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;
    const decoded = JSON.parse(
      Buffer.from(data, 'base64url').toString('utf-8')
    ) as { name?: string; email?: string; exp?: number };
    if (!decoded.exp || decoded.exp < Date.now() || !decoded.email || !decoded.name) {
      return null;
    }
    return { name: decoded.name, email: decoded.email };
  } catch {
    return null;
  }
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

async function getSessionFromRequest(req: Request): Promise<UserSession | null> {
  const authHeader = req.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    const localSession = verifyToken(token);
    if (localSession) return localSession;
    const fbSession = await verifyFirebaseIdToken(token);
    if (fbSession) return fbSession;
  }
  return null;
}

export default async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const rawPath = url.pathname
    .replace(/^\/\.netlify\/functions\/api/, '')
    .replace(/^\/api/, '');
  const cleanPath = rawPath || '/';
  const method = req.method.toUpperCase();

  const db = getDestinationsDb();

  if (method === 'GET' && cleanPath === '/health') {
    return jsonResponse({
      ok: true,
      runtime: 'netlify-functions',
      destinationsLoaded: db.destinations.length,
    });
  }

  if (method === 'GET' && cleanPath === '/maps-config') {
    return new Response(
      JSON.stringify({
        apiKey:
          process.env.VITE_GOOGLE_MAPS_API_KEY ||
          process.env.GOOGLE_MAPS_API_KEY ||
          '',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
        },
      }
    );
  }

  if (method === 'GET' && cleanPath === '/destinations/stats') {
    return jsonResponse(buildFullStatsPayload(db.destinations, db.generatedAt));
  }

  if (method === 'GET' && cleanPath === '/destinations/suggest') {
    const q = url.searchParams.get('q') || '';
    return jsonResponse({
      suggestions: suggestDestinations(db.destinations, q),
    });
  }

  if (method === 'GET' && cleanPath === '/destinations/map-points') {
    const sp = url.searchParams;
    const uLat = sp.get('userLat') ? Number(sp.get('userLat')) : null;
    const uLon = sp.get('userLon') ? Number(sp.get('userLon')) : null;
    const points = queryDestinationMapPoints(db.destinations, {
      q: sp.get('q') || '',
      state: sp.get('state') || 'All',
      region: sp.get('region') || 'All',
      category: sp.get('category') || 'All',
      budgetTier: sp.get('budgetTier') || 'all',
      maxBudget: sp.get('maxBudget') ? Number(sp.get('maxBudget')) : null,
      days: Number(sp.get('days')) || 2,
      travelers: Number(sp.get('travelers')) || 1,
      travelMode: (sp.get('travelMode') as TravelMode) || 'Train',
      season: sp.get('season') || 'All',
      startCity: sp.get('startCity') || '',
      userLat: uLat !== null && Number.isFinite(uLat) ? uLat : null,
      userLon: uLon !== null && Number.isFinite(uLon) ? uLon : null,
      maxDistanceKm: sp.get('maxDistanceKm')
        ? Number(sp.get('maxDistanceKm'))
        : null,
      verificationStatus: sp.get('verificationStatus') || 'All',
      studentFriendly: sp.get('studentFriendly') === 'true',
      weekendTrip: sp.get('weekendTrip') === 'true',
      oneDayTrip: sp.get('oneDayTrip') === 'true',
      groupTrip: sp.get('groupTrip') === 'true',
      maxDurationDays: sp.get('maxDurationDays')
        ? Number(sp.get('maxDurationDays'))
        : null,
    });
    return jsonResponse({ points });
  }

  if (method === 'GET' && cleanPath === '/destinations') {
    const sp = url.searchParams;
    const uLat = sp.get('userLat') ? Number(sp.get('userLat')) : null;
    const uLon = sp.get('userLon') ? Number(sp.get('userLon')) : null;
    const result = queryDestinationsList(db.destinations, {
      q: sp.get('q') || '',
      state: sp.get('state') || 'All',
      region: sp.get('region') || 'All',
      category: sp.get('category') || 'All',
      budgetTier: sp.get('budgetTier') || 'all',
      maxBudget: sp.get('maxBudget') ? Number(sp.get('maxBudget')) : null,
      days: Number(sp.get('days')) || 2,
      travelers: Number(sp.get('travelers')) || 1,
      travelMode: (sp.get('travelMode') as TravelMode) || 'Train',
      season: sp.get('season') || 'All',
      startCity: sp.get('startCity') || '',
      userLat: uLat !== null && Number.isFinite(uLat) ? uLat : null,
      userLon: uLon !== null && Number.isFinite(uLon) ? uLon : null,
      maxDistanceKm: sp.get('maxDistanceKm')
        ? Number(sp.get('maxDistanceKm'))
        : null,
      verificationStatus: sp.get('verificationStatus') || 'All',
      studentFriendly: sp.get('studentFriendly') === 'true',
      weekendTrip: sp.get('weekendTrip') === 'true',
      oneDayTrip: sp.get('oneDayTrip') === 'true',
      groupTrip: sp.get('groupTrip') === 'true',
      maxDurationDays: sp.get('maxDurationDays')
        ? Number(sp.get('maxDurationDays'))
        : null,
      sort: sp.get('sort') || 'best-match',
      page: Number(sp.get('page')) || 1,
      limit: Number(sp.get('limit')) || 18,
    });
    return jsonResponse(result);
  }

  if (method === 'GET' && cleanPath.startsWith('/destinations/')) {
    const idOrSlug = decodeURIComponent(cleanPath.slice('/destinations/'.length));
    const sp = url.searchParams;
    const uLat = sp.get('userLat') ? Number(sp.get('userLat')) : null;
    const uLon = sp.get('userLon') ? Number(sp.get('userLon')) : null;
    const detail = getDestinationDetail(db.destinations, idOrSlug, {
      days: sp.get('days') ? Number(sp.get('days')) : undefined,
      travelers: sp.get('travelers') ? Number(sp.get('travelers')) : undefined,
      travelMode: (sp.get('travelMode') as TravelMode) || 'Train',
      startCity: sp.get('startCity') || '',
      userLat: uLat !== null && Number.isFinite(uLat) ? uLat : null,
      userLon: uLon !== null && Number.isFinite(uLon) ? uLon : null,
    });
    if (!detail) return jsonResponse({ error: 'Destination not found.' }, 404);
    return jsonResponse(detail);
  }

  if (method === 'PATCH' && cleanPath.startsWith('/destinations/')) {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return jsonResponse(
        { error: 'Please sign in before modifying verification details.' },
        401
      );
    }

    const id = decodeURIComponent(cleanPath.slice('/destinations/'.length));
    const current = db.destinations.find((d) => d.id === id);
    if (!current) return jsonResponse({ error: 'Destination not found.' }, 404);

    const body = (await req.json()) as Partial<{
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

    let nextOfficialUrl = current.officialTourismUrl;
    if (body.officialTourismUrl?.trim()) {
      const trimmedUrl = body.officialTourismUrl.trim();
      let valid = false;
      try {
        const parsed = new URL(trimmedUrl);
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
          nextOfficialUrl = trimmedUrl;
          valid = true;
        }
      } catch {
        valid = false;
      }
      if (!valid) {
        return jsonResponse(
          { error: 'Official tourism URL must start with http:// or https://.' },
          400
        );
      }
    }

    const clampCost = (val: unknown, fallback: number) => {
      if (val === undefined) return fallback;
      const n = Number(val);
      if (!Number.isFinite(n) || n < 0 || n > 50000) return fallback;
      return Math.round(n);
    };

    const stay = clampCost(body.stayPerNightInr, current.budget.stayPerNightInr);
    const food = clampCost(body.foodPerDayInr, current.budget.foodPerDayInr);
    const local = clampCost(
      body.localTransportPerDayInr,
      current.budget.localTransportPerDayInr
    );
    const entry = clampCost(body.entryFeeInr, current.budget.entryFeeInr);
    const allowedStatuses: VerificationStatus[] = [
      'Verified',
      'Needs Review',
      'Unverified',
    ];
    const nextStatus =
      body.verificationStatus && allowedStatuses.includes(body.verificationStatus)
        ? body.verificationStatus
        : current.verificationStatus;

    const updated: IndiaDestination = {
      ...current,
      verificationStatus: nextStatus,
      officialTourismUrl: nextOfficialUrl,
      description: body.description?.trim() || current.description,
      whyFamous: body.whyFamous?.trim() || current.whyFamous,
      bestSeason: body.bestSeason?.trim() || current.bestSeason,
      safetyInfo: body.safetyInfo?.trim() || current.safetyInfo,
      accessibilityInfo: body.accessibilityInfo?.trim() || current.accessibilityInfo,
      lastVerifiedDate:
        nextStatus === 'Unverified'
          ? null
          : new Date().toISOString().slice(0, 10),
      budget: {
        ...current.budget,
        stayPerNightInr: stay,
        foodPerDayInr: food,
        localTransportPerDayInr: local,
        entryFeeInr: entry,
        entryFeeNote: body.entryFeeNote?.trim() || current.budget.entryFeeNote,
        estimatedDailyStudentCostInr: Math.max(0, stay + food + local + entry),
      },
    };
    return jsonResponse({ destination: updated });
  }

  if (method === 'POST' && cleanPath === '/bookings') {
    const body = (await req.json()) as Partial<BookingRecord>;
    const cleanEmail = (body.guestEmail || '').trim().toLowerCase();
    if (
      !body.guestName?.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) ||
      !body.destinationName?.trim()
    ) {
      return jsonResponse(
        { error: 'Please complete your name, a valid email address, and destination.' },
        400
      );
    }
    if (body.checkIn && body.checkOut && body.checkOut < body.checkIn) {
      return jsonResponse(
        { error: 'Check-out date must be on or after check-in date.' },
        400
      );
    }
    const safePrice = Number(body.totalPriceInr);
    if (!Number.isFinite(safePrice) || safePrice <= 0) {
      return jsonResponse({ error: 'Invalid trip price estimate.' }, 400);
    }
    const record: BookingRecord = {
      id: `MSF-${Math.floor(100000 + Math.random() * 900000)}`,
      destinationName: body.destinationName.trim(),
      packageTitle: body.packageTitle || `${body.destinationName} Curated Escape`,
      checkIn: body.checkIn || '',
      checkOut: body.checkOut || '',
      travelers: Math.max(1, Math.min(20, Math.round(Number(body.travelers) || 2))),
      totalPriceInr: Math.round(safePrice),
      guestName: body.guestName.trim(),
      guestEmail: cleanEmail,
      createdAt: new Date().toISOString(),
    };
    return jsonResponse({ booking: record }, 201);
  }

  if (method === 'POST' && cleanPath === '/newsletter') {
    const body = (await req.json()) as { email?: string };
    const cleanEmail = (body.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return jsonResponse({ error: 'Please enter a valid email address.' }, 400);
    }
    return jsonResponse({ subscribed: true, email: cleanEmail }, 201);
  }

  if (method === 'GET' && cleanPath === '/auth/me') {
    const session = await getSessionFromRequest(req);
    return jsonResponse({ user: session });
  }

  if (method === 'POST' && cleanPath === '/auth/logout') {
    return jsonResponse({ ok: true });
  }

  if (method === 'POST' && cleanPath === '/auth') {
    const body = (await req.json()) as {
      name?: string;
      email?: string;
      password?: string;
      mode?: 'login' | 'signup';
    };
    const cleanEmail = (body.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return jsonResponse({ error: 'Please enter a valid email address.' }, 400);
    }
    if (!body.password || body.password.length < 6) {
      return jsonResponse(
        { error: 'Password must be at least 6 characters.' },
        400
      );
    }
    const name = body.name?.trim() || cleanEmail.split('@')[0] || 'Traveler';
    const token = signToken({ name, email: cleanEmail });
    return jsonResponse({ user: { name, email: cleanEmail }, token }, body.mode === 'signup' ? 201 : 200);
  }

  return jsonResponse({ error: 'Endpoint not found.' }, 404);
};
