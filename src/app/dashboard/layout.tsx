'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Shield, Film, BarChart3, ListChecks, FileText,
  Bell, ChevronDown, Home, Settings, Menu, X,
  User, Users, MessageSquare, Zap, Swords,
} from 'lucide-react';
import { useGridironStore } from '@/lib/store';

function NotificationBell() {
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useGridironStore();
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
          <div className="absolute right-0 top-full mt-2 w-96 z-50 glass-card shadow-lg overflow-hidden animate-fade-in-up"
            style={{ maxHeight: '480px' }}>
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={markAllNotificationsRead} className="text-xs font-medium" style={{ color: 'var(--accent-primary)' }}>
                  Mark all read
                </button>
              )}
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
              {notifications.length === 0 ? (
                <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <Link
                    key={notif.id}
                    href={`/dashboard/film-room/${notif.gameId}`}
                    onClick={() => { markNotificationRead(notif.id); setIsOpen(false); }}
                    className="flex items-start gap-3 p-4 border-b transition-all hover:bg-white/[0.02]"
                    style={{
                      borderColor: 'var(--border-primary)',
                      background: notif.isRead ? 'transparent' : 'rgba(99, 102, 241, 0.03)',
                    }}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{
                        background: notif.type === 'MENTION'
                          ? 'rgba(99, 102, 241, 0.15)'
                          : notif.type === 'ACTION_ASSIGNED'
                          ? 'rgba(245, 158, 11, 0.15)'
                          : 'rgba(16, 185, 129, 0.15)',
                      }}>
                      {notif.type === 'MENTION' ? (
                        <MessageSquare className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                      ) : (
                        <ListChecks className="w-4 h-4" style={{ color: notif.type === 'ACTION_ASSIGNED' ? 'var(--accent-amber)' : 'var(--accent-emerald)' }} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate" style={{ color: notif.isRead ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                        {notif.message}
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        from {notif.fromUser?.name ?? 'Staff'} · {formatTimestamp(notif.createdAt)}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <div className="w-2 h-2 rounded-full shrink-0 mt-2" style={{ background: 'var(--accent-primary)' }} />
                    )}
                  </Link>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { activeGame, games, setActiveGame } = useGridironStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [gameDropdownOpen, setGameDropdownOpen] = useState(false);

  // Extract current section and game ID from pathname
  const pathParts = pathname.split('/');
  const section = pathParts[2] || 'film-room';
  const gameId = pathParts[3] || 'peddie-blair-2025';

  const navLinks = [
    { href: `/dashboard/film-room/${gameId}`, label: 'Film Room', icon: Film, active: pathname.includes('film-room') },
    { href: `/dashboard/offensive-coach/${gameId}`, label: 'AI Offensive Coach', icon: Swords, active: pathname.includes('offensive-coach') },
    { href: `/dashboard/players/${gameId}`, label: 'Player Tracker', icon: Users, active: pathname.includes('players') },
    { href: `/dashboard/analytics/${gameId}`, label: 'Analytics & ML', icon: BarChart3, active: pathname.includes('analytics') },
    { href: `/dashboard/actions/${gameId}`, label: 'Action Items', icon: ListChecks, active: pathname.includes('actions') },
    { href: `/dashboard/reports/${gameId}`, label: 'Reports', icon: FileText, active: pathname.includes('reports') },
  ];

  const handleSelectGame = (targetGameId: string) => {
    setActiveGame(targetGameId);
    setGameDropdownOpen(false);
    router.push(`/dashboard/${section}/${targetGameId}`);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Top Navbar HUD */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-3 md:px-6 h-14 border-b font-mono"
        style={{ borderColor: 'var(--border-primary)', background: 'rgba(10, 10, 15, 0.9)', backdropFilter: 'blur(16px)' }}>
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-4 lg:gap-6">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
              <Shield className="w-4 h-4 text-slate-950" />
            </div>
            <span className="font-bold text-sm hidden sm:block text-white font-mono tracking-tight">GridironIQ</span>
          </Link>

          {/* Desktop Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1">
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

        {/* Right: Game Switcher HUD + Season Telemetry Badge + User Profile */}
        <div className="flex items-center gap-2.5">
          {/* Live Season Telemetry Ticker (Hidden on small screens) */}
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px]">
            <span className="flex items-center gap-1 text-amber-400 font-bold">
              <Zap className="w-3 h-3 text-amber-400 animate-pulse" /> 292 Plays
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-indigo-300">152 Off</span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400">140 Def</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-300">+0.82 Motion EPA</span>
          </div>

          {/* Game Quick Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setGameDropdownOpen(!gameDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/15 hover:border-amber-400/40 text-xs text-white font-bold transition-all shadow-md backdrop-blur-md"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="max-w-[130px] sm:max-w-[180px] truncate text-slate-200">
                {activeGame?.title || 'Select Game'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {gameDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setGameDropdownOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-72 z-50 bg-slate-950 border border-white/15 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl">
                  <div className="p-2.5 border-b border-white/10 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    2025–2026 Varsity Games (9 Games)
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
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Nav Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b p-3 flex flex-col gap-1 font-mono"
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
