import React from 'react';
import { Calendar, Loader2, Search, Users } from 'lucide-react';
import { HERO_MOUNTAIN_IMAGE } from '../data/travelData.ts';

interface HeroSectionProps {
  checkIn: string;
  checkOut: string;
  travelers: number;
  searching: boolean;
  onCheckInChange: (val: string) => void;
  onCheckOutChange: (val: string) => void;
  onTravelersChange: (val: number) => void;
  onSearchTrips: (e: React.FormEvent) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  checkIn,
  checkOut,
  travelers,
  searching,
  onCheckInChange,
  onCheckOutChange,
  onTravelersChange,
  onSearchTrips,
}) => {
  return (
    <section
      id="home"
      className="mx-auto max-w-[1280px] px-4 sm:px-6 pt-6 pb-12"
    >
      {/* Large Rounded Cinematic Container with Glassmorphism Framing */}
      <div className="relative rounded-[32px] overflow-hidden min-h-[600px] lg:min-h-[660px] flex flex-col justify-between p-5 sm:p-10 lg:p-14 shadow-[0_24px_70px_rgba(20,23,20,0.16)] bg-[#1b241e]">
        <img
          src={HERO_MOUNTAIN_IMAGE}
          alt="Cinematic alpine mountains and lush emerald valley"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Atmospheric Gradient Scrim for WCAG AA Contrast */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-black/52 via-black/30 to-black/72"
        />

        {/* Subtle Inner Glassmorphic Frame Container */}
        <div className="glass-hero-frame relative z-10 rounded-[26px] p-6 sm:p-10 lg:p-12 flex-1 flex flex-col justify-between gap-10">
          {/* Centered Editorial Headline Block */}
          <div className="max-w-3xl mx-auto text-center pt-4 sm:pt-8 animate-fade-up">
            <p className="text-[11px] sm:text-xs font-semibold tracking-[0.24em] uppercase text-white/95 mb-4">
              MUSAFIR · HAR SAFAR EK NAYI KAHANI
            </p>

            <h1 className="font-sans text-[clamp(2.25rem,4.8vw,4.15rem)] font-semibold leading-[1.08] tracking-tight text-white [text-wrap:balance] mb-5">
              Turn Your{' '}
              <em className="font-editorial italic font-medium text-[#f3ede2]">
                Travel Dreams
              </em>{' '}
              Into Epic Adventures
            </h1>

            <p className="text-base sm:text-lg text-white/90 font-normal leading-relaxed max-w-2xl mx-auto">
              Discover Indian wonders, sacred temples, Himalayan valleys, and
              coastal islands all over India—crafted simply in Rupees with clear
              step-by-step plans.
            </p>
          </div>

          {/* White Rounded Search & Booking Widget */}
          <form
            onSubmit={onSearchTrips}
            className="bg-white rounded-[24px] p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.2)] max-w-4xl w-full mx-auto animate-fade-up"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-center">
              {/* Check-in Date */}
              <div className="lg:col-span-4 px-2 sm:border-r border-black/10">
                <label
                  htmlFor="hero-checkin"
                  className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#5a6159] mb-1"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#1d4738]" />
                  <span>Check-in Date</span>
                </label>
                <input
                  id="hero-checkin"
                  type="date"
                  value={checkIn}
                  onChange={(e) => onCheckInChange(e.target.value)}
                  className="w-full bg-transparent text-sm font-mono tabular-nums font-medium text-[#141714] focus:outline-none py-1"
                />
              </div>

              {/* Check-out Date */}
              <div className="lg:col-span-4 px-2 lg:border-r border-black/10">
                <label
                  htmlFor="hero-checkout"
                  className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#5a6159] mb-1"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#1d4738]" />
                  <span>Check-out Date</span>
                </label>
                <input
                  id="hero-checkout"
                  type="date"
                  value={checkOut}
                  onChange={(e) => onCheckOutChange(e.target.value)}
                  className="w-full bg-transparent text-sm font-mono tabular-nums font-medium text-[#141714] focus:outline-none py-1"
                />
              </div>

              {/* Number of Travelers */}
              <div className="lg:col-span-2 px-2">
                <label
                  htmlFor="hero-travelers"
                  className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#5a6159] mb-1"
                >
                  <Users className="w-3.5 h-3.5 text-[#1d4738]" />
                  <span>Travelers</span>
                </label>
                <select
                  id="hero-travelers"
                  value={travelers}
                  onChange={(e) => onTravelersChange(Number(e.target.value))}
                  className="w-full bg-transparent text-sm font-mono tabular-nums font-semibold text-[#141714] focus:outline-none cursor-pointer py-1"
                >
                  {[1, 2, 3, 4, 5, 6, 8].map((count) => (
                    <option key={count} value={count}>
                      {count} {count === 1 ? 'Traveler' : 'Travelers'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Trips CTA */}
              <div className="lg:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={searching}
                  className="w-full bg-[#1d4738] hover:bg-[#15362a] text-white text-sm font-semibold px-5 py-3.5 rounded-2xl inline-flex items-center justify-center gap-2 cursor-pointer transition-all whitespace-nowrap shrink-0 disabled:opacity-75"
                >
                  {searching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Searching</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Search Trips</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
