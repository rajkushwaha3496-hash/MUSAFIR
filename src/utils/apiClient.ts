import {
  auth,
  fetchDestinationOverridesFromFirestore,
  saveDestinationOverrideToFirestore,
  type DestinationOverrideDoc,
} from '../firebase.ts';
import type {
  BookingRecord,
  DestinationMapPoint,
  DestinationsReportStats,
  IndiaDestination,
  TravelMode,
  UserSession,
  VerificationStatus,
} from '../types.ts';
import {
  buildFullStatsPayload,
  getDestinationDetail,
  queryDestinationMapPoints,
  queryDestinationsList,
  suggestDestinations,
  type DestinationsQueryParams,
} from './destinationEngine.ts';

interface StaticDbCache {
  generatedAt: string;
  destinations: IndiaDestination[];
}

let staticDbPromise: Promise<StaticDbCache> | null = null;
let cachedDestinations: IndiaDestination[] | null = null;
let cachedGeneratedAt = new Date().toISOString();

// In-memory auth session token for server fallback (never stored in localStorage)
let memoryAuthToken: string | null = null;

export function setMemoryAuthToken(token: string | null): void {
  memoryAuthToken = token;
}

export function getMemoryAuthToken(): string | null {
  return memoryAuthToken;
}

function applyOverride(
  dest: IndiaDestination,
  ovr: DestinationOverrideDoc
): IndiaDestination {
  const stay = Number(ovr.stayPerNightInr ?? dest.budget.stayPerNightInr);
  const food = Number(ovr.foodPerDayInr ?? dest.budget.foodPerDayInr);
  const local = Number(
    ovr.localTransportPerDayInr ?? dest.budget.localTransportPerDayInr
  );
  const entry = Number(ovr.entryFeeInr ?? dest.budget.entryFeeInr);
  return {
    ...dest,
    verificationStatus: ovr.verificationStatus || dest.verificationStatus,
    officialTourismUrl: ovr.officialTourismUrl || dest.officialTourismUrl,
    description: ovr.description || dest.description,
    bestSeason: ovr.bestSeason || dest.bestSeason,
    safetyInfo: ovr.safetyInfo || dest.safetyInfo,
    lastVerifiedDate:
      ovr.verificationStatus === 'Unverified'
        ? null
        : new Date().toISOString().slice(0, 10),
    budget: {
      ...dest.budget,
      stayPerNightInr: stay,
      foodPerDayInr: food,
      localTransportPerDayInr: local,
      entryFeeInr: entry,
      estimatedDailyStudentCostInr: stay + food + local + entry,
    },
  };
}

async function loadStaticDestinationsDb(): Promise<StaticDbCache> {
  if (cachedDestinations) {
    return { generatedAt: cachedGeneratedAt, destinations: cachedDestinations };
  }
  if (!staticDbPromise) {
    staticDbPromise = (async () => {
      const res = await fetch('/data/destinations-db.json');
      if (!res.ok) {
        throw new Error('Could not load destinations dataset.');
      }
      const parsed = (await res.json()) as {
        generatedAt?: string;
        destinations?: IndiaDestination[];
      };
      const base = parsed.destinations || [];
      const overrides = await fetchDestinationOverridesFromFirestore();
      const merged = base.map((d) =>
        overrides[d.id] ? applyOverride(d, overrides[d.id]) : d
      );
      cachedDestinations = merged;
      cachedGeneratedAt = parsed.generatedAt || new Date().toISOString();
      return { generatedAt: cachedGeneratedAt, destinations: merged };
    })();
  }
  return staticDbPromise;
}

async function tryApiJson<T>(
  url: string,
  init?: RequestInit
): Promise<T | null> {
  try {
    const res = await fetch(url, init);
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return null;
    }
    const payload = (await res.json()) as T & { error?: string };
    if (!res.ok) {
      throw new Error(payload.error || `Request failed (${res.status})`);
    }
    return payload;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw err;
    }
    if (err instanceof Error && err.message.startsWith('Request failed')) {
      throw err;
    }
    return null;
  }
}

