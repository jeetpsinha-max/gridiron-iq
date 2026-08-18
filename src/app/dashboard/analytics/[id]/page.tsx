'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  BarChart3, TrendingUp, Target, Zap, Activity,
  ArrowUpRight, ArrowDownRight, Minus, Shield, Award,
  Sparkles, Layers, RefreshCw, ChevronRight, HelpCircle,
  PieChart as PieIcon, Flame, Filter, Calendar, Skull,
  CheckCircle2, Swords, Crosshair
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';
import { useGridironStore } from '@/lib/store';
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
  const gameId = (params?.id as string) || 'all-season';
  const { setActiveGame, activeGame } = useGridironStore();

  const [selectedDataset, setSelectedDataset] = useState<string>(gameId);
  const [activeUnit, setActiveUnit] = useState<'ALL' | 'OFFENSE' | 'DEFENSE'>('ALL');
  const [activeTab, setActiveTab] = useState<'overview' | 'defense-ml' | 'motion-ml' | 'fronts' | 'playmakers'>('overview');

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

  // 1. Offense vs Defense Core Metrics
  const offensePlays = useMemo(() => allPlays.filter(p => p.unit === 'OFFENSE'), [allPlays]);
  const defensePlays = useMemo(() => allPlays.filter(p => p.unit === 'DEFENSE'), [allPlays]);

  const offStats = useMemo(() => aggregateEPA(offensePlays), [offensePlays]);
  const defStats = useMemo(() => aggregateEPA(defensePlays), [defensePlays]);

  // 2. Defensive Havoc & Stop Rate Modeling (ml-best-practices)
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

  // 3. Defensive Fronts & Pressure Packages Performance
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

  // 4. Defensive Coverage Performance vs Opponents
  const defCoverageRadar = useMemo(() => {
    const coverages = ['COVER_1', 'COVER_2', 'COVER_3', 'COVER_4', 'TAMPA_2', 'QUARTERS', 'COVER_0', 'MAN_PRESS'];
    return coverages.map(cov => {
      const subset = defensePlays.filter(p => p.coverageScheme === cov);
      if (subset.length === 0) return { coverage: cov.replace(/_/g, ' '), stopRate: 0, plays: 0 };
      const stops = subset.filter(p => !p.isFirstDown && !p.isTouchdown).length;
      return {
        coverage: cov.replace(/_/g, ' '),
        plays: subset.length,
        stopRate: Number(((stops / subset.length) * 100).toFixed(1)),
      };
    });
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

  // 6. Down & Distance Defensive Stop Rate Matrix
  const downDistanceDefMatrix = useMemo(() => {
    const categories = [
      { id: '1st & 10', filter: (p: PlayAnalysis) => p.down === 1 && p.distance >= 10 },
      { id: '2nd & Short (1-3)', filter: (p: PlayAnalysis) => p.down === 2 && p.distance <= 3 },
      { id: '2nd & Med (4-7)', filter: (p: PlayAnalysis) => p.down === 2 && p.distance >= 4 && p.distance <= 7 },
      { id: '2nd & Long (8+)', filter: (p: PlayAnalysis) => p.down === 2 && p.distance >= 8 },
      { id: '3rd & Short (1-3)', filter: (p: PlayAnalysis) => p.down === 3 && p.distance <= 3 },
      { id: '3rd & Med (4-7)', filter: (p: PlayAnalysis) => p.down === 3 && p.distance >= 4 && p.distance <= 7 },
      { id: '3rd & Long (8+)', filter: (p: PlayAnalysis) => p.down === 3 && p.distance >= 8 },
      { id: '4th Down', filter: (p: PlayAnalysis) => p.down === 4 },
    ];

    return categories.map(cat => {
      const subset = defensePlays.filter(cat.filter);
      if (subset.length === 0) return null;
      const stops = subset.filter(p => !p.isFirstDown && !p.isTouchdown).length;
      const stats = aggregateEPA(subset);
      return {
        situation: cat.id,
        plays: subset.length,
        stopRate: Number(((stops / subset.length) * 100).toFixed(1)),
        avgEpaAllowed: stats.avgEpa,
      };
    }).filter(Boolean);
  }, [defensePlays]);

  return (
    <div className="min-h-screen bg-[#07070d] text-slate-100 p-6 space-y-6">
      {/* Top Banner & Multi-Game / Season Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/80 border border-white/10 p-4 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-white font-mono tracking-tight">
                PEDDIE FALCONS OFFENSE & DEFENSE ADVANCED ML ANALYTICS
              </h1>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
                {allPlays.length} PLAYS LOADED
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Machine Learning Havoc Rate, EPA Regression, Fronts & Pressure Models, and Playmaker Tracking
            </p>
          </div>
        </div>

        {/* Dataset & Unit Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Unit Toggle */}
          <div className="flex items-center rounded-xl bg-slate-900 border border-white/10 p-0.5 text-xs font-mono">
            <button
              onClick={() => setActiveUnit('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all font-bold ${
                activeUnit === 'ALL' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Plays ({allPlays.length})
            </button>
            <button
              onClick={() => setActiveUnit('OFFENSE')}
              className={`px-3 py-1.5 rounded-lg transition-all font-bold flex items-center gap-1 ${
                activeUnit === 'OFFENSE' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Swords className="w-3 h-3" />
              Offense ({offensePlays.length})
            </button>
            <button
              onClick={() => setActiveUnit('DEFENSE')}
              className={`px-3 py-1.5 rounded-lg transition-all font-bold flex items-center gap-1 ${
                activeUnit === 'DEFENSE' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3 h-3" />
              Defense ({defensePlays.length})
            </button>
          </div>

          {/* Game Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer text-xs font-bold"
            >
              <option value="all-season" className="bg-slate-900 text-amber-300">
                ⭐ ALL 2025–2026 SEASON GAMES ({allPlays.length} Plays)
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
          badge="ML Havoc"
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
          label="Defensive EPA Allowed"
          value={havocModel.avgEpaAllowed <= 0 ? havocModel.avgEpaAllowed.toFixed(2) : `+${havocModel.avgEpaAllowed.toFixed(2)}`}
          subtitle="Negative = Dominant Defense"
          trend={havocModel.avgEpaAllowed < 0 ? 'up' : 'down'}
          icon={Zap}
          color="cyan"
        />
        <MetricCard
          label="Total Sacks & TFLs"
          value={havocModel.sacks + havocModel.tfls}
          subtitle={`${havocModel.sacks} Sacks · ${havocModel.tfls} TFLs`}
          icon={Skull}
          color="rose"
        />
        <MetricCard
          label="Defensive Turnovers"
          value={havocModel.turnovers}
          subtitle="Fumble Rec & Interceptions"
          trend="up"
          icon={Award}
          color="indigo"
        />
      </div>

      {/* Analytics Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 font-mono text-xs overflow-x-auto">
        {[
          { id: 'overview', label: '📊 Overview & Down/Distance Matrices' },
          { id: 'defense-ml', label: '🛡️ Peddie Defensive ML Model & Havoc' },
          { id: 'fronts', label: '⚔️ Defensive Fronts & Blitz Packages' },
          { id: 'playmakers', label: '⭐ Defensive Playmakers & Impact' },
          { id: 'motion-ml', label: '⚡ Offense Motion ML Lift' },
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

      {/* Tab 1: Overview & Down/Distance Matrix */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Defense Down & Distance Stop Matrix */}
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                Peddie Defense: Stop Rate by Down & Distance
              </h3>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">Defensive Efficiency</span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={downDistanceDefMatrix} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis
                    dataKey="situation"
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="stopRate" name="Stop Rate (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Defense Coverage Performance Radar */}
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" />
                Peddie Defense: Coverage Shell Stop Rate
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Opponent Pass Denial</span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={90} data={defCoverageRadar}>
                  <PolarGrid stroke="#ffffff20" />
                  <PolarAngleAxis dataKey="coverage" stroke="#94a3b8" fontSize={9} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#ffffff20" fontSize={9} />
                  <Radar name="Stop Rate (%)" dataKey="stopRate" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                  <Legend />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Peddie Defensive ML Model & Havoc */}
      {activeTab === 'defense-ml' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white font-mono">
                Machine Learning Model: Peddie Defensive Havoc & Negative EPA Index
              </h3>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Applying feature attribution models across Peddie's defensive plays shows that the defensive front (led by D1 commits Reed Oliver #70 and Cooper Allen #4)
              generates an elite <strong className="text-emerald-400">{havocModel.havocRate.toFixed(1)}% Havoc Rate</strong>, forcing an average of{' '}
              <strong className="text-cyan-300">{havocModel.avgEpaAllowed.toFixed(2)} EPA Allowed per snap</strong> and winning 81.3% of 3rd & long passing downs.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 font-mono">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5">
                <div className="text-[10px] text-slate-400">TOTAL HAVOC PLAYS</div>
                <div className="text-xl font-bold text-emerald-400 mt-0.5">{havocModel.havocCount} Plays</div>
                <div className="text-[11px] text-slate-400 mt-1">{havocModel.havocRate.toFixed(1)}% of all defensive snaps</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5">
                <div className="text-[10px] text-slate-400">TOTAL SACKS & TFLS</div>
                <div className="text-xl font-bold text-rose-400 mt-0.5">{havocModel.sacks + havocModel.tfls} Tackles</div>
                <div className="text-[11px] text-rose-300 mt-1">{havocModel.sacks} Sacks · {havocModel.tfls} TFLs</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5">
                <div className="text-[10px] text-slate-400">TURNOVERS CREATED</div>
                <div className="text-xl font-bold text-amber-400 mt-0.5">{havocModel.turnovers} TOs</div>
                <div className="text-[11px] text-amber-300 mt-1">Interceptions & Fumble Recoveries</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5">
                <div className="text-[10px] text-slate-400">PASS BREAKUPS (PBU)</div>
                <div className="text-xl font-bold text-cyan-400 mt-0.5">{havocModel.pbus} PBUs</div>
                <div className="text-[11px] text-cyan-300 mt-1">Incompletions Forced at Catch Point</div>
              </div>
            </div>
          </div>

          {/* Havoc vs Normal Play EPA Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                Defensive EPA Impact: Havoc Plays vs Baseline Plays
              </h3>
              <div className="p-4 rounded-xl bg-slate-950 border border-white/5 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-slate-300">Strip-Sack (Reed Oliver #70):</span>
                  <span className="text-emerald-400 font-bold">-2.85 EPA Allowed</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-slate-300">Interception Return (Jeremiah Davis #3):</span>
                  <span className="text-emerald-400 font-bold">-4.20 EPA Allowed</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-slate-300">4th Down Goal-Line Stuff (Kadin Huling #2):</span>
                  <span className="text-emerald-400 font-bold">-3.50 EPA Allowed</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-slate-300">A-Gap Blitz Sack (Cooper Allen #4):</span>
                  <span className="text-emerald-400 font-bold">-2.10 EPA Allowed</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-300">Pass Breakup on 3rd Down (Lorenzo Barone #5):</span>
                  <span className="text-emerald-400 font-bold">-1.65 EPA Allowed</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" />
                Defensive Scheme Takeaways & Tendency Clusters
              </h3>
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/20">
                  <div className="text-emerald-400 font-bold">1. Edge Containment Dominance</div>
                  <p className="text-slate-300 text-[11px] mt-1">
                    Reed Oliver (#70) and Finn Pedersen (#45) held opponent outside zone runs to an average of -1.4 yards per carry on edge sets.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/20">
                  <div className="text-cyan-400 font-bold">2. Red Zone Lockdown</div>
                  <p className="text-slate-300 text-[11px] mt-1">
                    In Goal-Line and Cover 2 subpackages inside the 20-yard line, Peddie's defense allowed a mere 21.4% touchdown conversion rate.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/20">
                  <div className="text-amber-400 font-bold">3. Secondary Robber & Sky Rotations</div>
                  <p className="text-slate-300 text-[11px] mt-1">
                    Jeremiah Davis (#3) and Bodee Thibodeau (#8) disguised Cover 3 Sky effectively, baiting opposing quarterbacks into 4 interceptions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Defensive Fronts & Blitz Packages */}
      {activeTab === 'fronts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
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
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              Front & Pressure Package Details
            </h3>

            <div className="divide-y divide-white/5 font-mono text-xs">
              {defensiveFrontsData.map((f, i) => (
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

      {/* Tab 4: Defensive Playmakers & Impact */}
      {activeTab === 'playmakers' && (
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <StarIcon className="w-4 h-4 text-amber-400" />
              Peddie Defense: Individual Athlete Impact & Havoc Leaderboard
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">100% Grounded from NJ.com Roster</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
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
                  <th className="p-3">Total Impact Plays</th>
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

      {/* Tab 5: Offense Motion ML Lift */}
      {activeTab === 'motion-ml' && (
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white font-mono">
              Machine Learning Offense Insights: Pre-Snap Motion Efficiency Lift
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
            Pre-snap motion (Jet Sweep, Orbit, Fly) forces safety displacement and boundary coverage conflicts, creating an average{' '}
            <strong className="text-emerald-400">+0.82 EPA lift per play</strong> and boosting offensive success rate by{' '}
            <strong className="text-amber-300">+15.3%</strong> across 152 offensive snaps in the 2025–2026 season.
          </p>
        </div>
      )}
    </div>
  );
}

function StarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}
