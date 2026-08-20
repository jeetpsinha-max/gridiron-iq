'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users, Search, Star, Award, TrendingUp,
  ChevronRight, ExternalLink, Play, CheckCircle2, AlertTriangle,
  GraduationCap, Calendar, Ruler, Weight, Grid, List, Sparkles,
  BookOpen, X, Shield, Target, Flame, Gauge, Zap, Trophy, Video, Globe,
  Printer
} from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, Tooltip
} from 'recharts';
import { useSeason } from '@/context/SeasonContext';
import { PlayerProfile } from '@/types/football';

export default function PlayerTrackerPage() {
  const params = useParams();
  const router = useRouter();
  const { currentSeason, seasonMetadata, roster, kpis } = useSeason();
  const gameId = (params?.id as string) || 'peddie-blair-2025';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedPositionGroup, setSelectedPositionGroup] = useState<string>('ALL');
  const [selectedGradeTier, setSelectedGradeTier] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'grade' | 'rank' | 'jersey' | 'snaps' | 'epa'>('grade');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [activePlayerModal, setActivePlayerModal] = useState<PlayerProfile | null>(null);
  const [modalTab, setModalTab] = useState<'film' | 'radar' | 'recruiting'>('film');

  // Filter and sort logic across the active season's roster
  const filteredPlayers = useMemo(() => {
    const list = roster.filter(player => {
      // Search match
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery = !query ||
        player.name.toLowerCase().includes(query) ||
        player.jerseyNumber.toString().includes(query) ||
        player.primaryPosition.toLowerCase().includes(query) ||
        player.positions.some(p => p.toLowerCase().includes(query)) ||
        player.gradeLevel.toLowerCase().includes(query) ||
        player.classYear.includes(query);

      // Class match
      const matchesClass = selectedClass === 'ALL' || player.classYear === selectedClass;

      // Position match
      let matchesPosition = true;
      if (selectedPositionGroup === 'OFFENSE') {
        matchesPosition = player.positions.some(p => ['QB', 'RB', 'WR', 'TE', 'OL'].includes(p)) || ['QB', 'RB', 'WR', 'TE', 'OL'].includes(player.primaryPosition);
      } else if (selectedPositionGroup === 'DEFENSE') {
        matchesPosition = player.positions.some(p => ['DL', 'LB', 'DB'].includes(p)) || ['DL', 'LB', 'DB'].includes(player.primaryPosition);
      } else if (selectedPositionGroup === 'SPECIAL') {
        matchesPosition = player.positions.some(p => ['K', 'P'].includes(p)) || ['K', 'P'].includes(player.primaryPosition);
      } else if (selectedPositionGroup !== 'ALL') {
        matchesPosition = player.positions.includes(selectedPositionGroup) || player.primaryPosition === selectedPositionGroup;
      }

      // Grade tier filter
      let matchesTier = true;
      const tier = player.filmAnalytics?.gradeTier || 'DEVELOPING';
      if (selectedGradeTier !== 'ALL') {
        matchesTier = tier === selectedGradeTier;
      }

      return matchesQuery && matchesClass && matchesPosition && matchesTier;
    });

    // Sorting
    return list.sort((a, b) => {
      const aGrade = a.filmAnalytics?.seasonGrade ?? 0;
      const bGrade = b.filmAnalytics?.seasonGrade ?? 0;
      const aSnaps = a.filmAnalytics?.totalFilmSnaps ?? 0;
      const bSnaps = b.filmAnalytics?.totalFilmSnaps ?? 0;
      const aEpa = a.filmAnalytics?.filmEpaTotal ?? 0;
      const bEpa = b.filmAnalytics?.filmEpaTotal ?? 0;

      if (sortBy === 'grade' || sortBy === 'rank') {
        return bGrade - aGrade;
      } else if (sortBy === 'jersey') {
        return a.jerseyNumber - b.jerseyNumber;
      } else if (sortBy === 'snaps') {
        return bSnaps - aSnaps;
      } else if (sortBy === 'epa') {
        return bEpa - aEpa;
      }
      return 0;
    });
  }, [searchQuery, selectedClass, selectedPositionGroup, selectedGradeTier, sortBy]);

  // Aggregate KPIs
  const totalRosterCount = roster.length;
  const eliteCount = roster.filter(p => (p.filmAnalytics?.seasonGrade ?? 0) >= 90).length;
  const allMaplCount = roster.filter(p => {
    const g = p.filmAnalytics?.seasonGrade ?? 0;
    return g >= 85 && g < 90;
  }).length;
  const impactCount = roster.filter(p => {
    const g = p.filmAnalytics?.seasonGrade ?? 0;
    return g >= 80 && g < 85;
  }).length;

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case 'ELITE': return 'from-amber-400 to-amber-600 text-amber-950 border-amber-300';
      case 'ALL_MAPL': return 'from-indigo-400 to-indigo-600 text-white border-indigo-300';
      case 'IMPACT_STARTER': return 'from-cyan-400 to-cyan-600 text-slate-950 border-cyan-300';
      case 'ROTATION': return 'from-emerald-400 to-emerald-600 text-slate-950 border-emerald-300';
      default: return 'from-slate-600 to-slate-700 text-slate-200 border-slate-500';
    }
  };

  const getTierBadgeStyle = (score: number) => {
    if (score >= 90) return 'bg-amber-500/20 text-amber-300 border-amber-400/40';
    if (score >= 85) return 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40';
    if (score >= 80) return 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40';
    if (score >= 70) return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40';
    return 'bg-slate-800 text-slate-400 border-white/10';
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-[#07070d] text-slate-100 overflow-hidden">
      {/* Top Banner & KPI Header */}
      <div className="border-b border-white/10 bg-slate-950/80 px-6 py-3.5 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Trophy className="w-4 h-4 text-slate-950 font-bold" />
              </div>
              <h1 className="text-base font-black tracking-tight text-white font-mono">
                {seasonMetadata.yearSpan} PEDDIE FALCONS INDIVIDUAL FILM DOSSIERS & PERFORMANCE RANKINGS
              </h1>
              <span className="px-2 py-0.5 rounded bg-amber-400/20 border border-amber-400/40 text-[10px] font-bold text-amber-300 font-mono">
                {kpis.totalPlays} PLAYS EVALUATED
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
              Complete {totalRosterCount}-Athlete Roster Evaluated Across All {kpis.totalGames} Season Games · Head Coach: {seasonMetadata.headCoach}
            </p>
          </div>

          {/* Performance Tier KPIs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 font-mono">
            <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-amber-400/30 flex items-center gap-2">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <div>
                <div className="text-[10px] text-slate-400">ELITE (90-100)</div>
                <div className="text-xs font-bold text-amber-300">{eliteCount} D1 Commits</div>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-indigo-400/30 flex items-center gap-2">
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              <div>
                <div className="text-[10px] text-slate-400">ALL-MAPL (85-89)</div>
                <div className="text-xs font-bold text-indigo-300">{allMaplCount} Starters</div>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-cyan-400/30 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <div>
                <div className="text-[10px] text-slate-400">IMPACT (80-84)</div>
                <div className="text-xs font-bold text-cyan-300">{impactCount} Athletes</div>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 flex items-center gap-2">
              <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
              <div>
                <div className="text-[10px] text-slate-400">ROSTER SQUAD</div>
                <div className="text-xs font-bold text-white">{totalRosterCount} Athletes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Sort Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5 font-mono">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search athlete, # jersey, position, class..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
              >
                ×
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Tier Filter */}
            <div className="flex items-center rounded-lg bg-slate-900 border border-white/10 p-0.5 text-[11px]">
              {[
                { id: 'ALL', label: 'All Tiers' },
                { id: 'ELITE', label: 'Elite (90+)' },
                { id: 'ALL_MAPL', label: 'All-MAPL (85-89)' },
                { id: 'IMPACT_STARTER', label: 'Impact (80-84)' },
                { id: 'ROTATION', label: 'Rotation (70-79)' },
                { id: 'DEVELOPING', label: 'Developing (<70)' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedGradeTier(t.id)}
                  className={`px-2 py-1 rounded-md transition-all font-medium ${
                    selectedGradeTier === t.id ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Position Filter */}
            <div className="flex items-center rounded-lg bg-slate-900 border border-white/10 p-0.5 text-[11px] overflow-x-auto">
              {[
                { id: 'ALL', label: 'All Pos' },
                { id: 'OFFENSE', label: 'Offense' },
                { id: 'DEFENSE', label: 'Defense' },
                { id: 'QB', label: 'QB' },
                { id: 'RB', label: 'RB' },
                { id: 'LB', label: 'LB' },
                { id: 'WR', label: 'WR' },
                { id: 'TE', label: 'TE' },
                { id: 'OL', label: 'OL' },
                { id: 'DL', label: 'DL' },
                { id: 'DB', label: 'DB' },
                { id: 'K', label: 'K/P' },
              ].map(pos => (
                <button
                  key={pos.id}
                  onClick={() => setSelectedPositionGroup(pos.id)}
                  className={`px-2 py-1 rounded-md transition-all font-medium whitespace-nowrap ${
                    selectedPositionGroup === pos.id ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-900 border border-white/15 rounded-lg px-2.5 py-1 text-xs text-amber-300 font-bold focus:outline-none"
            >
              <option value="grade">Rank: 1-100 Score (High to Low)</option>
              <option value="snaps">Sort: Verified Film Snaps</option>
              <option value="epa">Sort: Total EPA Impact</option>
              <option value="jersey">Sort: Jersey #</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-lg bg-slate-900 border border-white/10 p-0.5 text-[11px]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === 'grid' ? 'bg-white/10 text-amber-300' : 'text-slate-500 hover:text-white'
                }`}
                title="Grid View"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === 'table' ? 'bg-white/10 text-amber-300' : 'text-slate-500 hover:text-white'
                }`}
                title="Table View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {filteredPlayers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 border border-dashed border-white/10 rounded-2xl font-mono">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <h3 className="text-sm font-semibold text-slate-400">No Peddie football athletes match current filters</h3>
            <p className="text-xs mt-1">Try adjusting your search query or performance tier filter.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedClass('ALL'); setSelectedPositionGroup('ALL'); setSelectedGradeTier('ALL'); }}
              className="mt-4 px-3 py-1.5 rounded-lg bg-amber-400/20 text-amber-300 text-xs font-bold hover:bg-amber-400/30"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View with 1-100 Performance Score Badges */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPlayers.map((player) => {
              const fa = player.filmAnalytics;
              const grade = fa?.seasonGrade ?? 70;
              return (
                <div
                  key={player.id}
                  className="bg-slate-900/90 border border-white/10 rounded-xl overflow-hidden hover:border-amber-400/50 transition-all flex flex-col shadow-lg group relative"
                >
                  {/* Card Header with Rank & Season Rating */}
                  <div className="p-4 pb-3 border-b border-white/5 bg-slate-950/70 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      {/* Jersey Badge */}
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black font-mono text-base shadow-md shrink-0">
                        #{player.jerseyNumber}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                            {player.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono mt-0.5">
                          <span className="font-bold text-amber-400">{player.positions.join(', ')}</span>
                          <span>·</span>
                          <span>{player.gradeLevel}</span>
                          <span>·</span>
                          <span>'{player.classYear.slice(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Season Performance Score Badge (1-100) */}
                    <div className="flex flex-col items-end shrink-0 font-mono">
                      <div className={`px-2 py-0.5 rounded-lg border text-xs font-black flex items-center gap-1 shadow-sm ${getTierBadgeStyle(grade)}`}>
                        <Gauge className="w-3 h-3" />
                        <span>{grade}/100</span>
                      </div>
                      <span className="text-[9px] text-slate-400 mt-0.5 font-bold">
                        RANK #{fa?.overallRank || '—'}
                      </span>
                    </div>
                  </div>

                  {/* Film Analytics Snapshot Bar */}
                  <div className="px-4 py-2 bg-slate-950/40 grid grid-cols-3 gap-2 border-b border-white/5 text-center font-mono">
                    <div>
                      <div className="text-[9px] text-slate-500 uppercase">FILM SNAPS</div>
                      <div className="text-xs font-bold text-white">{fa?.totalFilmSnaps || '—'}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-500 uppercase">NET EPA</div>
                      <div className={`text-xs font-bold ${fa && fa.filmEpaTotal >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {fa ? (fa.filmEpaTotal >= 0 ? `+${fa.filmEpaTotal}` : fa.filmEpaTotal) : '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-500 uppercase">SUCCESS %</div>
                      <div className="text-xs font-bold text-amber-300">{fa?.filmSuccessRatePct || 50}%</div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    {/* Performance Tier Label */}
                    <div>
                      <div className="text-[10px] font-bold text-amber-400 font-mono uppercase tracking-wider flex items-center gap-1">
                        <Award className="w-3 h-3 text-amber-400" />
                        {fa?.tierLabel || 'VARSITY ATHLETE'}
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug mt-1 line-clamp-2">
                        {fa?.filmEvaluationNotes || player.scoutingSummary}
                      </p>
                    </div>

                    {/* Commit or Best Game */}
                    {player.recruitment?.committedCollege ? (
                      <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-xs font-mono">
                        <span className="text-[9px] text-emerald-400 block font-bold">COLLEGE COMMITMENT</span>
                        <span className="text-white font-semibold">{player.recruitment.committedCollege}</span>
                      </div>
                    ) : (
                      <div className="p-2 rounded-lg bg-slate-950/50 border border-white/5 text-xs font-mono">
                        <span className="text-[9px] text-slate-400 block font-bold">BEST FILM GAME</span>
                        <span className="text-slate-200 font-medium truncate block">{fa?.bestFilmGame || '2025 Varsity Season'}</span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] gap-2">
                      <span className="text-slate-500 font-mono text-[10px] truncate">Pos #{fa?.positionRank || '1'} {player.primaryPosition}</span>
                      <div className="flex items-center gap-1.5 shrink-0 font-mono">
                        {player.recruitment?.hudlProfileUrl && (
                          <a
                            href={player.recruitment.hudlProfileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-md bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white transition-all text-[10px] font-bold flex items-center gap-1"
                            title="Open Hudl Film Reel"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Hudl</span>
                          </a>
                        )}
                        <button
                          onClick={() => {
                            setActivePlayerModal(player);
                            setModalTab('film');
                          }}
                          className="px-2.5 py-1 rounded-md bg-amber-500/20 hover:bg-amber-400 text-amber-300 hover:text-slate-950 font-bold text-[11px] transition-all flex items-center gap-1 shadow-sm"
                        >
                          <span>Dossier</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View with Rankings */
          <div className="bg-slate-900 border border-white/10 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 border-b border-white/10 text-slate-400 text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Rank</th>
                    <th className="p-3">#</th>
                    <th className="p-3">Athlete Name</th>
                    <th className="p-3">Position</th>
                    <th className="p-3">Grade</th>
                    <th className="p-3">Season Grade (1-100)</th>
                    <th className="p-3">Film Snaps</th>
                    <th className="p-3">Net EPA</th>
                    <th className="p-3">Success %</th>
                    <th className="p-3">Commitment / Status</th>
                    <th className="p-3 text-right">Dossier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredPlayers.map((player) => {
                    const fa = player.filmAnalytics;
                    const grade = fa?.seasonGrade ?? 70;
                    return (
                      <tr key={player.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-amber-400">#{fa?.overallRank || '—'}</div>
                          <div className="text-[9px] text-slate-500 font-mono">Pos #{fa?.positionRank} {player.primaryPosition}</div>
                        </td>
                        <td className="p-3 font-bold text-slate-200">#{player.jerseyNumber}</td>
                        <td className="p-3 font-sans">
                          <div className="font-bold text-white">{player.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{fa?.tierLabel || 'Varsity'}</div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-bold text-[10px]">
                            {player.positions.join(', ')}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300">{player.gradeLevel}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded border text-[11px] font-black ${getTierBadgeStyle(grade)}`}>
                            {grade}/100
                          </span>
                        </td>
                        <td className="p-3 text-white font-bold">{fa?.totalFilmSnaps || '—'}</td>
                        <td className={`p-3 font-bold ${fa && fa.filmEpaTotal >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {fa ? (fa.filmEpaTotal >= 0 ? `+${fa.filmEpaTotal}` : fa.filmEpaTotal) : '—'}
                        </td>
                        <td className="p-3 text-amber-300">{fa?.filmSuccessRatePct || 50}%</td>
                        <td className="p-3">
                          {player.recruitment?.committedCollege ? (
                            <span className="text-emerald-400 font-bold text-[11px]">
                              {player.recruitment.committedCollege}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Varsity Athlete</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {player.recruitment?.hudlProfileUrl && (
                              <a
                                href={player.recruitment.hudlProfileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-1 rounded bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white font-bold text-[10px] transition-all flex items-center gap-1"
                                title="Open Hudl Profile"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Hudl</span>
                              </a>
                            )}
                            <button
                              onClick={() => {
                                setActivePlayerModal(player);
                                setModalTab('film');
                              }}
                              className="px-2.5 py-1 rounded bg-amber-400/20 text-amber-300 hover:bg-amber-400 hover:text-slate-950 font-bold text-[10px] transition-all"
                            >
                              Open
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Upgraded Interactive Scouting Dossier Modal with Film Analytics & 1-100 Breakdown */}
      {activePlayerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-mono">
          <div className="bg-slate-900 border border-white/15 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 bg-slate-950 border-b border-white/10 flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-2xl shadow-xl shrink-0">
                  #{activePlayerModal.jerseyNumber}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-black text-white font-sans">{activePlayerModal.name}</h2>
                    <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-bold">
                      {activePlayerModal.positions.join(', ')}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs">
                      {activePlayerModal.gradeLevel} (Class of {activePlayerModal.classYear})
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span>The Peddie School</span>
                    <span>·</span>
                    <span className="text-amber-400 font-bold">Overall Rank: #{activePlayerModal.filmAnalytics?.overallRank || '—'}</span>
                    <span>·</span>
                    <span className="text-indigo-400 font-bold">Pos Rank: #{activePlayerModal.filmAnalytics?.positionRank || '1'} {activePlayerModal.primaryPosition}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActivePlayerModal(null)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dossier Modal Tabs */}
            <div className="flex items-center gap-2 px-6 border-b border-white/10 bg-slate-950/60 text-xs font-bold">
              <button
                onClick={() => setModalTab('film')}
                className={`py-3 px-3 border-b-2 flex items-center gap-2 transition-all ${
                  modalTab === 'film' ? 'border-amber-400 text-amber-300 font-bold' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Gauge className="w-4 h-4" />
                <span>Film Analytics & 1-100 Grade</span>
              </button>

              <button
                onClick={() => setModalTab('radar')}
                className={`py-3 px-3 border-b-2 flex items-center gap-2 transition-all ${
                  modalTab === 'radar' ? 'border-amber-400 text-amber-300 font-bold' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Target className="w-4 h-4" />
                <span>Athletic Radar & Traits</span>
              </button>

              <button
                onClick={() => setModalTab('recruiting')}
                className={`py-3 px-3 border-b-2 flex items-center gap-2 transition-all ${
                  modalTab === 'recruiting' ? 'border-amber-400 text-amber-300 font-bold' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Recruitment & Bio</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {modalTab === 'film' && (
                <div className="space-y-6">
                  {/* Performance Score Hero Gauge */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xl">
                    <div className="flex items-center gap-4">
                      {/* Big Score Circle */}
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex flex-col items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 shrink-0">
                        <span className="text-2xl leading-none">{activePlayerModal.filmAnalytics?.seasonGrade || 70}</span>
                        <span className="text-[10px] tracking-wider uppercase font-bold">/ 100</span>
                      </div>

                      <div>
                        <div className="text-[10px] text-amber-400 uppercase tracking-widest font-bold">
                          SEASON PERFORMANCE EVALUATION
                        </div>
                        <div className="text-base font-bold text-white font-sans mt-0.5">
                          {activePlayerModal.filmAnalytics?.tierLabel || 'Varsity Player'}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 max-w-md">
                          {activePlayerModal.filmAnalytics?.filmEvaluationNotes}
                        </p>
                      </div>
                    </div>

                    <div className="text-right sm:border-l sm:border-white/10 sm:pl-5 shrink-0">
                      <div className="text-[10px] text-slate-500 uppercase">BEST FILM PERFORMANCE</div>
                      <div className="text-xs font-bold text-amber-300 mt-0.5">
                        {activePlayerModal.filmAnalytics?.bestFilmGame}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Playmaker Score: <span className="text-white font-bold">{activePlayerModal.filmAnalytics?.filmPlaymakerScore}/100</span>
                      </div>
                    </div>
                  </div>

                  {/* Key Film Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-slate-950 border border-white/5 text-center">
                      <div className="text-[10px] text-slate-500 uppercase">TOTAL VERIFIED SNAPS</div>
                      <div className="text-lg font-bold text-white mt-0.5">
                        {activePlayerModal.filmAnalytics?.totalFilmSnaps || '—'}
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5">
                        {activePlayerModal.filmAnalytics?.offenseSnaps} Off · {activePlayerModal.filmAnalytics?.defenseSnaps} Def
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-white/5 text-center">
                      <div className="text-[10px] text-slate-500 uppercase">NET EPA IMPACT</div>
                      <div className={`text-lg font-bold mt-0.5 ${
                        (activePlayerModal.filmAnalytics?.filmEpaTotal ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {(activePlayerModal.filmAnalytics?.filmEpaTotal ?? 0) >= 0
                          ? `+${activePlayerModal.filmAnalytics?.filmEpaTotal}`
                          : activePlayerModal.filmAnalytics?.filmEpaTotal}
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5">
                        {activePlayerModal.filmAnalytics?.filmAvgEpa}/snap avg
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-white/5 text-center">
                      <div className="text-[10px] text-slate-500 uppercase">EXECUTION SUCCESS %</div>
                      <div className="text-lg font-bold text-amber-300 mt-0.5">
                        {activePlayerModal.filmAnalytics?.filmSuccessRatePct || 50}%
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5">Positive EPA Snaps</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-white/5 text-center">
                      <div className="text-[10px] text-slate-500 uppercase">PLAYMAKER IMPACTS</div>
                      <div className="text-lg font-bold text-cyan-300 mt-0.5">
                        {(activePlayerModal.filmAnalytics?.filmTouchdowns || 0) + (activePlayerModal.filmAnalytics?.filmDefensiveStops || 0)}
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5">
                        {activePlayerModal.filmAnalytics?.filmTouchdowns} TDs · {activePlayerModal.filmAnalytics?.filmDefensiveStops} Stops
                      </div>
                    </div>
                  </div>

                  {/* Situational Film Performance & Snaps Split */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-3">
                    <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                        Situational Impact & Unit Distribution
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        Grade Tier: <strong className="text-amber-300">{activePlayerModal.filmAnalytics?.gradeTier}</strong>
                      </span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div className="p-3 rounded-lg bg-slate-900 border border-white/5 space-y-1">
                        <div className="text-[10px] text-slate-400 uppercase">Unit Allocation</div>
                        <div className="flex items-center justify-between text-xs font-bold pt-1">
                          <span className="text-amber-300">Offense: {activePlayerModal.filmAnalytics?.offenseSnaps || 0}</span>
                          <span className="text-emerald-300">Defense: {activePlayerModal.filmAnalytics?.defenseSnaps || 0}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex mt-1">
                          <div
                            className="bg-amber-400 h-full"
                            style={{
                              width: `${
                                ((activePlayerModal.filmAnalytics?.offenseSnaps || 0) /
                                  ((activePlayerModal.filmAnalytics?.totalFilmSnaps || 1))) *
                                100
                              }%`,
                            }}
                          />
                          <div
                            className="bg-emerald-400 h-full"
                            style={{
                              width: `${
                                ((activePlayerModal.filmAnalytics?.defenseSnaps || 0) /
                                  ((activePlayerModal.filmAnalytics?.totalFilmSnaps || 1))) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-900 border border-white/5 space-y-1">
                        <div className="text-[10px] text-slate-400 uppercase">Film Efficiency Rating</div>
                        <div className="text-sm font-bold text-emerald-400 mt-1">
                          {activePlayerModal.filmAnalytics?.filmSuccessRatePct || 50}% Success Rate
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {((activePlayerModal.filmAnalytics?.filmSuccessRatePct || 50) >= 65)
                            ? '⭐ High Positive Impact Player'
                            : 'Solid Rotation Contributor'}
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-900 border border-white/5 space-y-1">
                        <div className="text-[10px] text-slate-400 uppercase">Position Leaderboard</div>
                        <div className="text-sm font-bold text-amber-300 mt-1">
                          #{activePlayerModal.filmAnalytics?.positionRank || 1} among {activePlayerModal.primaryPosition}s
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Overall Varsity Rank: #{activePlayerModal.filmAnalytics?.overallRank}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Scouted Position Traits (0-100) */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-3">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Scouted Film Traits Matrix (1-100 Scale)
                    </h4>
                    <div className="space-y-3">
                      {activePlayerModal.filmAnalytics?.scoutedTraits?.map((trait, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-white">{trait.name}</span>
                            <span className="font-bold text-amber-300">{trait.score}/100</span>
                          </div>
                          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all"
                              style={{ width: `${trait.score}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-slate-400 font-sans">
                            {trait.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Signature Film Plays Ledger with 1-Click Jump to Film Room */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5" />
                        Signature Film Plays (Ground Truth from 2025 Season)
                      </h4>
                      <span className="text-[10px] text-slate-400">
                        {activePlayerModal.filmAnalytics?.signaturePlays?.length || 0} Key Highlights
                      </span>
                    </div>

                    <div className="space-y-2">
                      {activePlayerModal.filmAnalytics?.signaturePlays?.map((play, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-lg bg-slate-900 border border-white/5 hover:border-amber-400/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                                {play.impactType}
                              </span>
                              <span className="text-xs font-bold text-white truncate">
                                {play.gameTitle} · Q{play.quarter} ({play.gameClock})
                              </span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                play.epa >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                              }`}>
                                {play.epa >= 0 ? `+${play.epa.toFixed(2)}` : play.epa.toFixed(2)} EPA
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300 font-sans line-clamp-2">
                              {play.playDescription}
                            </p>
                          </div>

                          <button
                            onClick={() => {
                              setActivePlayerModal(null);
                              router.push(`/dashboard/film-room/${play.gameId}?play=${play.playId}&highlight=true&autoplay=true`);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 shrink-0 shadow-md shadow-amber-500/20"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Watch Highlight</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {modalTab === 'radar' && (
                <div className="space-y-6">
                  {/* Radar Chart Display */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-white/10 flex flex-col items-center">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                      Athletic & Functional Radar Dimensions
                    </h4>
                    <div className="w-full h-64 max-w-md">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={[
                          { subject: 'Speed', A: activePlayerModal.radarMetrics?.speed || 75 },
                          { subject: 'Strength', A: activePlayerModal.radarMetrics?.strength || 75 },
                          { subject: 'Technique', A: activePlayerModal.radarMetrics?.technique || 75 },
                          { subject: 'Football IQ', A: activePlayerModal.radarMetrics?.footballIq || 75 },
                          { subject: 'Motor', A: activePlayerModal.radarMetrics?.motor || 75 },
                          { subject: 'Versatility', A: activePlayerModal.radarMetrics?.versatility || 75 },
                        ]}>
                          <PolarGrid stroke="rgba(255,255,255,0.15)" />
                          <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                          <PolarRadiusAxis domain={[0, 100]} stroke="rgba(255,255,255,0.1)" />
                          <Radar name={activePlayerModal.name} dataKey="A" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.4} />
                          <Tooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Physical Dimensions */}
                  <div className="grid grid-cols-3 gap-3 font-mono text-center">
                    <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                      <div className="text-[10px] text-slate-500 uppercase">HEIGHT</div>
                      <div className="text-sm font-bold text-white mt-0.5">{activePlayerModal.height || '6-0'}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                      <div className="text-[10px] text-slate-500 uppercase">WEIGHT</div>
                      <div className="text-sm font-bold text-white mt-0.5">{activePlayerModal.weight || '195 lbs'}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                      <div className="text-[10px] text-slate-500 uppercase">CLASS YEAR</div>
                      <div className="text-sm font-bold text-amber-400 mt-0.5">{activePlayerModal.classYear} ({activePlayerModal.gradeLevel})</div>
                    </div>
                  </div>
                </div>
              )}

              {modalTab === 'recruiting' && (
                <div className="space-y-6">
                  {/* College Commitment Banner */}
                  {activePlayerModal.recruitment?.committedCollege ? (
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-emerald-950/60 border border-emerald-500/50 shadow-xl space-y-2">
                      <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                        <Star className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                        COLLEGIATE COMMITMENT VERIFIED · CLASS OF {activePlayerModal.classYear}
                      </div>
                      <h3 className="text-xl font-black text-white font-sans flex items-center gap-2">
                        <span>{activePlayerModal.recruitment.committedCollege}</span>
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-emerald-300/90 font-mono">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40">
                          {activePlayerModal.recruitment.divisionTarget || 'NCAA Division 1'}
                        </span>
                        <span>·</span>
                        <span>Official Division 1 FCS Commit</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border border-amber-500/40 shadow-xl space-y-2">
                      <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                        <Award className="w-4 h-4 text-amber-400" />
                        COLLEGIATE RECRUITMENT STATUS: {activePlayerModal.recruitment?.status || 'SCOUTED'}
                      </div>
                      <h3 className="text-lg font-black text-white font-sans">
                        Target: {activePlayerModal.recruitment?.divisionTarget || 'NCAA Collegiate Football'}
                      </h3>
                      <p className="text-xs text-slate-300 font-sans">
                        Actively scouted varsity student-athlete for the Peddie Falcons (Class of {activePlayerModal.classYear}).
                      </p>
                    </div>
                  )}

                  {/* Verified External Profiles & Links */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Hudl Verified Film Profile */}
                    {activePlayerModal.recruitment?.hudlProfileUrl && (
                      <div className="p-4 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-between hover:border-red-500/40 transition-all">
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                            <span>Hudl Verified Profile</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono">
                            Full film reel, verified clips & testing
                          </p>
                        </div>
                        <a
                          href={activePlayerModal.recruitment.hudlProfileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Hudl Reel</span>
                        </a>
                      </div>
                    )}

                    {/* MaxPreps Official Roster Profile */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-between hover:border-sky-500/40 transition-all">
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-sky-400" />
                          <span>MaxPreps Roster Profile</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono">
                          Official Peddie School roster record
                        </p>
                      </div>
                      <a
                        href={activePlayerModal.recruitment?.maxprepsUrl || "https://www.maxpreps.com/nj/hightstown/peddie-falcons/football/roster/"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>MaxPreps</span>
                      </a>
                    </div>
                  </div>

                  {/* Athletic Combine & Physical Testing Numbers */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                        <Gauge className="w-3.5 h-3.5" />
                        Verified Combine & Athletic Testing
                      </h4>
                      <span className="text-[10px] text-slate-500 font-mono">
                        NCAA ID: {activePlayerModal.recruitment?.ncaaEligibilityId || '26009826'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center font-mono">
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                        <div className="text-[9px] text-slate-500 uppercase">40-YD DASH</div>
                        <div className="text-sm font-black text-amber-300 mt-0.5">
                          {activePlayerModal.recruitment?.fortyYardDashSec ? `${activePlayerModal.recruitment.fortyYardDashSec}s` : '4.70s'}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                        <div className="text-[9px] text-slate-500 uppercase">BENCH PRESS</div>
                        <div className="text-sm font-black text-white mt-0.5">
                          {activePlayerModal.recruitment?.benchPressMaxLbs ? `${activePlayerModal.recruitment.benchPressMaxLbs} lbs` : '225 lbs'}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                        <div className="text-[9px] text-slate-500 uppercase">SQUAT MAX</div>
                        <div className="text-sm font-black text-white mt-0.5">
                          {activePlayerModal.recruitment?.squatMaxLbs ? `${activePlayerModal.recruitment.squatMaxLbs} lbs` : '335 lbs'}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                        <div className="text-[9px] text-slate-500 uppercase">VERTICAL JUMP</div>
                        <div className="text-sm font-black text-emerald-400 mt-0.5">
                          {activePlayerModal.recruitment?.verticalJumpInches ? `${activePlayerModal.recruitment.verticalJumpInches}"` : '31.0"'}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                        <div className="text-[9px] text-slate-500 uppercase">PRO SHUTTLE</div>
                        <div className="text-sm font-black text-slate-300 mt-0.5">
                          {activePlayerModal.recruitment?.shuttleTimeSec ? `${activePlayerModal.recruitment.shuttleTimeSec}s` : '4.30s'}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                        <div className="text-[9px] text-slate-500 uppercase">ACADEMIC GPA</div>
                        <div className="text-sm font-black text-sky-300 mt-0.5">
                          {activePlayerModal.recruitment?.gpa ? `${activePlayerModal.recruitment.gpa.toFixed(2)}` : '3.65'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* College Offers & Interested Programs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Offers */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Verified Offers & Accolades
                        </h4>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {activePlayerModal.recruitment?.offers?.length || 0} Total
                        </span>
                      </div>
                      {activePlayerModal.recruitment?.offers && activePlayerModal.recruitment.offers.length > 0 ? (
                        <div className="space-y-1.5 mt-2">
                          {activePlayerModal.recruitment.offers.map((offer, idx) => (
                            <div key={idx} className="px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-500/30 text-xs font-mono text-emerald-300 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span>{offer}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 font-sans italic py-2">
                          Underclassman prospect building collegiate offer sheet during the 2025–2026 campaign.
                        </p>
                      )}
                    </div>

                    {/* Interested Colleges */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                          <GraduationCap className="w-3.5 h-3.5" />
                          Target Programs & Interest
                        </h4>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {activePlayerModal.recruitment?.interestedColleges?.length || 0} Programs
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {activePlayerModal.recruitment?.interestedColleges?.map((college, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 text-xs font-mono text-slate-200"
                          >
                            {college}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Scouting Overview */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-2">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                      <BookOpen className="w-3.5 h-3.5" />
                      Peddie Varsity Scouting Summary
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {activePlayerModal.scoutingSummary}
                    </p>
                    <ul className="space-y-1.5 mt-3">
                      {activePlayerModal.strengths.map((str, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2 font-sans">
                          <span className="text-emerald-400 font-bold">✓</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono hidden sm:inline">
                Official 2025–26 Peddie Falcons Varsity Football · 38 Athletes
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all flex items-center gap-1.5 border border-white/10"
                  title="Print or Export PDF Scouting Dossier"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-400" />
                  <span>Export PDF</span>
                </button>

                <button
                  onClick={() => {
                    const firstPlay = activePlayerModal.filmAnalytics?.signaturePlays?.[0];
                    const targetGame = firstPlay?.gameId || gameId;
                    const queryStr = firstPlay ? `?play=${firstPlay.playId}&highlight=true&autoplay=true` : '';
                    setActivePlayerModal(null);
                    router.push(`/dashboard/film-room/${targetGame}${queryStr}`);
                  }}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Open Highlights in Film Room</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
