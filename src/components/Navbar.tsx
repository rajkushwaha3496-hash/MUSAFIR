import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import type { UserSession } from '../types.ts';

interface NavbarProps {
  user: UserSession | null;
  onNavigate: (sectionId: string) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onBookTrip: () => void;
}

const NAV_LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'destinations', label: '500+ Places' },
  { id: 'packages', label: 'Packages' },
  { id: 'about', label: 'About Us' },
  { id: 'verification-report', label: 'Data Report' },
];

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onNavigate,
  onOpenAuth,
  onLogout,
  onBookTrip,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLinkClick = (id: string) => {
    setMobileOpen(false);
    onNavigate(id);
  };

  return (
    <header className="sticky top-4 z-40 mx-auto max-w-[1280px] px-4 sm:px-6">
      <div className="glass-navbar rounded-full px-5 sm:px-7 py-3 flex items-center justify-between gap-6">
        {/* Brand Logo */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('home');
          }}
          className="font-editorial text-2xl font-bold tracking-wide text-[#141714] whitespace-nowrap shrink-0"
        >
          MUSAFIR
        </a>

        {/* Center Navigation Links */}
        <nav
          aria-label="Primary"
          className="hidden lg:flex items-center gap-6 text-[13px] font-medium text-[#4a5149]"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick(link.id);
              }}
              className="whitespace-nowrap shrink-0 py-1 hover:text-[#141714] transition-colors relative after:absolute after:left-0 after:bottom-0 after:h-[1.5px] after:w-0 after:bg-[#1d4738] hover:after:w-full after:transition-all"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden lg:flex items-center gap-4 shrink-0">
          {user ? (
            <button
              type="button"
              onClick={onLogout}
              title="Click to sign out"
              className="text-[13px] font-medium text-[#1d4738] hover:text-[#141714] whitespace-nowrap shrink-0 cursor-pointer"
            >
              Hi, {user.name.split(' ')[0]} · Sign Out
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="text-[13px] font-medium text-[#141714] hover:text-[#1d4738] whitespace-nowrap shrink-0 cursor-pointer transition-colors"
            >
              Login / Sign Up
            </button>
          )}

          <button
            type="button"
            onClick={onBookTrip}
            className="bg-[#1d4738] hover:bg-[#15362a] text-white text-[13px] font-semibold px-5 py-2.5 rounded-full whitespace-nowrap shrink-0 cursor-pointer transition-all shadow-sm hover:shadow-md"
          >
            Book Your Trip
          </button>
        </div>

        {/* Mobile Hamburger */}
        <div className="flex lg:hidden items-center gap-2.5">
          <button
            type="button"
            onClick={onBookTrip}
            className="bg-[#1d4738] text-white text-xs font-semibold px-3.5 py-2 rounded-full whitespace-nowrap shrink-0 cursor-pointer"
          >
            Book Your Trip
          </button>
          <button
            type="button"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="w-9 h-9 rounded-full bg-white/80 border border-black/10 grid place-items-center text-[#141714] cursor-pointer"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileOpen && (
        <div className="lg:hidden mt-2 glass-panel rounded-3xl p-5 space-y-3">
          <nav className="grid grid-cols-2 gap-2">
            {NAV_LINKS.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(link.id);
                }}
                className="px-3 py-2 rounded-xl text-sm font-medium text-[#141714] hover:bg-[#ebe5da]/60"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="pt-2 border-t border-black/10 flex items-center justify-between">
            {user ? (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onLogout();
                }}
                className="text-sm font-medium text-[#1d4738]"
              >
                Signed in as {user.name} (Sign Out)
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onOpenAuth();
                }}
                className="text-sm font-semibold text-[#141714]"
              >
                Login / Sign Up
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
