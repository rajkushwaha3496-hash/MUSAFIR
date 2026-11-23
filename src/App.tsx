import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { FooterSection } from './components/FooterSection.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { IndiaDestinationDetailModal } from './components/IndiaDestinationDetailModal.tsx';
import { IndiaDestinationsDirectory } from './components/IndiaDestinationsDirectory.tsx';
import { Navbar } from './components/Navbar.tsx';
import { PackagesSection } from './components/PackagesSection.tsx';
import { TestimonialsSection } from './components/TestimonialsSection.tsx';
import { VerificationReportSection } from './components/VerificationReportSection.tsx';
import {
  AuthModal,
  BookingModal,
  DestinationModal,
} from './components/WanderlyModals.tsx';
import { WhyChooseUsSection } from './components/WhyChooseUsSection.tsx';
import { STARTING_CITIES } from './data/indianCities.ts';
import {
  DESTINATIONS,
  FEATURED_PACKAGES,
  TESTIMONIALS,
} from './data/travelData.ts';
import { auth, syncUserProfileToFirestore } from './firebase.ts';
import type {
  BookingRecord,
  DestinationMapPoint,
  DestinationsReportStats,
  IndiaCategory,
  IndiaDestination,
  IndiaRegion,
  MusafirDestination,
  StudentFinderState,
  TravelPackage,
  UserSession,
  VerificationStatus,
} from './types.ts';
import {
  fetchDestinationMapPointsApi,
  fetchDestinationsApi,
  fetchDestinationsStatsApi,
  fetchSessionFromServerApi,
  logoutServerApi,
} from './utils/apiClient.ts';

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

