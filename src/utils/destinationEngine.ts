import { haversineDistanceKm, STARTING_CITIES } from '../data/indianCities.ts';
import { calculateStudentBudgetBreakdown } from './budgetCalculator.ts';
import type {
  DestinationsReportStats,
  IndiaDestination,
  TravelMode,
} from '../types.ts';

export interface DestinationsQueryParams {
  q?: string;
  state?: string;
  region?: string;
  category?: string;
  budgetTier?: string;
  maxBudget?: number | null;
  days?: number;
  travelers?: number;
  travelMode?: TravelMode;
  season?: string;
  startCity?: string;
  maxDistanceKm?: number | null;
  verificationStatus?: string;
  studentFriendly?: boolean;
  weekendTrip?: boolean;
  oneDayTrip?: boolean;
  groupTrip?: boolean;
  maxDurationDays?: number | null;
  sort?: string;
  page?: number;
  limit?: number;
}

const MONTH_INDEX: Record<string, number> = {
  january: 0,
  jan: 0,
  february: 1,
  feb: 1,
  march: 2,
  mar: 2,
  april: 3,
  apr: 3,
  may: 4,
  june: 5,
  jun: 5,
  july: 6,
  jul: 6,
  august: 7,
  aug: 7,
  september: 8,
  sep: 8,
  sept: 8,
  october: 9,
  oct: 9,
  november: 10,
  nov: 10,
  december: 11,
  dec: 11,
};

