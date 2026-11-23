import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  ImageOff,
  Images,
  Loader2,
  MapPin,
  Navigation,
  Search,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { formatINR } from '../data/travelData.ts';
import { INDIA_STATES_AND_UTS, STARTING_CITIES } from '../data/indianCities.ts';
import type {
  IndiaCategory,
  IndiaDestination,
  IndiaRegion,
  StudentFinderState,
  VerificationStatus,
} from '../types.ts';

interface SuggestItem {
  id: string;
  name: string;
  state: string;
  district?: string;
  category: string;
}

interface IndiaDestinationsDirectoryProps {
  destinations: IndiaDestination[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  selectedState: string;
  selectedRegion: IndiaRegion;
  selectedVerification: 'All' | VerificationStatus;
  studentFriendlyOnly: boolean;
  finder: StudentFinderState;
  onSearchQueryChange: (q: string) => void;
  onStateChange: (state: string) => void;
  onRegionChange: (region: IndiaRegion) => void;
  onVerificationChange: (v: 'All' | VerificationStatus) => void;
  onStudentFriendlyChange: (val: boolean) => void;
  onCategoryChange: (cat: IndiaCategory) => void;
  onPageChange: (nextPage: number) => void;
  onResetAll: () => void;
  onExploreDestination: (id: string) => void;
}

const REGIONS: IndiaRegion[] = [
  'All',
  'North',
  'South',
  'East',
  'West',
  'Central',
  'Northeast',
];

const CATEGORIES: IndiaCategory[] = [
  'All',
  'Mountains',
  'Beaches',
  'Waterfalls',
  'Lakes',
  'Forts',
  'Heritage',
  'Temples',
  'Wildlife',
  'Adventure',
  'Spiritual',
  'Hidden Gems',
];

const VerificationBadge: React.FC<{ status: VerificationStatus }> = ({
  status,
}) => {
  if (status === 'Verified') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/85 text-emerald-100 backdrop-blur-sm border border-emerald-400/30">
        <BadgeCheck className="w-3.5 h-3.5 text-emerald-300" />
        Verified
      </span>
    );
  }
  if (status === 'Needs Review') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-950/85 text-amber-100 backdrop-blur-sm border border-amber-400/30">
        <AlertCircle className="w-3.5 h-3.5 text-amber-300" />
        Needs Review
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-stone-900/85 text-stone-200 backdrop-blur-sm border border-white/20">
      <ShieldAlert className="w-3.5 h-3.5 text-stone-300" />
      Unverified
    </span>
  );
};

