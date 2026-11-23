import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FooterSection } from './components/FooterSection.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { IndiaDestinationDetailModal } from './components/IndiaDestinationDetailModal.tsx';
import { IndiaDestinationsDirectory } from './components/IndiaDestinationsDirectory.tsx';
import { Navbar } from './components/Navbar.tsx';
import { PackagesSection } from './components/PackagesSection.tsx';
import {
  StudentTripFinderSection,
  type StudentFinderState,
} from './components/StudentTripFinderSection.tsx';
import { TestimonialsSection } from './components/TestimonialsSection.tsx';
import { VerificationReportSection } from './components/VerificationReportSection.tsx';
import {
  AuthModal,
  BookingModal,
  DestinationModal,
} from './components/WanderlyModals.tsx';
import { WhyChooseUsSection } from './components/WhyChooseUsSection.tsx';
import {
  DESTINATIONS,
  FEATURED_PACKAGES,
  TESTIMONIALS,
} from './data/travelData.ts';
import type {
  BookingRecord,
  DestinationsReportStats,
  IndiaCategory,
  IndiaDestination,
  IndiaRegion,
  MusafirDestination,
  TravelPackage,
  UserSession,
  VerificationStatus,
} from './types.ts';

const DEFAULT_FINDER: StudentFinderState = {
  startCity: 'delhi',
  budgetTier: 'all',
  customMaxBudget: 2500,
  days: 2,
  travelers: 2,
  travelMode: 'Train',
  season: 'All',
  category: 'All',
  maxDistanceKm: null,
  weekendTrip: false,
  oneDayTrip: false,
  groupTrip: false,
  sort: 'best-match',
};

interface DestinationsApiResponse {
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  items: IndiaDestination[];
  stats: DestinationsReportStats;
}

interface StatsApiResponse extends DestinationsReportStats {
  generatedAt: string;
  byState: Record<string, number>;
  byCategory: Record<string, number>;
  byRegion: Record<string, number>;
}