export function computeDbStats(
  destinations: IndiaDestination[]
): DestinationsReportStats {
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

export function buildFullStatsPayload(
  destinations: IndiaDestination[],
  generatedAt: string
) {
  const byState: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  const byRegion: Record<string, number> = {};

  for (const d of destinations) {
    byState[d.state] = (byState[d.state] || 0) + 1;
    byCategory[d.category] = (byCategory[d.category] || 0) + 1;
    byRegion[d.region] = (byRegion[d.region] || 0) + 1;
  }

  return {
    generatedAt,
    ...computeDbStats(destinations),
    byState,
    byCategory,
    byRegion,
  };
}

export function matchesSeasonMonth(
  bestSeason: string,
  monthOrSeason: string
): boolean {
  const query = monthOrSeason.trim().toLowerCase();
  if (!query || query === 'all') return true;

  const seasonLower = bestSeason.toLowerCase();
  if (
    seasonLower.includes('year-round') ||
    seasonLower.includes('year round') ||
    seasonLower.includes('all year') ||
    seasonLower.includes('all seasons')
  ) {
    return true;
  }

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
    return seasonLower.includes(query);
  }

  const segments = seasonLower.split(/[,;]/);
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

export function parseBudgetTierMax(
  tier: string,
  customMax: number | null
): number | null {
  switch (tier) {
    case 'under-500':
      return 500;
    case '500-1000':
      return 1000;
    case '1000-2000':
      return 2000;
    case '2000-3500':
      return 3500;
    case '3500-5000':
      return 5000;
    case 'custom':
      return customMax && customMax > 0 ? customMax : null;
    default:
      return customMax && customMax > 0 ? customMax : null;
  }
}

export function queryDestinationsList(
  allDestinations: IndiaDestination[],
  params: DestinationsQueryParams
) {
  const q = (params.q || '').trim().toLowerCase();
  const qTokens = q ? q.split(/[\s,&/+-]+/).filter((t) => t.length > 0) : [];
  const state = params.state || 'All';
  const region = params.region || 'All';
  const category = params.category || 'All';
  const budgetTier = params.budgetTier || 'all';
  const customMaxBudget = params.maxBudget ?? null;
  const days = Math.max(1, Math.min(15, Number(params.days) || 2));
  const travelers = Math.max(1, Math.min(20, Number(params.travelers) || 1));
  const travelMode: TravelMode = params.travelMode || 'Train';
  const season = params.season || 'All';
  const startCityId = params.startCity || '';
  const maxDistanceKm = params.maxDistanceKm ?? null;
  const verificationStatus = params.verificationStatus || 'All';
  const studentFriendly = Boolean(params.studentFriendly);
  const weekendTrip = Boolean(params.weekendTrip);
  const oneDayTrip = Boolean(params.oneDayTrip);
  const groupTrip = Boolean(params.groupTrip);
  const maxDurationDays = params.maxDurationDays ?? null;
  const sort = params.sort || 'best-match';
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.max(1, Math.min(48, Number(params.limit) || 18));

  const startCity = STARTING_CITIES.find(
    (c) =>
      c.id === startCityId ||
      c.name.toLowerCase() === startCityId.toLowerCase()
  );

  const budgetMax = parseBudgetTierMax(budgetTier, customMaxBudget);

  const enriched = allDestinations.map((dest) => {
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
    if (weekendTrip) {
      if (dest.distanceKm !== null) {
        if (dest.distanceKm > 450 && !dest.weekendTrip) return false;
        if (dest.distanceKm > 600) return false;
      } else if (!dest.weekendTrip && dest.recommendedDays > 3) {
        return false;
      }
    }
    if (oneDayTrip) {
      if (dest.distanceKm !== null) {
        if (dest.distanceKm > 180) return false;
      } else if (!dest.oneDayTrip && dest.recommendedDays > 1) {
        return false;
      }
    }
    if (groupTrip && !dest.groupTrip) return false;
    if (maxDurationDays && dest.recommendedDays > maxDurationDays) return false;

    if (season !== 'All' && !matchesSeasonMonth(dest.bestSeason, season)) {
      return false;
    }

    if (
      maxDistanceKm &&
      dest.distanceKm !== null &&
      dest.distanceKm > maxDistanceKm
    ) {
      return false;
    }

    // Strict affordability guarantee: never return a destination above budgetMax,
    // while allowing cheaper affordable destinations within budgetMax so students aren't shown 0 results.
    const perPerson = dest.estimatedBreakdown.perPersonTotalInr;
    if (budgetMax !== null && perPerson > budgetMax) return false;

    if (qTokens.length > 0) {
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

      const directMatch = haystack.includes(q);
      const tokenMatch = qTokens.every((tok) => haystack.includes(tok));
      if (!directMatch && !tokenMatch) return false;
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

    const score = (d: typeof a) => {
      let s = d.popularityScore;
      if (q && d.name.toLowerCase().includes(q)) s += 120;
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

  return {
    total,
    page: safePage,
    totalPages,
    limit,
    items,
    stats: computeDbStats(allDestinations),
  };
}

export function suggestDestinations(
  allDestinations: IndiaDestination[],
  rawQ: string
) {
  const q = rawQ.trim().toLowerCase();
  if (!q) {
    return allDestinations.slice(0, 8).map((d) => ({
      id: d.id,
      name: d.name,
      state: d.state,
      district: d.district,
      category: d.category,
    }));
  }

  const tokens = q.split(/[\s,&/+-]+/).filter((t) => t.length > 0);
  return allDestinations
    .filter((d) => {
      const hay = `${d.name} ${d.state} ${d.district} ${d.category}`.toLowerCase();
      return hay.includes(q) || tokens.every((t) => hay.includes(t));
    })
    .slice(0, 8)
    .map((d) => ({
      id: d.id,
      name: d.name,
      state: d.state,
      district: d.district,
      category: d.category,
    }));
}

export function getDestinationDetail(
  allDestinations: IndiaDestination[],
  idOrSlug: string,
  params: {
    days?: number;
    travelers?: number;
    travelMode?: TravelMode;
    startCity?: string;
  }
) {
  const dest = allDestinations.find(
    (d) => d.id === idOrSlug || d.slug === idOrSlug
  );
  if (!dest) return null;

  const days = Math.max(
    1,
    Math.min(15, Number(params.days) || dest.recommendedDays || 2)
  );
  const travelers = Math.max(1, Math.min(20, Number(params.travelers) || 1));
  const travelMode: TravelMode = params.travelMode || 'Train';
  const startCity = STARTING_CITIES.find((c) => c.id === params.startCity);

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

  const nearbyDestinations = allDestinations
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

  return {
    destination: {
      ...dest,
      distanceKm,
      estimatedBreakdown,
    },
    nearbyDestinations,
  };
}
