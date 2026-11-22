import React from 'react';
import { Clock, Star } from 'lucide-react';
import { formatINR } from '../data/travelData.ts';
import type { TravelPackage } from '../types.ts';

interface PackagesSectionProps {
  packages: TravelPackage[];
  selectedSearchDest: string;
  onBookPackage: (pkg: TravelPackage) => void;
}

export const PackagesSection: React.FC<PackagesSectionProps> = ({
  packages,
  selectedSearchDest,
  onBookPackage,
}) => {
  const orderedPackages =
    selectedSearchDest === 'all'
      ? packages
      : [...packages].sort((a, b) =>
          a.destinationId === selectedSearchDest
            ? -1
            : b.destinationId === selectedSearchDest
              ? 1
              : 0
        );

  return (
    <section
      id="packages"
      className="mx-auto max-w-[1280px] px-4 sm:px-6 py-16 lg:py-20"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1d4738] mb-2">
            Signature Journeys
          </p>
          <h2 className="font-sans text-3xl sm:text-4xl font-semibold tracking-tight text-[#141714]">
            Explore Our{' '}
            <em className="font-editorial italic font-medium">Best Experiences</em>
          </h2>
        </div>
        <p className="text-sm sm:text-base text-[#5a6159] max-w-md">
          Simple, budget-friendly all-inclusive journeys in Indian Rupees with
          comfortable stays, guided temple &amp; wonder visits, and clear transfers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {orderedPackages.map((pkg) => {
          const isHighlighted =
            selectedSearchDest !== 'all' &&
            pkg.destinationId === selectedSearchDest;

          return (
            <article
              key={pkg.id}
              className={`group bg-white rounded-[28px] overflow-hidden border transition-all duration-300 flex flex-col ${
                isHighlighted
                  ? 'border-[#1d4738] shadow-[0_16px_48px_rgba(29,71,56,0.14)]'
                  : 'border-black/6 shadow-[0_10px_32px_rgba(20,23,20,0.05)] hover:shadow-[0_20px_50px_rgba(20,23,20,0.1)]'
              }`}
            >
              <div className="relative h-72 sm:h-80 overflow-hidden bg-[#ebe5da]">
                <img
                  src={pkg.imageUrl}
                  alt={pkg.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"
                />
                <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between gap-4 text-white">
                  <p className="text-xs sm:text-sm font-medium text-white/90">
                    {pkg.locationLabel}
                  </p>
                  <p className="font-mono tabular-nums text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                    {pkg.rating.toFixed(1)} · {pkg.reviewCount} reviews
                  </p>
                </div>
              </div>

              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#5a6159]">
                    <Clock className="w-3.5 h-3.5 text-[#1d4738]" />
                    <span className="font-mono tabular-nums">{pkg.duration}</span>
                    <span aria-hidden="true">·</span>
                    <span>{pkg.inclusions[0]}</span>
                  </div>

                  <h3 className="font-editorial text-2xl sm:text-[26px] font-semibold text-[#141714] leading-snug">
                    {pkg.title}
                  </h3>

                  <p className="text-sm sm:text-[15px] text-[#5a6159] leading-relaxed">
                    {pkg.description}
                  </p>
                </div>

                <div className="pt-5 border-t border-black/8 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#5a6159] block">
                      Package Price
                    </span>
                    <p className="font-mono tabular-nums text-2xl font-semibold text-[#141714]">
                      {formatINR(pkg.pricePerGuestInr)}{' '}
                      <span className="font-sans text-xs font-normal text-[#5a6159]">
                        / guest
                      </span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onBookPackage(pkg)}
                    className="bg-[#1d4738] hover:bg-[#15362a] text-white text-sm font-semibold px-6 py-3 rounded-full cursor-pointer transition-all whitespace-nowrap shrink-0 shadow-sm hover:shadow-md"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
