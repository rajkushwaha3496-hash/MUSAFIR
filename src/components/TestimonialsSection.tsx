import React from 'react';
import { Star } from 'lucide-react';
import type { Testimonial } from '../types.ts';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  testimonials,
}) => {
  return (
    <section className="mx-auto max-w-[1280px] px-4 sm:px-6 py-16 lg:py-20">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1d4738] mb-2">
          Traveler Stories
        </p>
        <h2 className="font-sans text-3xl sm:text-4xl font-semibold tracking-tight text-[#141714]">
          Memories Across{' '}
          <em className="font-editorial italic font-medium">Incredible India</em>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
        {testimonials.map((review) => (
          <article
            key={review.id}
            className="bg-white rounded-[26px] border border-black/6 p-7 shadow-[0_8px_28px_rgba(20,23,20,0.04)] flex flex-col justify-between gap-6"
          >
            <div className="space-y-4">
              <div
                className="flex items-center gap-1"
                aria-label={`${review.rating} out of 5 stars`}
              >
                {Array.from({ length: review.rating }).map((_, idx) => (
                  <Star
                    key={idx}
                    className="w-4 h-4 fill-[#1d4738] text-[#1d4738]"
                  />
                ))}
              </div>

              <p className="font-editorial text-lg italic leading-relaxed text-[#141714]">
                “{review.quote}”
              </p>
            </div>

            <div className="pt-4 border-t border-black/8 flex items-center gap-3.5">
              <img
                src={review.avatarUrl}
                alt={review.name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full object-cover border border-black/10 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#141714] truncate">
                  {review.name}
                </p>
                <p className="text-xs text-[#5a6159] truncate">
                  {review.tripTaken} · {review.location}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
