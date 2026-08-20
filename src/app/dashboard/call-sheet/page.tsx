'use client';

// ============================================================================
// Peddie Football Analytics — Printable Sideline Call Sheet (Broadcast Quality)
// Print-optimized (@media print) double-sided card with situational play-calling matrices
// ============================================================================

import React, { useMemo } from 'react';
import { useSeason } from '@/context/SeasonContext';
import { Printer, Download, Shield, Target, Zap, Flame, Award, Crosshair, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function CallSheetPage() {
  const { currentSeason, seasonMetadata, games, plays, roster } = useSeason();

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // Top offensive starters
  const starters = useMemo(() => {
    return {
      qb: roster.find(p => p.primaryPosition === 'QB' && (p.classYear === '2026' || p.classYear === '2027')) || roster[0],
      rb: roster.find(p => p.primaryPosition === 'RB') || roster[1],
      wr1: roster.find(p => p.primaryPosition === 'WR') || roster[2],
      te: roster.find(p => p.primaryPosition === 'TE') || roster[3],
      lt: roster.find(p => p.primaryPosition === 'LT' || p.primaryPosition === 'OL') || roster[4],
      mlb: roster.find(p => p.jerseyNumber === 10) || roster[5],
    };
  }, [roster]);

  return (
    <div className="min-h-screen bg-[#07070d] text-slate-100 p-4 md:p-8 font-mono print:bg-white print:text-black print:p-0">
      {/* Screen Controls Header (Hidden in Print) */}
      <div className="max-w-6xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold">
              <Crosshair className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-black text-white">
              PEDDIE FALCONS SIDELINE CALL SHEET & SITUATIONAL MATRIX
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Season {seasonMetadata.yearSpan} · Head Coach: {seasonMetadata.headCoach} · AI Orchestrated by Google Antigravity & Fable 5 Tactical Engine
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs hover:scale-105 transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>PRINT CALL SHEET</span>
          </button>

          <Link
            href="/dashboard"
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 hover:border-amber-400/50 text-slate-300 text-xs font-bold transition-all"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* PRINTABLE CALL SHEET CARD CONTAINER */}
      <div className="max-w-6xl mx-auto bg-slate-950 border border-white/15 rounded-2xl p-6 md:p-8 shadow-2xl print:border-none print:shadow-none print:p-2 print:bg-white print:text-black">
        {/* Call Sheet Banner Header */}
        <div className="border-b-2 border-amber-400 pb-4 mb-6 flex items-center justify-between print:border-black">
          <div>
            <div className="text-2xl font-black tracking-tight text-white print:text-black">
              THE PEDDIE SCHOOL FALCONS FOOTBALL
            </div>
            <div className="text-xs font-bold text-amber-400 print:text-black mt-0.5">
              OFFENSIVE & DEFENSIVE SITUATIONAL SIDELINE MATRIX · {seasonMetadata.yearSpan}
            </div>
          </div>
          <div className="text-right text-xs">
            <div className="font-bold text-white print:text-black">HC: {seasonMetadata.headCoach}</div>
            <div className="text-slate-400 print:text-gray-600">CONF: MAPL · RECORD: {seasonMetadata.record}</div>
          </div>
        </div>

        {/* 4-Quadrant Situational Call Sheet Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4 text-xs">
          {/* Quadrant 1: 1st & 10 Base Plays & Explosive Shot Calls */}
          <div className="border border-white/10 rounded-xl p-4 bg-slate-900/60 print:bg-gray-50 print:border-gray-300">
            <div className="flex items-center justify-between border-b border-amber-400/40 pb-2 mb-3">
              <span className="font-black text-amber-300 print:text-black text-sm flex items-center gap-1.5">
                <Target className="w-4 h-4 text-amber-400" />
                1ST & 10 (BASE OPENERS & EXPLOSIVE SHOTS)
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold print:border print:border-black">
                P1 TIER
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="p-2 rounded bg-slate-950/80 print:bg-white border border-white/5 print:border-gray-200">
                <div className="flex justify-between font-bold text-white print:text-black">
                  <span>1. Gun Trips Open — "Falcon Dagger & Seam-Wheel"</span>
                  <span className="text-emerald-400 print:text-black">+1.64 xEPA</span>
                </div>
                <div className="text-[11px] text-slate-400 print:text-gray-600">
                  Read: #22 Perkins (Wheel) &gt; #4 Allen (Over) &gt; #5 Barone (Dig)
                </div>
              </div>

              <div className="p-2 rounded bg-slate-950/80 print:bg-white border border-white/5 print:border-gray-200">
                <div className="flex justify-between font-bold text-white print:text-black">
                  <span>2. Gun Pistol — "Inside Zone Read & Split Mesh"</span>
                  <span className="text-emerald-400 print:text-black">+1.10 xEPA</span>
                </div>
                <div className="text-[11px] text-slate-400 print:text-gray-600">
                  Primary: #3 Davis (B-Gap Cutback behind #72 Velardi &amp; #54 Annunziata)
                </div>
              </div>

              <div className="p-2 rounded bg-slate-950/80 print:bg-white border border-white/5 print:border-gray-200">
                <div className="flex justify-between font-bold text-white print:text-black">
                  <span>3. Gun 12 Personnel — "Outside Zone & Naked Boot Shot"</span>
                  <span className="text-emerald-400 print:text-black">+1.55 xEPA</span>
                </div>
                <div className="text-[11px] text-slate-400 print:text-gray-600">
                  Read: #4 Allen (Delay Boot 12 yds) &gt; #22 Perkins (Comeback)
                </div>
              </div>
            </div>
          </div>

          {/* Quadrant 2: 2nd & Medium / 2nd & Long Adjustments */}
          <div className="border border-white/10 rounded-xl p-4 bg-slate-900/60 print:bg-gray-50 print:border-gray-300">
            <div className="flex items-center justify-between border-b border-cyan-400/40 pb-2 mb-3">
              <span className="font-black text-cyan-300 print:text-black text-sm flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-cyan-400" />
                2ND DOWN (RUN/PASS BALANCE & RPO)
              </span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-bold print:border print:border-black">
                82% SUCCESS
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="p-2 rounded bg-slate-950/80 print:bg-white border border-white/5 print:border-gray-200">
                <div className="flex justify-between font-bold text-white print:text-black">
                  <span>1. Gun 2x2 Ace — "Peddie Smash-Fade vs Cover 2"</span>
                  <span className="text-emerald-400 print:text-black">+1.48 xEPA</span>
                </div>
                <div className="text-[11px] text-slate-400 print:text-gray-600">
                  Hole Shot: #4 Allen between safeties | Boundary: #5 Barone Corner
                </div>
              </div>

              <div className="p-2 rounded bg-slate-950/80 print:bg-white border border-white/5 print:border-gray-200">
                <div className="flex justify-between font-bold text-white print:text-black">
                  <span>2. Gun Pistol Trips — "Zero-Burner Slant-Bubble RPO"</span>
                  <span className="text-emerald-400 print:text-black">+2.10 xEPA</span>
                </div>
                <div className="text-[11px] text-slate-400 print:text-gray-600">
                  Pre-snap motion: #21 Torres creates +1 number advantage in flat
                </div>
              </div>

              <div className="p-2 rounded bg-slate-950/80 print:bg-white border border-white/5 print:border-gray-200">
                <div className="flex justify-between font-bold text-white print:text-black">
                  <span>3. Pistol Heavy — "Counter GT Pull (Velardi & Sandy)"</span>
                  <span className="text-emerald-400 print:text-black">+1.32 xEPA</span>
                </div>
                <div className="text-[11px] text-slate-400 print:text-gray-600">
                  Lead: #2 Huling kicking out DE, #3 Davis wraps for 8+ yards
                </div>
              </div>
            </div>
          </div>

          {/* Quadrant 3: 3rd Down & 4th Down Critical Converters */}
          <div className="border border-white/10 rounded-xl p-4 bg-slate-900/60 print:bg-gray-50 print:border-gray-300">
            <div className="flex items-center justify-between border-b border-rose-400/40 pb-2 mb-3">
              <span className="font-black text-rose-300 print:text-black text-sm flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-rose-400" />
                3RD & 4TH DOWN MONEY CONVERTERS
              </span>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-bold print:border print:border-black">
                MONEY DOWNS
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="p-2 rounded bg-slate-950/80 print:bg-white border border-white/5 print:border-gray-200">
                <div className="flex justify-between font-bold text-white print:text-black">
                  <span>1. 3rd & Short (1-2 yds): "Jumbo Wedge Plug"</span>
                  <span className="text-emerald-400 print:text-black">88% Conv.</span>
                </div>
                <div className="text-[11px] text-slate-400 print:text-gray-600">
                  Interior wedge behind #54 Rocco Annunziata &amp; #77 Mason Kish
                </div>
              </div>

              <div className="p-2 rounded bg-slate-950/80 print:bg-white border border-white/5 print:border-gray-200">
                <div className="flex justify-between font-bold text-white print:text-black">
                  <span>2. 3rd & Medium (3-6 yds): "Trips Mesh Shallow Cross"</span>
                  <span className="text-emerald-400 print:text-black">79% Conv.</span>
                </div>
                <div className="text-[11px] text-slate-400 print:text-gray-600">
                  Pick rub route freeing #22 Perkins underneath linebackers
                </div>
              </div>

              <div className="p-2 rounded bg-slate-950/80 print:bg-white border border-white/5 print:border-gray-200">
                <div className="flex justify-between font-bold text-white print:text-black">
                  <span>3. 3rd & Long (7+ yds): "Four Verticals & Deep In"</span>
                  <span className="text-emerald-400 print:text-black">64% Conv.</span>
                </div>
                <div className="text-[11px] text-slate-400 print:text-gray-600">
                  Deep dig in 14-yard hole void; #15 Melton 7-man pass pro
                </div>
              </div>
            </div>
          </div>

          {/* Quadrant 4: Red Zone Killers & Defensive Havoc Alerts */}
          <div className="border border-white/10 rounded-xl p-4 bg-slate-900/60 print:bg-gray-50 print:border-gray-300">
            <div className="flex items-center justify-between border-b border-emerald-400/40 pb-2 mb-3">
              <span className="font-black text-emerald-300 print:text-black text-sm flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-400" />
                RED ZONE KILLERS & DEFENSIVE HAVOC ALERTS
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold print:border print:border-black">
                TOUCHDOWN TARGETS
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="p-2 rounded bg-slate-950/80 print:bg-white border border-white/5 print:border-gray-200">
                <div className="flex justify-between font-bold text-white print:text-black">
                  <span>1. Gun Bunch Right — "Double Pass Wheel TD"</span>
                  <span className="text-emerald-400 print:text-black">+2.85 xEPA</span>
                </div>
                <div className="text-[11px] text-slate-400 print:text-gray-600">
                  Melton lateral to Perkins &gt; deep touchdown strike to Barone
                </div>
              </div>

              <div className="p-2 rounded bg-slate-950/80 print:bg-white border border-white/5 print:border-gray-200">
                <div className="flex justify-between font-bold text-white print:text-black">
                  <span>2. Defense Havoc Alert: "A-Gap Cassidy Blitz"</span>
                  <span className="text-rose-400 print:text-black">&lt;2.1s Time to Pressure</span>
                </div>
                <div className="text-[11px] text-slate-400 print:text-gray-600">
                  #10 August Cassidy (ALL-MAPL #1 LB) timed pressure force
                </div>
              </div>

              <div className="p-2 rounded bg-slate-950/80 print:bg-white border border-white/5 print:border-gray-200">
                <div className="flex justify-between font-bold text-white print:text-black">
                  <span>3. Goal Line Stand: "Peddie 5-3 Bear Wall"</span>
                  <span className="text-emerald-400 print:text-black">94% Stop Rate</span>
                </div>
                <div className="text-[11px] text-slate-400 print:text-gray-600">
                  Interior plug: #70 Oliver, #77 Kish, #10 Cassidy
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Roster Check on Printout */}
        <div className="mt-6 pt-4 border-t border-white/10 print:border-gray-300 flex items-center justify-between text-[10px] text-slate-400 print:text-gray-600">
          <div>OFFENSIVE STARTERS: QB #{starters.qb.jerseyNumber} · RB #{starters.rb.jerseyNumber} · WR #{starters.wr1.jerseyNumber} · TE #{starters.te.jerseyNumber} · LT #{starters.lt.jerseyNumber}</div>
          <div>DEFENSIVE ANCHOR: MLB #{starters.mlb.jerseyNumber} {starters.mlb.name}</div>
        </div>
      </div>
    </div>
  );
}
