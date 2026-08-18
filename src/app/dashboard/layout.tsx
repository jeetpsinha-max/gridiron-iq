'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield, Film, BarChart3, ListChecks, FileText,
  Bell, ChevronDown, Home, Settings, Menu, X,
  User, Users, MessageSquare, Zap, Swords,
} from 'lucide-react';
import { useGridironStore } from '@/lib/store';

function NotificationBell() {
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useGridironStore();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg transition-all hover:bg-white/5"
        style={{ color: 'var(--text-secondary)' }}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
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
                        from {notif.fromUser?.name ?? 'Staff'} · {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
  const { activeGame } = useGridironStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Extract game ID from pathname
  const pathParts = pathname.split('/');
  const gameId = pathParts[pathParts.length - 1];

  const navLinks = [
    { href: `/dashboard/film-room/${gameId}`, label: 'Film Room', icon: Film, active: pathname.includes('film-room') },
    { href: `/dashboard/offensive-coach/${gameId}`, label: 'Offensive Coach', icon: Swords, active: pathname.includes('offensive-coach') },
    { href: `/dashboard/players/${gameId}`, label: 'Player Tracker', icon: Users, active: pathname.includes('players') },
    { href: `/dashboard/analytics/${gameId}`, label: 'Analytics', icon: BarChart3, active: pathname.includes('analytics') },
    { href: `/dashboard/actions/${gameId}`, label: 'Action Items', icon: ListChecks, active: pathname.includes('actions') },
    { href: `/dashboard/reports/${gameId}`, label: 'Reports', icon: FileText, active: pathname.includes('reports') },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 md:px-6 h-14 border-b"
        style={{ borderColor: 'var(--border-primary)', background: 'rgba(10, 10, 15, 0.85)', backdropFilter: 'blur(16px)' }}>
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}>
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm hidden md:block" style={{ color: 'var(--text-primary)' }}>GridironIQ</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  link.active ? 'text-white' : ''
                }`}
                style={{
                  color: link.active ? 'var(--text-primary)' : 'var(--text-muted)',
                  background: link.active ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                }}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right: Game title + Actions */}
        <div className="flex items-center gap-3">
          {activeGame && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
              <Zap className="w-3.5 h-3.5" style={{ color: 'var(--accent-emerald)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                {activeGame.title}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                · {activeGame.plays.length} plays
              </span>
            </div>
          )}
          <NotificationBell />
          <div className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}>
            <User className="w-4 h-4 text-white" />
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg"
            style={{ color: 'var(--text-secondary)' }}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Nav Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b p-3 flex flex-col gap-1"
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
