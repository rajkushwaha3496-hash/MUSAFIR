import React from 'react';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Database,
  FileCheck2,
  Map,
  ShieldAlert,
} from 'lucide-react';
import type { DestinationsReportStats } from '../types.ts';

interface VerificationReportSectionProps {
  stats: DestinationsReportStats | null;
  byRegion: Record<string, number>;
  byCategory: Record<string, number>;
}

export const VerificationReportSection: React.FC<VerificationReportSectionProps> = ({
  stats,
  byRegion,
  byCategory,
}) => {
  if (!stats) return null;

  return (
    <section
      id="verification-report"
      className="mx-auto max-w-[1280px] px-4 sm:px-6 py-12 lg:py-16 scroll-mt-24"
    >
      <div className="bg-white rounded-[32px] border border-black/8 p-7 sm:p-10 lg:p-12 shadow-[0_10px_32px_rgba(20,23,20,0.04)]">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1d4738] mb-2">
              Live Database &amp; Photo Verification Report
            </p>
            <h2 className="font-sans text-3xl sm:text-4xl font-semibold tracking-tight text-[#141714]">
              Transparent{' '}
              <em className="font-editorial italic font-medium">
                India Coverage &amp; Photo Audit
              </em>
            </h2>
            <p className="text-sm text-[#5a6159] mt-2 max-w-2xl">
              Every destination photograph on MUSAFIR is sourced directly from
              Wikimedia Commons and Wikipedia with preserved photographer credits,
              licenses, and source links—never unrelated or synthetic images.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e7ede9] text-[#1d4738] text-xs font-semibold shrink-0">
            <Database className="w-4 h-4" />
            <span>Live Database Metrics</span>
          </div>
        </div>

        {/* Key Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-[#f7f5f0] rounded-2xl p-4 border border-black/6">
            <Map className="w-4 h-4 text-[#1d4738] mb-2" />
            <p className="font-mono tabular-nums text-2xl font-bold text-[#141714]">
              {stats.totalDestinations}
            </p>
            <p className="text-xs text-[#5a6159] mt-0.5">Total Destinations</p>
          </div>

          <div className="bg-[#f7f5f0] rounded-2xl p-4 border border-black/6">
            <Camera className="w-4 h-4 text-[#1d4738] mb-2" />
            <p className="font-mono tabular-nums text-2xl font-bold text-[#141714]">
              {stats.totalPhotographs.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-[#5a6159] mt-0.5">Real Photos Added</p>
          </div>

          <div className="bg-[#e7ede9]/70 rounded-2xl p-4 border border-[#1d4738]/15">
            <CheckCircle2 className="w-4 h-4 text-[#1d4738] mb-2" />
            <p className="font-mono tabular-nums text-2xl font-bold text-[#1d4738]">
              {stats.completeGalleries}
            </p>
            <p className="text-xs text-[#1d4738]/85 mt-0.5">
              Complete Galleries (3–6)
            </p>
          </div>

          <div className="bg-[#f7f5f0] rounded-2xl p-4 border border-black/6">
            <AlertTriangle className="w-4 h-4 text-amber-700 mb-2" />
            <p className="font-mono tabular-nums text-2xl font-bold text-[#141714]">
              {stats.missingPhotos}
            </p>
            <p className="text-xs text-[#5a6159] mt-0.5">
              Missing Photos ({stats.partialGalleries} partial)
            </p>
          </div>

          <div className="bg-[#f7f5f0] rounded-2xl p-4 border border-black/6">
            <FileCheck2 className="w-4 h-4 text-[#1d4738] mb-2" />
            <p className="font-mono tabular-nums text-2xl font-bold text-[#141714]">
              {stats.completeDescriptions}
            </p>
            <p className="text-xs text-[#5a6159] mt-0.5">
              Complete Descriptions
            </p>
          </div>

          <div className="bg-[#f7f5f0] rounded-2xl p-4 border border-black/6">
            <ShieldAlert className="w-4 h-4 text-[#1d4738] mb-2" />
            <p className="font-mono tabular-nums text-2xl font-bold text-[#141714]">
              {stats.statesAndUTsCovered} / 36
            </p>
            <p className="text-xs text-[#5a6159] mt-0.5">
              States &amp; UTs Covered
            </p>
          </div>
        </div>

        {/* Verification Status + Regional Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-[#f7f5f0] rounded-2xl p-5 border border-black/6">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#1d4738] mb-3">
              Verification Status Breakdown
            </p>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 font-medium text-[#141714]">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  Verified (Official Source + 3+ Photos)
                </span>
                <span className="font-mono tabular-nums font-semibold">
                  {stats.verifiedCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 font-medium text-[#141714]">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Needs Review (Partial Info/Photos)
                </span>
                <span className="font-mono tabular-nums font-semibold">
                  {stats.needsReviewCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 font-medium text-[#141714]">
                  <span className="w-2.5 h-2.5 rounded-full bg-stone-400" />
                  Unverified (Awaiting Research)
                </span>
                <span className="font-mono tabular-nums font-semibold">
                  {stats.unverifiedCount}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#f7f5f0] rounded-2xl p-5 border border-black/6">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#1d4738] mb-3">
              Regional Coverage Across India
            </p>
            <div className="grid grid-cols-2 gap-2.5 text-sm">
              {Object.entries(byRegion).map(([region, count]) => (
                <div
                  key={region}
                  className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-black/5"
                >
                  <span className="font-medium text-[#141714]">{region}</span>
                  <span className="font-mono tabular-nums text-xs font-semibold text-[#1d4738]">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#f7f5f0] rounded-2xl p-5 border border-black/6">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#1d4738] mb-3">
              Top Categories &amp; Sources
            </p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {Object.entries(byCategory)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8)
                .map(([cat, count]) => (
                  <span
                    key={cat}
                    className="bg-white px-2.5 py-1 rounded-full text-xs font-medium text-[#141714] border border-black/6"
                  >
                    {cat}: <strong className="font-mono">{count}</strong>
                  </span>
                ))}
            </div>
            <p className="text-[11px] text-[#5a6159] leading-relaxed">
              Sources: Wikimedia Commons API (CC BY / CC BY-SA / Public Domain),
              Wikipedia Geo &amp; Summaries API, and Official State/UT Tourism
              Portals.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
