import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  BadgeCheck,
  BedDouble,
  Bus,
  Calendar,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  ExternalLink,
  ImageOff,
  Loader2,
  MapPin,
  Maximize2,
  Navigation,
  Pencil,
  ShieldCheck,
  TrainFront,
  Utensils,
  X,
} from 'lucide-react';
import { formatINR } from '../data/travelData.ts';
import { STARTING_CITIES } from '../data/indianCities.ts';
import { calculateStudentBudgetBreakdown } from '../utils/budgetCalculator.ts';
import type {
  CommonsPhoto,
  IndiaDestination,
  TravelMode,
  VerificationStatus,
} from '../types.ts';

interface NearbySummary {
  id: string;
  slug: string;
  name: string;
  state: string;
  category: string;
  coverPhoto: CommonsPhoto | null;
  verificationStatus: VerificationStatus;
  distanceKm: number;
}

interface IndiaDestinationDetailModalProps {
  destinationId: string | null;
  initialStartCity: string;
  initialDays: number;
  initialTravelers: number;
  initialTravelMode: TravelMode;
  onClose: () => void;
  onSelectDestination: (id: string) => void;
  onDestinationUpdated: (updated: IndiaDestination) => void;
  onBookDestination: (dest: IndiaDestination) => void;
}

export const IndiaDestinationDetailModal: React.FC<
  IndiaDestinationDetailModalProps