export default function App() {
  // Hero search & preserved booking state
  const [destinationQuery, setDestinationQuery] = useState('all');
  const [checkIn, setCheckIn] = useState('2027-06-12');
  const [checkOut, setCheckOut] = useState('2027-06-19');
  const [heroTravelers, setHeroTravelers] = useState(2);
  const [searching, setSearching] = useState(false);

  // 500+ Destinations Directory & Student Budget Trip Finder state
  const [finder, setFinder] = useState<StudentFinderState>(DEFAULT_FINDER);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState<IndiaRegion>('All');
  const [selectedVerification, setSelectedVerification] = useState<
    'All' | VerificationStatus
  >('All');
  const [studentFriendlyOnly, setStudentFriendlyOnly] = useState(false);
  const [page, setPage] = useState(1);

  const [destinations, setDestinations] = useState<IndiaDestination[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  // Live audit report & verification breakdown
  const [reportStats, setReportStats] = useState<DestinationsReportStats | null>(
    null
  );
  const [byRegion, setByRegion] = useState<Record<string, number>>({});
  const [byCategory, setByCategory] = useState<Record<string, number>>({});
  const [refreshNonce, setRefreshNonce] = useState(0);

  // Interactive modals & user session
  const [user, setUser] = useState<UserSession | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [selectedDestinationId, setSelectedDestinationId] = useState<
    string | null
  >(null);
  const [exploredDestination, setExploredDestination] =
    useState<MusafirDestination | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingPackage, setBookingPackage] = useState<TravelPackage | null>(
    null
  );
  const [customBookingDest, setCustomBookingDest] =
    useState<MusafirDestination | null>(null);
  const [bookingDestId, setBookingDestId] = useState('agra-taj');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => {
      setToast((curr) => (curr === message ? null : curr));
    }, 3600);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Fetch Verification & Photo Audit Report stats
  useEffect(() => {
    let cancelled = false;
    fetch('/api/destinations/stats')
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load database metrics.');
        return (await res.json()) as StatsApiResponse;
      })
      .then((data) => {
        if (cancelled) return;
        setReportStats({
          totalDestinations: data.totalDestinations,
          statesAndUTsCovered: data.statesAndUTsCovered,
          totalPhotographs: data.totalPhotographs,
          completeGalleries: data.completeGalleries,
          partialGalleries: data.partialGalleries,
          missingPhotos: data.missingPhotos,
          completeDescriptions: data.completeDescriptions,
          verifiedCount: data.verifiedCount,
          needsReviewCount: data.needsReviewCount,
          unverifiedCount: data.unverifiedCount,
        });
        setByRegion(data.byRegion || {});
        setByCategory(data.byCategory || {});
      })
      .catch(() => {
        // Non-blocking metrics fallback
      });

    return () => {
      cancelled = true;
    };
  }, [refreshNonce]);

  // Fetch filtered/sorted 500+ Indian destinations from /api/destinations
  useEffect(() => {
    const controller = new AbortController();
    setLoadingList(true);
    setListError(null);

    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (selectedState !== 'All') params.set('state', selectedState);
    if (selectedRegion !== 'All') params.set('region', selectedRegion);
    if (finder.category !== 'All') params.set('category', finder.category);
    if (finder.budgetTier !== 'all') params.set('budgetTier', finder.budgetTier);
    if (finder.budgetTier === 'custom') {
      params.set('maxBudget', String(finder.customMaxBudget));
    }
    params.set('days', String(finder.days));
    params.set('travelers', String(finder.travelers));
    params.set('travelMode', finder.travelMode);
    if (finder.season !== 'All') params.set('season', finder.season);
    if (finder.startCity) params.set('startCity', finder.startCity);
    if (finder.maxDistanceKm) {
      params.set('maxDistanceKm', String(finder.maxDistanceKm));
    }
    if (selectedVerification !== 'All') {
      params.set('verificationStatus', selectedVerification);
    }
    if (studentFriendlyOnly) params.set('studentFriendly', 'true');
    if (finder.weekendTrip) params.set('weekendTrip', 'true');
    if (finder.oneDayTrip) params.set('oneDayTrip', 'true');
    if (finder.groupTrip) params.set('groupTrip', 'true');
    params.set('sort', finder.sort);
    params.set('page', String(page));
    params.set('limit', '18');

    const timer = window.setTimeout(() => {
      fetch(`/api/destinations?${params.toString()}`, {
        signal: controller.signal,
      })
        .then(async (res) => {
          if (!res.ok) throw new Error('Unable to load destinations.');
          return (await res.json()) as DestinationsApiResponse;
        })
        .then((data) => {
          setDestinations(data.items || []);
          setTotal(data.total || 0);
          setTotalPages(data.totalPages || 1);
          if (data.stats) setReportStats(data.stats);
        })
        .catch((err: unknown) => {
          if (err instanceof Error && err.name === 'AbortError') return;
          setListError(
            err instanceof Error
              ? err.message
              : 'Failed to load destinations.'
          );
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setLoadingList(false);
          }
        });
    }, 120);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [
    finder,
    searchQuery,
    selectedState,
    selectedRegion,
    selectedVerification,
    studentFriendlyOnly,
    page,
    refreshNonce,
  ]);

  const updateFinder = useCallback((patch: Partial<StudentFinderState>) => {
    setFinder((prev) => ({ ...prev, ...patch }));
    setPage(1);
  }, []);

  const resetAllFilters = useCallback(() => {
    setFinder(DEFAULT_FINDER);
    setSearchQuery('');
    setSelectedState('All');
    setSelectedRegion('All');
    setSelectedVerification('All');
    setStudentFriendlyOnly(false);
    setDestinationQuery('all');
    setPage(1);
    setRefreshNonce((n) => n + 1);
  }, []);

  const handleSearchTrips = (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    setSelectedRegion('All');
    setSelectedState('All');

    const selected = DESTINATIONS.find((d) => d.id === destinationQuery);
    if (selected) {
      const keyword = selected.name.split('&')[0].trim();
      setSearchQuery(keyword);
    } else {
      setSearchQuery('');
    }
    setFinder((prev) => ({ ...prev, travelers: heroTravelers }));
    setPage(1);

    window.setTimeout(() => {
      setSearching(false);
      scrollToSection('destinations');
      showToast(
        selected
          ? `Showing curated escapes for ${selected.name} (${heroTravelers} ${
              heroTravelers === 1 ? 'traveler' : 'travelers'
            }).`
          : `Showing Indian destinations for ${heroTravelers} ${
              heroTravelers === 1 ? 'traveler' : 'travelers'
            }.`
      );
    }, 280);
  };

  const handleOpenBookingForDest = (dest: MusafirDestination) => {
    setExploredDestination(null);
    setCustomBookingDest(null);
    setBookingPackage(
      FEATURED_PACKAGES.find((p) => p.destinationId === dest.id) ?? null
    );
    setBookingDestId(dest.id);
    setBookingOpen(true);
  };

  const handleBookIndiaDestination = (dest: IndiaDestination) => {
    setSelectedDestinationId(null);
    const matchedPkg = FEATURED_PACKAGES.find(
      (p) =>
        p.title.toLowerCase().includes(dest.name.toLowerCase()) ||
        p.locationLabel.toLowerCase().includes(dest.name.toLowerCase())
    );

    if (matchedPkg) {
      setCustomBookingDest(null);
      setBookingPackage(matchedPkg);
      setBookingDestId(matchedPkg.destinationId);
    } else {
      const perPersonEstimate =
        dest.estimatedBreakdown?.perPersonTotalInr ??
        dest.budget.estimatedDailyStudentCostInr * dest.recommendedDays;
      const pkgId = `india-${dest.id}`;
      const dynamicDest: MusafirDestination = {
        id: dest.id,
        name: `${dest.name}, ${dest.state}`,
        country: 'India',
        regionCategory: 'Indian Wonders & Temples',
        startingPriceInr: perPersonEstimate,
        bestSeason: dest.bestSeason,
        idealDuration: dest.idealDuration,
        imageUrl: dest.coverPhoto?.imageUrl || '',
        tagline: dest.whyFamous,
        easyDescription: dest.description,
        highlights: dest.thingsToDo.slice(0, 4),
        gallery: [],
      };
      const dynamicPkg: TravelPackage = {
        id: pkgId,
        destinationId: dest.id,
        title: `${dest.name} Student Budget Escape`,
        locationLabel: `${dest.district}, ${dest.state}`,
        duration: dest.idealDuration,
        days: dest.recommendedDays,
        pricePerGuestInr: perPersonEstimate,
        rating: 4.8,
        reviewCount: 42,
        description: dest.description,
        imageUrl: dest.coverPhoto?.imageUrl || '',
        inclusions: [
          'Student Hostel / Dorm Estimate',
          'Sleeper Rail / Bus Guide',
          'Official Tourism Checklist',
        ],
      };
      setCustomBookingDest(dynamicDest);
      setBookingPackage(dynamicPkg);
      setBookingDestId(dest.id);
    }
    setBookingOpen(true);
  };

  const handleOpenBookingForPkg = (pkg: TravelPackage) => {
    setCustomBookingDest(null);
    setBookingPackage(pkg);
    setBookingDestId(pkg.destinationId);
    setBookingOpen(true);
  };

  const handleBookingSuccess = (booking: BookingRecord) => {
    showToast(`Trip reserved (${booking.id}) for ${booking.destinationName}.`);
  };

  const modalDestinations = useMemo(
    () =>
      customBookingDest
        ? [customBookingDest, ...DESTINATIONS]
        : DESTINATIONS,
    [customBookingDest]
  );

  const modalPackages = useMemo(
    () =>
      bookingPackage &&
      !FEATURED_PACKAGES.some((p) => p.id === bookingPackage.id)
        ? [bookingPackage, ...FEATURED_PACKAGES]
        : FEATURED_PACKAGES,
    [bookingPackage]
  );

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#141714]">
      <Navbar
        user={user}
        onNavigate={scrollToSection}
        onOpenAuth={() => setAuthOpen(true)}
        onLogout={() => {
          setUser(null);
          showToast('Signed out of MUSAFIR.');
        }}
        onBookTrip={() => {
          setCustomBookingDest(null);
          setBookingPackage(null);
          setBookingDestId(
            destinationQuery === 'all' ? 'agra-taj' : destinationQuery
          );
          setBookingOpen(true);
        }}
      />

      <main>
        <HeroSection
          destinations={DESTINATIONS}
          destinationQuery={destinationQuery}
          checkIn={checkIn}
          checkOut={checkOut}
          travelers={heroTravelers}
          searching={searching}
          onDestinationQueryChange={setDestinationQuery}
          onCheckInChange={setCheckIn}
          onCheckOutChange={setCheckOut}
          onTravelersChange={setHeroTravelers}
          onSearchTrips={handleSearchTrips}
        />

        <StudentTripFinderSection
          finder={finder}
          totalMatching={total}
          onChange={updateFinder}
          onApplyAndScroll={() => scrollToSection('destinations')}
          onReset={resetAllFilters}
        />

        <IndiaDestinationsDirectory
          destinations={destinations}
          total={total}
          page={page}
          totalPages={totalPages}
          loading={loadingList}
          error={listError}
          searchQuery={searchQuery}
          selectedState={selectedState}
          selectedRegion={selectedRegion}
          selectedVerification={selectedVerification}
          studentFriendlyOnly={studentFriendlyOnly}
          finder={finder}
          onSearchQueryChange={(q) => {
            setSearchQuery(q);
            setPage(1);
          }}
          onStateChange={(st) => {
            setSelectedState(st);
            setPage(1);
          }}
          onRegionChange={(reg) => {
            setSelectedRegion(reg);
            setPage(1);
          }}
          onVerificationChange={(v) => {
            setSelectedVerification(v);
            setPage(1);
          }}
          onStudentFriendlyChange={(val) => {
            setStudentFriendlyOnly(val);
            setPage(1);
          }}
          onCategoryChange={(cat: IndiaCategory) =>
            updateFinder({ category: cat })
          }
          onPageChange={(next) => {
            setPage(next);
            scrollToSection('destinations');
          }}
          onResetAll={resetAllFilters}
          onExploreDestination={(id) => setSelectedDestinationId(id)}
        />

        <PackagesSection
          packages={FEATURED_PACKAGES}
          selectedSearchDest={destinationQuery}
          onBookPackage={handleOpenBookingForPkg}
        />

        <WhyChooseUsSection />

        <TestimonialsSection testimonials={TESTIMONIALS} />

        <VerificationReportSection
          stats={reportStats}
          byRegion={byRegion}
          byCategory={byCategory}
        />
      </main>

      <FooterSection
        destinations={DESTINATIONS}
        onNavigate={scrollToSection}
        onSelectDestination={(dest) => setExploredDestination(dest)}
      />

      {/* Individual 500+ Destination Full Detail + Lightbox + Admin Modal */}
      <IndiaDestinationDetailModal
        destinationId={selectedDestinationId}
        initialStartCity={finder.startCity}
        initialDays={finder.days}
        initialTravelers={finder.travelers}
        initialTravelMode={finder.travelMode}
        onClose={() => setSelectedDestinationId(null)}
        onSelectDestination={(id) => setSelectedDestinationId(id)}
        onDestinationUpdated={(updated) => {
          setDestinations((prev) =>
            prev.map((d) => (d.id === updated.id ? { ...d, ...updated } : d))
          );
          setRefreshNonce((n) => n + 1);
          showToast(`Updated verification for ${updated.name}.`);
        }}
        onBookDestination={handleBookIndiaDestination}
      />

      {/* Preserved Footer Curated Modal */}
      <DestinationModal
        key={exploredDestination?.id ?? 'closed'}
        destination={exploredDestination}
        onClose={() => setExploredDestination(null)}
        onBookDestination={handleOpenBookingForDest}
      />

      <BookingModal
        key={`${bookingOpen}-${bookingDestId}-${bookingPackage?.id ?? 'none'}`}
        open={bookingOpen}
        destinations={modalDestinations}
        packages={modalPackages}
        initialDestinationId={bookingDestId}
        initialPackage={bookingPackage}
        initialCheckIn={checkIn}
        initialCheckOut={checkOut}
        initialTravelers={finder.travelers || heroTravelers}
        user={user}
        onClose={() => setBookingOpen(false)}
        onSuccess={handleBookingSuccess}
      />

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthSuccess={(signedIn) => {
          setUser(signedIn);
          showToast(`Welcome to MUSAFIR, ${signedIn.name}.`);
        }}
      />

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 bg-[#141714] text-white px-5 py-3 rounded-full text-xs sm:text-sm font-medium shadow-xl"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
