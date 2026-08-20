'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Shield, Film, BarChart3, ListChecks, FileText,
  Bell, ChevronDown, Home, Settings, Menu, X,
  User, Users, MessageSquare, Zap, Swords,
  Calendar, Sparkles, History, Layers, Crosshair, Target
} from 'lucide-react';
import { usePeddieSACStore } from '@/lib/store';
import { SeasonProvider, useSeason } from '@/context/SeasonContext';
import { SeasonId } from '@/types/football';

function NotificationBell() {
  const { notifications, unreadCount } = usePeddieSACStore();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return '';
      const hours = d.getUTCHours().toString().padStart(2, '0');
      const mins = d.getUTCMinutes().toString().padStart(2, '0');
      return `${hours}:${mins} UTC`;
    } catch {
      return '';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg transition-all hover:bg-white/5"
        style={{ color: 'var(--text-secondary)' }}
      >
        <Bell className="w-5 h-5" />
        {mounted && unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white rounded-full pulse-glow"
            style={{ background: 'var(--accent-red)', padding: '0 4px' }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 z-50 rounded-xl border shadow-2xl overflow-hidden font-mono"
            style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-secondary)' }}>
            <div className="flex items-center justify-between p-3.5 border-b"
              style={{ borderColor: 'var(--border-primary)' }}>
              <span className="font-bold text-sm text-white">Falcon Alert Feed</span>
              <span className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                Staff Comm
              </span>
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
              {notifications.length === 0 ? (
                <p className="p-4 text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                  No active coaching alerts
                </p>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.id} className="p-3 text-xs flex gap-2.5 items-start hover:bg-white/5">
                    <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: 'var(--accent-primary)' }} />
                    <div className="flex-1">
                      <p className="font-bold text-white">{notif.title}</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">{notif.message}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{formatTimestamp(notif.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function DashboardHeaderContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { activeGame, setActiveGame } = usePeddieSACStore();
  const { currentSeason, setSeason, availableSeasons, seasonMetadata, games, kpis } = useSeason();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [seasonDropdownOpen, setSeasonDropdownOpen] = useState(false);
  const [gameDropdownOpen, setGameDropdownOpen] = useState(false);

  // Extract current section and game ID from pathname
  const pathParts = pathname.split('/');
  const section = pathParts[2] || 'film-room';
  const gameId = pathParts[3] || games[0]?.id || 'peddie-blair-2025';

  const navLinks = [
    { href: `/dashboard`, label: 'Command Center', icon: Home, active: pathname === '/dashboard' },
    { href: `/dashboard/film-room/${gameId}`, label: 'Film Room', icon: Film, active: pathname.includes('film-room') },
    { href: `/dashboard/call-sheet`, label: 'Call Sheet', icon: Crosshair, active: pathname.includes('call-sheet') },
    { href: `/dashboard/player-portal`, label: 'Player Portal', icon: User, active: pathname.includes('player-portal') },
    { href: `/dashboard/offensive-coach/${gameId}`, label: 'AI Offensive Coach', icon: Swords, active: pathname.includes('offensive-coach') },
    { href: `/dashboard/players/${gameId}`, label: 'Player Tracker', icon: Users, active: pathname.includes('players') },
    { href: `/dashboard/analytics/${gameId}`, label: 'Analytics & ML', icon: BarChart3, active: pathname.includes('analytics') },
    { href: `/dashboard/actions/${gameId}`, label: 'Action Items', icon: ListChecks, active: pathname.includes('actions') },
    { href: `/dashboard/reports/${gameId}`, label: 'Reports', icon: FileText, active: pathname.includes('reports') },
  ];

  const handleSelectSeason = (newSeason: SeasonId) => {
    setSeason(newSeason);
    setSeasonDropdownOpen(false);
  };

  const handleSelectGame = (targetGameId: string) => {
    setActiveGame(targetGameId);
    setGameDropdownOpen(false);
    if (pathname === '/dashboard') {
      router.push(`/dashboard/film-room/${targetGameId}?season=${currentSeason}`);
    } else {
      router.push(`/dashboard/${section}/${targetGameId}?season=${currentSeason}`);
    }
  };

  // Find active game from the current season's games list
  const currentSeasonActiveGame = games.find(g => g.id === gameId) || games[0];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Top Navbar HUD */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-3 md:px-6 h-14 border-b font-mono"
        style={{ borderColor: 'var(--border-primary)', background: 'rgba(10, 10, 15, 0.92)', backdropFilter: 'blur(16px)' }}>
        
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-4 lg:gap-6">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
              <Shield className="w-4 h-4 text-slate-950" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-xs lg:text-sm text-white font-mono tracking-tight block leading-tight">
                Peddie Football SAC
              </span>
              <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider block">
                {seasonMetadata.shortLabel} {seasonMetadata.type === 'PROJECTED' ? '🔮 PROJECTED' : seasonMetadata.type === 'HISTORICAL' ? '📅 ARCHIVE' : '⭐ VARSITY'}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Tabs */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  link.active
                    ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <link.icon className="w-3.5 h-3.5" />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right: Season Selector + Game Switcher + Telemetry Badge */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Live Season Telemetry Ticker (Hidden on small screens) */}
          <div className="hidden 2xl:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px]">
            <span className="flex items-center gap-1 text-amber-400 font-bold">
              <Zap className="w-3 h-3 text-amber-400 animate-pulse" /> {kpis.totalPlays} Plays
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-indigo-300">{kpis.offensePlaysCount} Off</span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400">{kpis.defensePlaysCount} Def</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-300">+{kpis.motionEpaLift} EPA Lift</span>
          </div>

          {/* 📅 GLOBAL SEASON SELECTOR DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => {
                setSeasonDropdownOpen(!seasonDropdownOpen);
                setGameDropdownOpen(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-md backdrop-blur-md ${
                seasonMetadata.type === 'CURRENT'
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:border-emerald-400'
                  : seasonMetadata.type === 'PROJECTED'
                  ? 'bg-purple-950/40 border-purple-500/40 text-purple-300 hover:border-purple-400'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-amber-400/40'
              }`}
            >
              {seasonMetadata.type === 'CURRENT' ? (
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              ) : seasonMetadata.type === 'PROJECTED' ? (
                <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              ) : (
                <History className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span className="font-mono">{seasonMetadata.shortLabel}</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {/* Season Dropdown Menu */}
            {seasonDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setSeasonDropdownOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 z-50 bg-slate-950 border border-white/15 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl divide-y divide-white/10 font-mono">
                  <div className="p-2.5 bg-slate-900/80 flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    <span>Select Season Dataset</span>
                    <span className="text-amber-400">3 Seasons Available</span>
                  </div>
                  <div className="p-1.5 space-y-1">
                    {availableSeasons.map((season) => (
                      <button
                        key={season.id}
                        onClick={() => handleSelectSeason(season.id)}
                        className={`w-full text-left p-2.5 rounded-lg transition-all flex items-start gap-2.5 ${
                          season.id === currentSeason
                            ? 'bg-amber-400/15 border border-amber-400/40 text-white'
                            : 'hover:bg-white/5 text-slate-300'
                        }`}
                      >
                        <div className={`p-1.5 rounded-md mt-0.5 shrink-0 ${
                          season.type === 'CURRENT'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : season.type === 'PROJECTED'
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {season.type === 'CURRENT' ? (
                            <Sparkles className="w-4 h-4" />
                          ) : season.type === 'PROJECTED' ? (
                            <Layers className="w-4 h-4" />
                          ) : (
                            <Calendar className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{season.yearSpan}</span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                              season.type === 'CURRENT'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : season.type === 'PROJECTED'
                                ? 'bg-purple-500/20 text-purple-300'
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              {season.type}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {season.record} · {season.totalGames} Games · {season.totalPlays} Plays
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Game Quick Switcher Dropdown (Updates for selected season) */}
          <div className="relative">
            <button
              onClick={() => {
                setGameDropdownOpen(!gameDropdownOpen);
                setSeasonDropdownOpen(false);
              }}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 border border-white/15 hover:border-amber-400/40 text-xs text-white font-bold transition-all shadow-md backdrop-blur-md"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="max-w-[110px] sm:max-w-[170px] truncate text-slate-200">
                {currentSeasonActiveGame?.title || 'Select Game'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {gameDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setGameDropdownOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 z-50 bg-slate-950 border border-white/15 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl">
                  <div className="p-2.5 border-b border-white/10 text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center justify-between">
                    <span>{seasonMetadata.yearSpan} Schedule</span>
                    <span className="text-amber-300">{games.length} Games</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                    {games.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => handleSelectGame(g.id)}
                        className={`w-full text-left p-2.5 flex items-center justify-between transition-all hover:bg-white/10 ${
                          g.id === gameId ? 'bg-amber-400/10 border-l-2 border-amber-400' : ''
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-white truncate">
                            {g.title}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span>{g.date}</span>
                            <span>·</span>
                            <span className="text-amber-300">{g.plays.length} plays</span>
                          </div>
                        </div>
                        {g.homeScore !== undefined && g.awayScore !== undefined && (
                          <span className={`text-[10px] font-black font-mono px-1.5 py-0.5 rounded ${
                            (g.homeScore > g.awayScore && g.homeTeam.includes('Peddie')) || (g.awayScore > g.homeScore && g.awayTeam.includes('Peddie'))
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}>
                            {g.homeScore}-{g.awayScore}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <NotificationBell />

          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black text-xs shadow-md">
            🦅
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Nav Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b p-3 flex flex-col gap-1 font-mono"
          style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-secondary)' }}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium"
              style={{
                color: link.active ? 'var(--text-primary)' : 'var(--text-muted)',
                background: link.active ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
              }}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          ))}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SeasonProvider>
      <DashboardHeaderContent>{children}</DashboardHeaderContent>
    </SeasonProvider>
  );
}
