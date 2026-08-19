// ============================================================================
// Peddie Football S.A.C. — Utility Functions (shadcn/ui compatible)
// ============================================================================

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatGameClock(clock: string): string {
  return clock;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getMotionBadgeColor(motion: string): string {
  const colors: Record<string, string> = {
    JET_SWEEP: 'bg-red-500/20 text-red-400 border-red-500/30',
    ORBIT: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    FLY: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    RETURN: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    TRADE_TE: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    SHIFT_BACKFIELD: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    NONE: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  };
  return colors[motion] ?? colors.NONE;
}

export function getPlayTypeBadgeColor(playType: string): string {
  const colors: Record<string, string> = {
    PASS: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    RUN: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    PLAY_ACTION_BOOT: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    RPO: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    SCREEN: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    DRAW: 'bg-lime-500/20 text-lime-400 border-lime-500/30',
    PUNT: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    FIELD_GOAL: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    TRICK_REVERSE: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    TURNOVER: 'bg-red-600/20 text-red-500 border-red-600/30',
  };
  return colors[playType] ?? 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    LOW: 'bg-blue-500/20 text-blue-400',
    MEDIUM: 'bg-amber-500/20 text-amber-400',
    HIGH: 'bg-orange-500/20 text-orange-400',
    CRITICAL: 'bg-red-500/20 text-red-400',
  };
  return colors[priority] ?? colors.MEDIUM;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    TODO: 'bg-zinc-500/20 text-zinc-400',
    IN_REVIEW: 'bg-amber-500/20 text-amber-400',
    RESOLVED: 'bg-emerald-500/20 text-emerald-400',
  };
  return colors[status] ?? colors.TODO;
}

export function getEpaColor(epa: number): string {
  if (epa >= 2) return 'text-emerald-400';
  if (epa >= 0.5) return 'text-green-400';
  if (epa >= 0) return 'text-zinc-300';
  if (epa >= -1) return 'text-orange-400';
  return 'text-red-400';
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
}
