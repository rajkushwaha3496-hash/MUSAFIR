import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  BadgeCheck,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  ImageOff,
  Images,
  Loader2,
  LocateFixed,
  Map as MapIcon,
  MapPin,
  MousePointerClick,
  Navigation,
  Search,
  ShieldAlert,
  Sparkles,
  X,
} from 'lucide-react';
import { formatINR } from '../data/travelData.ts';
import { INDIA_STATES_AND_UTS, STARTING_CITIES } from '../data/indianCities.ts';
import type {
  DestinationMapPoint,
  IndiaCategory,
  IndiaDestination,
  IndiaRegion,
  StudentFinderState,
  VerificationStatus,
} from '../types.ts';
import { IndiaDestinationsMap } from './IndiaDestinationsMap.tsx';

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
  userCoords: { lat: number; lon: number; label: string } | null;
  startLocationLabel: string;
  detectingLocation: boolean;
  locationError: string | null;
  locationNotice: string | null;
  pickingStartOnMap: boolean;
  mapPoints: DestinationMapPoint[];
  loadingMap: boolean;
  onStartCityChange: (cityId: string) => void;
  onDetectLocation: () => void;
  onClearGps: () => void;
  onTogglePickStartOnMap: () => void;
  onPickOriginCoords: (lat: number, lon: number, label?: string) => void;
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
  startLocationLabel: string | null;
  onExplore: (id: string) => void;
}> = ({ dest, startLocationLabel, onExplore }) => {
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
              {dest.district}, {dest.state}
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

          <h3 className="font-editorial text-xl sm:text-2xl font-semibold text-[#141714] mb-1.5 leading-snug">
            {dest.name}
          </h3>

          <p className="inline-flex items-center gap-1 text-xs font-medium text-[#1d4738] mb-2">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>
              {dest.district}, {dest.state} · {dest.region} India
            </span>
          </p>

          <p className="text-sm text-[#5a6159] leading-relaxed line-clamp-3">
            {dest.description}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {dest.distanceKm !== null && dest.distanceKm !== undefined && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-[#e7ede9] text-[#1d4738]">
                <Navigation className="w-3 h-3" />
                {dest.distanceKm} km
                {startLocationLabel ? ` from ${startLocationLabel}` : ''}
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

interface OriginOption {
  key: string;
  cityId?: string;
  name: string;
  subtitle: string;
  searchText: string;
  lat: number;
  lon: number;
}

const StartingLocationCombobox: React.FC<{
  options: OriginOption[];
  activeLabel: string;
  activeCityId: string;
  isCustomOrigin: boolean;
  onSelectCity: (cityId: string) => void;
  onSelectCustom: (lat: number, lon: number, label: string) => void;
}> = ({
  options,
  activeLabel,
  activeCityId,
  isCustomOrigin,
  onSelectCity,
  onSelectCustom,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 20);
    const onDocClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('mousedown', onDocClick);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const filtered = useMemo(() => {
    const tokens = query
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    if (tokens.length === 0) return options.slice(0, 80);
    return options
      .filter((opt) => tokens.every((tok) => opt.searchText.includes(tok)))
      .slice(0, 80);
  }, [options, query]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setQuery('');
          setOpen((prev) => !prev);
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Search and select starting location across India"
        className="inline-flex items-center justify-between gap-2 min-w-[230px] max-w-[300px] bg-white border border-black/12 hover:border-[#1d4738]/40 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold text-[#141714] cursor-pointer shadow-xs transition-colors"
      >
        <span className="inline-flex items-center gap-1.5 truncate">
          <Search className="w-3.5 h-3.5 text-[#1d4738] shrink-0" />
          <span className="truncate">{activeLabel}</span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-[#5a6159] shrink-0 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-[300px] sm:w-[360px] z-40 bg-white rounded-2xl border border-black/12 shadow-2xl overflow-hidden">
          <div className="p-2.5 border-b border-black/8 bg-[#f7f5f0]">
            <div className="flex items-center gap-2 bg-white border border-black/10 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-[#1d4738] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search any city, district, or state in India..."
                aria-label="Search all India starting locations"
                className="w-full bg-transparent text-xs sm:text-sm text-[#141714] placeholder:text-[#7c837a] focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear location search"
                  className="text-[#5a6159] hover:text-[#141714] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <p className="text-[11px] text-[#5a6159] mt-1.5 px-1 flex items-center justify-between">
              <span>All 28 States &amp; 8 UTs ({options.length} India hubs)</span>
              {query && <span>Showing {filtered.length}</span>}
            </p>
          </div>

          <ul
            role="listbox"
            className="max-h-72 overflow-y-auto divide-y divide-black/5"
          >
            {filtered.length === 0 ? (
              <li className="px-4 py-6 text-center text-xs text-[#5a6159]">
                No matching Indian city or district found for &ldquo;{query}
                &rdquo;. Try &ldquo;Pick Start on Map&rdquo; to pin any exact
                place.
              </li>
            ) : (
              filtered.map((opt) => {
                const isActive =
                  !isCustomOrigin && Boolean(opt.cityId && opt.cityId === activeCityId);
                return (
                  <li key={opt.key}>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        if (opt.cityId) {
                          onSelectCity(opt.cityId);
                        } else {
                          onSelectCustom(opt.lat, opt.lon, opt.name);
                        }
                      }}
                      className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between gap-2.5 hover:bg-[#f7f5f0] cursor-pointer transition-colors ${
                        isActive ? 'bg-[#e7ede9]/60' : ''
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-[#141714] truncate">
                          {opt.name}
                        </p>
                        <p className="text-[11px] text-[#5a6159] truncate">
                          {opt.subtitle}
                        </p>
                      </div>
                      {isActive && (
                        <Check className="w-4 h-4 text-[#1d4738] shrink-0" />
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
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
  userCoords,
  startLocationLabel,
  detectingLocation,
  locationError,
  locationNotice,
  pickingStartOnMap,
  mapPoints,
  loadingMap,
  onStartCityChange,
  onDetectLocation,
  onClearGps,
  onTogglePickStartOnMap,
  onPickOriginCoords,
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
  const [showMap, setShowMap] = useState(true);
  const knownOriginCatalogRef = useRef<Record<string, OriginOption>>({});

  const allOriginOptions = useMemo(() => {
    const dict = knownOriginCatalogRef.current;
    for (const city of STARTING_CITIES) {
      const key = `${city.name.toLowerCase()}|${city.state.toLowerCase()}`;
      dict[key] = {
        key,
        cityId: city.id,
        name: city.name,
        subtitle: city.state,
        searchText: `${city.name} ${city.state}`.toLowerCase(),
        lat: city.lat,
        lon: city.lon,
      };
    }
    for (const pt of mapPoints) {
      const key = `${pt.name.toLowerCase()}|${pt.state.toLowerCase()}`;
      if (!dict[key]) {
        const sub =
          pt.district && pt.district.toLowerCase() !== pt.name.toLowerCase()
            ? `${pt.district}, ${pt.state}`
            : pt.state;
        dict[key] = {
          key,
          name: pt.name,
          subtitle: sub,
          searchText: `${pt.name} ${pt.district} ${pt.state} ${pt.region}`.toLowerCase(),
          lat: pt.lat,
          lon: pt.lon,
        };
      }
      if (pt.district) {
        const distKey = `${pt.district.toLowerCase()}|${pt.state.toLowerCase()}`;
        if (!dict[distKey]) {
          dict[distKey] = {
            key: distKey,
            name: pt.district,
            subtitle: `${pt.district} District, ${pt.state}`,
            searchText: `${pt.district} ${pt.state} ${pt.region}`.toLowerCase(),
            lat: pt.lat,
            lon: pt.lon,
          };
        }
      }
    }
    return Object.values(dict);
  }, [mapPoints]);

  const startCityObj =
    STARTING_CITIES.find((c) => c.id === finder.startCity) || STARTING_CITIES[0];
  const originCoords = userCoords
    ? userCoords
    : {
        lat: startCityObj.lat,
        lon: startCityObj.lon,
        label: startCityObj.name,
      };

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

      {/* Search + Starting Location + Advanced Filter Bar */}
      <div className="bg-white rounded-3xl border border-black/8 p-4 sm:p-5 mb-6 shadow-[0_6px_24px_rgba(20,23,20,0.03)] space-y-4">
        {/* User Starting Location Row */}
        <div className="bg-[#f7f5f0] rounded-2xl p-3.5 sm:p-4 border border-black/8 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#1d4738] text-white grid place-items-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#1d4738]">
                Where are you starting your trip from?
              </p>
              <p className="text-xs text-[#5a6159]">
                Distances on the map and destination cards are measured from{' '}
                <strong className="text-[#141714]">{originCoords.label}</strong>{' '}
                <span className="font-mono text-[11px]">
                  ({originCoords.lat.toFixed(2)}° N,{' '}
                  {originCoords.lon.toFixed(2)}° E)
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <StartingLocationCombobox
              options={allOriginOptions}
              activeLabel={
                userCoords
                  ? `${userCoords.label}`
                  : `${startCityObj.name}, ${startCityObj.state}`
              }
              activeCityId={finder.startCity}
              isCustomOrigin={Boolean(userCoords)}
              onSelectCity={onStartCityChange}
              onSelectCustom={(lat, lon, label) =>
                onPickOriginCoords(lat, lon, label)
              }
            />

            <button
              type="button"
              onClick={onDetectLocation}
              disabled={detectingLocation}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1d4738] hover:bg-[#15362a] disabled:opacity-60 text-white text-xs sm:text-sm font-semibold cursor-pointer transition-colors"
            >
              {detectingLocation ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LocateFixed className="w-3.5 h-3.5" />
              )}
              <span>
                {detectingLocation ? 'Detecting...' : 'Detect My Location'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowMap(true);
                onTogglePickStartOnMap();
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs sm:text-sm font-semibold cursor-pointer transition-colors ${
                pickingStartOnMap
                  ? 'bg-amber-600 border-amber-600 text-white hover:bg-amber-700'
                  : 'bg-white border-black/10 text-[#141714] hover:bg-[#ebe5da]'
              }`}
            >
              <MousePointerClick className="w-3.5 h-3.5" />
              <span>
                {pickingStartOnMap ? 'Cancel Map Pick' : 'Pick Start on Map'}
              </span>
            </button>

            {userCoords && (
              <button
                type="button"
                onClick={onClearGps}
                aria-label="Reset custom location and use city"
                className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-white border border-black/10 text-xs font-semibold text-[#5a6159] hover:text-[#141714] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {locationNotice && (
          <p className="text-xs font-medium text-[#1d4738] bg-[#e7ede9] border border-[#1d4738]/20 rounded-xl px-3.5 py-2">
            {locationNotice}
          </p>
        )}

        {locationError && (
          <p className="text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2">
            {locationError}
          </p>
        )}

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

      {/* Interactive All-India Map Plotting Every Matching Destination as Dots */}
      <div className="bg-white rounded-3xl border border-black/8 overflow-hidden mb-8 shadow-[0_8px_28px_rgba(20,23,20,0.04)]">
        <div className="px-4 sm:px-6 py-3.5 bg-[#f7f5f0]/80 border-b border-black/8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <MapIcon className="w-4 h-4 text-[#1d4738] shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-[#141714]">
                India Destinations Map ·{' '}
                <span className="font-mono text-[#1d4738]">
                  {mapPoints.length}
                </span>{' '}
                Places Plotted as Dots
              </h3>
              <p className="text-[11px] text-[#5a6159]">
                Click any dot to see exact district, state, coordinates, and
                distance from {originCoords.label}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-[#5a6159]">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-600 ring-2 ring-sky-200" />
              Your Start
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1d4738]" />
              Verified
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
              Needs Review
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-600" />
              Unverified
            </span>
            <button
              type="button"
              onClick={() => setShowMap((v) => !v)}
              className="px-3 py-1.5 rounded-full bg-white border border-black/10 text-xs font-semibold text-[#141714] hover:bg-[#ebe5da] cursor-pointer transition-colors"
            >
              {showMap ? 'Hide Map' : 'Show Map'}
            </button>
          </div>
        </div>

        {showMap && (
          <IndiaDestinationsMap
            points={mapPoints}
            originCoords={originCoords}
            isGpsOrigin={Boolean(userCoords)}
            loading={loadingMap}
            pickingStartOnMap={pickingStartOnMap}
            onTogglePickStart={onTogglePickStartOnMap}
            onPickOriginCoords={onPickOriginCoords}
            onExploreDestination={onExploreDestination}
          />
        )}
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
                startLocationLabel={startLocationLabel || originCoords.label}
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
