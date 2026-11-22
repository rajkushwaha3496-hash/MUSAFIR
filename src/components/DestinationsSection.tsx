import React, { useState } from 'react';
import { ArrowUpRight, Images } from 'lucide-react';
import { formatINR } from '../data/travelData.ts';
import type { DestinationRegion, MusafirDestination } from '../types.ts';

interface DestinationsSectionProps {
  destinations: MusafirDestination[];
  activeRegion: DestinationRegion;
  selectedSearchDest: string;
  onRegionChange: (region: DestinationRegion) => void;
  onClearSearchFilter: () => void;
  onExploreDestination: (dest: MusafirDestination) => void;
}

const REGIONS: DestinationRegion[] = [
  'All',
  'Indian Wonders & Temples',
  'Mountains',
  'Tropical & Coastal',
  'Iconic Cities',
];

export const DestinationsSection: React.FC<DestinationsSectionProps> = ({
  destinations,
  activeRegion,
  selectedSearchDest,
  onRegionChange,
  onClearSearchFilter,
  onExploreDestination,
}) => {
  const [activePhotoByDest, setActivePhotoByDest] = useState<Record<string, number>>({});

  const visibleDestinations = destinations.filter((dest) => {
    const regionOk = activeRegion === 'All' || dest.regionCategory === activeRegion;
    const searchOk =
      selectedSearchDest === 'all' || dest.id === selectedSearchDest;
    return regionOk && searchOk;
  });

  return (
    <section
      id="destinations"
      className="mx-auto max-w-[1280px] px-4 sm:px-6 py-16 lg:py-20"
    >
      <div id="explore" className="scroll-mt-24" />
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1d4738] mb-2">
            All Over India · Verified Wonders, Temples, Hills &amp; Coasts
          </p>
          <h2 className="font-sans text-3xl sm:text-4xl font-semibold tracking-tight text-[#141714]">
            Popular{' '}
            <em className="font-editorial italic font-medium">Destinations</em>
          </h2>
          <p className="text-sm sm:text-base text-[#5a6159] mt-2 max-w-2xl">
            Click any thumbnail on a card to preview 4–5 iconic spots for that place,
            or select Explore for an easy day-by-day overview and full photo gallery.
          </p>
        </div>

        {/* Interactive Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {selectedSearchDest !== 'all' && (
            <button
              type="button"
              onClick={onClearSearchFilter}
              className="text-xs font-semibold text-[#1d4738] underline underline-offset-4 mr-2 cursor-pointer whitespace-nowrap"
            >
              Show all {destinations.length} places
            </button>
          )}
          <div
            className="inline-flex flex-wrap items-center gap-1 p-1 rounded-2xl sm:rounded-full bg-[#ebe5da]"
            role="tablist"
            aria-label="Filter destinations by category"
          >
            {REGIONS.map((region) => {
              const active = activeRegion === region;
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
                  {region}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {visibleDestinations.length === 0 ? (
        <div className="bg-white rounded-3xl border border-black/8 p-12 text-center">
          <p className="font-editorial text-2xl font-medium text-[#141714] mb-2">
            No destinations match both filters
          </p>
          <p className="text-sm text-[#5a6159] mb-5">
            Reset the category or search selection to browse all places.
          </p>
          <button
            type="button"
            onClick={() => {
              onRegionChange('All');
              onClearSearchFilter();
            }}
            className="bg-[#1d4738] text-white text-sm font-semibold px-5 py-2.5 rounded-full cursor-pointer"
          >
            View All Destinations
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {visibleDestinations.map((dest) => {
            const activeIndex = activePhotoByDest[dest.id] ?? 0;
            const activePhoto = dest.gallery[activeIndex] ?? dest.gallery[0];

            return (
              <article
                key={dest.id}
                className="group bg-white rounded-[26px] border border-black/6 overflow-hidden shadow-[0_8px_28px_rgba(20,23,20,0.04)] hover:shadow-[0_18px_44px_rgba(20,23,20,0.09)] transition-all duration-300 flex flex-col"
              >
                {/* Main Photo */}
                <div className="relative aspect-[4/3] overflow-hidden bg-[#ebe5da]">
                  <img
                    src={activePhoto?.imageUrl ?? dest.imageUrl}
                    alt={`${dest.name} — ${activePhoto?.title ?? dest.name}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"
                  />
                  <div className="absolute bottom-3.5 left-4 right-4 flex items-end justify-between gap-3 text-white">
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-white/80">
                        Spot {activeIndex + 1} of {dest.gallery.length}
                      </p>
                      <p className="text-sm font-semibold truncate">
                        {activePhoto?.title}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono tabular-nums text-white/90 shrink-0">
                      <Images className="w-3.5 h-3.5" />
                      {dest.gallery.length} photos
                    </span>
                  </div>
                </div>

                {/* Interactive 4–5 Photo Thumbnail Strip */}
                <div className="px-4 pt-3 flex items-center gap-2">
                  {dest.gallery.map((photo, idx) => {
                    const isCurrent = idx === activeIndex;
                    return (
                      <button
                        key={photo.id}
                        type="button"
                        onClick={() =>
                          setActivePhotoByDest((prev) => ({ ...prev, [dest.id]: idx }))
                        }
                        aria-label={`View ${photo.title}`}
                        className={`relative flex-1 h-12 rounded-xl overflow-hidden cursor-pointer transition-all ${
                          isCurrent
                            ? 'ring-2 ring-[#1d4738] ring-offset-1 opacity-100'
                            : 'opacity-65 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={photo.imageUrl}
                          alt={photo.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Card Copy & Simple Description */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-[#5a6159] mb-1">
                      {dest.country} · {dest.idealDuration} · Best in {dest.bestSeason}
                    </p>
                    <h3 className="font-editorial text-2xl font-semibold text-[#141714] mb-2">
                      {dest.name}
                    </h3>
                    <p className="text-sm text-[#5a6159] leading-relaxed">
                      {dest.easyDescription}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-black/8 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-[#5a6159] block">
                        Starting from
                      </span>
                      <span className="font-mono tabular-nums text-lg font-semibold text-[#141714]">
                        {formatINR(dest.startingPriceInr)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onExploreDestination(dest)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold bg-[#f7f5f0] hover:bg-[#1d4738] text-[#141714] hover:text-white border border-black/10 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <span>Explore ({dest.gallery.length} Pics)</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
