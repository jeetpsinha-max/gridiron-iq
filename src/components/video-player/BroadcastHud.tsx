'use client';

// ============================================================================
// Peddie Football Analytics — Broadcast-Grade Floating In-Video Scoreboard HUD
// Pinned telemetry: Down & Distance, Yard Line, Hash, Formation, Front/Coverage, EPA
// ============================================================================

import React from 'react';
import { PlayAnalysisData } from '@/lib/data-schemas';
import { Shield, Target, Zap, Clock, Activity, Gauge } from 'lucide-react';

interface BroadcastHudProps {
  play: PlayAnalysisData;
  playbackTimeSec: number;
  homeTeam?: string;
  awayTeam?: string;
  homeScore?: number;
  awayScore?: number;
  gameClock?: string;
  quarter?: number;
  pressureTimeSec?: number;
}

export function BroadcastHud({
  play,
  playbackTimeSec,
  homeTeam = 'PEDDIE',
  awayTeam = 'OPPONENT',
  homeScore = 28,
  awayScore = 14,
  gameClock = '10:45',
  quarter = 1,
  pressureTimeSec = 2.4,
}: BroadcastHudProps) {
  const isOffense = play.unit === 'OFFENSE';
  const epa = play.epa;
  const isPositiveEpa = epa >= 0;

  // Pressure Radar Color
  const getPressureColor = (t: number) => {
    if (t < 2.2) return 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse';
    if (t <= 3.0) return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  };

  return (
    <div className="absolute top-4 left-4 right-4 z-30 pointer-events-none flex flex-col gap-2 font-mono">
      {/* Top Glassmorphic Broadcast Scoreboard */}
      <div className="flex items-center justify-between gap-3 bg-black/75 backdrop-blur-md border border-white/15 px-4 py-2 rounded-xl shadow-2xl">
        {/* Teams & Score */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-md shadow-amber-400/50" />
            <span className="text-xs font-black text-white tracking-wider">{homeTeam}</span>
            <span className="text-sm font-black text-amber-300 bg-slate-900 px-2 py-0.5 rounded border border-white/10">{homeScore}</span>
          </div>

          <span className="text-slate-500 text-xs font-bold">VS</span>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-300 tracking-wider">{awayTeam}</span>
            <span className="text-sm font-black text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-white/10">{awayScore}</span>
          </div>
        </div>

        {/* Down, Distance & Field Position */}
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded bg-slate-900 border border-amber-400/30 text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {play.down === 1 ? '1ST' : play.down === 2 ? '2ND' : play.down === 3 ? '3RD' : '4TH'} & {play.distance}
            </span>
          </div>

          <div className="px-2.5 py-1 rounded bg-slate-900 border border-white/10 text-xs text-white">
            <span className="text-slate-400 text-[10px]">BALL ON: </span>
            <span className="font-bold">{play.yardLine} YD</span>
            <span className="text-slate-400 text-[10px] ml-1">({play.hash})</span>
          </div>

          <div className="px-2.5 py-1 rounded bg-slate-900 border border-white/10 text-xs text-slate-300 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Q{quarter} {gameClock}</span>
          </div>
        </div>

        {/* Tactical Schemes & EPA Badge */}
        <div className="flex items-center gap-2">
          {/* Offensive Formation */}
          <div className="px-2.5 py-1 rounded bg-slate-900/80 border border-cyan-400/30 text-xs text-cyan-300 hidden md:flex items-center gap-1">
            <span className="text-[10px] text-slate-400">FORM:</span>
            <span className="font-bold">{play.offensiveFormation}</span>
          </div>

          {/* Defensive Front & Coverage */}
          <div className="px-2.5 py-1 rounded bg-slate-900/80 border border-rose-400/30 text-xs text-rose-300 hidden md:flex items-center gap-1">
            <Shield className="w-3 h-3 text-rose-400" />
            <span className="font-bold">{play.coverageScheme}</span>
          </div>

          {/* Real-time EPA Pill */}
          <div className={`px-2.5 py-1 rounded border text-xs font-black flex items-center gap-1 shadow-md ${
            isPositiveEpa
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
              : 'bg-rose-500/20 text-rose-300 border-rose-400/40'
          }`}>
            <Activity className="w-3.5 h-3.5" />
            <span>{isPositiveEpa ? `+${epa.toFixed(2)}` : epa.toFixed(2)} EPA</span>
          </div>
        </div>
      </div>

      {/* Secondary Bottom Floating Metric Badges: Snap-to-Pressure Stopwatch */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          {/* Snap-to-Pressure Timer Badge */}
          <div className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md ${getPressureColor(pressureTimeSec)}`}>
            <Gauge className="w-3.5 h-3.5" />
            <span>POCKET BREACH: {pressureTimeSec.toFixed(2)}s</span>
            <span className="text-[9px] uppercase tracking-wider opacity-80">
              ({pressureTimeSec < 2.2 ? 'PRESSURE ALERT' : pressureTimeSec <= 3.0 ? 'MODERATE' : 'CLEAN POCKET'})
            </span>
          </div>

          {/* Pre-Snap Motion Tag if present */}
          {play.motionType !== 'NONE' && (
            <div className="px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-[11px] font-bold flex items-center gap-1 backdrop-blur-md shadow-lg">
              <Zap className="w-3 h-3 text-indigo-400" />
              <span>MOTION: {play.motionType} #{play.motionPlayerJersey || '5'}</span>
            </div>
          )}
        </div>

        {/* Play Description Marquee */}
        <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-lg text-[11px] text-slate-200 truncate max-w-md hidden lg:block shadow-md">
          {play.playDescription}
        </div>
      </div>
    </div>
  );
}
