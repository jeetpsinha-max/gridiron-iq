'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Shield, Play, Swords, Sparkles, Trophy, Users, BarChart3,
  Crosshair, Video, ArrowRight, Zap, Target, Activity, Flame,
  CheckCircle2, Compass, Award, ExternalLink, RefreshCw, Layers
} from 'lucide-react';
import { PEDDIE_PLAYERS } from '@/lib/peddie-player-data';
import { MOCK_GAMES } from '@/lib/mock-game-data';

export default function HomePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'EPA_TESTER' | 'ROSTER' | 'SCHEDULE'>('OVERVIEW');
  const [calcDown, setCalcDown] = useState<number>(3);
  const [calcDistance, setCalcDistance] = useState<number>(4);
  const [calcYardline, setCalcYardline] = useState<number>(65);
  const [calcGain, setCalcGain] = useState<number>(14);

  // Live EPA calculation in Hero
  const distToGoal = Math.max(1, Math.min(99, 100 - calcYardline));
  const baseEp = 6.0 * (1.0 - Math.pow(distToGoal / 100.0, 1.3)) - 1.2 * (distToGoal / 100.0);
  const downPen = [0, 0.0, 0.45, 1.15, 2.35][calcDown] || 1.0;
  const epBefore = +(baseEp - downPen - Math.min(2.5, 0.08 * calcDistance)).toFixed(2);
  const newYd = Math.min(99, calcYardline + calcGain);
  const epAfter = +(6.0 * (1.0 - Math.pow((100 - newYd) / 100.0, 1.3))).toFixed(2);
  const epaResult = +(epAfter - epBefore).toFixed(2);

  const starAthletes = PEDDIE_PLAYERS.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#05070D] text-slate-100 font-sans selection:bg-amber-400 selection:text-slate-950 relative overflow-x-hidden">
      {/* Background Stadium Glow & Grid Textures */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-amber-500/15 via-indigo-600/10 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/5 blur-[160px] pointer-events-none" />

      {/* Top Stadium Header */}
      <header className="relative z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950">
              <Shield className="w-5 h-5 font-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black font-mono tracking-tight text-white text-base">GRIDIRON·IQ</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-[10px] font-bold text-amber-300 font-mono">
                  PEDDIE FALCONS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono -mt-0.5">The Peddie School · MAPL Varsity Football Intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-bold transition-all"
            >
              Command Center
            </Link>
            <Link
              href="/dashboard/offensive-coach/peddie-blair-2025"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Launch AI Coordinator</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-20 max-w-7xl mx-auto px-6 pt-12 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Mission & Highlights */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Powered by Google Antigravity & BigQuery AI</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Stadium-Grade AI <br />
              <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                Football Tactical Platform
              </span>
            </h1>

            <p className="text-base text-slate-300 leading-relaxed font-sans max-w-2xl">
              Complete computer vision spatial tracking, Expected Points Added (EPA) modeling, situational 4th-down decision modeling, and automated offensive counter-play synthesis for The Peddie School Falcons.
            </p>

            {/* Quick Action Matrix */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={() => router.push('/dashboard/film-room/peddie-blair-2025')}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-sm transition-all shadow-xl shadow-amber-500/25 flex items-center gap-2 font-mono"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Open All-22 Film Room</span>
              </button>
              <button
                onClick={() => router.push('/dashboard/players/peddie-blair-2025')}
                className="px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/15 text-white font-bold text-sm transition-all flex items-center gap-2 font-mono shadow-lg"
              >
                <Users className="w-4 h-4 text-amber-400" />
                <span>Roster & Scouting Dossiers</span>
              </button>
            </div>

            {/* Metric Badges */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10 font-mono text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">MAPL RECORD</span>
                <span className="text-lg font-black text-white">5–4 Varsity</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">MOTION EPA LIFT</span>
                <span className="text-lg font-black text-amber-300">+0.82 EPA/Play</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">ROSTER GRADES</span>
                <span className="text-lg font-black text-emerald-400">38 Verified</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive EPA Simulator Widget */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-2xl shadow-black/80 font-mono relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                    <Zap className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Live Situational EPA Engine</h3>
                    <span className="text-[10px] text-slate-400">Google Antigravity Math Model</span>
                  </div>
                </div>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                  epaResult >= 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}>
                  {epaResult >= 0 ? `+${epaResult}` : epaResult} EPA
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="text-slate-400 block text-[11px] mb-1">Down & Distance</label>
                  <div className="flex gap-2">
                    <select
                      value={calcDown}
                      onChange={(e) => setCalcDown(Number(e.target.value))}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white w-full focus:outline-none focus:border-amber-400"
                    >
                      <option value={1}>1st Down</option>
                      <option value={2}>2nd Down</option>
                      <option value={3}>3rd Down</option>
                      <option value={4}>4th Down</option>
                    </select>
                    <input
                      type="number"
                      min={1}
                      max={25}
                      value={calcDistance}
                      onChange={(e) => setCalcDistance(Number(e.target.value))}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white w-20 text-center focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block text-[11px] mb-1">Field Position (Yardline)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={1}
                      max={99}
                      value={calcYardline}
                      onChange={(e) => setCalcYardline(Number(e.target.value))}
                      className="w-full accent-amber-400"
                    />
                    <span className="font-bold text-amber-300 bg-slate-950 px-2 py-1 rounded border border-slate-800 min-w-[55px] text-center text-[11px]">
                      {calcYardline > 50 ? `Opp ${100 - calcYardline}` : `Own ${calcYardline}`}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block text-[11px] mb-1">Simulated Yards Gained</label>
                  <input
                    type="number"
                    min={-15}
                    max={90}
                    value={calcGain}
                    onChange={(e) => setCalcGain(Number(e.target.value))}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white w-full text-center focus:outline-none focus:border-amber-400 font-bold"
                  />
                </div>

                {/* Outcome Display */}
                <div className="pt-2 border-t border-white/10 bg-slate-950/60 p-3 rounded-xl border border-white/5 space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Pre-Snap EP:</span>
                    <span className="text-slate-200 font-bold">{epBefore} pts</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Post-Snap EP:</span>
                    <span className="text-slate-200 font-bold">{epAfter} pts</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">First Down Converted:</span>
                    <span className={calcGain >= calcDistance ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {calcGain >= calcDistance ? 'YES (+10 Yds)' : 'NO'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="relative z-20 max-w-7xl mx-auto px-6 py-12 border-t border-white/10">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
            Tactical Architecture
          </span>
          <h2 className="text-3xl font-black text-white tracking-tight font-sans">
            6 Specialized Coaching & Film Modules
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Every subsystem engineered for low latency, verified statistics, and sideline execution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono">
          {/* Card 1: All-22 Film Room */}
          <div
            onClick={() => router.push('/dashboard/film-room/peddie-blair-2025')}
            className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-amber-400/50 transition-all cursor-pointer group shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                All-22 Film Room Studio
              </h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Computer vision 22-player tracking with pre-snap motion vectors, route branches, and yardage separation metrics.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs text-amber-400 font-bold">
              <span>Launch Film Room</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: AI Offensive Coordinator */}
          <div
            onClick={() => router.push('/dashboard/offensive-coach/peddie-blair-2025')}
            className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-amber-400/50 transition-all cursor-pointer group shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Swords className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                AI Offensive Coordinator
              </h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Counter-scheme synthesizer for Cover 3, Cover 2, and blitz fronts with BigQuery ML models and personnel groupings.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs text-indigo-400 font-bold">
              <span>Open Synthesizer</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Roster & Dossiers */}
          <div
            onClick={() => router.push('/dashboard/players/peddie-blair-2025')}
            className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-amber-400/50 transition-all cursor-pointer group shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                Roster & Scouting Dossiers
              </h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                38 verified Peddie athletes with position grades (1-100), 40-times, physical measurements, and NCAA D1 recruitment tracks.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs text-emerald-400 font-bold">
              <span>Explore Roster</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Sideline Call Sheet */}
          <div
            onClick={() => router.push('/dashboard/call-sheet')}
            className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-amber-400/50 transition-all cursor-pointer group shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <Crosshair className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors">
                Sideline Call Sheet
              </h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Printable wristband call sheet formatted for in-game situational calling across 1st & 10, 3rd down, red zone, and 2-minute drill.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs text-rose-400 font-bold">
              <span>Generate Call Sheet</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 5: Defense ML Analytics */}
          <div
            onClick={() => router.push('/dashboard/analytics/peddie-blair-2025')}
            className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-amber-400/50 transition-all cursor-pointer group shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                Defense ML Analytics
              </h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Field heatmaps, pressure stopwatch distributions, blitz rate by down, and coverage vulnerability tendencies.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs text-cyan-400 font-bold">
              <span>View Defense Telemetry</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 6: Player Portal */}
          <div
            onClick={() => router.push('/dashboard/player-portal')}
            className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-amber-400/50 transition-all cursor-pointer group shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                Athlete Player Portal
              </h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Individual athlete film study dashboard with personalized assignment feedback, coach tags, and highlight reels.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs text-purple-400 font-bold">
              <span>Open Player Portal</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-950/80 py-8 text-center text-xs font-mono text-slate-500">
        <p>Peddie Football Analytics Platform · The Peddie School, Hightstown, NJ · Developed with ❤️ by Jeet P. Sinha</p>
      </footer>
    </div>
  );
}