export default function App() {
  // Hero search & preserved booking state
  const destinationQuery = 'all';
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

  // Interactive All-India map dots & starting location (city or GPS)
  const [mapPoints, setMapPoints] = useState<DestinationMapPoint[]>([]);
  const [loadingMap, setLoadingMap] = useState(true);
  const [userCoords, setUserCoords] = useState<{
    lat: number;
    lon: number;
    label: string;
  } | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);
  const [pickingStartOnMap, setPickingStartOnMap] = useState(false);
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);

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
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToast((curr) => (curr === message ? null : curr));
    }, 3600);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // Listen for Google Maps Platform quota/auth events from main.tsx
  useEffect(() => {
    const onQuotaExceeded = () => setMapsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuotaExceeded);
    return () => {
      window.removeEventListener('gmp-quota-exceeded', onQuotaExceeded);
    };
  }, []);

  // Session persistence across reloads (Firebase Auth + server session cookie fallback)
  useEffect(() => {
    let active = true;
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!active) return;
      if (fbUser && fbUser.email) {
        const display =
          fbUser.displayName?.trim() || fbUser.email.split('@')[0] || 'Traveler';
        setUser({ name: display, email: fbUser.email });
        if (fbUser.emailVerified) {
          void syncUserProfileToFirestore({
            uid: fbUser.uid,
            name: display,
            email: fbUser.email,
          }).catch(() => {
            // Non-blocking profile sync
          });
        }
      } else {
        const serverUser = await fetchSessionFromServerApi();
        if (active) {
          setUser(serverUser);
        }
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
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
    fetchDestinationsStatsApi()
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

  // Fetch filtered/sorted 500+ Indian destinations with Express + Netlify + Static fallback
  useEffect(() => {
    const controller = new AbortController();
    setLoadingList(true);
    setListError(null);

    const timer = window.setTimeout(() => {
      fetchDestinationsApi(
        {
          q: searchQuery.trim(),
          state: selectedState,
          region: selectedRegion,
          category: finder.category,
          budgetTier: finder.budgetTier,
          maxBudget:
            finder.budgetTier === 'custom' ? finder.customMaxBudget : null,
          days: finder.days,
          travelers: finder.travelers,
          travelMode: finder.travelMode,
          season: finder.season,
          startCity: finder.startCity,
          userLat: userCoords?.lat ?? null,
          userLon: userCoords?.lon ?? null,
          maxDistanceKm: finder.maxDistanceKm,
          verificationStatus: selectedVerification,
          studentFriendly: studentFriendlyOnly,
          weekendTrip: finder.weekendTrip,
          oneDayTrip: finder.oneDayTrip,
          groupTrip: finder.groupTrip,
          sort: finder.sort,
          page,
          limit: 18,
        },
        controller.signal
      )
        .then((data) => {
          if (controller.signal.aborted) return;
          setDestinations(data.items || []);
          setTotal(data.total || 0);
          setTotalPages(data.totalPages || 1);
          if (data.page && data.page !== page) {
            setPage(data.page);
          }
          if (data.stats) setReportStats(data.stats);
        })
        .catch((err: unknown) => {
          if (err instanceof Error && err.name === 'AbortError') return;
          setListError(
            err instanceof Error
              ? err.message
              : 'Unable to load destinations right now.'
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
    userCoords,
    searchQuery,
    selectedState,
    selectedRegion,
    selectedVerification,
    studentFriendlyOnly,
    page,
    refreshNonce,
  ]);

  // Fetch ALL matching destinations for the interactive India map dots
  useEffect(() => {
    const controller = new AbortController();
    setLoadingMap(true);

    const timer = window.setTimeout(() => {
      fetchDestinationMapPointsApi(
        {
          q: searchQuery.trim(),
          state: selectedState,
          region: selectedRegion,
          category: finder.category,
          budgetTier: finder.budgetTier,
          maxBudget:
            finder.budgetTier === 'custom' ? finder.customMaxBudget : null,
          days: finder.days,
          travelers: finder.travelers,
          travelMode: finder.travelMode,
          season: finder.season,
          startCity: finder.startCity,
          userLat: userCoords?.lat ?? null,
          userLon: userCoords?.lon ?? null,
          maxDistanceKm: finder.maxDistanceKm,
          verificationStatus: selectedVerification,
          studentFriendly: studentFriendlyOnly,
          weekendTrip: finder.weekendTrip,
          oneDayTrip: finder.oneDayTrip,
          groupTrip: finder.groupTrip,
        },
        controller.signal
      )
        .then((points) => {
          if (!controller.signal.aborted) {
            setMapPoints(points || []);
          }
        })
        .catch((err: unknown) => {
          if (err instanceof Error && err.name === 'AbortError') return;
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setLoadingMap(false);
          }
        });
    }, 120);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [
    finder,
    userCoords,
    searchQuery,
    selectedState,
    selectedRegion,
    selectedVerification,
    studentFriendlyOnly,
    refreshNonce,
  ]);

  const updateFinder = useCallback((patch: Partial<StudentFinderState>) => {
    setFinder((prev) => ({ ...prev, ...patch }));
    setPage(1);
  }, []);

  const handleStartCityChange = useCallback((cityId: string) => {
    setUserCoords(null);
    setLocationError(null);
    setLocationNotice(null);
    setPickingStartOnMap(false);
    setFinder((prev) => ({ ...prev, startCity: cityId }));
    setPage(1);
  }, []);

  const handleClearGps = useCallback(() => {
    setUserCoords(null);
    setLocationError(null);
    setLocationNotice(null);
    setPickingStartOnMap(false);
    setPage(1);
  }, []);

  const handlePickOriginCoords = useCallback(
    (lat: number, lon: number, label?: string) => {
      const cleanLabel = label?.trim() || 'Custom Map Pin';
      setUserCoords({ lat, lon, label: cleanLabel });
      setLocationError(null);
      setLocationNotice(null);
      setPickingStartOnMap(false);
      setPage(1);
      showToast(
        `Trip starting point set to ${cleanLabel} (${lat}° N, ${lon}° E).`
      );
    },
    [showToast]
  );

  const detectNetworkApproxLocation = useCallback(async (): Promise<{
    lat: number;
    lon: number;
    label: string;
  } | null> => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch('https://get.geojs.io/v1/ip/geo.json', {
        signal: controller.signal,
      });
      if (!res.ok) return null;
      const data = (await res.json()) as {
        latitude?: string | number;
        longitude?: string | number;
        city?: string;
        country_code?: string;
      };
      const lat = Number(data.latitude);
      const lon = Number(data.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
      const cleanCity = (data.city || '').trim();
      const label = cleanCity
        ? data.country_code && data.country_code !== 'IN'
          ? `Near ${cleanCity}, ${data.country_code}`
          : `Near ${cleanCity}`
        : 'Approximate Network Location';
      return {
        lat: Number(lat.toFixed(4)),
        lon: Number(lon.toFixed(4)),
        label,
      };
    } catch {
      return null;
    } finally {
      window.clearTimeout(timer);
    }
  }, []);

  const handleDetectLocation = useCallback(async () => {
    setDetectingLocation(true);
    setLocationError(null);
    setLocationNotice(null);
    setPickingStartOnMap(false);

    const runNetworkFallback = async (reason: 'denied' | 'iframe' | 'unavailable') => {
      const approx = await detectNetworkApproxLocation();
      setDetectingLocation(false);
      if (approx) {
        setUserCoords(approx);
        setPage(1);
        const why =
          reason === 'iframe'
            ? 'Exact GPS is blocked inside embedded preview frames'
            : reason === 'denied'
              ? 'Browser GPS permission is blocked'
              : 'Exact GPS is unavailable';
        setLocationNotice(
          `${why}, so we detected your approximate network location (${approx.label}). You can also choose any Indian city or click "Pick Start on Map".`
        );
        showToast(`Starting location set to ${approx.label}.`);
        return;
      }

      setLocationError(
        reason === 'iframe'
          ? 'Exact GPS is blocked in this embedded preview and network lookup was blocked. Please pick your starting city or click "Pick Start on Map".'
          : 'Location permission is blocked in your browser. Please pick your starting city or click "Pick Start on Map".'
      );
    };

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      await runNetworkFallback('unavailable');
      return;
    }

    const inIframe = (() => {
      try {
        return window.self !== window.top;
      } catch {
        return true;
      }
    })();

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(4));
        const lon = Number(pos.coords.longitude.toFixed(4));
        setUserCoords({ lat, lon, label: 'Your GPS Location' });
        setDetectingLocation(false);
        setPage(1);
        showToast(
          `Starting location set to your GPS coordinates (${lat}° N, ${lon}° E).`
        );
      },
      (err) => {
        const reason =
          err.code === err.PERMISSION_DENIED
            ? inIframe
              ? 'iframe'
              : 'denied'
            : 'unavailable';
        void runNetworkFallback(reason);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }, [detectNetworkApproxLocation, showToast]);

  const resetAllFilters = useCallback(() => {
    setFinder(DEFAULT_FINDER);
    setUserCoords(null);
    setLocationError(null);
    setLocationNotice(null);
    setPickingStartOnMap(false);
    setSearchQuery('');
    setSelectedState('All');
    setSelectedRegion('All');
    setSelectedVerification('All');
    setStudentFriendlyOnly(false);
    setPage(1);
    setRefreshNonce((n) => n + 1);
  }, []);

  const handleCheckInChange = (val: string) => {
    setCheckIn(val);
    if (checkOut && val && checkOut < val) {
      setCheckOut(val);
    }
  };

  const handleCheckOutChange = (val: string) => {
    if (checkIn && val && val < checkIn) {
      showToast('Check-out date cannot be before check-in date.');
      setCheckOut(checkIn);
      return;
    }
    setCheckOut(val);
  };

  const handleSearchTrips = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkIn && checkOut && checkOut < checkIn) {
      showToast('Check-out date must be on or after check-in date.');
      return;
    }

    setSearching(true);
    setSelectedRegion('All');
    setSelectedState('All');
    setSearchQuery('');
    setFinder((prev) => ({ ...prev, travelers: heroTravelers }));
    setPage(1);

    window.setTimeout(() => {
      setSearching(false);
      scrollToSection('destinations');
      showToast(
        `Showing Indian destinations for ${heroTravelers} ${
          heroTravelers === 1 ? 'traveler' : 'travelers'
        }.`
      );
    }, 240);
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

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore if signed in via server cookie only
    }
    await logoutServerApi();
    setUser(null);
    showToast('Signed out of MUSAFIR.');
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

  const startLocationLabel = useMemo(() => {
    if (userCoords) return userCoords.label;
    return (
      STARTING_CITIES.find((c) => c.id === finder.startCity)?.name ||
      'New Delhi'
    );
  }, [userCoords, finder.startCity]);

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#141714]">
      {mapsQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      <Navbar
        user={user}
        onNavigate={scrollToSection}
        onOpenAuth={() => setAuthOpen(true)}
        onLogout={handleLogout}
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
          checkIn={checkIn}
          checkOut={checkOut}
          travelers={heroTravelers}
          searching={searching}
          onCheckInChange={handleCheckInChange}
          onCheckOutChange={handleCheckOutChange}
          onTravelersChange={setHeroTravelers}
          onSearchTrips={handleSearchTrips}
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
          userCoords={userCoords}
          startLocationLabel={startLocationLabel}
          detectingLocation={detectingLocation}
          locationError={locationError}
          locationNotice={locationNotice}
          pickingStartOnMap={pickingStartOnMap}
          mapPoints={mapPoints}
          loadingMap={loadingMap}
          onStartCityChange={handleStartCityChange}
          onDetectLocation={handleDetectLocation}
          onClearGps={handleClearGps}
          onTogglePickStartOnMap={() => setPickingStartOnMap((prev) => !prev)}
          onPickOriginCoords={handlePickOriginCoords}
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
        userLat={userCoords?.lat ?? null}
        userLon={userCoords?.lon ?? null}
        startLocationLabel={startLocationLabel}
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
