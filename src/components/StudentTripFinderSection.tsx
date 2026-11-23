import React from 'react';
import {
  Bus,
  Calendar,
  Compass,
  Footprints,
  IndianRupee,
  MapPin,
  Navigation,
  RotateCcw,
  TrainFront,
  Users,
} from 'lucide-react';
import { STARTING_CITIES } from '../data/indianCities.ts';
import type {
  BudgetTier,
  IndiaCategory,
  SortOption,
  TravelMode,
} from '../types.ts';

export interface StudentFinderState {
  startCity: string;
  budgetTier: BudgetTier;
  customMaxBudget: number;
  days: number;
  travelers: number;
  travelMode: TravelMode;
  season: string;
  category: IndiaCategory;
  maxDistanceKm: number | null;
  weekendTrip: boolean;
  oneDayTrip: boolean;
  groupTrip: boolean;
  sort: SortOption;
}

interface StudentTripFinderSectionProps {
  finder: StudentFinderState;
  totalMatching: number;
  onChange: (patch: Partial<StudentFinderState>) => void;
  onApplyAndScroll: () => void;
  onReset: () => void;
}

const BUDGET_OPTIONS: Array<{ id: BudgetTier; label: string }> = [
  { id: 'all', label: 'All Budgets' },
  { id: 'under-500', label: 'Under ₹500' },
  { id: '500-1000', label: '₹500–₹1,000' },
  { id: '1000-2000', label: '₹1,000–₹2,000' },
  { id: '2000-3500', label: '₹2,000–₹3,500' },
  { id: '3500-5000', label: '₹3,500–₹5,000' },
  { id: 'custom', label: 'Custom Budget' },
];

const TRAVEL_MODES: Array<{ mode: TravelMode; icon: React.ComponentType<{ className?: string }> }> = [
  { mode: 'Train', icon: TrainFront },
  { mode: 'Bus', icon: Bus },
  { mode: 'Shared transport', icon: Users },
  { mode: 'Local public transport', icon: Compass },
  { mode: 'Walking', icon: Footprints },
];

