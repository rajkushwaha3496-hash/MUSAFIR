import React from 'react';
import { Compass, Headphones, ShieldCheck, Sparkles } from 'lucide-react';

const PILLARS = [
  {
    icon: ShieldCheck,
    title: 'Best Price Guarantee',
    description:
      'Direct partnerships with boutique lodges and mountain guides ensure transparent pricing without hidden agency markups.',
  },
  {
    icon: Compass,
    title: 'Handpicked Destinations',
    description:
      'Every valley, villa, and scenic rail route is personally vetted by our travel curators for atmosphere and authenticity.',
  },
  {
    icon: Sparkles,
    title: 'Easy Booking Experience',
    description:
      'Reserve tailored multi-day escapes in minutes with clear itineraries, flexible dates, and instant confirmation.',
  },
  {
    icon: Headphones,
    title: '24/7 Travel Support',
    description:
      'Dedicated concierge specialists remain on call throughout your journey for seamless transfers and schedule adjustments.',
  },
];

export const WhyChooseUsSection: React.FC = () => {
  return (
    <section
      id="about"
      className="mx-auto max-w-[1280px] px-4 sm:px-6 py-16 lg:py-20"
    >
      <div className="bg-[#ebe5da]/75 rounded-[32px] border border-black/6 p-8 sm:p-12 lg:p-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          <div className="lg:col-span-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1d4738] mb-3">
              Why Choose MUSAFIR
            </p>
            <h2 className="font-sans text-3xl sm:text-4xl font-semibold tracking-tight text-[#141714] leading-tight mb-4">
              Travel designed with{' '}
              <em className="font-editorial italic font-medium">quiet precision</em>
            </h2>
            <p className="text-sm sm:text-base text-[#5a6159] leading-relaxed">
              Har safar ek nayi kahani—simple planning, clear Rupee pricing, and
              calm, verified journeys across every corner of India.
            </p>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {PILLARS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-white/85 rounded-2xl p-6 border border-black/6 shadow-[0_6px_22px_rgba(20,23,20,0.03)] hover:-translate-y-0.5 transition-transform"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#e7ede9] text-[#1d4738] grid place-items-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-sans text-lg font-semibold text-[#141714] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#5a6159] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
