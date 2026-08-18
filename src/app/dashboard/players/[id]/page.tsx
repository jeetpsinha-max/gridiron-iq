'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Users, Search, Filter, Star, Award, TrendingUp,
  Activity, Shield, Target, Zap, ChevronRight,
  ExternalLink, Play, CheckCircle2, AlertTriangle,
  GraduationCap, Calendar, Ruler, Weight, UserCheck,
  Flame, BookOpen, Layers, X, Grid, List, Sparkles
} from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, Tooltip
} from 'recharts';
import { PEDDIE_PLAYERS } from '@/lib/peddie-player-data';
import { PlayerProfile } from '@/types/football';

export default function PlayerTrackerPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params?.id as string || 'peddie-blair-2025';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedPositionGroup, setSelectedPositionGroup] = useState<string>('ALL');
  const [selectedRecruitmentStatus, setSelectedRecruitmentStatus] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [activePlayerModal, setActivePlayerModal] = useState<PlayerProfile | null>(null);

  // Filter logic
  const filteredPlayers = useMemo(() => {
    return PEDDIE_PLAYERS.filter(player => {
      // Search match
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery = !query ||
        player.name.toLowerCase().includes(query) ||
        player.jerseyNumber.toString().includes(query) ||
        player.primaryPosition.toLowerCase().includes(query) ||
        player.positions.some(p => p.toLowerCase().includes(query)) ||
        player.strengths.some(s => s.toLowerCase().includes(query));

      // Class match
      const matchesClass = selectedClass === 'ALL' || player.classYear === selectedClass;

      // Position match
      let matchesPosition = true;
      if (selectedPositionGroup === 'OFFENSE') {
        matchesPosition = ['QB', 'RB', 'WR', 'TE', 'OL', 'C', 'G', 'OT', 'ATH'].includes(player.primaryPosition);
      } else if (selectedPositionGroup === 'DEFENSE') {
        matchesPosition = ['DE', 'DT', 'NT', 'EDGE', 'LB', 'MLB', 'OLB', 'CB', 'FS', 'SS', 'DB'].includes(player.primaryPosition);
      } else if (selectedPositionGroup !== 'ALL') {
        matchesPosition = player.positions.includes(selectedPositionGroup) || player.primaryPosition === selectedPositionGroup;
      }

      // Recruitment match
      let matchesRecruitment = true;
      if (selectedRecruitmentStatus === '4_STAR') {
        matchesRecruitment = player.recruitment.rating === '4_STAR';
      } else if (selectedRecruitmentStatus === '3_STAR') {
        matchesRecruitment = player.recruitment.rating === '3_STAR';
      } else if (selectedRecruitmentStatus === 'COMMITTED') {
        matchesRecruitment = player.recruitment.status === 'COMMITTED';
      } else if (selectedRecruitmentStatus === 'OFFERS') {
        matchesRecruitment = player.recruitment.offers.length > 0;
      }

      return matchesQuery && matchesClass && matchesPosition && matchesRecruitment;
    });
  }, [searchQuery, selectedClass, selectedPositionGroup, selectedRecruitmentStatus]);

  // Aggregate KPIs
  const totalRosterCount = PEDDIE_PLAYERS.length;
  const totalOffersCount = PEDDIE_PLAYERS.reduce((acc, p) => acc + p.recruitment.offers.length, 0);
  const avgGpa = (PEDDIE_PLAYERS.reduce((acc, p) => acc + (p.recruitment.gpa || 3.7), 0) / PEDDIE_PLAYERS.length).toFixed(2);
  const totalTouchdowns = PEDDIE_PLAYERS.reduce((acc, p) => acc + (p.stats2025.passingTds || 0) + (p.stats2025.rushingTds || 0) + (p.stats2025.receivingTds || 0), 0);
  const totalSacks = PEDDIE_PLAYERS.reduce((acc, p) => acc + (p.stats2025.sacks || 0), 0).toFixed(1);

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-[#07070d] text-slate-100 overflow-hidden">
      {/* Top Banner & KPI Header */}
      <div className="border-b border-white/10 bg-slate-950/80 px-6 py-3.5 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Users className="w-4 h-4 text-slate-950 font-bold" />
              </div>
              <h1 className="text-base font-black tracking-tight text-white font-mono">
                2025–2026 PEDDIE FALCONS PLAYER TRACKER & SCOUTING DOSSIER
              </h1>
              <span className="px-2 py-0.5 rounded bg-amber-400/20 border border-amber-400/40 text-[10px] font-bold text-amber-300">
                MAPL VARSITY FOOTBALL
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Head Coach Mark Fabish · Multimodal Film Vision, Physicals, 2025–26 Stats, Strengths/Weaknesses & Recruiting
            </p>
          </div>

          {/* Quick KPIs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 flex items-center gap-2">
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              <div>
                <div className="text-[10px] text-slate-400 font-mono">ACTIVE ROSTER</div>
                <div className="text-xs font-bold text-white">{totalRosterCount} Athletes</div>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 flex items-center gap-2">
              <Star className="w-3.5 h-3.5 text-yellow-400" />
              <div>
                <div className="text-[10px] text-slate-400 font-mono">COLLEGE OFFERS</div>
                <div className="text-xs font-bold text-amber-300">{totalOffersCount} Total</div>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 flex items-center gap-2">
              <Award className="w-3.5 h-3.5 text-cyan-400" />
              <div>
                <div className="text-[10px] text-slate-400 font-mono">TEAM AVG GPA</div>
                <div className="text-xs font-bold text-cyan-300">{avgGpa}</div>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 flex items-center gap-2">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <div>
                <div className="text-[10px] text-slate-400 font-mono">2025-26 SACKS</div>
                <div className="text-xs font-bold text-rose-300">{totalSacks}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, # jersey, position, or trait..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
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
          <div className="flex items-center gap-2 overflow-x-auto">
            {/* Graduation Class Filter */}
            <div className="flex items-center rounded-lg bg-slate-900 border border-white/10 p-0.5 text-[11px]">
              {['ALL', '2026', '2027', '2028'].map(cls => (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                    selectedClass === cls ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cls === 'ALL' ? 'All Classes' : `Class of '${cls.slice(2)}`}
                </button>
              ))}
            </div>

            {/* Position Filter */}
            <div className="flex items-center rounded-lg bg-slate-900 border border-white/10 p-0.5 text-[11px]">
              {[
                { id: 'ALL', label: 'All Positions' },
                { id: 'OFFENSE', label: 'Offense' },
                { id: 'DEFENSE', label: 'Defense' },
                { id: 'QB', label: 'QB' },
                { id: 'WR', label: 'WR' },
                { id: 'DE', label: 'DE' },
              ].map(pos => (
                <button
                  key={pos.id}
                  onClick={() => setSelectedPositionGroup(pos.id)}
                  className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                    selectedPositionGroup === pos.id ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>

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
          <div className="p-12 text-center text-slate-500 border border-dashed border-white/10 rounded-2xl">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <h3 className="text-sm font-semibold text-slate-400">No Peddie football players found</h3>
            <p className="text-xs mt-1">Try adjusting your search keywords or filter criteria.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedClass('ALL'); setSelectedPositionGroup('ALL'); }}
              className="mt-4 px-3 py-1.5 rounded-lg bg-amber-400/20 text-amber-300 text-xs font-bold hover:bg-amber-400/30"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPlayers.map((player) => {
              // Prepare radar data for mini-chart
              const radarData = [
                { subject: 'SPD', value: player.radarMetrics.speed },
                { subject: 'STR', value: player.radarMetrics.strength },
                { subject: 'TEC', value: player.radarMetrics.technique },
                { subject: 'IQ', value: player.radarMetrics.footballIq },
                { subject: 'MTR', value: player.radarMetrics.motor },
                { subject: 'VER', value: player.radarMetrics.versatility },
              ];

              return (
                <div
                  key={player.id}
                  className="bg-slate-900/90 border border-white/10 rounded-xl overflow-hidden hover:border-amber-400/50 transition-all flex flex-col shadow-lg group relative"
                >
                  {/* Card Header */}
                  <div className="p-4 pb-3 border-b border-white/5 bg-slate-950/60 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      {/* Jersey Badge */}
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black font-mono text-base shadow-md shrink-0">
                        #{player.jerseyNumber}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                            {player.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono mt-0.5">
                          <span className="font-bold text-amber-400">{player.primaryPosition}</span>
                          <span>·</span>
                          <span>{player.gradeLevel}</span>
                          <span>·</span>
                          <span>Class of '{player.classYear.slice(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Star Rating Badge */}
                    {player.recruitment.rating === '4_STAR' ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-400/15 border border-emerald-400/40 text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-emerald-300" />
                        4-STAR
                      </span>
                    ) : player.recruitment.rating === '3_STAR' ? (
                      <span className="px-2 py-0.5 rounded bg-amber-400/15 border border-amber-400/40 text-[10px] font-bold text-amber-300 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-300" />
                        3-STAR
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-blue-400/15 border border-blue-400/30 text-[10px] font-bold text-blue-300">
                        {player.recruitment.rating.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>

                  {/* Physical Dimensions & Combine KPIs */}
                  <div className="px-4 py-2.5 bg-slate-950/30 grid grid-cols-4 gap-2 border-b border-white/5 text-center">
                    <div>
                      <div className="text-[10px] text-slate-500 font-mono">HT</div>
                      <div className="text-xs font-bold text-slate-200">{player.height}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-mono">WT</div>
                      <div className="text-xs font-bold text-slate-200">{player.weight}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-mono">AGE</div>
                      <div className="text-xs font-bold text-slate-200">{player.age}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-mono">40YD</div>
                      <div className="text-xs font-bold text-amber-400">{player.recruitment.fortyYardDashSec || '—'}s</div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    {/* Strengths & Weaknesses Snapshot */}
                    <div className="space-y-2">
                      <div>
                        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Key Strengths
                        </div>
                        <ul className="space-y-1">
                          {player.strengths.slice(0, 2).map((str, idx) => (
                            <li key={idx} className="text-[11px] text-slate-300 leading-snug flex items-start gap-1.5">
                              <span className="text-amber-400 mt-0.5">•</span>
                              <span className="line-clamp-2">{str}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-400" />
                          Growth Focus
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 leading-snug">
                          {player.weaknesses[0] || 'Continued collegiate strength progression.'}
                        </p>
                      </div>
                    </div>

                    {/* 2025-2026 Key Season Stats Line */}
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-white/5">
                      <div className="text-[10px] text-slate-400 font-mono mb-1 flex items-center justify-between">
                        <span>2025–26 STATS ({player.stats2025.gamesPlayed} GAMES)</span>
                        <span className="text-emerald-400 font-bold">+{player.stats2025.avgEpaContribution} EPA</span>
                      </div>
                      <div className="text-[11px] font-mono text-white font-semibold">
                        {player.primaryPosition === 'QB' && (
                          <span>{player.stats2025.passingYards} Pass Yds · {player.stats2025.passingTds} TD / {player.stats2025.interceptionsThrown} INT · {player.stats2025.completionPct}% Comp</span>
                        )}
                        {player.primaryPosition === 'RB' && (
                          <span>{player.stats2025.rushingYards} Rush Yds · {player.stats2025.rushingTds} TD · {player.stats2025.yardsPerCarry} YPC</span>
                        )}
                        {(player.primaryPosition === 'WR' || player.primaryPosition === 'TE') && (
                          <span>{player.stats2025.receptions} Rec · {player.stats2025.receivingYards} Yds · {player.stats2025.receivingTds} TD ({player.stats2025.yardsPerCatch} YPR)</span>
                        )}
                        {(player.primaryPosition === 'DE' || player.primaryPosition === 'DT' || player.primaryPosition === 'LB' || player.primaryPosition === 'MLB' || player.primaryPosition === 'OLB') && (
                          <span>{player.stats2025.tacklesTotal} Tkls · {player.stats2025.tacklesForLoss} TFL · {player.stats2025.sacks} Sacks</span>
                        )}
                        {(player.primaryPosition === 'CB' || player.primaryPosition === 'FS' || player.primaryPosition === 'SS') && (
                          <span>{player.stats2025.tacklesTotal} Tkls · {player.stats2025.interceptionsDefense} INT · {player.stats2025.passBreakups} PBU</span>
                        )}
                        {(player.primaryPosition === 'OL' || player.primaryPosition === 'C' || player.primaryPosition === 'G' || player.primaryPosition === 'OT') && (
                          <span>{player.stats2025.pancakeBlocks} Pancakes · {player.stats2025.sacksAllowed} Sacks Allowed</span>
                        )}
                        {player.primaryPosition === 'ATH' && (
                          <span>{player.stats2025.receivingYards} Rec Yds · {player.stats2025.passingYards || 0} Pass Yds · {player.stats2025.tacklesTotal} Tkls</span>
                        )}
                      </div>
                    </div>

                    {/* Recruiting Highlights */}
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                      <div className="truncate max-w-[170px] text-slate-400">
                        {player.recruitment.status === 'COMMITTED' ? (
                          <span className="text-emerald-400 font-semibold">Committed: {player.recruitment.committedCollege}</span>
                        ) : player.recruitment.offers.length > 0 ? (
                          <span className="text-amber-300 font-semibold">{player.recruitment.offers.length} Offers ({player.recruitment.offers[0]})</span>
                        ) : (
                          <span className="text-slate-400">{player.recruitment.interestedColleges.slice(0, 2).join(', ')}</span>
                        )}
                      </div>

                      <button
                        onClick={() => setActivePlayerModal(player)}
                        className="px-2.5 py-1 rounded-md bg-amber-500/15 hover:bg-amber-400 text-amber-300 hover:text-slate-950 font-bold text-[11px] transition-all flex items-center gap-1 shrink-0"
                      >
                        Dossier
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="bg-slate-900 border border-white/10 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 border-b border-white/10 text-slate-400 font-mono text-[10px] uppercase">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Athlete</th>
                    <th className="p-3">Position</th>
                    <th className="p-3">Class</th>
                    <th className="p-3">Ht / Wt</th>
                    <th className="p-3">Age</th>
                    <th className="p-3">2025–26 Season Highlights</th>
                    <th className="p-3">EPA Contribution</th>
                    <th className="p-3">Recruiting / Offers</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredPlayers.map((player) => (
                    <tr key={player.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3 font-mono font-bold text-amber-400">#{player.jerseyNumber}</td>
                      <td className="p-3">
                        <div className="font-bold text-white">{player.name}</div>
                        <div className="text-[10px] text-slate-400">{player.hometown}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono font-bold text-[10px]">
                          {player.primaryPosition}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300 font-mono">Class of '{player.classYear.slice(2)} ({player.gradeLevel})</td>
                      <td className="p-3 text-slate-300 font-mono">{player.height} · {player.weight}</td>
                      <td className="p-3 text-slate-300">{player.age}</td>
                      <td className="p-3 text-slate-200 font-mono">
                        {player.primaryPosition === 'QB' && `${player.stats2025.passingYards} yds, ${player.stats2025.passingTds} TD, ${player.stats2025.completionPct}%`}
                        {player.primaryPosition === 'RB' && `${player.stats2025.rushingYards} yds, ${player.stats2025.rushingTds} TD, ${player.stats2025.yardsPerCarry} YPC`}
                        {(player.primaryPosition === 'WR' || player.primaryPosition === 'TE') && `${player.stats2025.receptions} rec, ${player.stats2025.receivingYards} yds, ${player.stats2025.receivingTds} TD`}
                        {(player.primaryPosition === 'DE' || player.primaryPosition === 'DT' || player.primaryPosition === 'LB' || player.primaryPosition === 'MLB' || player.primaryPosition === 'OLB') && `${player.stats2025.tacklesTotal} tkls, ${player.stats2025.tacklesForLoss} TFL, ${player.stats2025.sacks} sacks`}
                        {(player.primaryPosition === 'CB' || player.primaryPosition === 'FS' || player.primaryPosition === 'SS') && `${player.stats2025.tacklesTotal} tkls, ${player.stats2025.interceptionsDefense} INT, ${player.stats2025.passBreakups} PBU`}
                        {(player.primaryPosition === 'OL' || player.primaryPosition === 'C' || player.primaryPosition === 'G' || player.primaryPosition === 'OT') && `${player.stats2025.pancakeBlocks} pancakes, ${player.stats2025.sacksAllowed} sacks allowed`}
                        {player.primaryPosition === 'ATH' && `${player.stats2025.receivingYards} rec yds, ${player.stats2025.passingYards || 0} pass yds, ${player.stats2025.tacklesTotal} tkls`}
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-400">+{player.stats2025.avgEpaContribution}</td>
                      <td className="p-3">
                        <div className="text-slate-200 font-semibold">{player.recruitment.rating.replace(/_/g, ' ')}</div>
                        <div className="text-[10px] text-slate-400">
                          {player.recruitment.offers.length > 0 ? `${player.recruitment.offers.length} Offers` : `${player.recruitment.interestedColleges.length} Inquiries`}
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setActivePlayerModal(player)}
                          className="px-2.5 py-1 rounded bg-amber-400/20 text-amber-300 hover:bg-amber-400 hover:text-slate-950 font-bold text-[10px] transition-all"
                        >
                          View Dossier
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Deep-Dive Scouting Dossier Modal */}
      {activePlayerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-white/15 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 bg-slate-950 border-b border-white/10 flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black font-mono text-2xl shadow-xl shrink-0">
                  #{activePlayerModal.jerseyNumber}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-white">{activePlayerModal.name}</h2>
                    <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-mono font-bold">
                      {activePlayerModal.primaryPosition}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono">
                      Class of {activePlayerModal.classYear} ({activePlayerModal.gradeLevel})
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {activePlayerModal.highSchool} · {activePlayerModal.hometown} · Age {activePlayerModal.age}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActivePlayerModal(null)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Combine & Physical Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-white/5 text-center">
                  <div className="text-[10px] text-slate-500 font-mono">HEIGHT</div>
                  <div className="text-sm font-bold text-white mt-0.5">{activePlayerModal.height}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-white/5 text-center">
                  <div className="text-[10px] text-slate-500 font-mono">WEIGHT</div>
                  <div className="text-sm font-bold text-white mt-0.5">{activePlayerModal.weight}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-white/5 text-center">
                  <div className="text-[10px] text-slate-500 font-mono">40-YD DASH</div>
                  <div className="text-sm font-bold text-amber-400 mt-0.5">{activePlayerModal.recruitment.fortyYardDashSec || '—'}s</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-white/5 text-center">
                  <div className="text-[10px] text-slate-500 font-mono">VERTICAL</div>
                  <div className="text-sm font-bold text-cyan-400 mt-0.5">{activePlayerModal.recruitment.verticalJumpInches || '—'}"</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-white/5 text-center">
                  <div className="text-[10px] text-slate-500 font-mono">BENCH PRESS</div>
                  <div className="text-sm font-bold text-white mt-0.5">{activePlayerModal.recruitment.benchPressMaxLbs || '—'} lbs</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-white/5 text-center">
                  <div className="text-[10px] text-slate-500 font-mono">SQUAT MAX</div>
                  <div className="text-sm font-bold text-white mt-0.5">{activePlayerModal.recruitment.squatMaxLbs || '—'} lbs</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-white/5 text-center">
                  <div className="text-[10px] text-slate-500 font-mono">ACADEMIC GPA</div>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5">{activePlayerModal.recruitment.gpa || '3.75'}</div>
                </div>
              </div>

              {/* Scouting Overview & Radar Chart */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  {/* Executive Scouting Summary */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      Executive Scouting Report
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {activePlayerModal.scoutingSummary}
                    </p>
                  </div>

                  {/* Strengths Breakdown */}
                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified Film Strengths & Elite Traits
                    </h4>
                    <ul className="space-y-1.5">
                      {activePlayerModal.strengths.map((str, i) => (
                        <li key={i} className="text-xs text-slate-200 leading-relaxed flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">✓</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses & Coaching Directives */}
                  <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/20">
                    <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Coaching Directives & Growth Focus Areas
                    </h4>
                    <ul className="space-y-1.5">
                      {activePlayerModal.weaknesses.map((wk, i) => (
                        <li key={i} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                          <span className="text-rose-400 font-bold">!</span>
                          <span>{wk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Radar Chart */}
                <div className="p-4 rounded-xl bg-slate-950 border border-white/10 flex flex-col items-center justify-center">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
                    Athletic & Vision Radar
                  </h4>
                  <div className="w-full h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart
                        data={[
                          { subject: 'Speed', value: activePlayerModal.radarMetrics.speed },
                          { subject: 'Strength', value: activePlayerModal.radarMetrics.strength },
                          { subject: 'Technique', value: activePlayerModal.radarMetrics.technique },
                          { subject: 'Game IQ', value: activePlayerModal.radarMetrics.footballIq },
                          { subject: 'Motor', value: activePlayerModal.radarMetrics.motor },
                          { subject: 'Versatility', value: activePlayerModal.radarMetrics.versatility },
                        ]}
                      >
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" tick={false} />
                        <Radar name="Metrics" dataKey="value" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.35} />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* 2025-2026 Statistical Breakdown */}
              <div className="p-4 rounded-xl bg-slate-950 border border-white/10">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    2025–2026 Season Verified Statistics
                  </span>
                  <span className="text-emerald-400 font-mono text-[11px]">
                    Average Game EPA: +{activePlayerModal.stats2025.avgEpaContribution}
                  </span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                    <div className="text-[10px] text-slate-500 font-mono">GAMES PLAYED</div>
                    <div className="text-sm font-bold text-white mt-0.5">{activePlayerModal.stats2025.gamesPlayed}</div>
                  </div>

                  {activePlayerModal.stats2025.passingYards !== undefined && (
                    <>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                        <div className="text-[10px] text-slate-500 font-mono">PASS YARDS</div>
                        <div className="text-sm font-bold text-white mt-0.5">{activePlayerModal.stats2025.passingYards}</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                        <div className="text-[10px] text-slate-500 font-mono">PASS TDS / INT</div>
                        <div className="text-sm font-bold text-amber-400 mt-0.5">{activePlayerModal.stats2025.passingTds} / {activePlayerModal.stats2025.interceptionsThrown}</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                        <div className="text-[10px] text-slate-500 font-mono">COMPLETION %</div>
                        <div className="text-sm font-bold text-cyan-400 mt-0.5">{activePlayerModal.stats2025.completionPct}%</div>
                      </div>
                    </>
                  )}

                  {activePlayerModal.stats2025.rushingYards !== undefined && (
                    <>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                        <div className="text-[10px] text-slate-500 font-mono">RUSH YARDS</div>
                        <div className="text-sm font-bold text-white mt-0.5">{activePlayerModal.stats2025.rushingYards}</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                        <div className="text-[10px] text-slate-500 font-mono">RUSH TDS</div>
                        <div className="text-sm font-bold text-amber-400 mt-0.5">{activePlayerModal.stats2025.rushingTds}</div>
                      </div>
                      {activePlayerModal.stats2025.yardsPerCarry !== undefined && (
                        <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                          <div className="text-[10px] text-slate-500 font-mono">YARDS / CARRY</div>
                          <div className="text-sm font-bold text-cyan-400 mt-0.5">{activePlayerModal.stats2025.yardsPerCarry}</div>
                        </div>
                      )}
                    </>
                  )}

                  {activePlayerModal.stats2025.receptions !== undefined && (
                    <>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                        <div className="text-[10px] text-slate-500 font-mono">RECEPTIONS</div>
                        <div className="text-sm font-bold text-white mt-0.5">{activePlayerModal.stats2025.receptions}</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                        <div className="text-[10px] text-slate-500 font-mono">REC YARDS</div>
                        <div className="text-sm font-bold text-white mt-0.5">{activePlayerModal.stats2025.receivingYards}</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                        <div className="text-[10px] text-slate-500 font-mono">REC TDS</div>
                        <div className="text-sm font-bold text-amber-400 mt-0.5">{activePlayerModal.stats2025.receivingTds}</div>
                      </div>
                    </>
                  )}

                  {activePlayerModal.stats2025.tacklesTotal !== undefined && (
                    <>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                        <div className="text-[10px] text-slate-500 font-mono">TOTAL TACKLES</div>
                        <div className="text-sm font-bold text-white mt-0.5">{activePlayerModal.stats2025.tacklesTotal}</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                        <div className="text-[10px] text-slate-500 font-mono">TFLs</div>
                        <div className="text-sm font-bold text-rose-400 mt-0.5">{activePlayerModal.stats2025.tacklesForLoss || 0}</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                        <div className="text-[10px] text-slate-500 font-mono">SACKS</div>
                        <div className="text-sm font-bold text-amber-400 mt-0.5">{activePlayerModal.stats2025.sacks || 0}</div>
                      </div>
                    </>
                  )}

                  {activePlayerModal.stats2025.interceptionsDefense !== undefined && (
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                      <div className="text-[10px] text-slate-500 font-mono">INTERCEPTIONS</div>
                      <div className="text-sm font-bold text-cyan-400 mt-0.5">{activePlayerModal.stats2025.interceptionsDefense}</div>
                    </div>
                  )}

                  {activePlayerModal.stats2025.pancakeBlocks !== undefined && (
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                      <div className="text-[10px] text-slate-500 font-mono">PANCAKE BLOCKS</div>
                      <div className="text-sm font-bold text-amber-400 mt-0.5">{activePlayerModal.stats2025.pancakeBlocks}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recruitment Dossier */}
              <div className="p-4 rounded-xl bg-slate-950 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5" />
                    Collegiate Recruitment Profile & Offers
                  </h4>
                  <span className="px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-xs font-bold font-mono">
                    {activePlayerModal.recruitment.rating.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="text-slate-400 font-mono text-[11px] mb-1">OFFICIAL OFFERS</div>
                    {activePlayerModal.recruitment.offers.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {activePlayerModal.recruitment.offers.map((offer, i) => (
                          <span key={i} className="px-2 py-1 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 font-semibold text-[11px]">
                            {offer}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 italic">No formal verbal offers announced yet.</p>
                    )}
                  </div>

                  <div>
                    <div className="text-slate-400 font-mono text-[11px] mb-1">HIGH INTEREST PROGRAMS</div>
                    <div className="flex flex-wrap gap-1.5">
                      {activePlayerModal.recruitment.interestedColleges.map((col, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/5 text-[11px]">
                          {col}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-white/10 flex items-center justify-between">
              <a
                href={activePlayerModal.recruitment.hudlProfileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-bold"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View 2025–26 Hudl Highlights
              </a>

              <button
                onClick={() => {
                  setActivePlayerModal(null);
                  router.push(`/dashboard/film-room/${gameId}`);
                }}
                className="px-4 py-2 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-all flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                Open In Film Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