function buildDestinationParams(query: DestinationsQueryParams): URLSearchParams {
  const params = new URLSearchParams();
  if (query.q) params.set('q', query.q);
  if (query.state && query.state !== 'All') params.set('state', query.state);
  if (query.region && query.region !== 'All') params.set('region', query.region);
  if (query.category && query.category !== 'All') {
    params.set('category', query.category);
  }
  if (query.budgetTier && query.budgetTier !== 'all') {
    params.set('budgetTier', query.budgetTier);
  }
  if (query.maxBudget) params.set('maxBudget', String(query.maxBudget));
  if (query.days) params.set('days', String(query.days));
  if (query.travelers) params.set('travelers', String(query.travelers));
  if (query.travelMode) params.set('travelMode', query.travelMode);
  if (query.season && query.season !== 'All') params.set('season', query.season);
  if (query.startCity) params.set('startCity', query.startCity);
  if (query.userLat !== null && query.userLat !== undefined) {
    params.set('userLat', String(query.userLat));
  }
  if (query.userLon !== null && query.userLon !== undefined) {
    params.set('userLon', String(query.userLon));
  }
  if (query.maxDistanceKm) {
    params.set('maxDistanceKm', String(query.maxDistanceKm));
  }
  if (query.verificationStatus && query.verificationStatus !== 'All') {
    params.set('verificationStatus', query.verificationStatus);
  }
  if (query.studentFriendly) params.set('studentFriendly', 'true');
  if (query.weekendTrip) params.set('weekendTrip', 'true');
  if (query.oneDayTrip) params.set('oneDayTrip', 'true');
  if (query.groupTrip) params.set('groupTrip', 'true');
  if (query.sort) params.set('sort', query.sort);
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  return params;
}

export async function fetchDestinationsApi(
  query: DestinationsQueryParams,
  signal?: AbortSignal
): Promise<{
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  items: IndiaDestination[];
  stats: DestinationsReportStats;
}> {
  const params = buildDestinationParams(query);

  const apiResult = await tryApiJson<{
    total: number;
    page: number;
    totalPages: number;
    limit: number;
    items: IndiaDestination[];
    stats: DestinationsReportStats;
  }>(`/api/destinations?${params.toString()}`, { signal });

  if (apiResult && Array.isArray(apiResult.items) && apiResult.stats?.totalDestinations > 0) {
    return apiResult;
  }

  const staticDb = await loadStaticDestinationsDb();
  return queryDestinationsList(staticDb.destinations, query);
}

export async function fetchDestinationMapPointsApi(
  query: DestinationsQueryParams,
  signal?: AbortSignal
): Promise<DestinationMapPoint[]> {
  const params = buildDestinationParams(query);
  const apiResult = await tryApiJson<{ points: DestinationMapPoint[] }>(
    `/api/destinations/map-points?${params.toString()}`,
    { signal }
  );
  if (apiResult && Array.isArray(apiResult.points)) {
    return apiResult.points;
  }
  const staticDb = await loadStaticDestinationsDb();
  return queryDestinationMapPoints(staticDb.destinations, query);
}

export async function fetchDestinationsStatsApi() {
  const apiResult = await tryApiJson<
    DestinationsReportStats & {
      generatedAt: string;
      byState: Record<string, number>;
      byCategory: Record<string, number>;
      byRegion: Record<string, number>;
    }
  >('/api/destinations/stats');

  if (apiResult && apiResult.totalDestinations > 0) {
    return apiResult;
  }

  const staticDb = await loadStaticDestinationsDb();
  return buildFullStatsPayload(staticDb.destinations, staticDb.generatedAt);
}

export async function fetchDestinationSuggestionsApi(q: string) {
  const apiResult = await tryApiJson<{
    suggestions: Array<{
      id: string;
      name: string;
      state: string;
      district?: string;
      category: string;
    }>;
  }>(`/api/destinations/suggest?q=${encodeURIComponent(q)}`);

  if (apiResult && Array.isArray(apiResult.suggestions)) {
    return apiResult.suggestions;
  }

  const staticDb = await loadStaticDestinationsDb();
  return suggestDestinations(staticDb.destinations, q);
}