const DestinationCard: React.FC<{
  dest: IndiaDestination;
  startCityName: string | null;
  onExplore: (id: string) => void;
}> = ({ dest, startCityName, onExplore }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [brokenUrls, setBrokenUrls] = useState<Record<string, boolean>>({});

  const validPhotos = (dest.gallery || []).filter(
    (p) => p.imageUrl && !brokenUrls[p.imageUrl]
  );
  const activePhoto = validPhotos[activeIdx] ?? validPhotos[0] ?? null;

  const perPersonCost =
    dest.estimatedBreakdown?.perPersonTotalInr ??
    dest.budget.estimatedDailyStudentCostInr;

  const handleImgError = (url: string) => {
    setBrokenUrls((prev) => ({ ...prev, [url]: true }));
    setActiveIdx(0);
  };

  return (
    <article className="group bg-white rounded-[26px] border border-black/6 overflow-hidden shadow-[0_8px_28px_rgba(20,23,20,0.04)] hover:shadow-[0_18px_44px_rgba(20,23,20,0.09)] transition-all duration-300 flex flex-col">
      {/* Main Cover Photo or Photo Unavailable */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#ebe5da]">
        {activePhoto ? (
          <img
            src={activePhoto.imageUrl}
            alt={`${dest.name}, ${dest.state} — ${activePhoto.title}`}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => handleImgError(activePhoto.imageUrl)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#5a6159] p-6 text-center bg-[#ebe5da]">
            <ImageOff className="w-8 h-8 mb-2 opacity-60" />
            <p className="text-sm font-semibold text-[#141714]">
              Photo unavailable
            </p>
            <p className="text-xs text-[#5a6159] mt-1">
              No verified image available yet for {dest.name}
            </p>
          </div>
        )}

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent pointer-events-none"
        />

        {/* Top Badges: Verification + Category */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2">
          <VerificationBadge status={dest.verificationStatus} />
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/90 text-[#141714] shadow-sm">
            {dest.category}
          </span>
        </div>

        {/* Bottom Caption & Photo Count */}
        <div className="absolute bottom-3.5 left-4 right-4 flex items-end justify-between gap-3 text-white">
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-white/85 truncate">
              {dest.state} · {dest.district}
            </p>
            <p className="text-xs font-semibold truncate">
              {activePhoto ? activePhoto.title : 'Photo unavailable'}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono tabular-nums text-white/95 shrink-0 bg-black/35 px-2 py-0.5 rounded-full">
            <Images className="w-3 h-3" />
            {validPhotos.length}
          </span>
        </div>
      </div>

      {/* 3–6 Photo Thumbnail Strip */}
      {validPhotos.length > 1 && (
        <div className="px-4 pt-3 flex items-center gap-1.5">
          {validPhotos.slice(0, 5).map((photo, idx) => {
            const isCurrent = idx === activeIdx;
            return (
              <button
                key={`${photo.id}-${idx}`}
                type="button"
                onClick={() => setActiveIdx(idx)}
                aria-label={`Preview ${photo.title}`}
                className={`relative flex-1 h-11 rounded-lg overflow-hidden cursor-pointer transition-all ${
                  isCurrent
                    ? 'ring-2 ring-[#1d4738] ring-offset-1 opacity-100'
                    : 'opacity-65 hover:opacity-100'
                }`}
              >
                <img
                  src={photo.thumbUrl || photo.imageUrl}
                  alt={photo.title}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={() => handleImgError(photo.imageUrl)}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Card Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-[#5a6159] mb-1.5">
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#1d4738]" />
              {dest.idealDuration}
            </span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{dest.bestSeason}</span>
          </div>

          <h3 className="font-editorial text-xl sm:text-2xl font-semibold text-[#141714] mb-2 leading-snug">
            {dest.name}
          </h3>

          <p className="text-sm text-[#5a6159] leading-relaxed line-clamp-3">
            {dest.description}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {dest.distanceKm !== null && dest.distanceKm !== undefined && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-[#e7ede9] text-[#1d4738]">
                <Navigation className="w-3 h-3" />
                {dest.distanceKm} km{startCityName ? ` from ${startCityName}` : ''}
              </span>
            )}
            {dest.studentFriendly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#f7f5f0] text-[#141714] border border-black/8">
                <Sparkles className="w-3 h-3 text-[#1d4738]" />
                Student Budget
              </span>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-black/8 flex items-center justify-between gap-3">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#5a6159] block">
              Est. Student Budget
            </span>
            <span className="font-mono tabular-nums text-lg font-bold text-[#141714]">
              {formatINR(perPersonCost)}
            </span>
            <span className="text-[11px] text-[#5a6159] ml-1">/ person</span>
          </div>

          <button
            type="button"
            onClick={() => onExplore(dest.id)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold bg-[#f7f5f0] hover:bg-[#1d4738] text-[#141714] hover:text-white border border-black/10 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>Explore</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
};

export const IndiaDestinationsDirectory: React.FC<IndiaDestinationsDirectoryProps> = ({
  destinations,
  total,
  page,
  totalPages,
  loading,
  error,
  searchQuery,
  selectedState,
  selectedRegion,
  selectedVerification,
  studentFriendlyOnly,
  finder,
  onSearchQueryChange,
  onStateChange,
  onRegionChange,
  onVerificationChange,
  onStudentFriendlyChange,
  onCategoryChange,
  onPageChange,
  onResetAll,
  onExploreDestination,
}) => {
  const [suggestions, setSuggestions] = useState<SuggestItem[]>([]);
  const [showSuggest, setShowSuggest] = useState(false);

  const startCityObj = STARTING_CITIES.find((c) => c.id === finder.startCity);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSuggestions([]);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const { fetchDestinationSuggestionsApi } = await import(
          '../utils/apiClient.ts'
        );
        const list = await fetchDestinationSuggestionsApi(trimmed);
        if (!cancelled) setSuggestions(list);
      } catch {
        // ignore autocomplete network hiccups
      }
    }, 180);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [searchQuery]);

  return (
    <section
      id="destinations"
      className="mx-auto max-w-[1280px] px-4 sm:px-6 py-12 lg:py-16 scroll-mt-24"
    >
      <div id="explore" className="scroll-mt-24" />

      {/* Section Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1d4738] mb-2">
            All 28 States &amp; 8 Union Territories · Real Wikimedia Photographs
          </p>
          <h2 className="font-sans text-3xl sm:text-4xl font-semibold tracking-tight text-[#141714]">
            Explore{' '}
            <em className="font-editorial italic font-medium">
              500+ Indian Destinations
            </em>
          </h2>
          <p className="text-sm sm:text-base text-[#5a6159] mt-2 max-w-2xl">
            Browse verified heritage sites, sacred temples, hill stations,
            beaches, waterfalls, and hidden student-friendly gems with real
            photographs and itemized cost estimates.
          </p>
        </div>

        {/* Region Filter Tabs */}
        <div
          className="inline-flex flex-wrap items-center gap-1 p-1 rounded-2xl sm:rounded-full bg-[#ebe5da]"
          role="tablist"
          aria-label="Filter destinations by Indian region"
        >
          {REGIONS.map((region) => {
            const active = selectedRegion === region;
            return (
              <button
                key={region}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onRegionChange(region)}
                className={`px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-all ${
                  active
                    ? 'bg-[#141714] text-white shadow-sm'
                    : 'text-[#4a5149] hover:text-[#141714]'
                }`}
              >
                {region === 'All' ? 'All India' : `${region} India`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search + Advanced Filter Bar */}
      <div className="bg-white rounded-3xl border border-black/8 p-4 sm:p-5 mb-8 shadow-[0_6px_24px_rgba(20,23,20,0.03)] space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search Input with Autocomplete Suggestions */}
          <div className="lg:col-span-5 relative">
            <div className="flex items-center gap-2 bg-[#f7f5f0] border border-black/10 rounded-2xl px-3.5 py-2.5">
              <Search className="w-4 h-4 text-[#1d4738] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setShowSuggest(true)}
                onBlur={() => window.setTimeout(() => setShowSuggest(false), 180)}
                onChange={(e) => {
                  onSearchQueryChange(e.target.value);
                  setShowSuggest(true);
                }}
                placeholder="Search Rishikesh, Hampi, waterfalls, district, or state..."
                aria-label="Search 500+ Indian destinations"
                className="w-full bg-transparent text-sm text-[#141714] placeholder:text-[#7c837a] focus:outline-none"
              />
            </div>

            {showSuggest && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white rounded-2xl border border-black/10 shadow-xl overflow-hidden">
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      setShowSuggest(false);
                      onExploreDestination(s.id);
                    }}
                    className="w-full px-4 py-2.5 text-left hover:bg-[#f7f5f0] flex items-center justify-between gap-3 text-sm cursor-pointer border-b border-black/5 last:border-b-0"
                  >
                    <span className="font-semibold text-[#141714] truncate">
                      {s.name}
                    </span>
                    <span className="text-xs text-[#5a6159] shrink-0">
                      {s.state} · {s.category}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* State / UT Filter */}
          <div className="lg:col-span-3">
            <select
              value={selectedState}
              onChange={(e) => onStateChange(e.target.value)}
              aria-label="Filter by Indian State or Union Territory"
              className="w-full bg-[#f7f5f0] border border-black/10 rounded-2xl px-3.5 py-2.5 text-sm font-medium text-[#141714]"
            >
              <option value="All">All States &amp; UTs (36)</option>
              {INDIA_STATES_AND_UTS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="lg:col-span-2">
            <select
              value={finder.category}
              onChange={(e) => onCategoryChange(e.target.value as IndiaCategory)}
              aria-label="Filter by destination category"
              className="w-full bg-[#f7f5f0] border border-black/10 rounded-2xl px-3.5 py-2.5 text-sm font-medium text-[#141714]"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </div>

          {/* Verification Status Filter */}
          <div className="lg:col-span-2">
            <select
              value={selectedVerification}
              onChange={(e) =>
                onVerificationChange(
                  e.target.value as 'All' | VerificationStatus
                )
              }
              aria-label="Filter by verification status"
              className="w-full bg-[#f7f5f0] border border-black/10 rounded-2xl px-3.5 py-2.5 text-sm font-medium text-[#141714]"
            >
              <option value="All">All Statuses</option>
              <option value="Verified">Verified Only</option>
              <option value="Needs Review">Needs Review</option>
              <option value="Unverified">Unverified</option>
            </select>
          </div>
        </div>

        {/* Bottom Filter Summary Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-black/6 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 cursor-pointer font-semibold text-[#141714]">
              <input
                type="checkbox"
                checked={studentFriendlyOnly}
                onChange={(e) => onStudentFriendlyChange(e.target.checked)}
                className="rounded accent-[#1d4738] w-4 h-4 cursor-pointer"
              />
              <span>Student-Friendly Daily Cost (≤ ₹1,500/day)</span>
            </label>

            <span className="text-[#5a6159] inline-flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-[#1d4738]" />
              Showing <strong className="text-[#141714]">{total}</strong> places
              (Page {page} of {totalPages})
            </span>
          </div>

          <button
            type="button"
            onClick={onResetAll}
            className="text-xs font-semibold text-[#1d4738] hover:underline cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      </div>

      {/* Loading / Error / Empty / Grid States */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-black/6 p-14 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#1d4738] mx-auto mb-3" />
          <p className="font-editorial text-xl font-medium text-[#141714]">
            Loading verified Indian destinations...
          </p>
          <p className="text-xs text-[#5a6159] mt-1">
            Calculating real distances and student budget estimates
          </p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-3xl border border-rose-200 p-10 text-center">
          <p className="font-editorial text-2xl font-medium text-rose-900 mb-2">
            Could not load destinations
          </p>
          <p className="text-sm text-[#5a6159] mb-4">{error}</p>
          <button
            type="button"
            onClick={onResetAll}
            className="bg-[#1d4738] text-white text-sm font-semibold px-5 py-2.5 rounded-full cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : destinations.length === 0 ? (
        <div className="bg-white rounded-3xl border border-black/8 p-12 text-center">
          <MapPin className="w-8 h-8 text-[#1d4738] mx-auto mb-3 opacity-70" />
          <p className="font-editorial text-2xl font-medium text-[#141714] mb-2">
            No Indian destinations fit all active filters
          </p>
          <p className="text-sm text-[#5a6159] max-w-md mx-auto mb-5">
            Try increasing your student budget limit, expanding distance beyond{' '}
            {finder.maxDistanceKm ? `${finder.maxDistanceKm} km` : 'current range'},
            or resetting filters.
          </p>
          <button
            type="button"
            onClick={onResetAll}
            className="bg-[#1d4738] text-white text-sm font-semibold px-5 py-2.5 rounded-full cursor-pointer"
          >
            View All Destinations
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {destinations.map((dest) => (
              <DestinationCard
                key={dest.id}
                dest={dest}
                startCityName={startCityObj?.name ?? null}
                onExplore={onExploreDestination}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-xs font-semibold bg-white border border-black/10 text-[#141714] disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <span className="px-4 py-2 text-xs font-mono font-semibold text-[#5a6159]">
                Page {page} of {totalPages} ({total} destinations)
              </span>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-xs font-semibold bg-white border border-black/10 text-[#141714] disabled:opacity-40 cursor-pointer"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};
