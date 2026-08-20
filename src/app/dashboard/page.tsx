'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Film, Sparkles, BarChart3, Users, FileText, CheckSquare,
  Trophy, Shield, Zap, Target, Gauge, Star, ChevronRight,
  TrendingUp, Play, Award, Calendar, ExternalLink, ArrowUpRight,
  Layers, History, Crosshair, Swords, Calculator
} from 'lucide-react';
import { useSeason } from '@/context/SeasonContext';
import { AntigravityTacticalHUD } from '@/components/AntigravityTacticalHUD';

export default function DashboardOverviewPage() {
  const router = useRouter();
  const { currentSeason, seasonMetadata, games, roster, plays, kpis } = useSeason();
  const defaultGameId = games[0]?.id || 'peddie-blair-2025';

  // Top Ranked Athletes for this specific season
  const topAthletes = [...roster]
    .sort((a, b) => (b.filmAnalytics?.seasonGrade || 0) - (a.filmAnalytics?.seasonGrade || 0))
    .slice(0, 5);

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-[#07070d] text-slate-100 overflow-y-auto font-mono">
      {/* Header Banner */}
      <div className="p-6 border-b border-white/10 bg-slate-950/80 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
                <Trophy className="w-5 h-5 font-bold" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-black text-white font-sans tracking-tight">
                    PEDDIE FOOTBALL COMMAND COCKPIT
                  </h1>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    seasonMetadata.type === 'CURRENT'
                      ? 'bg-emerald-400/20 text-emerald-300 border-emerald-400/40'
                      : seasonMetadata.type === 'PROJECTED'
                      ? 'bg-purple-400/20 text-purple-300 border-purple-400/40'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    {seasonMetadata.label}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  The Peddie School Falcons · Head Coach: {seasonMetadata.headCoach} · {seasonMetadata.record} · {games.length} Games · {plays.length} Verified Plays
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/dashboard/film-room/${defaultGameId}?season=${currentSeason}`)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Play className="w-4 h-4 fill-current" />
              Launch Film Room
            </button>
            <button
              onClick={() => router.push(`/dashboard/offensive-coach/${defaultGameId}?season=${currentSeason}`)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20"
            >
              <Swords className="w-4 h-4 text-indigo-300" />
              AI Offensive Coordinator
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto p-6 w-full space-y-6 flex-1">
        {/* Season Overview Description Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-white/10 flex items-start gap-3 shadow-lg">
          <div className="p-2 rounded-xl bg-amber-400/15 text-amber-300 shrink-0 mt-0.5">
            <Shield className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white font-sans uppercase tracking-wider">
                {seasonMetadata.yearSpan} Season Overview & Intelligence Dossier
              </span>
              <span className="text-[10px] text-amber-400 font-bold">
                {seasonMetadata.record}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-sans mt-1 leading-relaxed">
              {seasonMetadata.description}
            </p>
          </div>
        </div>

        {/* Google Antigravity Tactical Co-Pilot Engine */}
        <AntigravityTacticalHUD />

        {/* Season KPIs Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-white/10 shadow-lg">
            <div className="text-[10px] text-slate-400 uppercase">TOTAL FILM PLAYS</div>
            <div className="text-2xl font-black text-white mt-1">{kpis.totalPlays}</div>
            <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {games.length} Season Games
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-white/10 shadow-lg">
            <div className="text-[10px] text-slate-400 uppercase">MOTION EPA LIFT</div>
            <div className="text-2xl font-black text-amber-300 mt-1">+{kpis.motionEpaLift}</div>
            <div className="text-[10px] text-slate-400 mt-1">
              {kpis.motionEpaAvg} Motion vs {kpis.nonMotionEpaAvg} Static
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-white/10 shadow-lg">
            <div className="text-[10px] text-slate-400 uppercase">OFFENSE VS DEFENSE</div>
            <div className="text-2xl font-black text-indigo-300 mt-1">
              {kpis.offensePlaysCount} <span className="text-sm text-slate-500 font-normal">/ {kpis.defensePlaysCount}</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {seasonMetadata.successRatePct}% Success Rate
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-white/10 shadow-lg">
            <div className="text-[10px] text-slate-400 uppercase">EXPLOSIVE PLAYS</div>
            <div className="text-2xl font-black text-emerald-300 mt-1">
              {plays.filter(p => (p.yardsGained || 0) >= 15).length}
            </div>
            <div className="text-[10px] text-emerald-400 mt-1">
              {((plays.filter(p => (p.yardsGained || 0) >= 15).length / (plays.length || 1)) * 100).toFixed(1)}% of all snaps
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-white/10 shadow-lg">
            <div className="text-[10px] text-slate-400 uppercase">ROSTER ATHLETES</div>
            <div className="text-2xl font-black text-purple-300 mt-1">{roster.length}</div>
            <div className="text-[10px] text-purple-400 mt-1">
              {roster.filter(p => (p.filmAnalytics?.seasonGrade || 0) >= 90).length} Elite Tier (90+)
            </div>
          </div>
        </div>

        {/* 2-Column Split: Top Rated Playmakers & Schedule Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 6 Columns: Top Rated Athletes */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                <span>TOP-GRADED FALCON ATHLETES ({seasonMetadata.shortLabel})</span>
              </h3>
              <Link
                href={`/dashboard/players/${defaultGameId}?season=${currentSeason}`}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold"
              >
                <span>Full Roster ({roster.length})</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {topAthletes.map((athlete, idx) => {
                const grade = athlete.filmAnalytics?.seasonGrade || 75;
                return (
                  <div
                    key={athlete.id}
                    onClick={() => router.push(`/dashboard/players/${defaultGameId}?season=${currentSeason}&player=${athlete.id}`)}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 hover:border-amber-400/50 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-md group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-sm shrink-0">
                        #{athlete.jerseyNumber}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                          {athlete.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {athlete.positions.join('/')} · {athlete.gradeLevel} · {athlete.height}, {athlete.weight}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono border ${
                        grade >= 95 ? 'bg-amber-400/20 text-amber-300 border-amber-400/40' :
                        grade >= 90 ? 'bg-emerald-400/20 text-emerald-300 border-emerald-400/40' :
                        'bg-blue-400/20 text-blue-300 border-blue-400/40'
                      }`}>
                        {grade}/100
                      </span>
                      <div className="text-[9px] text-slate-500 mt-0.5">
                        {athlete.recruitment?.committedCollege ? 'Committed' : 'Prospect'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 6 Columns: Schedule Film Sessions */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-indigo-400" />
                <span>MAPL GAME FILM ARCHIVES ({games.length} Matchups)</span>
              </h3>
              <span className="text-xs text-slate-400">Grounded All-22</span>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {games.map((g) => (
                <div
                  key={g.id}
                  onClick={() => router.push(`/dashboard/film-room/${g.id}?season=${currentSeason}`)}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 hover:border-indigo-400/50 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-md group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300 font-bold text-xs shrink-0 group-hover:border-indigo-400/50">
                      {g.title.split('vs')[1]?.trim()?.slice(0, 3)?.toUpperCase() || 'MAPL'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {g.title}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {g.plays?.length || 0} Analyzed Plays · {g.opponent || 'MAPL'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                      {g.homeScore ?? 28} - {g.awayScore ?? 21}
                    </span>
                    <Play className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
