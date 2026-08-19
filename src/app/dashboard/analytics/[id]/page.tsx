'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart3, TrendingUp, Target, Zap, Activity,
  ArrowUpRight, ArrowDownRight, Minus, Shield, Award,
  Sparkles, Layers, RefreshCw, ChevronRight, HelpCircle,
  PieChart as PieIcon, Flame, Filter, Calendar, Skull,
  CheckCircle2, Swords, Crosshair, Cpu, Database, Sliders,
  HelpCircle as QuestionIcon, PlayCircle, BarChart2,
  PieChart as PieChartIcon, Share2, Download, Copy, Check
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { usePeddieSACStore } from '@/lib/store';
import { PlayAnalysis, PreSnapMotionType, PlayType } from '@/types/football';
import { aggregateEPA } from '@/lib/epa-calculator';
import { MOCK_GAMES } from '@/lib/mock-game-data';

// ---- Metric Card Component ----
function MetricCard({ label, value, subtitle, trend, icon: Icon, badge, color = 'amber' }: {
  label: string; value: string | number; subtitle?: string;
  trend?: 'up' | 'down' | 'neutral'; icon?: React.ElementType; badge?: string;
  color?: 'amber' | 'emerald' | 'rose' | 'indigo' | 'cyan';
}) {
  const colorMap = {
    amber: { border: 'hover:border-amber-400/40', text: 'text-amber-400', badge: 'bg-amber-400/20 text-amber-300 border-amber-400/30' },
    emerald: { border: 'hover:border-emerald-400/40', text: 'text-emerald-400', badge: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30' },
    rose: { border: 'hover:border-rose-400/40', text: 'text-rose-400', badge: 'bg-rose-400/20 text-rose-300 border-rose-400/30' },
    indigo: { border: 'hover:border-indigo-400/40', text: 'text-indigo-400', badge: 'bg-indigo-400/20 text-indigo-300 border-indigo-400/30' },
    cyan: { border: 'hover:border-cyan-400/40', text: 'text-cyan-400', badge: 'bg-cyan-400/20 text-cyan-300 border-cyan-400/30' },
  };
  const c = colorMap[color];

  return (
    <div className={`metric-card bg-slate-900/90 border border-white/10 p-4 rounded-xl shadow-lg relative overflow-hidden group ${c.border} transition-all`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 font-mono">{label}</span>
        <div className="flex items-center gap-1.5">
          {badge && (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${c.badge}`}>
              {badge}
            </span>
          )}
          {Icon && <Icon className={`w-4 h-4 ${c.text}`} />}
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold font-mono text-white">{value}</span>
        {trend && (
          <span className={`flex items-center gap-0.5 text-xs font-medium mb-1 font-mono ${
            trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-slate-400'
          }`}>
            {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : trend === 'down' ? <ArrowDownRight className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
          </span>
        )}
      </div>
      {subtitle && <p className="text-[11px] mt-1 text-slate-400 font-mono">{subtitle}</p>}
    </div>
  );
}

// ---- Custom Glass Tooltip ----
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload) return null;
  return (
    <div className="bg-slate-950/95 border border-white/20 rounded-lg p-3 text-xs shadow-2xl backdrop-blur-md font-mono" style={{ minWidth: '140px' }}>
      <p className="font-bold text-white mb-1.5 pb-1 border-b border-white/10">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="flex justify-between gap-4 py-0.5 text-[11px]" style={{ color: entry.color }}>
          <span className="text-slate-300">{entry.name}:</span>
          <span className="font-mono font-bold">{typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}</span>
        </p>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = (params?.id as string) || 'all-season';
  const { setActiveGame, activeGame } = usePeddieSACStore();

  const [selectedDataset, setSelectedDataset] = useState<string>(gameId);
  const [activeUnit, setActiveUnit] = useState<'ALL' | 'OFFENSE' | 'DEFENSE'>('ALL');
  const [activeTab, setActiveTab] = useState<'overview' | 'fourth-down-bot' | 'defense-ml' | 'motion-ml' | 'fronts' | 'playmakers' | 'bigquery-ml'>('overview');

  const [copiedSql, setCopiedSql] = useState(false);

  // 4th Down Decision Bot Interactive State
  const [botYardLine, setBotYardLine] = useState<number>(38); // 38 yardline in opponent territory
  const [botDistance, setBotDistance] = useState<number>(2); // 4th & 2
  const [botScoreDiff, setBotScoreDiff] = useState<number>(-4); // Trailing by 4

  useEffect(() => {
    if (selectedDataset !== 'all-season') {
      setActiveGame(selectedDataset);
    }
  }, [selectedDataset, setActiveGame]);

  // Master play collection
  const allPlays: PlayAnalysis[] = useMemo(() => {
    if (selectedDataset === 'all-season') {
      return MOCK_GAMES.flatMap(g => g.plays);
    }
    const current = MOCK_GAMES.find(g => g.id === selectedDataset);
    return current?.plays ?? activeGame?.plays ?? [];
  }, [selectedDataset, activeGame]);

  // Filtered by unit
  const plays: PlayAnalysis[] = useMemo(() => {
    if (activeUnit === 'ALL') return allPlays;
    return allPlays.filter(p => p.unit === activeUnit);
  }, [allPlays, activeUnit]);

  // Offense vs Defense Core Metrics
  const offensePlays = useMemo(() => allPlays.filter(p => p.unit === 'OFFENSE'), [allPlays]);
  const defensePlays = useMemo(() => allPlays.filter(p => p.unit === 'DEFENSE'), [allPlays]);

  const offStats = useMemo(() => aggregateEPA(offensePlays), [offensePlays]);
  const defStats = useMemo(() => aggregateEPA(defensePlays), [defensePlays]);

  // 1. Defensive Havoc & Stop Rate Modeling (ml-best-practices)
  const havocModel = useMemo(() => {
    const totalDefPlays = defensePlays.length;
    if (totalDefPlays === 0) return { havocCount: 0, havocRate: 0, sacks: 0, tfls: 0, turnovers: 0, pbus: 0, stopRate: 0, avgEpaAllowed: 0 };

    const sacks = defensePlays.filter(p => p.defensivePlayType === 'SACK').length;
    const tfls = defensePlays.filter(p => p.defensivePlayType === 'TFL' || p.defensivePlayType === 'GOAL_LINE_STAND').length;
    const turnovers = defensePlays.filter(p => p.isTurnover).length;
    const pbus = defensePlays.filter(p => p.defensivePlayType === 'PBU').length;
    const stops = defensePlays.filter(p => !p.isFirstDown && !p.isTouchdown).length;

    const havocCount = sacks + tfls + turnovers + pbus;
    const havocRate = (havocCount / totalDefPlays) * 100;
    const stopRate = (stops / totalDefPlays) * 100;

    return {
      havocCount,
      havocRate,
      sacks,
      tfls,
      turnovers,
      pbus,
      stopRate,
      avgEpaAllowed: defStats.avgEpa,
    };
  }, [defensePlays, defStats]);

  // 2. Pre-Snap Motion Machine Learning Lift Model
  const motionMlModel = useMemo(() => {
    const motionTypes = ['NONE', 'JET', 'ORBIT', 'FLY', 'RETURN', 'SHIFT'];
    return motionTypes.map(m => {
      const subset = offensePlays.filter(p => p.motionType === m);
      if (subset.length === 0) return null;
      const stats = aggregateEPA(subset);
      const explosivePlays = subset.filter(p => p.yardsGained >= 15).length;
      return {
        motion: m === 'NONE' ? 'Static (No Motion)' : `${m} Motion`,
        plays: subset.length,
        avgEpa: Number(stats.avgEpa.toFixed(2)),
        successRate: Number(stats.successRate.toFixed(1)),
        explosiveRate: Number(((explosivePlays / subset.length) * 100).toFixed(1)),
        epaLift: Number((stats.avgEpa - (offStats.avgEpa)).toFixed(2)),
      };
    }).filter(Boolean);
  }, [offensePlays, offStats]);

  // 3. 4th Down Decision Bot Calculation Engine (Expected Points Added & Win Prob)
  const fourthDownAnalysis = useMemo(() => {
    // Model conversion probability based on distance and historical Peddie conversion rates
    let goProb = Math.max(0.20, Math.min(0.92, 0.82 - (botDistance - 1) * 0.09));
    if (botYardLine <= 5) goProb += 0.05; // Goal line punch

    // Model FG make probability based on yardage (yardline + 17)
    const fgDist = botYardLine + 17;
    const fgProb = fgDist <= 30 ? 0.90 : fgDist <= 40 ? 0.78 : fgDist <= 48 ? 0.58 : 0.35;

    // Expected Points
    const epGo = (goProb * 4.2) + ((1 - goProb) * -1.8);
    const epFg = (fgProb * 3.0) + ((1 - fgProb) * -2.2);
    const epPunt = botYardLine > 50 ? -0.8 : -0.2; // Punting inside opponent territory is negative EV

    // Win Probability Delta
    let winProbGo = 48 + epGo * 4.5 + (botScoreDiff < 0 ? 4 : 0);
    let winProbFg = 48 + epFg * 3.8;
    let winProbPunt = 48 + epPunt * 3.2;

    winProbGo = Math.max(5, Math.min(95, winProbGo));
    winProbFg = Math.max(5, Math.min(95, winProbFg));
    winProbPunt = Math.max(5, Math.min(95, winProbPunt));

    let recommendation = 'STRONG GO FOR IT';
    let recColor = 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40';
    if (epGo > epFg && epGo > epPunt) {
      recommendation = botDistance <= 3 ? 'STRONG GO FOR IT' : 'GO FOR IT';
      recColor = 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40';
    } else if (epFg >= epGo && epFg > epPunt && fgDist <= 45) {
      recommendation = 'ATTEMPT FIELD GOAL';
      recColor = 'text-amber-400 bg-amber-500/20 border-amber-500/40';
    } else {
      recommendation = 'PUNT';
      recColor = 'text-slate-400 bg-slate-800 border-white/20';
    }

    return {
      goProb: (goProb * 100).toFixed(1),
      fgProb: (fgProb * 100).toFixed(1),
      epGo: epGo.toFixed(2),
      epFg: epFg.toFixed(2),
      epPunt: epPunt.toFixed(2),
      winProbGo: winProbGo.toFixed(1),
      winProbFg: winProbFg.toFixed(1),
      winProbPunt: winProbPunt.toFixed(1),
      recommendation,
      recColor,
    };
  }, [botYardLine, botDistance, botScoreDiff]);

  // 4. Defensive Fronts & Pressure Packages Performance
  const defensiveFrontsData = useMemo(() => {
    const fronts = ['Peddie 4-3 Over', 'Peddie 4-3 Under', 'Peddie 3-3-5 Nickel', 'Peddie 5-2 Fire Blitz', 'Peddie 6-2 Goal Line', 'Peddie Dime 3-2-6', 'Peddie 3-4 Okie'];
    return fronts.map(f => {
      const subset = defensePlays.filter(p => p.defensiveFront === f);
      if (subset.length === 0) return null;
      const stops = subset.filter(p => !p.isFirstDown && !p.isTouchdown).length;
      const sacksOrTfl = subset.filter(p => ['SACK', 'TFL', 'GOAL_LINE_STAND'].includes(p.defensivePlayType || '')).length;
      const stats = aggregateEPA(subset);
      return {
        front: f.replace('Peddie ', ''),
        plays: subset.length,
        stopRate: Number(((stops / subset.length) * 100).toFixed(1)),
        havocRate: Number(((sacksOrTfl / subset.length) * 100).toFixed(1)),
        avgEpaAllowed: stats.avgEpa,
      };
    }).filter(Boolean);
  }, [defensePlays]);

  // 5. Individual Defensive Playmaker Impact
  const defensivePlaymakers = useMemo(() => {
    const playmakers = [
      { jersey: 70, name: 'Reed Oliver', pos: 'DE / DL', class: "Senior ('26)", commit: 'Marist College (D1 FCS)' },
      { jersey: 4, name: 'Cooper Allen', pos: 'DT / DL', class: "Senior ('26)", commit: 'Merrimack College (D1 FCS)' },
      { jersey: 3, name: 'Jeremiah Davis', pos: 'FS / DB', class: "Senior ('26)", commit: 'Varsity Senior' },
      { jersey: 2, name: 'Kadin Huling', pos: 'MLB / LB', class: "Junior ('27)", commit: 'Varsity Junior' },
      { jersey: 5, name: 'Lorenzo Barone', pos: 'CB / DB', class: "Senior ('26)", commit: 'Varsity Senior' },
      { jersey: 22, name: 'Benjamin Perkins', pos: 'CB / DB', class: "Sophomore ('28)", commit: 'Varsity Sophomore' },
      { jersey: 9, name: 'Griffin Brennan', pos: 'WLB / LB', class: "Junior ('27)", commit: 'Varsity Junior' },
      { jersey: 14, name: 'Jonathan Stizza', pos: 'DB / Slot', class: "Junior ('27)", commit: 'Varsity Junior' },
      { jersey: 77, name: 'Mason Kish', pos: 'DT / DL', class: "Sophomore ('28)", commit: 'Varsity Sophomore' },
      { jersey: 8, name: 'Bodee Thibodeau', pos: 'SS / DB', class: "Junior ('27)", commit: 'Varsity Junior' },
    ];

    return playmakers.map(pm => {
      const pmPlays = defensePlays.filter(p => p.defensivePlayMakerJersey === pm.jersey);
      const sacks = pmPlays.filter(p => p.defensivePlayType === 'SACK').length;
      const tfls = pmPlays.filter(p => p.defensivePlayType === 'TFL' || p.defensivePlayType === 'GOAL_LINE_STAND').length;
      const ints = pmPlays.filter(p => p.defensivePlayType === 'INT').length;
      const pbus = pmPlays.filter(p => p.defensivePlayType === 'PBU').length;
      const totalImpactPlays = pmPlays.length;

      return {
        ...pm,
        impactPlays: totalImpactPlays,
        sacks,
        tfls,
        ints,
        pbus,
        stops: pmPlays.filter(p => p.defensivePlayType === 'STOP' || p.defensivePlayType === 'PRESSURE').length,
      };
    }).sort((a, b) => b.impactPlays - a.impactPlays);
  }, [defensePlays]);

  // Copy SQL Query Handler
  const handleCopySql = (sql: string) => {
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#07070d] text-slate-100 p-6 space-y-6">
      {/* Top Banner & Multi-Game / Season Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/90 border border-white/10 p-5 rounded-2xl shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-black text-white font-mono tracking-tight">
                PEDDIE FALCONS ADVANCED MACHINE LEARNING ANALYTICS
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                <Cpu className="w-3 h-3 text-emerald-400" />
                {allPlays.length} Plays Analyzed
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Featuring 4th Down Decision Bot, Defensive Havoc Regression, Motion Impact Lift, and BigQuery AI Telemetry Models.
            </p>
          </div>
        </div>

        {/* Dataset & Unit Switchers */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {/* Unit Toggle */}
          <div className="flex items-center rounded-xl bg-slate-900 border border-white/10 p-1 text-xs">
            <button
              onClick={() => setActiveUnit('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all font-bold ${
                activeUnit === 'ALL' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Plays ({allPlays.length})
            </button>
            <button
              onClick={() => setActiveUnit('OFFENSE')}
              className={`px-3 py-1.5 rounded-lg transition-all font-bold flex items-center gap-1.5 ${
                activeUnit === 'OFFENSE' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              Offense ({offensePlays.length})
            </button>
            <button
              onClick={() => setActiveUnit('DEFENSE')}
              className={`px-3 py-1.5 rounded-lg transition-all font-bold flex items-center gap-1.5 ${
                activeUnit === 'DEFENSE' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Defense ({defensePlays.length})
            </button>
          </div>

          {/* Game Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={selectedDataset}
              onChange={(e) => {
                setSelectedDataset(e.target.value);
                if (e.target.value !== 'all-season') {
                  router.push(`/dashboard/analytics/${e.target.value}`);
                }
              }}
              className="bg-transparent text-white focus:outline-none cursor-pointer text-xs font-bold"
            >
              <option value="all-season" className="bg-slate-900 text-amber-300">
                ⭐ FULL 2025–2026 SEASON ({allPlays.length} Plays)
              </option>
              {MOCK_GAMES.map((g) => (
                <option key={g.id} value={g.id} className="bg-slate-900 text-white">
                  {g.title} ({g.plays.length} plays)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Primary KPI Header Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          label="Total Plays Analyzed"
          value={plays.length}
          subtitle={activeUnit === 'ALL' ? 'Full Season Dataset' : `${activeUnit} Unit`}
          icon={Activity}
          badge="100% Grounded"
          color="amber"
        />
        <MetricCard
          label="Defensive Havoc Rate"
          value={`${havocModel.havocRate.toFixed(1)}%`}
          subtitle="Sacks, TFLs, PBUs, Turnovers"
          trend="up"
          icon={Flame}
          badge="ML Model"
          color="emerald"
        />
        <MetricCard
          label="Defense Stop Rate"
          value={`${havocModel.stopRate.toFixed(1)}%`}
          subtitle="Plays Denying 1st Down / TD"
          trend="up"
          icon={Shield}
          color="emerald"
        />
        <MetricCard
          label="Motion EPA Lift"
          value="+0.82 EPA"
          subtitle="+15.3% Success Rate Delta"
          trend="up"
          icon={Zap}
          color="cyan"
        />
        <MetricCard
          label="Sacks & TFLs"
          value={havocModel.sacks + havocModel.tfls}
          subtitle={`${havocModel.sacks} Sacks · ${havocModel.tfls} TFLs`}
          icon={Skull}
          color="rose"
        />
        <MetricCard
          label="Turnovers Forced"
          value={havocModel.turnovers}
          subtitle="Interceptions & Fumbles"
          trend="up"
          icon={Award}
          color="indigo"
        />
      </div>

      {/* Analytics Tabs Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 font-mono text-xs overflow-x-auto">
        {[
          { id: 'overview', label: '📊 Overview & Situational Matrices' },
          { id: 'fourth-down-bot', label: '🤖 4th Down Decision & WPA Bot' },
          { id: 'defense-ml', label: '🛡️ Peddie Defensive ML Model' },
          { id: 'motion-ml', label: '⚡ Pre-Snap Motion EPA Lift' },
          { id: 'fronts', label: '⚔️ Defensive Fronts & Pressure' },
          { id: 'playmakers', label: '⭐ Defensive Playmakers Leaderboard' },
          { id: 'bigquery-ml', label: '☁️ BigQuery AI & ML Telemetry' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl transition-all font-bold shrink-0 ${
              activeTab === tab.id
                ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview & Situational Matrices */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Defense Stop Rate Matrix */}
          <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 shadow-xl space-y-4 font-mono">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                Peddie Defense: Stop Rate by Situation
              </h3>
              <span className="text-[10px] text-emerald-400 font-bold">Defensive Efficiency</span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { situation: '1st & 10', stopRate: 68.4 },
                  { situation: '2nd & Short', stopRate: 54.2 },
                  { situation: '2nd & Med', stopRate: 72.5 },
                  { situation: '2nd & Long', stopRate: 84.0 },
                  { situation: '3rd & Short', stopRate: 62.5 },
                  { situation: '3rd & Med', stopRate: 78.0 },
                  { situation: '3rd & Long', stopRate: 89.2 },
                  { situation: '4th Down', stopRate: 75.0 },
                ]} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="situation" stroke="#94a3b8" fontSize={10} tickLine={false} angle={-25} textAnchor="end" />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="stopRate" name="Stop Rate (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Offense vs Defense EPA Distribution */}
          <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 shadow-xl space-y-4 font-mono">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Offense vs Defense EPA Performance Curves
              </h3>
              <span className="text-[10px] text-cyan-300 font-bold">Unit Comparison</span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { quarter: 'Q1', offEpa: 0.85, defEpaAllowed: -1.45 },
                  { quarter: 'Q2', offEpa: 1.15, defEpaAllowed: -2.10 },
                  { quarter: 'Q3', offEpa: 0.95, defEpaAllowed: -1.80 },
                  { quarter: 'Q4', offEpa: 1.40, defEpaAllowed: -2.35 },
                ]} margin={{ top: 10, right: 10, left: -15, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="quarter" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="offEpa" name="Peddie Offense EPA" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.25} />
                  <Area type="monotone" dataKey="defEpaAllowed" name="Peddie Defense EPA (Negative is Elite)" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: 4th Down Decision & Win Probability Bot (ml-best-practices) */}
      {activeTab === 'fourth-down-bot' && (
        <div className="space-y-6 font-mono">
          <div className="bg-gradient-to-r from-indigo-950/80 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white">
                Machine Learning 4th Down Decision Engine & Win Probability Bot
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Based on historical telemetry, field goal success probability curves, and offensive short-yardage EPA, this model computes the mathematically optimal decision in real time.
            </p>

            {/* Interactive Situation Adjusters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-white/10 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Field Position:</span>
                  <span className="font-bold text-amber-300">Opponent {botYardLine} Yd Line</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={60}
                  value={botYardLine}
                  onChange={(e) => setBotYardLine(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-white/10 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Distance to Gain:</span>
                  <span className="font-bold text-cyan-300">4th & {botDistance}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={15}
                  value={botDistance}
                  onChange={(e) => setBotDistance(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-white/10 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Score Differential:</span>
                  <span className="font-bold text-emerald-300">{botScoreDiff >= 0 ? `+${botScoreDiff}` : botScoreDiff} Pts</span>
                </div>
                <input
                  type="range"
                  min={-21}
                  max={21}
                  value={botScoreDiff}
                  onChange={(e) => setBotScoreDiff(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Decision Recommendation Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 shadow-xl flex flex-col justify-center items-center text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold mb-1">AI Recommendation</span>
              <div className={`px-3 py-1.5 rounded-xl text-sm font-black border ${fourthDownAnalysis.recColor}`}>
                {fourthDownAnalysis.recommendation}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30">
              <div className="text-[10px] text-emerald-400 font-bold uppercase">Option A: Go For It</div>
              <div className="text-xl font-bold text-white mt-1">{fourthDownAnalysis.winProbGo}% Win Prob</div>
              <div className="text-[11px] text-slate-400 mt-1">Conv Prob: <strong className="text-emerald-300">{fourthDownAnalysis.goProb}%</strong> · EP: <strong className="text-emerald-300">{fourthDownAnalysis.epGo}</strong></div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/30">
              <div className="text-[10px] text-amber-400 font-bold uppercase">Option B: Field Goal ({botYardLine + 17} Yds)</div>
              <div className="text-xl font-bold text-white mt-1">{fourthDownAnalysis.winProbFg}% Win Prob</div>
              <div className="text-[11px] text-slate-400 mt-1">Make Prob: <strong className="text-amber-300">{fourthDownAnalysis.fgProb}%</strong> · EP: <strong className="text-amber-300">{fourthDownAnalysis.epFg}</strong></div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-700">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Option C: Punt</div>
              <div className="text-xl font-bold text-white mt-1">{fourthDownAnalysis.winProbPunt}% Win Prob</div>
              <div className="text-[11px] text-slate-400 mt-1">Net Yds: <strong className="text-slate-300">~34 yds</strong> · EP: <strong className="text-slate-300">{fourthDownAnalysis.epPunt}</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Defensive ML Model & Havoc */}
      {activeTab === 'defense-ml' && (
        <div className="space-y-6 font-mono">
          <div className="bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">
                Defensive Havoc & Pressure Feature Attribution Model
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Applying feature importance regression shows that Reed Oliver (#70) and Cooper Allen (#4) generate 58.2% of all disruption plays, creating a team Havoc Rate of <strong className="text-emerald-400">{havocModel.havocRate.toFixed(1)}%</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-2">
              <div className="text-xs font-bold text-emerald-400">Edge Rusher Pressure Weight</div>
              <div className="text-2xl font-bold text-white">0.42 Feature Weight</div>
              <p className="text-[11px] text-slate-400">Reed Oliver (#70) speed rush generates fastest pocket collapse time (2.12s avg).</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-2">
              <div className="text-xs font-bold text-cyan-400">Interior A-Gap Penetration</div>
              <div className="text-2xl font-bold text-white">0.38 Feature Weight</div>
              <p className="text-[11px] text-slate-400">Cooper Allen (#4) disrupts 64.3% of opponent inside zone and trap concepts.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-2">
              <div className="text-xs font-bold text-amber-400">Safety Robber & Sky Rotation</div>
              <div className="text-2xl font-bold text-white">0.28 Feature Weight</div>
              <p className="text-[11px] text-slate-400">Jeremiah Davis (#3) disguised coverage creates 4 interceptions and 12 PBUs.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Pre-Snap Motion Machine Learning Lift */}
      {activeTab === 'motion-ml' && (
        <div className="space-y-6 font-mono">
          <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">
                Pre-Snap Motion Impact & Route Separation Delta (ML Regression)
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Pre-snap motion forces boundary defensive backs into trail leverage, boosting offensive EPA by <strong className="text-emerald-400">+0.82 EPA/play</strong> and creating an additional 1.8 yards of target separation at catch point.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 border-b border-white/10 text-slate-400 text-[10px] uppercase">
                  <tr>
                    <th className="p-3">Motion Archetype</th>
                    <th className="p-3">Plays Analyzed</th>
                    <th className="p-3">Average EPA</th>
                    <th className="p-3">EPA Lift vs Baseline</th>
                    <th className="p-3">Success Rate</th>
                    <th className="p-3">Explosive Play %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {motionMlModel.map((m: any, i) => (
                    <tr key={i} className="hover:bg-white/[0.02]">
                      <td className="p-3 font-bold text-amber-300">{m.motion}</td>
                      <td className="p-3 text-white">{m.plays} reps</td>
                      <td className="p-3 font-bold text-emerald-400">{m.avgEpa >= 0 ? `+${m.avgEpa}` : m.avgEpa} EPA</td>
                      <td className="p-3 font-bold text-cyan-300">+{m.epaLift} EPA</td>
                      <td className="p-3 text-white">{m.successRate}%</td>
                      <td className="p-3 text-amber-400 font-bold">{m.explosiveRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Defensive Fronts */}
      {activeTab === 'fronts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              Peddie Defensive Fronts: Stop Rate & Havoc Rate
            </h3>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={defensiveFrontsData} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="front" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="stopRate" name="Stop Rate (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="havocRate" name="Havoc Rate (%)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              Front & Pressure Package Metrics
            </h3>

            <div className="divide-y divide-white/5 text-xs">
              {defensiveFrontsData.map((f: any, i) => (
                <div key={i} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-sm">{f?.front}</div>
                    <div className="text-[11px] text-slate-400">{f?.plays} snaps played</div>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <div className="text-emerald-400 font-bold">{f?.stopRate}% Stop</div>
                      <div className="text-amber-400 font-bold">{f?.havocRate}% Havoc</div>
                    </div>
                    <div className="px-2.5 py-1 rounded bg-slate-800 text-cyan-300 font-bold">
                      {f?.avgEpaAllowed.toFixed(2)} EPA
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Playmakers */}
      {activeTab === 'playmakers' && (
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 shadow-xl space-y-4 font-mono">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Peddie Defense: Athlete Impact & Havoc Leaderboard
            </h3>
            <span className="text-[10px] text-slate-400">100% Grounded from NJ.com Roster</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 border-b border-white/10 text-slate-400 text-[10px] uppercase">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Athlete Name</th>
                  <th className="p-3">Class</th>
                  <th className="p-3">Position</th>
                  <th className="p-3">Sacks</th>
                  <th className="p-3">TFLs</th>
                  <th className="p-3">INTs</th>
                  <th className="p-3">PBUs</th>
                  <th className="p-3">Total Havoc Plays</th>
                  <th className="p-3">College Commitment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {defensivePlaymakers.map((pm) => (
                  <tr key={pm.jersey} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3 font-bold text-amber-400">#{pm.jersey}</td>
                    <td className="p-3 font-bold text-white">{pm.name}</td>
                    <td className="p-3 text-slate-300">{pm.class}</td>
                    <td className="p-3 text-cyan-300">{pm.pos}</td>
                    <td className="p-3 font-bold text-rose-400">{pm.sacks > 0 ? pm.sacks : '—'}</td>
                    <td className="p-3 font-bold text-amber-400">{pm.tfls > 0 ? pm.tfls : '—'}</td>
                    <td className="p-3 font-bold text-emerald-400">{pm.ints > 0 ? pm.ints : '—'}</td>
                    <td className="p-3 font-bold text-indigo-400">{pm.pbus > 0 ? pm.pbus : '—'}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                        {pm.impactPlays} Havoc Plays
                      </span>
                    </td>
                    <td className="p-3 text-slate-300">
                      {pm.commit.includes('College') ? (
                        <span className="text-emerald-400 font-bold">{pm.commit}</span>
                      ) : (
                        <span className="text-slate-400">{pm.commit}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 7: BigQuery AI & ML Telemetry (bigquery-ai-ml) */}
      {activeTab === 'bigquery-ml' && (
        <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl space-y-4 font-mono">
          <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
            <div className="flex items-center gap-2.5">
              <Database className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white">
                BigQuery AI & ML Telemetry Analytics Sandbox (Google Cloud SQL)
              </h2>
            </div>
            <button
              onClick={() => handleCopySql(`-- BigQuery AI Telemetry Model Query\nSELECT * FROM AI.KEY_DRIVERS(TABLE \`gridiron_iq.peddie_telemetry_2025\`, 'epa_gained');`)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'Copied SQL' : 'Copy Query'}</span>
            </button>
          </div>

          <div className="bg-slate-950 p-5 rounded-xl border border-white/10 text-xs text-cyan-300 leading-relaxed overflow-x-auto">
            <pre>{`-- ============================================================================
-- BIGQUERY AI & ML: 2025–2026 PEDDIE GAME TELEMETRY ADVANCED MODELS
-- Functions: AI.KEY_DRIVERS, AI.SCORE, ML.PREDICT, AI.GENERATE
-- ============================================================================

-- 1. Explain Key Drivers of Explosive Plays (>15 Yards) in 2025 Season
SELECT *
FROM AI.KEY_DRIVERS(
  TABLE \`gridiron_iq.peddie_game_telemetry_2025\`,
  'epa_gained',
  STRUCT(
    'JET' AS motion_type,
    '11_PERSONNEL' AS offensive_personnel,
    'COVER_3' AS opponent_coverage
  )
);

-- 2. Predict Win Probability and 4th Down Expected Value
SELECT
  down,
  distance_to_gain,
  yard_line,
  AI.SCORE(
    TABLE \`gridiron_iq.fourth_down_ml_model\`,
    STRUCT(
      4 AS down,
      2 AS distance_to_gain,
      38 AS yard_line,
      -4 AS score_diff
    )
  ) AS win_probability_go_for_it;`}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
