import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  Users,
  X,
} from 'lucide-react';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { formatINR } from '../data/travelData.ts';
import {
  auth,
  saveBookingToFirestore,
  syncUserProfileToFirestore,
} from '../firebase.ts';
import { setMemoryAuthToken, submitBookingApi } from '../utils/apiClient.ts';
import type {
  BookingRecord,
  MusafirDestination,
  TravelPackage,
  UserSession,
} from '../types.ts';

/* ---------------- Destination Detail & 4–5 Photo Gallery Modal ---------------- */
interface DestinationModalProps {
  destination: MusafirDestination | null;
  onClose: () => void;
  onBookDestination: (dest: MusafirDestination) => void;
}

export const DestinationModal: React.FC<DestinationModalProps> = ({
  destination,
  onClose,
  onBookDestination,
}) => {
  const [photoIdx, setPhotoIdx] = useState(0);

  if (!destination) return null;

  const currentPhoto = destination.gallery[photoIdx] ?? destination.gallery[0];
  const totalPhotos = destination.gallery.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dest-modal-title"
    >
      <div className="glass-panel bg-white w-full max-w-3xl rounded-[28px] overflow-hidden animate-fade-up max-h-[92vh] overflow-y-auto">
        {/* Main Large Photo Stage */}
        <div className="relative h-64 sm:h-80 bg-[#141714]">
          <img
            src={currentPhoto?.imageUrl ?? destination.imageUrl}
            alt={currentPhoto?.title ?? destination.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"
          />

          <button
            type="button"
            onClick={onClose}
            aria-label="Close destination gallery"
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 text-[#141714] grid place-items-center cursor-pointer hover:bg-white"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Prev / Next Gallery Arrows */}
          <button
            type="button"
            aria-label="Previous photo"
            onClick={() =>
              setPhotoIdx((prev) => (prev - 1 + totalPhotos) % totalPhotos)
            }
            className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 text-[#141714] grid place-items-center cursor-pointer hover:bg-white shadow"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={() => setPhotoIdx((prev) => (prev + 1) % totalPhotos)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 text-[#141714] grid place-items-center cursor-pointer hover:bg-white shadow"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="absolute bottom-5 left-6 right-6 text-white">
            <p className="text-xs font-medium text-white/85 mb-1">
              {destination.country} · Photo {photoIdx + 1} of {totalPhotos} · Best in{' '}
              {destination.bestSeason}
            </p>
            <h3
              id="dest-modal-title"
              className="font-editorial text-2xl sm:text-3xl font-semibold"
            >
              {destination.name} — {currentPhoto?.title}
            </h3>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6 bg-white">
          {/* Thumbnail Strip */}
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
            {destination.gallery.map((item, idx) => {
              const active = idx === photoIdx;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPhotoIdx(idx)}
                  className={`relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer transition-all ${
                    active
                      ? 'ring-2 ring-[#1d4738] ring-offset-2 opacity-100'
                      : 'opacity-65 hover:opacity-100'
                  }`}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              );
            })}
          </div>

          {/* Easy Description for Selected Spot + Overall Guide */}
          <div className="bg-[#f7f5f0] rounded-2xl p-4 sm:p-5 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#1d4738]">
              About This Spot ({currentPhoto?.title})
            </p>
            <p className="text-sm sm:text-base text-[#141714] leading-relaxed">
              {currentPhoto?.description}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#5a6159]">
              Easy Trip Overview ({destination.idealDuration})
            </p>
            <p className="text-sm sm:text-base text-[#5a6159] leading-relaxed">
              {destination.easyDescription}
            </p>
          </div>

          <div className="space-y-2.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#1d4738]">
              What You’ll Experience
            </p>
            <ul className="space-y-2 text-sm text-[#141714]">
              {destination.highlights.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#1d4738] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t border-black/8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#5a6159] block">
                Starting Package Price
              </span>
              <span className="font-mono tabular-nums text-2xl font-semibold text-[#141714]">
                {formatINR(destination.startingPriceInr)}{' '}
                <span className="font-sans text-xs font-normal text-[#5a6159]">
                  / guest
                </span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => onBookDestination(destination)}
              className="bg-[#1d4738] hover:bg-[#15362a] text-white text-sm font-semibold px-6 py-3 rounded-full cursor-pointer transition-colors"
            >
              Book This Trip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------------- Trip Booking Modal ---------------- */
interface BookingModalProps {
  open: boolean;
  destinations: MusafirDestination[];
  packages: TravelPackage[];
  initialDestinationId: string;
  initialPackage: TravelPackage | null;
  initialCheckIn: string;
  initialCheckOut: string;
  initialTravelers: number;
  user: UserSession | null;
  onClose: () => void;
  onSuccess: (booking: BookingRecord) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  open,
  destinations,
  packages,
  initialDestinationId,
  initialPackage,
  initialCheckIn,
  initialCheckOut,
  initialTravelers,
  user,
  onClose,
  onSuccess,
}) => {
  const [selectedPkgId, setSelectedPkgId] = useState<string>(
    initialPackage?.id ??
      packages.find((p) => p.destinationId === initialDestinationId)?.id ??
      packages[0]?.id ??
      ''
  );
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [travelers, setTravelers] = useState(initialTravelers);
  const [guestName, setGuestName] = useState(user?.name ?? '');
  const [guestEmail, setGuestEmail] = useState(user?.email ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<BookingRecord | null>(null);

  if (!open) return null;

  const activePkg = packages.find((p) => p.id === selectedPkgId) ?? packages[0];
  const activeDest =
    destinations.find((d) => d.id === activePkg?.destinationId) ?? destinations[0];
  const totalEstimateInr = (activePkg?.pricePerGuestInr ?? 6999) * travelers;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!guestName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    const cleanEmail = guestEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (checkIn && checkOut && checkOut < checkIn) {
      setErrorMsg('Check-out date must be on or after check-in date.');
      return;
    }

    setSubmitting(true);
    try {
      const booking = await submitBookingApi({
        destinationName: activeDest?.name ?? 'Taj Mahal & Agra',
        packageTitle: activePkg?.title ?? 'Curated Journey',
        checkIn,
        checkOut,
        travelers,
        totalPriceInr: totalEstimateInr,
        guestName: guestName.trim(),
        guestEmail: cleanEmail,
      });

      if (auth.currentUser && auth.currentUser.emailVerified) {
        void saveBookingToFirestore({
          bookingCode: booking.id,
          destinationId: activeDest?.id ?? 'agra-taj',
          destinationName: booking.destinationName,
          packageTitle: booking.packageTitle,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          travelers: booking.travelers,
          totalPriceInr: booking.totalPriceInr,
          guestName: booking.guestName,
          guestEmail: booking.guestEmail,
        }).catch(() => {
          // Non-blocking Firestore sync
        });
      }

      setConfirmed(booking);
      onSuccess(booking);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Network error. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <div className="glass-panel bg-white w-full max-w-xl rounded-[28px] p-6 sm:p-8 animate-fade-up max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1d4738] mb-1">
              MUSAFIR Concierge
            </p>
            <h3
              id="booking-modal-title"
              className="font-editorial text-2xl sm:text-3xl font-semibold text-[#141714]"
            >
              {confirmed ? 'Reservation Confirmed' : 'Book Your Trip'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close booking dialog"
            className="w-9 h-9 rounded-full bg-[#f7f5f0] text-[#141714] grid place-items-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {confirmed ? (
          <div className="space-y-6">
            <div className="bg-[#e7ede9] rounded-2xl p-5 flex items-start gap-3.5 text-[#1d4738]">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">
                  Booking Reference: <span className="font-mono">{confirmed.id}</span>
                </p>
                <p className="text-xs text-[#1d4738]/85 mt-1">
                  We have sent your full itinerary brief to {confirmed.guestEmail}.
                </p>
              </div>
            </div>

            <div className="bg-[#f7f5f0] rounded-2xl p-5 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-[#5a6159]">Experience</span>
                <span className="font-semibold text-[#141714]">
                  {confirmed.packageTitle}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5a6159]">Dates</span>
                <span className="font-mono tabular-nums text-[#141714]">
                  {confirmed.checkIn} → {confirmed.checkOut}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5a6159]">Guests</span>
                <span className="font-mono tabular-nums text-[#141714]">
                  {confirmed.travelers}
                </span>
              </div>
              <div className="pt-2 border-t border-black/10 flex justify-between font-semibold">
                <span>Estimated Total</span>
                <span className="font-mono tabular-nums text-[#1d4738]">
                  {formatINR(confirmed.totalPriceInr)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full bg-[#141714] text-white text-sm font-semibold py-3.5 rounded-full cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="bk-pkg"
                className="text-xs font-semibold text-[#5a6159] flex items-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5 text-[#1d4738]" />
                <span>Select Curated Experience</span>
              </label>
              <select
                id="bk-pkg"
                value={selectedPkgId}
                onChange={(e) => setSelectedPkgId(e.target.value)}
                className="w-full bg-[#f7f5f0] border border-black/10 rounded-xl px-4 py-3 text-sm font-semibold text-[#141714]"
              >
                {packages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({formatINR(p.pricePerGuestInr)}/guest)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="bk-in"
                  className="text-xs font-semibold text-[#5a6159] flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#1d4738]" />
                  <span>Check-in</span>
                </label>
                <input
                  id="bk-in"
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full bg-[#f7f5f0] border border-black/10 rounded-xl px-3 py-2.5 text-sm font-mono tabular-nums"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="bk-out"
                  className="text-xs font-semibold text-[#5a6159] flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#1d4738]" />
                  <span>Check-out</span>
                </label>
                <input
                  id="bk-out"
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full bg-[#f7f5f0] border border-black/10 rounded-xl px-3 py-2.5 text-sm font-mono tabular-nums"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="bk-guests"
                  className="text-xs font-semibold text-[#5a6159] flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5 text-[#1d4738]" />
                  <span>Travelers</span>
                </label>
                <select
                  id="bk-guests"
                  value={travelers}
                  onChange={(e) => setTravelers(Number(e.target.value))}
                  className="w-full bg-[#f7f5f0] border border-black/10 rounded-xl px-3 py-2.5 text-sm font-mono tabular-nums font-semibold"
                >
                  {[1, 2, 3, 4, 5, 6, 8].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="bk-name"
                  className="text-xs font-semibold text-[#5a6159] block"
                >
                  Full Name
                </label>
                <input
                  id="bk-name"
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Aarav Sharma"
                  className="w-full bg-[#f7f5f0] border border-black/10 rounded-xl px-4 py-2.5 text-sm"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="bk-email"
                  className="text-xs font-semibold text-[#5a6159] block"
                >
                  Email Address
                </label>
                <input
                  id="bk-email"
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="aarav@example.com"
                  className="w-full bg-[#f7f5f0] border border-black/10 rounded-xl px-4 py-2.5 text-sm"
                  required
                />
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs font-medium text-rose-700">{errorMsg}</p>
            )}

            <div className="bg-[#ebe5da]/65 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-[#5a6159] block">Estimated Total</span>
                <span className="font-mono tabular-nums text-xl font-bold text-[#141714]">
                  {formatINR(totalEstimateInr)}
                </span>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="bg-[#1d4738] hover:bg-[#15362a] text-white text-sm font-semibold px-6 py-3 rounded-full inline-flex items-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{submitting ? 'Confirming...' : 'Confirm Reservation'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

/* ---------------- Auth Modal ---------------- */
interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  open,
  onClose,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (mode === 'signup' && !name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    setSubmitting(true);
    try {
      // Primary: Firebase Authentication
      try {
        if (mode === 'signup') {
          const cred = await createUserWithEmailAndPassword(
            auth,
            cleanEmail,
            password
          );
          const cleanName = name.trim() || cleanEmail.split('@')[0] || 'Traveler';
          await updateProfile(cred.user, { displayName: cleanName });
          void sendEmailVerification(cred.user).catch(() => {});
          onAuthSuccess({ name: cleanName, email: cleanEmail });
          onClose();
          return;
        } else {
          const cred = await signInWithEmailAndPassword(
            auth,
            cleanEmail,
            password
          );
          const cleanName =
            cred.user.displayName?.trim() ||
            cleanEmail.split('@')[0] ||
            'Traveler';
          if (cred.user.emailVerified) {
            void syncUserProfileToFirestore({
              uid: cred.user.uid,
              name: cleanName,
              email: cleanEmail,
            }).catch(() => {});
          }
          onAuthSuccess({ name: cleanName, email: cleanEmail });
          onClose();
          return;
        }
      } catch (fbErr: unknown) {
        const fbCode =
          typeof fbErr === 'object' && fbErr !== null && 'code' in fbErr
            ? String((fbErr as { code?: string }).code)
            : '';

        if (fbCode === 'auth/email-already-in-use') {
          setErrorMsg('An account with this email already exists. Please sign in.');
          return;
        }
        if (
          fbCode === 'auth/wrong-password' ||
          fbCode === 'auth/invalid-credential' ||
          fbCode === 'auth/user-not-found'
        ) {
          setErrorMsg('Invalid email or password.');
          return;
        }
        if (fbCode === 'auth/weak-password') {
          setErrorMsg('Password must be at least 6 characters long.');
          return;
        }
        if (fbCode !== 'auth/operation-not-allowed' && fbCode !== 'auth/network-request-failed') {
          // Fall through to server /api/auth only when Firebase provider is disabled or unavailable
          if (fbCode.startsWith('auth/')) {
            setErrorMsg('Authentication failed. Please check your credentials.');
            return;
          }
        }
      }

      // Secondary: Server /api/auth with scrypt password verification & signed session
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: cleanEmail, password, mode }),
      });
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        setErrorMsg('Authentication service is currently unavailable.');
        return;
      }
      const data = (await res.json()) as {
        user?: UserSession;
        token?: string;
        error?: string;
      };
      if (!res.ok || !data.user) {
        setErrorMsg(data.error ?? 'Authentication failed.');
      } else {
        if (data.token) setMemoryAuthToken(data.token);
        onAuthSuccess(data.user);
        onClose();
      }
    } catch {
      setErrorMsg('Unable to sign in right now. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="glass-panel bg-white w-full max-w-md rounded-[28px] p-6 sm:p-8 animate-fade-up">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1d4738] mb-1">
              MUSAFIR Member
            </p>
            <h3
              id="auth-modal-title"
              className="font-editorial text-2xl font-semibold text-[#141714]"
            >
              {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close auth dialog"
            className="w-9 h-9 rounded-full bg-[#f7f5f0] text-[#141714] grid place-items-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1 p-1 rounded-full bg-[#ebe5da] mb-5">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`py-2 rounded-full text-xs font-semibold cursor-pointer ${
              mode === 'login' ? 'bg-[#141714] text-white' : 'text-[#5a6159]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`py-2 rounded-full text-xs font-semibold cursor-pointer ${
              mode === 'signup' ? 'bg-[#141714] text-white' : 'text-[#5a6159]'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label
                htmlFor="auth-name"
                className="text-xs font-semibold text-[#5a6159] block"
              >
                Full Name
              </label>
              <input
                id="auth-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aarav Sharma"
                className="w-full bg-[#f7f5f0] border border-black/10 rounded-xl px-4 py-2.5 text-sm"
                required
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="auth-email"
              className="text-xs font-semibold text-[#5a6159] block"
            >
              Email Address
            </label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-[#f7f5f0] border border-black/10 rounded-xl px-4 py-2.5 text-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="auth-pass"
              className="text-xs font-semibold text-[#5a6159] block"
            >
              Password
            </label>
            <input
              id="auth-pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#f7f5f0] border border-black/10 rounded-xl px-4 py-2.5 text-sm"
              required
            />
          </div>

          {errorMsg && (
            <p className="text-xs font-medium text-rose-700">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#1d4738] hover:bg-[#15362a] text-white text-sm font-semibold py-3 rounded-full cursor-pointer inline-flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
