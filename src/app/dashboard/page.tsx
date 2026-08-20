'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Film, Sparkles, BarChart3, Users, FileText, CheckSquare,
  Trophy, Shield, Zap, Target, Gauge, Star, ChevronRight,
  TrendingUp, Play, Award, Calendar, ExternalLink, ArrowUpRight,
  Layers, History
} from 'lucide-react';
import { useSeason } from '@/context/SeasonContext';

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
                    Peddie Football Analytics COMMAND CENTER
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
              <Sparkles className="w-4 h-4 text-indigo-300" />
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
            <div className="text-[10px] text-indigo-400 mt-1">
              {Math.round((kpis.offensePlaysCount / Math.max(1, kpis.totalPlays)) * 100)}% Offense Snaps
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-white/10 shadow-lg">
            <div className="text-[10px] text-slate-400 uppercase">TOTAL TOUCHDOWNS</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{kpis.touchdownsCount}</div>
            <div className="text-[10px] text-slate-400 mt-1">
              Scoring Efficiency
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-white/10 shadow-lg col-span-2 md:col-span-1">
            <div className="text-[10px] text-slate-400 uppercase">DEFENSIVE HAVOC</div>
            <div className="text-2xl font-black text-cyan-300 mt-1">
              {kpis.takeawaysCount + kpis.stopsCount}
            </div>
            <div className="text-[10px] text-cyan-400 mt-1">
              {kpis.takeawaysCount} Takeaways · {kpis.stopsCount} Stops
            </div>
          </div>
        </div>

        {/* Action Modules Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div
            onClick={() => router.push(`/dashboard/film-room/${defaultGameId}?season=${currentSeason}`)}
            className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-white/10 hover:border-amber-400/40 transition-all cursor-pointer group shadow-lg"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Film className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white font-sans">Interactive Film Room</h4>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              60fps All-22 simulator with mowed turf, laser LOS & 1st down markers, QB drops, and receiver routes for {seasonMetadata.shortLabel}.
            </p>
            <div className="mt-3 text-[10px] text-amber-400 font-bold flex items-center gap-1">
              <span>Watch Film & Highlights</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => router.push(`/dashboard/offensive-coach/${defaultGameId}?season=${currentSeason}`)}
            className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-white/10 hover:border-indigo-400/40 transition-all cursor-pointer group shadow-lg"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white font-sans">AI Offensive Coordinator</h4>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              BigQuery ML counter-scheme simulations, coverage exploit modeling, and personnel groupings for {seasonMetadata.shortLabel}.
            </p>
            <div className="mt-3 text-[10px] text-indigo-400 font-bold flex items-center gap-1">
              <span>Simulate Gameplans</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => router.push(`/dashboard/players/${defaultGameId}?season=${currentSeason}`)}
            className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-white/10 hover:border-emerald-400/40 transition-all cursor-pointer group shadow-lg"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white font-sans">Player Roster Tracker</h4>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              {roster.length} athlete profiles with 1-100 positional grades, 6-axis athletic radars, Hudl links, and class progression for {seasonMetadata.shortLabel}.
            </p>
            <div className="mt-3 text-[10px] text-emerald-400 font-bold flex items-center gap-1">
              <span>View {seasonMetadata.shortLabel} Roster</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => router.push(`/dashboard/analytics/${defaultGameId}?season=${currentSeason}`)}
            className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-white/10 hover:border-cyan-400/40 transition-all cursor-pointer group shadow-lg"
          >
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white font-sans">ML Analytics Studio</h4>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              Self-scout motion EPA models, coverage shell vulnerability matrices, field heatmaps, and down-and-distance decision trees for {seasonMetadata.shortLabel}.
            </p>
            <div className="mt-3 text-[10px] text-cyan-400 font-bold flex items-center gap-1">
              <span>Deep-Dive Analytics</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* 2-Column Section: Season Games Schedule & Top 5 Ranked Athletes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Season Games Hub */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                {seasonMetadata.yearSpan} Games Ledger ({games.length} Matches)
              </h3>
              <span className="text-[10px] text-slate-400">Click game to analyze</span>
            </div>

            <div className="space-y-2">
              {games.map((game, i) => (
                <div
                  key={game.id}
                  onClick={() => router.push(`/dashboard/film-room/${game.id}?season=${currentSeason}`)}
                  className="p-3 rounded-xl bg-slate-950/70 border border-white/5 hover:border-amber-400/40 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                      W{i + 1}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white font-sans group-hover:text-amber-300 transition-colors">
                        {game.title}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {game.date} · {game.plays.length} Verified Plays
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {game.homeScore !== undefined && game.awayScore !== undefined && (
                      <span className={`text-[10px] font-black font-mono px-2 py-0.5 rounded ${
                        (game.homeScore > game.awayScore && game.homeTeam.includes('Peddie')) || (game.awayScore > game.homeScore && game.awayTeam.includes('Peddie'))
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {game.homeScore}-{game.awayScore}
                      </span>
                    )}
                    <button className="px-2.5 py-1 rounded-lg bg-amber-400/15 group-hover:bg-amber-400 text-amber-300 group-hover:text-slate-950 font-bold text-[10px] transition-all flex items-center gap-1">
                      Film
                      <Play className="w-2.5 h-2.5 fill-current" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Top 5 Ranked Athletes */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                {seasonMetadata.shortLabel} Performance Leaders (1–100 Scale)
              </h3>
              <Link
                href={`/dashboard/players/${defaultGameId}?season=${currentSeason}`}
                className="text-[10px] text-amber-300 hover:underline flex items-center gap-1 font-bold"
              >
                All {roster.length} Athletes
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2">
              {topAthletes.map((athlete) => {
                const fa = athlete.filmAnalytics;
                return (
                  <div
                    key={athlete.id}
                    onClick={() => router.push(`/dashboard/players/${defaultGameId}?season=${currentSeason}`)}
                    className="p-3 rounded-xl bg-slate-950/70 border border-white/5 hover:border-cyan-400/40 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-sm shadow-md">
                        #{athlete.jerseyNumber}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white font-sans group-hover:text-cyan-300 transition-colors">
                            {athlete.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-amber-300 font-bold">
                            {athlete.primaryPosition}
                          </span>
                          {athlete.recruitment?.committedCollege && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                              D1 FCS
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {athlete.gradeLevel} · {fa?.totalFilmSnaps || 'Varsity'} Snaps · {fa?.bestFilmGame || seasonMetadata.label}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-black">
                          {fa?.seasonGrade || 75}/100
                        </div>
                        <div className="text-[9px] text-slate-400 mt-0.5 font-bold">
                          RANK #{fa?.overallRank || 1}
                        </div>
                      </div>

                      {fa?.signaturePlays?.[0] && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const sp = fa.signaturePlays[0];
                            router.push(`/dashboard/film-room/${sp.gameId}?play=${sp.playId}&highlight=true&autoplay=true&season=${currentSeason}`);
                          }}
                          className="p-1.5 rounded-lg bg-amber-400/20 hover:bg-amber-400 text-amber-300 hover:text-slate-950 transition-all"
                          title="Watch Player Highlight"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
