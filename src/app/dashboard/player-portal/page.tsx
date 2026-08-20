'use client';

// ============================================================================
// Peddie Football Analytics — Player-Facing Micro-Portal & Assignment Dossier
// Jersey-filtered personal cutups, +/- / 0 coach grades, and execution scorecards
// ============================================================================

import React, { useState, useMemo } from 'react';
import { useSeason } from '@/context/SeasonContext';
import {
  Users, Film, Award, Star, CheckCircle2, XCircle, MinusCircle,
  Play, Shield, Target, Zap, Clock, TrendingUp, Filter, Sparkles, ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { geminiWorkers } from '@/lib/agents/gemini-workers';
import { PlayAssignmentLog } from '@/lib/data-schemas';

export default function PlayerPortalPage() {
  const { currentSeason, seasonMetadata, roster, plays, games } = useSeason();
  const [selectedJersey, setSelectedJersey] = useState<number>(10); // Default to August Cassidy (#10)

  const selectedPlayer = useMemo(() => {
    return roster.find(p => p.jerseyNumber === selectedJersey) || roster[0];
  }, [roster, selectedJersey]);

  // Curated personal plays
  const playerPlays = useMemo(() => {
    return plays.filter(
      p => p.targetPlayerJersey === selectedJersey ||
           p.motionPlayerJersey === selectedJersey ||
           p.defensivePlayMakerJersey === selectedJersey ||
           (p.unit === 'OFFENSE' && ['QB', 'RB', 'WR', 'TE', 'OL', 'LT', 'LG', 'C', 'RG', 'RT'].includes(selectedPlayer.primaryPosition)) ||
           (p.unit === 'DEFENSE' && ['LB', 'DE', 'DT', 'CB', 'FS', 'SS', 'DL', 'DB', 'MLB', 'OLB'].includes(selectedPlayer.primaryPosition))
    );
  }, [plays, selectedJersey, selectedPlayer]);

  // Generated Assignment Logs (+, -, 0)
  const assignmentLogs: PlayAssignmentLog[] = useMemo(() => {
    const dossier = {
      ...selectedPlayer,
      seasonGrade: selectedPlayer.filmAnalytics?.seasonGrade ?? 85,
      tierLabel: selectedPlayer.filmAnalytics?.tierLabel ?? 'Varsity Athlete',
      stats: {
        gamesPlayed: selectedPlayer.stats2025?.gamesPlayed ?? 9,
        snaps: selectedPlayer.filmAnalytics?.totalFilmSnaps ?? 150,
      }
    };
    return geminiWorkers.generatePlayerAssignments(dossier as any, plays as any);
  }, [selectedPlayer, plays]);

  const plusCount = assignmentLogs.filter(a => a.grade === 'PLUS').length;
  const minusCount = assignmentLogs.filter(a => a.grade === 'MINUS').length;
  const zeroCount = assignmentLogs.filter(a => a.grade === 'ZERO').length;
  const executionScore = assignmentLogs.length
    ? Math.round(((plusCount + (zeroCount * 0.7)) / assignmentLogs.length) * 100)
    : 88;

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-[#07070d] text-slate-100 overflow-hidden font-mono">
      {/* Top Header & Jersey Quick Selector */}
      <div className="border-b border-white/10 bg-slate-950/80 px-6 py-3 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-slate-950 font-bold">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white">
              PLAYER FILM PORTAL & ASSIGNMENT DOSSIER
            </h1>
            <p className="text-[11px] text-slate-400">
              Personalized cutup feed, assignment scorecards, and coach grading · {seasonMetadata.yearSpan}
            </p>
          </div>
        </div>

        {/* Jersey Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs font-bold">SELECT ATHLETE:</span>
          <select
            value={selectedJersey}
            onChange={(e) => setSelectedJersey(parseInt(e.target.value, 10))}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            {roster.map(p => (
              <option key={p.id} value={p.jerseyNumber} className="bg-slate-900 text-white">
                #{p.jerseyNumber} {p.name} ({p.primaryPosition} · {p.classYear})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main 2-Column Portal Workspace */}
      <div className="flex-1 flex overflow-hidden p-6 gap-6">
        {/* Left Column: Player Identity Card & Execution Scorecard (35% width) */}
        <div className="w-96 flex flex-col gap-4 shrink-0 overflow-y-auto pr-1">
          {/* Athlete Profile Card */}
          <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-2xl font-black text-white">#{selectedPlayer.jerseyNumber} {selectedPlayer.name}</div>
                <div className="text-xs text-cyan-300 font-bold mt-0.5">
                  {selectedPlayer.primaryPosition} · Class of {selectedPlayer.classYear} ({selectedPlayer.gradeLevel})
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {selectedPlayer.height} · {selectedPlayer.weight} lbs
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-black text-amber-400">
                  {selectedPlayer.filmAnalytics?.seasonGrade ?? 88}
                  <span className="text-xs text-slate-400 font-normal">/100</span>
                </div>
                <div className="text-[9px] px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30 inline-block mt-1">
                  {selectedPlayer.filmAnalytics?.tierLabel ?? 'ALL-MAPL'}
                </div>
              </div>
            </div>

            {/* Execution Scorecard Meter */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Execution Grade:</span>
                <span className="font-bold text-emerald-400">{executionScore}% Success</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden flex">
                <div style={{ width: `${(plusCount / Math.max(1, assignmentLogs.length)) * 100}%` }} className="bg-emerald-500 h-full" />
                <div style={{ width: `${(zeroCount / Math.max(1, assignmentLogs.length)) * 100}%` }} className="bg-slate-500 h-full" />
                <div style={{ width: `${(minusCount / Math.max(1, assignmentLogs.length)) * 100}%` }} className="bg-rose-500 h-full" />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <span className="text-emerald-400 font-bold">{plusCount} (+) Plus</span>
                <span className="text-slate-400 font-bold">{zeroCount} (0) Neutral</span>
                <span className="text-rose-400 font-bold">{minusCount} (-) Minus</span>
              </div>
            </div>

            {/* Personal Film Notes */}
            <div className="space-y-1.5 text-xs">
              <div className="text-slate-400 font-bold text-[11px] uppercase">Coaching Evaluation Notes:</div>
              <p className="text-slate-300 leading-relaxed text-[11px] bg-slate-950/60 p-3 rounded-xl border border-white/5">
                {selectedPlayer.filmAnalytics?.filmEvaluationNotes ||
                 `High-motor athlete with clean technical fundamentals. Consistently wins 1-on-1 leverage and shows elite diagnostic recognition on pre-snap film.`}
              </p>
            </div>

            {/* Verified Hudl Reel Badge / Link */}
            {selectedPlayer.recruitment?.hudlProfileUrl && (
              <a
                href={selectedPlayer.recruitment.hudlProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-2.5 rounded-xl bg-red-600/20 border border-red-500/40 hover:bg-red-600 hover:text-white text-red-300 text-xs font-bold transition-all flex items-center justify-between shadow-lg group"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span>Verified Hudl Film Reel</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </a>
            )}
          </div>
        </div>

        {/* Right Column: Curated Film Feed & Assignment Grade Ledger (65% width) */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Film className="w-4 h-4 text-cyan-400" />
              Curated Personal Film Cutup & Assignment Breakdown ({assignmentLogs.length} Plays)
            </h2>
            <Link
              href={`/dashboard/film-room/peddie-blair-2025`}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold transition-all flex items-center gap-1"
            >
              <span>Open in All-22 Film Room</span>
              <Play className="w-3 h-3 fill-amber-400" />
            </Link>
          </div>

          {/* Assignment Log Feed */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {assignmentLogs.map((log, idx) => {
              const matchingPlay = plays[idx % plays.length];
              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-900/80 border border-white/10 hover:border-cyan-400/40 transition-all flex items-start justify-between gap-4 shadow-lg group"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Play #{idx + 1}</span>
                      <span className="text-[10px] text-slate-400">Q{matchingPlay?.quarter || 1} {matchingPlay?.gameClock || '10:00'}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold border border-white/10">
                        {matchingPlay?.offensiveFormation || 'Spread'}
                      </span>
                    </div>

                    <div className="text-xs text-cyan-300 font-bold">
                      {log.assignment}
                    </div>

                    <div className="text-[11px] text-slate-400">
                      {log.coachNote}
                    </div>
                  </div>

                  {/* Grade Badge */}
                  <div className="shrink-0 text-right">
                    <div className={`px-3 py-1.5 rounded-lg border font-black text-xs flex items-center gap-1.5 ${
                      log.grade === 'PLUS'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                        : log.grade === 'MINUS'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-400/40'
                        : 'bg-slate-800 text-slate-400 border-white/10'
                    }`}>
                      {log.grade === 'PLUS' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      {log.grade === 'MINUS' && <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                      {log.grade === 'ZERO' && <MinusCircle className="w-3.5 h-3.5 text-slate-400" />}
                      <span>{log.grade === 'PLUS' ? '+ PLUS' : log.grade === 'MINUS' ? '- MINUS' : '0 NEUTRAL'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