export async function fetchDestinationDetailApi(
  idOrSlug: string,
  params: {
    startCity?: string;
    userLat?: number | null;
    userLon?: number | null;
    days?: number;
    travelers?: number;
    travelMode?: TravelMode;
  }
) {
  const sp = new URLSearchParams();
  if (params.startCity) sp.set('startCity', params.startCity);
  if (params.userLat !== null && params.userLat !== undefined) {
    sp.set('userLat', String(params.userLat));
  }
  if (params.userLon !== null && params.userLon !== undefined) {
    sp.set('userLon', String(params.userLon));
  }
  if (params.days) sp.set('days', String(params.days));
  if (params.travelers) sp.set('travelers', String(params.travelers));
  if (params.travelMode) sp.set('travelMode', params.travelMode);

  const apiResult = await tryApiJson<{
    destination: IndiaDestination;
    nearbyDestinations: Array<{
      id: string;
      slug: string;
      name: string;
      state: string;
      category: string;
      coverPhoto: IndiaDestination['coverPhoto'];
      verificationStatus: VerificationStatus;
      distanceKm: number;
    }>;
  }>(`/api/destinations/${encodeURIComponent(idOrSlug)}?${sp.toString()}`);

  if (apiResult && apiResult.destination) {
    return apiResult;
  }

  const staticDb = await loadStaticDestinationsDb();
  const detail = getDestinationDetail(staticDb.destinations, idOrSlug, params);
  if (!detail) {
    throw new Error('Destination not found.');
  }
  return detail;
}

export async function updateDestinationAdminApi(
  id: string,
  payload: {
    verificationStatus: VerificationStatus;
    officialTourismUrl: string;
    description: string;
    bestSeason: string;
    stayPerNightInr: number;
    foodPerDayInr: number;
    localTransportPerDayInr: number;
    entryFeeInr: number;
    safetyInfo: string;
  }
): Promise<IndiaDestination> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (auth.currentUser) {
    const idToken = await auth.currentUser.getIdToken();
    headers.Authorization = `Bearer ${idToken}`;
  } else if (memoryAuthToken) {
    headers.Authorization = `Bearer ${memoryAuthToken}`;
  }

  if (auth.currentUser && auth.currentUser.emailVerified) {
    await saveDestinationOverrideToFirestore({
      destinationId: id,
      ...payload,
    });
  }

  const res = await fetch(`/api/destinations/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(payload),
  });

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const data = (await res.json()) as {
      destination?: IndiaDestination;
      error?: string;
    };
    if (!res.ok || !data.destination) {
      throw new Error(data.error || 'Authentication required to update record.');
    }
    if (cachedDestinations) {
      cachedDestinations = cachedDestinations.map((d) =>
        d.id === id ? data.destination! : d
      );
    }
    return data.destination;
  }

  // Pure static fallback: update cached destinations if Firestore override succeeded
  if (auth.currentUser && auth.currentUser.emailVerified && cachedDestinations) {
    const existing = cachedDestinations.find((d) => d.id === id);
    if (existing) {
      const updated = applyOverride(existing, {
        destinationId: id,
        updatedByUid: auth.currentUser.uid,
        ...payload,
      });
      cachedDestinations = cachedDestinations.map((d) =>
        d.id === id ? updated : d
      );
      return updated;
    }
  }

  throw new Error('Sign in as an authenticated user to save updates.');
}

export async function fetchSessionFromServerApi(): Promise<UserSession | null> {
  try {
    const headers: Record<string, string> = {};
    if (memoryAuthToken) {
      headers.Authorization = `Bearer ${memoryAuthToken}`;
    }
    const res = await fetch('/api/auth/me', { headers });
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json') || !res.ok) return null;
    const data = (await res.json()) as { user?: UserSession | null };
    return data.user || null;
  } catch {
    return null;
  }
}

export async function logoutServerApi(): Promise<void> {
  memoryAuthToken = null;
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch {
    // non-blocking
  }
}

export async function submitBookingApi(payload: {
  destinationName: string;
  packageTitle: string;
  checkIn: string;
  checkOut: string;
  travelers: number;
  totalPriceInr: number;
  guestName: string;
  guestEmail: string;
}): Promise<BookingRecord> {
  const res = await fetch('/api/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(memoryAuthToken ? { Authorization: `Bearer ${memoryAuthToken}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    throw new Error('Booking service unavailable right now.');
  }
  const data = (await res.json()) as { booking?: BookingRecord; error?: string };
  if (!res.ok || !data.booking) {
    throw new Error(data.error || 'Could not complete reservation.');
  }
  return data.booking;
}