> = ({
  destinationId,
  initialStartCity,
  initialDays,
  initialTravelers,
  initialTravelMode,
  onClose,
  onSelectDestination,
  onDestinationUpdated,
  onBookDestination,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dest, setDest] = useState<IndiaDestination | null>(null);
  const [nearby, setNearby] = useState<NearbySummary[]>([]);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [brokenUrls, setBrokenUrls] = useState<Record<string, boolean>>({});
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  // Interactive calculator controls inside detail view
  const [days, setDays] = useState(initialDays);
  const [travelers, setTravelers] = useState(initialTravelers);
  const [travelMode, setTravelMode] = useState<TravelMode>(initialTravelMode);

  // Admin Edit & Verification state
  const [adminOpen, setAdminOpen] = useState(false);
  const [savingAdmin, setSavingAdmin] = useState(false);
  const [adminMsg, setAdminMsg] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<VerificationStatus>('Verified');
  const [editOfficialUrl, setEditOfficialUrl] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editBestSeason, setEditBestSeason] = useState('');
  const [editStay, setEditStay] = useState(450);
  const [editFood, setEditFood] = useState(300);
  const [editLocal, setEditLocal] = useState(150);
  const [editEntry, setEditEntry] = useState(0);
  const [editSafety, setEditSafety] = useState('');

  useEffect(() => {
    if (!destinationId) {
      setDest(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPhotoIdx(0);
    setBrokenUrls({});
    setAdminOpen(false);
    setAdminMsg(null);

    const params = new URLSearchParams();
    if (initialStartCity) params.set('startCity', initialStartCity);
    params.set('days', String(initialDays));
    params.set('travelers', String(initialTravelers));
    params.set('travelMode', initialTravelMode);

    fetch(`/api/destinations/${encodeURIComponent(destinationId)}?${params.toString()}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Could not load destination details.');
        return (await res.json()) as {
          destination: IndiaDestination;
          nearbyDestinations: NearbySummary[];
        };
      })
      .then((data) => {
        if (cancelled) return;
        const d = data.destination;
        setDest(d);
        setNearby(data.nearbyDestinations || []);
        setDays(initialDays || d.recommendedDays || 2);
        setTravelers(initialTravelers || 1);
        setTravelMode(initialTravelMode || 'Train');

        setEditStatus(d.verificationStatus);
        setEditOfficialUrl(d.officialTourismUrl);
        setEditDescription(d.description);
        setEditBestSeason(d.bestSeason);
        setEditStay(d.budget.stayPerNightInr);
        setEditFood(d.budget.foodPerDayInr);
        setEditLocal(d.budget.localTransportPerDayInr);
        setEditEntry(d.budget.entryFeeInr);
        setEditSafety(d.safetyInfo);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [destinationId, initialStartCity, initialDays, initialTravelers, initialTravelMode]);

  useEffect(() => {
    if (!destinationId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (fullscreenOpen) setFullscreenOpen(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [destinationId, fullscreenOpen, onClose]);

  if (!destinationId) return null;

  const validPhotos = (dest?.gallery || []).filter(
    (p) => p.imageUrl && !brokenUrls[p.imageUrl]
  );
  const currentPhoto = validPhotos[photoIdx] ?? validPhotos[0] ?? null;
  const startCityObj = STARTING_CITIES.find((c) => c.id === initialStartCity);

  const liveBreakdown = dest
    ? calculateStudentBudgetBreakdown({
        budget: dest.budget,
        days,
        travelers,
        distanceKm: dest.distanceKm,
        travelMode,
      })
    : null;

  const handleSaveAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dest) return;
    setSavingAdmin(true);
    setAdminMsg(null);
    try {
      const res = await fetch(`/api/destinations/${encodeURIComponent(dest.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationStatus: editStatus,
          officialTourismUrl: editOfficialUrl,
          description: editDescription,
          bestSeason: editBestSeason,
          stayPerNightInr: editStay,
          foodPerDayInr: editFood,
          localTransportPerDayInr: editLocal,
          entryFeeInr: editEntry,
          safetyInfo: editSafety,
        }),
      });
      if (!res.ok) throw new Error('Failed to save updates.');
      const data = (await res.json()) as { destination: IndiaDestination };
      const merged = {
        ...data.destination,
        distanceKm: dest.distanceKm,
      };
      setDest(merged);
      onDestinationUpdated(merged);
      setAdminMsg('Saved & updated verification record.');
    } catch (err) {
      setAdminMsg(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSavingAdmin(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="india-dest-detail-title"
      >
        <div className="bg-white w-full max-w-5xl rounded-[28px] overflow-hidden shadow-2xl animate-fade-up max-h-[94vh] overflow-y-auto">
          {loading ? (
            <div className="p-16 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#1d4738] mx-auto mb-3" />
              <p className="font-editorial text-xl text-[#141714]">
                Loading destination gallery &amp; verified guide...
              </p>
            </div>
          ) : error || !dest ? (
            <div className="p-12 text-center">
              <p className="font-editorial text-2xl text-[#141714] mb-2">
                {error || 'Destination unavailable'}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="bg-[#141714] text-white text-sm font-semibold px-5 py-2.5 rounded-full cursor-pointer"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {/* Top Photo Stage */}
              <div className="relative h-72 sm:h-96 bg-[#141714]">
                {currentPhoto ? (
                  <img
                    src={currentPhoto.imageUrl}
                    alt={`${dest.name} — ${currentPhoto.title}`}
                    referrerPolicy="no-referrer"
                    onError={() => {
                      setBrokenUrls((prev) => ({
                        ...prev,
                        [currentPhoto.imageUrl]: true,
                      }));
                      setPhotoIdx(0);
                    }}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white/80 p-6 text-center">
                    <ImageOff className="w-10 h-10 mb-2 opacity-70" />
                    <p className="text-base font-semibold">Photo unavailable</p>
                    <p className="text-xs text-white/60 mt-1">
                      No verified Wikimedia photograph found yet for {dest.name}
                    </p>
                  </div>
                )}

                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30 pointer-events-none"
                />

                {/* Top Action Buttons */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        dest.verificationStatus === 'Verified'
                          ? 'bg-emerald-950/90 text-emerald-100 border border-emerald-400/40'
                          : dest.verificationStatus === 'Needs Review'
                            ? 'bg-amber-950/90 text-amber-100 border border-amber-400/40'
                            : 'bg-stone-900/90 text-stone-200 border border-white/25'
                      }`}
                    >
                      <BadgeCheck className="w-3.5 h-3.5" />
                      {dest.verificationStatus}
                    </span>

                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-[#141714]">
                      {dest.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {currentPhoto && (
                      <button
                        type="button"
                        onClick={() => setFullscreenOpen(true)}
                        aria-label="View full-screen photo"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/90 hover:bg-white text-[#141714] text-xs font-semibold cursor-pointer shadow"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Full Screen</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={onClose}
                      aria-label="Close destination detail"
                      className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#141714] grid place-items-center cursor-pointer shadow"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Prev / Next Arrows */}
                {validPhotos.length > 1 && (
                  <>
                    <button
                      type="button"
                      aria-label="Previous photograph"
                      onClick={() =>
                        setPhotoIdx(
                          (prev) =>
                            (prev - 1 + validPhotos.length) % validPhotos.length
                        )
                      }
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-[#141714] grid place-items-center cursor-pointer shadow"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Next photograph"
                      onClick={() =>
                        setPhotoIdx((prev) => (prev + 1) % validPhotos.length)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-[#141714] grid place-items-center cursor-pointer shadow"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Title & Photo Credits Overlay */}
                <div className="absolute bottom-4 left-5 right-5 text-white">
                  <p className="text-xs font-medium text-white/85 mb-1">
                    {dest.state} · {dest.district} · {dest.region} India
                    {dest.distanceKm !== null && dest.distanceKm !== undefined
                      ? ` · ${dest.distanceKm} km from ${startCityObj?.name || 'selected city'}`
                      : ''}
                  </p>
                  <h2
                    id="india-dest-detail-title"
                    className="font-editorial text-2xl sm:text-4xl font-semibold leading-tight"
                  >
                    {dest.name}
                  </h2>
                  {currentPhoto && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/85">
                      <span>
                        Photo {photoIdx + 1} of {validPhotos.length}:{' '}
                        <strong>{currentPhoto.title}</strong>
                      </span>
                      <span>· Credit: {currentPhoto.photographer}</span>
                      <span>· License: {currentPhoto.license}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-8">
                {/* Multi-Image Thumbnail Strip + Photo Source Credit Bar */}
                {validPhotos.length > 0 && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                      {validPhotos.map((photo, idx) => (
                        <button
                          key={`${photo.id}-${idx}`}
                          type="button"
                          onClick={() => setPhotoIdx(idx)}
                          className={`relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer transition-all ${
                            idx === photoIdx
                              ? 'ring-2 ring-[#1d4738] ring-offset-2 opacity-100'
                              : 'opacity-65 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={photo.thumbUrl || photo.imageUrl}
                            alt={photo.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>

                    {currentPhoto && (
                      <div className="bg-[#f7f5f0] rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-2 text-xs text-[#5a6159]">
                        <div className="flex items-start gap-2 min-w-0">
                          <Camera className="w-4 h-4 text-[#1d4738] shrink-0 mt-0.5" />
                          <span>
                            <strong className="text-[#141714]">
                              {currentPhoto.caption}
                            </strong>{' '}
                            — Photo by {currentPhoto.photographer} (
                            {currentPhoto.license})
                          </span>
                        </div>
                        <a
                          href={currentPhoto.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-[#1d4738] hover:underline shrink-0"
                        >
                          Wikimedia Source
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Outdated / Unverified Warning */}
                {dest.verificationStatus !== 'Verified' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs sm:text-sm text-amber-950">
                    <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">
                        Status: {dest.verificationStatus}
                      </p>
                      <p className="text-amber-900/85 mt-0.5">
                        Some fares, entry fees, or gallery records for {dest.name}{' '}
                        need human review. Please verify live timings via the
                        official state tourism portal before traveling.
                      </p>
                    </div>
                  </div>
                )}

                {/* Overview, Why Famous, History & Speciality */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7 space-y-5">
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1d4738] mb-1.5">
                        What This Place Is
                      </h3>
                      <p className="text-sm sm:text-base text-[#141714] leading-relaxed">
                        {dest.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-[#f7f5f0] rounded-2xl p-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1d4738] mb-1.5">
                          Why It Is Famous
                        </h4>
                        <p className="text-xs sm:text-sm text-[#5a6159] leading-relaxed">
                          {dest.whyFamous}
                        </p>
                      </div>
                      <div className="bg-[#f7f5f0] rounded-2xl p-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1d4738] mb-1.5">
                          History &amp; Speciality
                        </h4>
                        <p className="text-xs sm:text-sm text-[#5a6159] leading-relaxed">
                          {dest.historySpeciality}
                        </p>
                      </div>
                    </div>

                    {/* Things to Do / Tourist Experiences */}
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1d4738] mb-2.5">
                        What Tourists Can Experience
                      </h3>
                      <ul className="space-y-2 text-sm text-[#141714]">
                        {dest.thingsToDo.map((item) => (
                          <li key={item} className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-[#1d4738] shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Suggested Itinerary */}
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1d4738] mb-2.5">
                        Suggested Student Itinerary ({dest.idealDuration})
                      </h3>
                      <div className="space-y-2">
                        {dest.suggestedItinerary.map((step, i) => (
                          <div
                            key={i}
                            className="bg-[#ebe5da]/50 rounded-xl p-3.5 text-xs sm:text-sm text-[#141714]"
                          >
                            {step}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Interactive Student Budget Breakdown Calculator */}
                  <div className="lg:col-span-5 space-y-5">
                    <div className="bg-[#ebe5da]/75 rounded-3xl p-5 sm:p-6 border border-black/8">
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <h3 className="font-editorial text-xl font-semibold text-[#141714]">
                          Student Budget Breakdown
                        </h3>
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white text-[#1d4738]">
                          Est. INR
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div>
                          <label className="text-[10px] font-semibold uppercase text-[#5a6159] block mb-1">
                            Days
                          </label>
                          <select
                            value={days}
                            onChange={(e) => setDays(Number(e.target.value))}
                            className="w-full bg-white rounded-xl px-2.5 py-2 text-xs font-mono font-semibold"
                          >
                            {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                              <option key={d} value={d}>
                                {d}D / {Math.max(0, d - 1)}N
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold uppercase text-[#5a6159] block mb-1">
                            Students
                          </label>
                          <select
                            value={travelers}
                            onChange={(e) => setTravelers(Number(e.target.value))}
                            className="w-full bg-white rounded-xl px-2.5 py-2 text-xs font-mono font-semibold"
                          >
                            {[1, 2, 3, 4, 5, 6, 8, 10].map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold uppercase text-[#5a6159] block mb-1">
                            Mode
                          </label>
                          <select
                            value={travelMode}
                            onChange={(e) =>
                              setTravelMode(e.target.value as TravelMode)
                            }
                            className="w-full bg-white rounded-xl px-2 py-2 text-xs font-semibold"
                          >
                            <option value="Train">Train</option>
                            <option value="Bus">Bus</option>
                            <option value="Shared transport">Shared</option>
                            <option value="Local public transport">Local</option>
                            <option value="Walking">Walking</option>
                          </select>
                        </div>
                      </div>

                      {liveBreakdown && (
                        <div className="bg-white rounded-2xl p-4 space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-[#5a6159]">
                              Round-trip transport ({travelMode})
                            </span>
                            <span className="font-mono font-semibold">
                              {formatINR(liveBreakdown.roundTripTransportInr)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#5a6159]">
                              Stay ({formatINR(dest.budget.stayPerNightInr)} ×{' '}
                              {liveBreakdown.nights} nights)
                            </span>
                            <span className="font-mono font-semibold">
                              {formatINR(liveBreakdown.stayTotalInr)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#5a6159]">
                              Food ({formatINR(dest.budget.foodPerDayInr)} ×{' '}
                              {liveBreakdown.days} days)
                            </span>
                            <span className="font-mono font-semibold">
                              {formatINR(liveBreakdown.foodTotalInr)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#5a6159]">
                              Local transport ({liveBreakdown.days} days)
                            </span>
                            <span className="font-mono font-semibold">
                              {formatINR(liveBreakdown.localTransportTotalInr)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#5a6159]">
                              Sightseeing &amp; entry fees
                            </span>
                            <span className="font-mono font-semibold">
                              {formatINR(liveBreakdown.sightseeingEntryInr)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#5a6159]">
                              Emergency reserve (10%)
                            </span>
                            <span className="font-mono font-semibold">
                              {formatINR(liveBreakdown.emergencyReserveInr)}
                            </span>
                          </div>

                          <div className="pt-2.5 border-t border-black/10 flex justify-between items-baseline">
                            <span className="font-semibold text-[#141714]">
                              Per-Person Total
                            </span>
                            <span className="font-mono text-lg font-bold text-[#1d4738]">
                              {formatINR(liveBreakdown.perPersonTotalInr)}
                            </span>
                          </div>
                          {travelers > 1 && (
                            <div className="flex justify-between text-[11px] text-[#5a6159]">
                              <span>Group Total ({travelers} students)</span>
                              <span className="font-mono font-semibold text-[#141714]">
                                {formatINR(liveBreakdown.groupTotalInr)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      <p className="text-[11px] text-[#5a6159] mt-3 leading-relaxed">
                        {dest.budget.entryFeeNote}. Estimates only—verify live
                        IRCTC/SRTC fares before booking.
                      </p>
                    </div>

                    {/* Google Maps Embed */}
                    <div className="rounded-3xl overflow-hidden border border-black/10 bg-[#f7f5f0]">
                      <div className="px-4 py-3 flex items-center justify-between gap-2 bg-white border-b border-black/8">
                        <span className="text-xs font-semibold text-[#141714] inline-flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#1d4738]" />
                          {dest.lat}, {dest.lon}
                        </span>
                        <a
                          href={`https://www.google.com/maps?q=${dest.lat},${dest.lon}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-[#1d4738] hover:underline inline-flex items-center gap-1"
                        >
                          Open in Google Maps
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <iframe
                        title={`Map of ${dest.name}`}
                        src={`https://maps.google.com/maps?q=${dest.lat},${dest.lon}&z=11&output=embed`}
                        className="w-full h-48 border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  </div>
                </div>

                {/* Transport, Hostels, Food, Season, Safety & Accessibility */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div className="bg-[#f7f5f0] rounded-2xl p-5 space-y-2.5">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1d4738] flex items-center gap-1.5">
                      <TrainFront className="w-4 h-4" />
                      How to Reach &amp; Transit
                    </h4>
                    <p className="text-xs text-[#5a6159] leading-relaxed">
                      {dest.howToReach}
                    </p>
                    <ul className="space-y-1.5 text-xs text-[#141714] pt-1">
                      {dest.transportOptions.slice(0, 4).map((t) => (
                        <li key={t.mode}>
                          <strong>{t.mode}:</strong>{' '}
                          <span className="text-[#5a6159]">{t.note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-[#f7f5f0] rounded-2xl p-5 space-y-3">
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1d4738] flex items-center gap-1.5 mb-2">
                        <BedDouble className="w-4 h-4" />
                        Hostel &amp; Stay Options
                      </h4>
                      <ul className="space-y-1 text-xs text-[#5a6159] list-disc pl-4">
                        {dest.hostelSuggestions.map((h) => (
                          <li key={h}>{h}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1d4738] flex items-center gap-1.5 mb-1.5">
                        <Utensils className="w-4 h-4" />
                        Local Student Food
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {dest.localFood.map((food) => (
                          <span
                            key={food}
                            className="bg-white px-2.5 py-1 rounded-full text-[11px] font-medium text-[#141714] border border-black/6"
                          >
                            {food}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#f7f5f0] rounded-2xl p-5 space-y-3">
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1d4738] flex items-center gap-1.5 mb-1">
                        <Calendar className="w-4 h-4" />
                        Best Time &amp; Weather
                      </h4>
                      <p className="text-xs font-semibold text-[#141714]">
                        {dest.bestSeason}
                      </p>
                      <p className="text-xs text-[#5a6159] mt-0.5">
                        {dest.weatherNotes}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1d4738] flex items-center gap-1.5 mb-1">
                        <ShieldCheck className="w-4 h-4" />
                        Safety &amp; Accessibility
                      </h4>
                      <p className="text-xs text-[#5a6159]">{dest.safetyInfo}</p>
                      <p className="text-xs text-[#5a6159] mt-1">
                        {dest.accessibilityInfo}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Nearby Destinations (Real Haversine Distance) */}
                {nearby.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1d4738] mb-3 flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5" />
                      Real Nearby Destinations (Haversine Geographic Distance)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {nearby.map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => onSelectDestination(n.id)}
                          className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#f7f5f0] hover:bg-[#ebe5da] text-left transition-colors cursor-pointer border border-black/6"
                        >
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#ebe5da] shrink-0">
                            {n.coverPhoto ? (
                              <img
                                src={n.coverPhoto.thumbUrl || n.coverPhoto.imageUrl}
                                alt={n.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full grid place-items-center text-[10px] text-[#5a6159]">
                                N/A
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#141714] truncate">
                              {n.name}
                            </p>
                            <p className="text-[11px] text-[#5a6159] truncate">
                              {n.state} · {n.category}
                            </p>
                            <p className="text-[11px] font-mono font-semibold text-[#1d4738] mt-0.5">
                              {n.distanceKm} km away
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Official Sources, Verification Date & Admin Edit Toggle */}
                <div className="pt-4 border-t border-black/10 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <a
                        href={dest.officialTourismUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#e7ede9] text-[#1d4738] font-semibold hover:underline"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        Official State Tourism Portal
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      {dest.wikipediaUrl && (
                        <a
                          href={dest.wikipediaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#f7f5f0] text-[#141714] font-semibold border border-black/10 hover:underline"
                        >
                          Wikipedia Reference
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <span className="text-[#5a6159]">
                        Last verified:{' '}
                        <strong className="font-mono text-[#141714]">
                          {dest.lastVerifiedDate || 'Unverified'}
                        </strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setAdminOpen((prev) => !prev)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold bg-[#f7f5f0] text-[#141714] border border-black/10 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Admin: Edit / Verify
                      </button>

                      <button
                        type="button"
                        onClick={() => onBookDestination(dest)}
                        className="bg-[#1d4738] hover:bg-[#15362a] text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-full cursor-pointer"
                      >
                        Plan / Reserve Trip
                      </button>
                    </div>
                  </div>

                  {/* Admin Editor Form */}
                  {adminOpen && (
                    <form
                      onSubmit={handleSaveAdmin}
                      className="bg-[#f7f5f0] rounded-2xl p-5 border border-black/10 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1d4738]">
                          Admin Destination Verification &amp; Budget Editor
                        </h4>
                        {adminMsg && (
                          <span className="text-xs font-semibold text-[#1d4738]">
                            {adminMsg}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-[#5a6159] block mb-1">
                            Verification Status
                          </label>
                          <select
                            value={editStatus}
                            onChange={(e) =>
                              setEditStatus(e.target.value as VerificationStatus)
                            }
                            className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-xs font-semibold"
                          >
                            <option value="Verified">Verified</option>
                            <option value="Needs Review">Needs Review</option>
                            <option value="Unverified">Unverified</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-[#5a6159] block mb-1">
                            Official Tourism URL
                          </label>
                          <input
                            type="url"
                            value={editOfficialUrl}
                            onChange={(e) => setEditOfficialUrl(e.target.value)}
                            className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-[#5a6159] block mb-1">
                            Best Season
                          </label>
                          <input
                            type="text"
                            value={editBestSeason}
                            onChange={(e) => setEditBestSeason(e.target.value)}
                            className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-[#5a6159] block mb-1">
                            Stay / Night (₹)
                          </label>
                          <input
                            type="number"
                            value={editStay}
                            onChange={(e) => setEditStay(Number(e.target.value))}
                            className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-[#5a6159] block mb-1">
                            Food / Day (₹)
                          </label>
                          <input
                            type="number"
                            value={editFood}
                            onChange={(e) => setEditFood(Number(e.target.value))}
                            className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-[#5a6159] block mb-1">
                            Local Transit (₹)
                          </label>
                          <input
                            type="number"
                            value={editLocal}
                            onChange={(e) => setEditLocal(Number(e.target.value))}
                            className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-[#5a6159] block mb-1">
                            Entry Fee (₹)
                          </label>
                          <input
                            type="number"
                            value={editEntry}
                            onChange={(e) => setEditEntry(Number(e.target.value))}
                            className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-[#5a6159] block mb-1">
                          Description
                        </label>
                        <textarea
                          rows={2}
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-[#5a6159] block mb-1">
                          Safety Notes
                        </label>
                        <input
                          type="text"
                          value={editSafety}
                          onChange={(e) => setEditSafety(e.target.value)}
                          className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-xs"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={savingAdmin}
                          className="bg-[#141714] text-white text-xs font-semibold px-5 py-2.5 rounded-full cursor-pointer disabled:opacity-60"
                        >
                          {savingAdmin ? 'Saving...' : 'Save & Update Record'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Full-Screen Lightbox Photo Viewer */}
      {fullscreenOpen && currentPhoto && dest && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 flex flex-col justify-between p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Full-screen destination photograph"
        >
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-xs text-white/70">
                {dest.name}, {dest.state} · Photo {photoIdx + 1} of{' '}
                {validPhotos.length}
              </p>
              <p className="text-sm sm:text-base font-semibold">
                {currentPhoto.title}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFullscreenOpen(false)}
              aria-label="Close full-screen viewer"
              className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white grid place-items-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative flex-1 flex items-center justify-center my-4 min-h-0">
            {validPhotos.length > 1 && (
              <button
                type="button"
                aria-label="Previous photo"
                onClick={() =>
                  setPhotoIdx(
                    (prev) => (prev - 1 + validPhotos.length) % validPhotos.length
                  )
                }
                className="absolute left-2 sm:left-4 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white grid place-items-center cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <img
              src={currentPhoto.imageUrl}
              alt={currentPhoto.title}
              referrerPolicy="no-referrer"
              className="max-h-full max-w-full object-contain rounded-xl"
            />

            {validPhotos.length > 1 && (
              <button
                type="button"
                aria-label="Next photo"
                onClick={() =>
                  setPhotoIdx((prev) => (prev + 1) % validPhotos.length)
                }
                className="absolute right-2 sm:right-4 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white grid place-items-center cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          <div className="text-center text-xs text-white/80 space-y-1">
            <p>{currentPhoto.caption}</p>
            <p className="text-white/60">
              Credit: {currentPhoto.photographer} · {currentPhoto.license} ·{' '}
              <a
                href={currentPhoto.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-white/90"
              >
                Original Wikimedia Source
              </a>
            </p>
          </div>
        </div>
      )}
    </>
  );
};