const MONTHS = [
  'All',
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
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

export const StudentTripFinderSection: React.FC<StudentTripFinderSectionProps> = ({
  finder,
  totalMatching,
  onChange,
  onApplyAndScroll,
  onReset,
}) => {
  return (
    <section
      id="student-finder"
      className="mx-auto max-w-[1280px] px-4 sm:px-6 py-12 lg:py-16 scroll-mt-24"
    >
      <div className="bg-[#ebe5da]/80 rounded-[32px] border border-black/8 p-6 sm:p-10 lg:p-12 shadow-[0_14px_40px_rgba(20,23,20,0.04)]">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1d4738] mb-2">
              Student Budget Travel &amp; Smart Trip Finder
            </p>
            <h2 className="font-sans text-3xl sm:text-4xl font-semibold tracking-tight text-[#141714]">
              Plan Your{' '}
              <em className="font-editorial italic font-medium">
                College &amp; Budget Escape
              </em>
            </h2>
            <p className="text-sm sm:text-base text-[#5a6159] mt-2 max-w-2xl">
              Compare real Haversine distances from your college city, sleeper
              train/bus fares, hostel/dorm stays, local food, and 10% emergency
              reserve—never recommending destinations above your budget.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="font-mono tabular-nums text-xs sm:text-sm font-semibold bg-white px-4 py-2 rounded-full border border-black/10 text-[#1d4738]">
              {totalMatching} matching places
            </span>
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4a5149] hover:text-[#141714] px-3 py-2 rounded-full bg-white/70 border border-black/10 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>

        {/* Budget Categories */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#5a6159] mb-2.5 flex items-center gap-1.5">
            <IndianRupee className="w-3.5 h-3.5 text-[#1d4738]" />
            Per-Person Total Budget Category (Includes Transport + Stay + Food + Reserve)
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {BUDGET_OPTIONS.map((opt) => {
              const active = finder.budgetTier === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChange({ budgetTier: opt.id })}
                  className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-[#1d4738] text-white shadow-sm'
                      : 'bg-white text-[#4a5149] hover:text-[#141714] border border-black/8'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
            {finder.budgetTier === 'custom' && (
              <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-[#1d4738]/40">
                <span className="text-xs font-semibold text-[#5a6159]">Max ₹</span>
                <input
                  type="number"
                  min={200}
                  max={50000}
                  step={100}
                  value={finder.customMaxBudget}
                  onChange={(e) =>
                    onChange({ customMaxBudget: Number(e.target.value) || 2500 })
                  }
                  aria-label="Custom maximum budget per person in Rupees"
                  className="w-24 text-xs font-mono tabular-nums font-semibold text-[#141714] focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* Travel Modes */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#5a6159] mb-2.5">
            Preferred Student Travel Mode
          </p>
          <div className="flex flex-wrap gap-2">
            {TRAVEL_MODES.map(({ mode, icon: Icon }) => {
              const active = finder.travelMode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onChange({ travelMode: mode })}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-[#141714] text-white'
                      : 'bg-white/90 text-[#4a5149] hover:text-[#141714] border border-black/8'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{mode}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Smart Student Trip Finder Form Controls */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-black/6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
          <div>
            <label
              htmlFor="finder-start-city"
              className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#5a6159] mb-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-[#1d4738]" />
              <span>Starting City</span>
            </label>
            <select
              id="finder-start-city"
              value={finder.startCity}
              onChange={(e) => onChange({ startCity: e.target.value })}
              className="w-full bg-[#f7f5f0] border border-black/10 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#141714]"
            >
              <option value="">Any Starting City</option>
              {STARTING_CITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.state})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="finder-days"
              className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#5a6159] mb-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-[#1d4738]" />
              <span>Days</span>
            </label>
            <select
              id="finder-days"
              value={finder.days}
              onChange={(e) => onChange({ days: Number(e.target.value) })}
              className="w-full bg-[#f7f5f0] border border-black/10 rounded-xl px-3 py-2.5 text-sm font-mono tabular-nums font-semibold text-[#141714]"
            >
              {[1, 2, 3, 4, 5, 6, 7, 10].map((d) => (
                <option key={d} value={d}>
                  {d} {d === 1 ? 'Day (One-Day)' : 'Days'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="finder-travelers"
              className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#5a6159] mb-1.5"
            >
              <Users className="w-3.5 h-3.5 text-[#1d4738]" />
              <span>Travellers</span>
            </label>
            <select
              id="finder-travelers"
              value={finder.travelers}
              onChange={(e) => onChange({ travelers: Number(e.target.value) })}
              className="w-full bg-[#f7f5f0] border border-black/10 rounded-xl px-3 py-2.5 text-sm font-mono tabular-nums font-semibold text-[#141714]"
            >
              {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((t) => (
                <option key={t} value={t}>
                  {t} {t === 1 ? 'Student' : 'Students'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="finder-month"
              className="block text-[11px] font-semibold uppercase tracking-wider text-[#5a6159] mb-1.5"
            >
              Travel Month
            </label>
            <select
              id="finder-month"
              value={finder.season}
              onChange={(e) => onChange({ season: e.target.value })}
              className="w-full bg-[#f7f5f0] border border-black/10 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#141714]"
            >
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m === 'All' ? 'Any Month' : m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="finder-category"
              className="block text-[11px] font-semibold uppercase tracking-wider text-[#5a6159] mb-1.5"
            >
              Interest / Category
            </label>
            <select
              id="finder-category"
              value={finder.category}
              onChange={(e) =>
                onChange({ category: e.target.value as IndiaCategory })
              }
              className="w-full bg-[#f7f5f0] border border-black/10 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#141714]"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              type="button"
              onClick={onApplyAndScroll}
              className="w-full bg-[#1d4738] hover:bg-[#15362a] text-white text-sm font-semibold px-4 py-2.5 rounded-xl cursor-pointer transition-colors"
            >
              Find Matching Trips
            </button>
          </div>
        </div>

        {/* Nearby & Weekend Quick Presets + Sort */}
        <div className="mt-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#5a6159] mr-1 inline-flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5 text-[#1d4738]" />
              Nearby &amp; Quick Modes:
            </span>
            <button
              type="button"
              onClick={() =>
                onChange({
                  maxDistanceKm: finder.maxDistanceKm === 100 ? null : 100,
                  startCity: finder.startCity || 'delhi',
                })
              }
              className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer border ${
                finder.maxDistanceKm === 100
                  ? 'bg-[#1d4738] text-white border-[#1d4738]'
                  : 'bg-white text-[#4a5149] border-black/10'
              }`}
            >
              Under 100 km
            </button>
            <button
              type="button"
              onClick={() =>
                onChange({
                  maxDistanceKm: finder.maxDistanceKm === 300 ? null : 300,
                  startCity: finder.startCity || 'delhi',
                })
              }
              className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer border ${
                finder.maxDistanceKm === 300
                  ? 'bg-[#1d4738] text-white border-[#1d4738]'
                  : 'bg-white text-[#4a5149] border-black/10'
              }`}
            >
              Under 300 km
            </button>
            <button
              type="button"
              onClick={() => onChange({ weekendTrip: !finder.weekendTrip })}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer border ${
                finder.weekendTrip
                  ? 'bg-[#1d4738] text-white border-[#1d4738]'
                  : 'bg-white text-[#4a5149] border-black/10'
              }`}
            >
              Weekend Trips
            </button>
            <button
              type="button"
              onClick={() =>
                onChange({
                  oneDayTrip: !finder.oneDayTrip,
                  days: !finder.oneDayTrip ? 1 : 2,
                })
              }
              className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer border ${
                finder.oneDayTrip
                  ? 'bg-[#1d4738] text-white border-[#1d4738]'
                  : 'bg-white text-[#4a5149] border-black/10'
              }`}
            >
              One-Day Trips
            </button>
            <button
              type="button"
              onClick={() =>
                onChange({
                  groupTrip: !finder.groupTrip,
                  travelers: !finder.groupTrip ? 4 : 1,
                })
              }
              className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer border ${
                finder.groupTrip
                  ? 'bg-[#1d4738] text-white border-[#1d4738]'
                  : 'bg-white text-[#4a5149] border-black/10'
              }`}
            >
              College Group Trips
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <label htmlFor="finder-sort" className="text-xs font-semibold text-[#5a6159]">
              Sort by:
            </label>
            <select
              id="finder-sort"
              value={finder.sort}
              onChange={(e) => onChange({ sort: e.target.value as SortOption })}
              className="bg-white border border-black/10 rounded-full px-3.5 py-1.5 text-xs font-semibold text-[#141714]"
            >
              <option value="best-match">Best Match</option>
              <option value="cheapest">Cheapest First</option>
              <option value="shortest-distance">Shortest Distance</option>
              <option value="most-popular">Most Popular</option>
            </select>
          </div>
        </div>

        <p className="mt-4 text-[11px] text-[#5a6159]">
          Note: All displayed budgets are student travel estimates (sleeper rail/bus, hostel/dorm beds, budget meals, and 10% emergency reserve). Actual IRCTC/state bus fares and ASI entry tickets vary by season—check official links before booking.
        </p>
      </div>
    </section>
  );
};
