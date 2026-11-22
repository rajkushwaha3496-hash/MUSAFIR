import React, { useState } from 'react';
import { CheckCircle2, Globe, Instagram, Loader2, Mail, MapPin, Phone, Send } from 'lucide-react';
import type { MusafirDestination } from '../types.ts';

interface FooterSectionProps {
  destinations: MusafirDestination[];
  onNavigate: (id: string) => void;
  onSelectDestination: (dest: MusafirDestination) => void;
}

export const FooterSection: React.FC<FooterSectionProps> = ({
  destinations,
  onNavigate,
  onSelectDestination,
}) => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [subscribedEmail, setSubscribedEmail] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { subscribed?: boolean; email?: string; error?: string };
      if (!res.ok) {
        setErrorMsg(data.error ?? 'Subscription failed.');
      } else {
        setSubscribedEmail(data.email ?? email);
        setEmail('');
      }
    } catch {
      setErrorMsg('Unable to connect right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer id="contact" className="pt-8">
      {/* Newsletter Subscription Banner */}
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 pb-16">
        <div className="bg-[#ebe5da] rounded-[32px] border border-black/8 px-6 py-12 sm:px-12 sm:py-14 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1d4738] mb-3">
            MUSAFIR · Har Safar Ek Nayi Kahani
          </p>
          <h2 className="font-sans text-3xl sm:text-4xl font-semibold tracking-tight text-[#141714] [text-wrap:balance] max-w-2xl mx-auto mb-3">
            Your Next Adventure Starts{' '}
            <em className="font-editorial italic font-medium">With One Click</em>
          </h2>
          <p className="text-sm sm:text-base text-[#5a6159] max-w-lg mx-auto mb-8">
            Get seasonal guides for Indian temples, mountain escapes, and curated
            Rupee packages delivered simply to your inbox.
          </p>

          {subscribedEmail ? (
            <div className="inline-flex items-center gap-2.5 bg-white px-6 py-3.5 rounded-full text-sm font-semibold text-[#1d4738] shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Welcome to MUSAFIR — {subscribedEmail} is subscribed.</span>
            </div>
          ) : (
            <form
              onSubmit={handleSubscribe}
              className="max-w-md mx-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 bg-white p-2 rounded-2xl sm:rounded-full shadow-[0_12px_32px_rgba(20,23,20,0.08)]"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                aria-label="Email address for newsletter"
                className="flex-1 bg-transparent px-4 py-2.5 text-sm text-[#141714] placeholder:text-[#7c837a] focus:outline-none"
                required
              />
              <button
                type="submit"
                disabled={submitting}
                className="bg-[#1d4738] hover:bg-[#15362a] text-white text-sm font-semibold px-6 py-3 rounded-xl sm:rounded-full inline-flex items-center justify-center gap-2 cursor-pointer transition-colors whitespace-nowrap shrink-0 disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Subscribing</span>
                  </>
                ) : (
                  <>
                    <span>Subscribe</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}
          {errorMsg && (
            <p className="text-xs font-medium text-rose-700 mt-3">{errorMsg}</p>
          )}
        </div>
      </div>

      {/* Main Dark Charcoal Footer */}
      <div className="bg-[#141714] text-[#ebe5da]">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-14 lg:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/12">
            {/* Brand & Description */}
            <div className="lg:col-span-4 space-y-4">
              <div>
                <p className="font-editorial text-3xl font-bold tracking-wide text-white">
                  MUSAFIR
                </p>
                <p className="text-xs tracking-[0.18em] uppercase text-[#8fc4ad] mt-1">
                  Har Safar Ek Nayi Kahani
                </p>
              </div>
              <p className="text-sm text-white/70 leading-relaxed max-w-xs">
                Thoughtful, easy-to-plan journeys across India’s sacred temples,
                heritage wonders, Himalayan peaks, and tropical islands.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="#home"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('home');
                  }}
                  aria-label="MUSAFIR Instagram"
                  className="w-9 h-9 rounded-full border border-white/20 grid place-items-center text-white/80 hover:text-white hover:border-white/50 transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="#destinations"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('destinations');
                  }}
                  aria-label="MUSAFIR Destinations"
                  className="w-9 h-9 rounded-full border border-white/20 grid place-items-center text-white/80 hover:text-white hover:border-white/50 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                </a>
                <a
                  href="mailto:namaste@musafir.travel"
                  aria-label="Email MUSAFIR"
                  className="w-9 h-9 rounded-full border border-white/20 grid place-items-center text-white/80 hover:text-white hover:border-white/50 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-2 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                Quick Links
              </p>
              <ul className="space-y-2.5 text-sm text-white/80">
                {[
                  { id: 'home', label: 'Home' },
                  { id: 'destinations', label: 'Destinations' },
                  { id: 'packages', label: 'Travel Packages' },
                  { id: 'about', label: 'About Us' },
                ].map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate(item.id);
                      }}
                      className="hover:text-white transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Popular Destinations */}
            <div className="lg:col-span-3 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                Popular Destinations
              </p>
              <ul className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-sm text-white/80">
                {destinations.slice(0, 10).map((dest) => (
                  <li key={dest.id}>
                    <button
                      type="button"
                      onClick={() => onSelectDestination(dest)}
                      className="hover:text-white transition-colors cursor-pointer text-left"
                    >
                      {dest.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="lg:col-span-3 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                Contact
              </p>
              <ul className="space-y-2.5 text-sm text-white/80">
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#7fb39c] shrink-0" />
                  <span>namaste@musafir.travel</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#7fb39c] shrink-0" />
                  <span className="font-mono tabular-nums">+91 98110 44290</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#7fb39c] shrink-0 mt-0.5" />
                  <span>Connaught Place, New Delhi &amp; Bengaluru</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/55">
            <p>© {new Date().getFullYear()} MUSAFIR Travels. All rights reserved.</p>
            <p>Har Safar Ek Nayi Kahani.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
