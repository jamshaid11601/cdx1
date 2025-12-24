import React, { useState, useEffect } from 'react';
import { Menu, X, Rocket } from 'lucide-react';
import { PageView, User } from '../types';
import Logo from './Logo';

interface NavigationProps {
  activePage: PageView;
  setPage: (page: PageView) => void;
  onOpenLogin: () => void;
  user?: User | null;
}

const Navigation: React.FC<NavigationProps> = ({ activePage, setPage, onOpenLogin, user }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isDarkHeroPage = activePage === 'home' || activePage === 'about' || activePage === 'portfolio';
  const isSolidNav = isScrolled || !isDarkHeroPage;

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'portfolio', label: 'Work' },
    { id: 'marketplace', label: 'Marketplace' },
    { id: 'about', label: 'Company' },
  ];

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${isSolidNav ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-slate-200/50 py-4' : 'bg-transparent border-b border-white/5 py-6'}`}>
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex justify-between items-center">

          <div className="cursor-pointer group" onClick={() => { setPage('home'); setIsMenuOpen(false); }}>
            <Logo isDark={isSolidNav} />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-10">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => setPage(link.id as PageView)}
                className={`text-sm font-medium transition-colors hover:text-blue-500 ${activePage === link.id ? 'text-blue-500' : isSolidNav ? 'text-slate-600' : 'text-slate-300'}`}
              >
                {link.label}
              </button>
            ))}

            <div className={`h-4 w-px ${isSolidNav ? 'bg-slate-300' : 'bg-white/20'}`} />

            {user ? (
              <button
                onClick={() => setPage('dashboard')}
                className={`flex items-center gap-2 text-sm font-bold transition-colors ${isSolidNav ? 'text-slate-900' : 'text-white'}`}
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  {user.name.charAt(0)}
                </div>
                <span className="hidden xl:inline">Dashboard</span>
              </button>
            ) : (
              <button onClick={onOpenLogin} className={`text-sm font-medium transition-colors hover:text-blue-500 ${isSolidNav ? 'text-slate-900' : 'text-white'}`}>Log In</button>
            )}

            <button onClick={() => setPage('custom-order')} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] ${isSolidNav ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-white text-slate-900 hover:bg-blue-50'}`}>
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`lg:hidden p-2 transition-colors ${isSolidNav ? 'text-slate-900' : 'text-white'}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
        <div className={`absolute top-20 left-4 right-4 bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 transition-all duration-500 transform ${isMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          <div className="flex flex-col gap-6">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => { setPage(link.id as PageView); setIsMenuOpen(false); }}
                className={`text-xl font-bold transition-colors text-left ${activePage === link.id ? 'text-blue-600' : 'text-slate-900'}`}
              >
                {link.label}
              </button>
            ))}

            <div className="h-px bg-slate-100 my-2" />

            {user ? (
              <button
                onClick={() => { setPage('dashboard'); setIsMenuOpen(false); }}
                className="flex items-center gap-4 text-xl font-bold text-slate-900"
              >
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  {user.name.charAt(0)}
                </div>
                My Dashboard
              </button>
            ) : (
              <button onClick={() => { onOpenLogin(); setIsMenuOpen(false); }} className="text-xl font-bold text-slate-900 text-left">Log In</button>
            )}

            <button
              onClick={() => { setPage('custom-order'); setIsMenuOpen(false); }}
              className="w-full bg-slate-900 text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl"
            >
              <Rocket size={20} /> Get Started
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;