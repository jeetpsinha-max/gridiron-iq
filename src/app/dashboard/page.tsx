'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Film, Sparkles, BarChart3, Users, FileText, CheckSquare,
  Trophy, Shield, Zap, Target, Gauge, Star, ChevronRight,
  TrendingUp, Play, Award, Calendar, ExternalLink, ArrowUpRight
} from 'lucide-react';
import { MOCK_GAMES } from '@/lib/mock-game-data';
import { PEDDIE_PLAYERS } from '@/lib/peddie-player-data';

export default function DashboardOverviewPage() {
  const router = useRouter();
  const defaultGameId = MOCK_GAMES[0]?.id || 'peddie-blair-2025';

  const totalPlays = MOCK_GAMES.reduce((sum, g) => sum + g.plays.length, 0);
  const totalOffensePlays = MOCK_GAMES.reduce((sum, g) => sum + g.plays.filter(p => p.unit === 'OFFENSE').length, 0);
  const totalDefensePlays = MOCK_GAMES.reduce((sum, g) => sum + g.plays.filter(p => p.unit === 'DEFENSE').length, 0);
  const totalTouchdowns = MOCK_GAMES.reduce((sum, g) => sum + g.plays.filter(p => p.isTouchdown).length, 0);
  const totalTurnoversForced = MOCK_GAMES.reduce((sum, g) => sum + g.plays.filter(p => p.unit === 'DEFENSE' && (p.isTurnover || p.playDescription.includes('INTERCEPTION') || p.playDescription.includes('FUMBLE') || p.playDescription.includes('TURNOVER'))).length, 0);

  // Top Ranked Athletes
  const topAthletes = [...PEDDIE_PLAYERS]
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
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-white font-sans tracking-tight">
                    Peddie Football Analytics COMMAND CENTER
                  </h1>
                  <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold">
                    2025–2026 VARSITY PLATFORM
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  The Peddie School Falcons · Head Coach: Mark Fabish · 9 Season Games · 292 Verified Film Plays
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/dashboard/film-room/${defaultGameId}`)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Play className="w-4 h-4 fill-current" />
              Launch Film Room
            </button>
            <button
              onClick={() => router.push(`/dashboard/offensive-coach/${defaultGameId}`)}
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
        {/* Season KPIs Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-white/10 shadow-lg">
            <div className="text-[10px] text-slate-400 uppercase">TOTAL FILM PLAYS</div>
            <div className="text-2xl font-black text-white mt-1">{totalPlays}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {totalOffensePlays} Off · {totalDefensePlays} Def
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-white/10 shadow-lg">
            <div className="text-[10px] text-slate-400 uppercase">OFFENSE TOUCHDOWNS</div>
            <div className="text-2xl font-black text-amber-300 mt-1">{totalTouchdowns} TDs</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">+0.82 Motion EPA</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-white/10 shadow-lg">
            <div className="text-[10px] text-slate-400 uppercase">DEFENSIVE HAVOC</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{totalTurnoversForced} Plays</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Stops, Sacks & Turnovers</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-white/10 shadow-lg">
            <div className="text-[10px] text-slate-400 uppercase">ROSTER ATHLETES</div>
            <div className="text-2xl font-black text-cyan-300 mt-1">38 Players</div>
            <div className="text-[10px] text-slate-400 mt-0.5">1-100 Performance Graded</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-white/10 shadow-lg">
            <div className="text-[10px] text-slate-400 uppercase">VARSITY CAMPAIGN</div>
            <div className="text-2xl font-black text-purple-300 mt-1">9 Games</div>
            <div className="text-[10px] text-slate-400 mt-0.5">MAPL & Non-Conference</div>
          </div>
        </div>

        {/* Feature Launchpad Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Film Room */}
          <div
            onClick={() => router.push(`/dashboard/film-room/${defaultGameId}`)}
            className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 hover:border-amber-400/50 transition-all cursor-pointer group shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Film className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-white font-sans group-hover:text-amber-300 transition-colors">
                Hudl Film Room & All-22 Vision
              </h3>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Breakdown all 292 plays with dual-mode viewing (🎥 Real Highlights Video vs 🏈 All-22 X's & O's), frame-by-frame jog wheels, live telemetry HUD, and freehand telestration canvas.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs text-amber-400 font-bold">
              <span>Enter Film Room</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: AI Offensive Coordinator */}
          <div
            onClick={() => router.push(`/dashboard/offensive-coach/${defaultGameId}`)}
            className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 hover:border-indigo-400/50 transition-all cursor-pointer group shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-white font-sans group-hover:text-indigo-300 transition-colors">
                AI Offensive Coordinator
              </h3>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                BigQuery ML counter-scheme synthesizer. Analyzes opposing defensive fronts and packages, exploits secondary coverage voids, and optimizes plays based on Peddie's available varsity personnel.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs text-indigo-400 font-bold">
              <span>Synthesize Counter-Plays</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Player Tracker & Rankings */}
          <div
            onClick={() => router.push(`/dashboard/players/${defaultGameId}`)}
            className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 hover:border-cyan-400/50 transition-all cursor-pointer group shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-white font-sans group-hover:text-cyan-300 transition-colors">
                Player Tracker & 1-100 Rankings
              </h3>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Comprehensive scouting dossiers for all 38 athletes. Grounded film analytics, verified snaps, net EPA contributions, signature plays with 1-click film deep-links, and 6-axis athletic radars.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs text-cyan-400 font-bold">
              <span>View 38 Player Dossiers</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Advanced ML Analytics */}
          <div
            onClick={() => router.push(`/dashboard/analytics/${defaultGameId}`)}
            className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 hover:border-emerald-400/50 transition-all cursor-pointer group shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-white font-sans group-hover:text-emerald-300 transition-colors">
                Advanced Analytics & Models
              </h3>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Self-scout motion EPA models, coverage shell vulnerability matrices, field heatmaps, red zone conversion metrics, and down-and-distance decision trees across all 9 season games.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs text-emerald-400 font-bold">
              <span>Explore Analytics Models</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 5: Automated Game Reports */}
          <div
            onClick={() => router.push(`/dashboard/reports/${defaultGameId}`)}
            className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 hover:border-purple-400/50 transition-all cursor-pointer group shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-white font-sans group-hover:text-purple-300 transition-colors">
                Automated Post-Game Reports
              </h3>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Coaching-ready post-game summaries, drive charts, third-down efficiency breakdowns, turnover logs, printable PDF exports, and shareable links for coaching staff review.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs text-purple-400 font-bold">
              <span>View Game Reports</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 6: Coaching Action Items */}
          <div
            onClick={() => router.push(`/dashboard/actions/${defaultGameId}`)}
            className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 hover:border-rose-400/50 transition-all cursor-pointer group shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckSquare className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-white font-sans group-hover:text-rose-300 transition-colors">
                Coaching Action Items
              </h3>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Task assignments tied directly to specific video timestamps and film plays. Assign drill focus items to Coach Fabish, Coach Kibrick, Coach Brooks, and Coach Gonzalez.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs text-rose-400 font-bold">
              <span>Manage Action Items</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* 2-Column Section: 9-Game Schedule & Top 5 Ranked Athletes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: 9 Season Games Hub */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                2025–2026 Varsity Games Ledger (9 Matches)
              </h3>
              <span className="text-[10px] text-slate-400">Select game to analyze</span>
            </div>

            <div className="space-y-2">
              {MOCK_GAMES.map((game, i) => (
                <div
                  key={game.id}
                  onClick={() => router.push(`/dashboard/film-room/${game.id}`)}
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

                  <button className="px-2.5 py-1 rounded-lg bg-amber-400/15 group-hover:bg-amber-400 text-amber-300 group-hover:text-slate-950 font-bold text-[10px] transition-all flex items-center gap-1">
                    Film
                    <Play className="w-2.5 h-2.5 fill-current" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Top 5 Ranked Athletes */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                Season Performance Leaders (1–100 Scale)
              </h3>
              <Link
                href={`/dashboard/players/${defaultGameId}`}
                className="text-[10px] text-amber-300 hover:underline flex items-center gap-1 font-bold"
              >
                All 38 Athletes
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2">
              {topAthletes.map((athlete) => {
                const fa = athlete.filmAnalytics;
                return (
                  <div
                    key={athlete.id}
                    onClick={() => router.push(`/dashboard/players/${defaultGameId}`)}
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
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {athlete.gradeLevel} · {fa?.totalFilmSnaps} Snaps · {fa?.bestFilmGame}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-black">
                        {fa?.seasonGrade}/100
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5 font-bold">
                        RANK #{fa?.overallRank}
                      </div>
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
