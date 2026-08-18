'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Users, Search, Star, Award, TrendingUp,
  ChevronRight, ExternalLink, Play, CheckCircle2, AlertTriangle,
  GraduationCap, Calendar, Ruler, Weight, Grid, List, Sparkles,
  BookOpen, X, Shield, Target, Flame
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
  const gameId = (params?.id as string) || 'peddie-blair-2025';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedPositionGroup, setSelectedPositionGroup] = useState<string>('ALL');
  const [selectedRecruitmentStatus, setSelectedRecruitmentStatus] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [activePlayerModal, setActivePlayerModal] = useState<PlayerProfile | null>(null);

  // Filter logic across all 38 official varsity players
  const filteredPlayers = useMemo(() => {
    return PEDDIE_PLAYERS.filter(player => {
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
        matchesPosition = ['QB', 'RB', 'WR', 'TE', 'OL'].includes(player.primaryPosition);
      } else if (selectedPositionGroup === 'DEFENSE') {
        matchesPosition = ['DL', 'LB', 'DB'].includes(player.primaryPosition);
      } else if (selectedPositionGroup === 'SPECIAL') {
        matchesPosition = ['K', 'P'].includes(player.primaryPosition);
      } else if (selectedPositionGroup !== 'ALL') {
        matchesPosition = player.positions.includes(selectedPositionGroup) || player.primaryPosition === selectedPositionGroup;
      }

      // Recruitment match
      let matchesRecruitment = true;
      if (selectedRecruitmentStatus === 'COMMITTED') {
        matchesRecruitment = player.recruitment?.status === 'COMMITTED' || !!player.recruitment?.committedCollege;
      }

      return matchesQuery && matchesClass && matchesPosition && matchesRecruitment;
    });
  }, [searchQuery, selectedClass, selectedPositionGroup, selectedRecruitmentStatus]);

  // Aggregate KPIs
  const totalRosterCount = PEDDIE_PLAYERS.length;
  const totalSeniors = PEDDIE_PLAYERS.filter(p => p.gradeLevel === 'Senior').length;
  const totalJuniors = PEDDIE_PLAYERS.filter(p => p.gradeLevel === 'Junior').length;
  const totalSophomores = PEDDIE_PLAYERS.filter(p => p.gradeLevel === 'Sophomore').length;
  const totalFreshmen = PEDDIE_PLAYERS.filter(p => p.gradeLevel === 'Freshman').length;

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
                2025–2026 PEDDIE FALCONS OFFICIAL VARSITY ROSTER & DOSSIER
              </h1>
              <span className="px-2 py-0.5 rounded bg-amber-400/20 border border-amber-400/40 text-[10px] font-bold text-amber-300">
                OFFICIAL NJ.COM ROSTER
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
              Head Coach: Mark Fabish · Assistant Coaches: Ethan Kibrick, Deyvon Brooks, Chris Gonzalez · Complete 38-Player Roster
            </p>
          </div>

          {/* Quick KPIs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 font-mono">
            <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 flex items-center gap-2">
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              <div>
                <div className="text-[10px] text-slate-400">TOTAL SQUAD</div>
                <div className="text-xs font-bold text-white">{totalRosterCount} Athletes</div>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 flex items-center gap-2">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">SR</span>
              <div>
                <div className="text-[10px] text-slate-400">SENIORS ('26)</div>
                <div className="text-xs font-bold text-amber-300">{totalSeniors}</div>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 flex items-center gap-2">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">JR</span>
              <div>
                <div className="text-[10px] text-slate-400">JUNIORS ('27)</div>
                <div className="text-xs font-bold text-cyan-300">{totalJuniors}</div>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 flex items-center gap-2">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">SO</span>
              <div>
                <div className="text-[10px] text-slate-400">SOPHOMORES ('28)</div>
                <div className="text-xs font-bold text-indigo-300">{totalSophomores}</div>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 flex items-center gap-2">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">FR</span>
              <div>
                <div className="text-[10px] text-slate-400">FRESHMEN ('29)</div>
                <div className="text-xs font-bold text-emerald-300">{totalFreshmen}</div>
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
              placeholder="Search by player name, # jersey, position, or class..."
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
            <div className="flex items-center rounded-lg bg-slate-900 border border-white/10 p-0.5 text-[11px] font-mono">
              {[
                { id: 'ALL', label: 'All Classes' },
                { id: '2026', label: "Sr ('26)" },
                { id: '2027', label: "Jr ('27)" },
                { id: '2028', label: "So ('28)" },
                { id: '2029', label: "Fr ('29)" },
              ].map(cls => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClass(cls.id)}
                  className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                    selectedClass === cls.id ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cls.label}
                </button>
              ))}
            </div>

            {/* Position Filter */}
            <div className="flex items-center rounded-lg bg-slate-900 border border-white/10 p-0.5 text-[11px] font-mono">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'OFFENSE', label: 'Offense' },
                { id: 'DEFENSE', label: 'Defense' },
                { id: 'SPECIAL', label: 'K/P' },
                { id: 'QB', label: 'QB' },
                { id: 'RB', label: 'RB' },
                { id: 'WR', label: 'WR' },
                { id: 'TE', label: 'TE' },
                { id: 'OL', label: 'OL' },
                { id: 'DL', label: 'DL' },
                { id: 'LB', label: 'LB' },
                { id: 'DB', label: 'DB' },
              ].map(pos => (
                <button
                  key={pos.id}
                  onClick={() => setSelectedPositionGroup(pos.id)}
                  className={`px-2 py-1 rounded-md transition-all font-medium ${
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
            <h3 className="text-sm font-semibold text-slate-400">No Peddie football athletes found</h3>
            <p className="text-xs mt-1">Try adjusting your search query or class filter.</p>
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
                          <span className="font-bold text-amber-400">{player.positions.join(', ')}</span>
                          <span>·</span>
                          <span>{player.gradeLevel}</span>
                          <span>·</span>
                          <span>Class of '{player.classYear.slice(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Commit / Roster Badge */}
                    {player.recruitment?.committedCollege ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-400/15 border border-emerald-400/40 text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-emerald-300" />
                        COMMIT
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono font-bold">
                        VARSITY
                      </span>
                    )}
                  </div>

                  {/* Physical Dimensions */}
                  <div className="px-4 py-2.5 bg-slate-950/30 grid grid-cols-3 gap-2 border-b border-white/5 text-center font-mono">
                    <div>
                      <div className="text-[10px] text-slate-500">HEIGHT</div>
                      <div className="text-xs font-bold text-slate-200">{player.height || '—'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">GRADE</div>
                      <div className="text-xs font-bold text-amber-400">{player.gradeLevel}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">CLASS</div>
                      <div className="text-xs font-bold text-slate-200">'{player.classYear.slice(2)}</div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    {/* Strengths / Profile Snapshot */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Official Roster Profile
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug">
                        {player.scoutingSummary}
                      </p>
                    </div>

                    {/* Verified Recruitment Info */}
                    {player.recruitment?.committedCollege && (
                      <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-xs">
                        <span className="text-[10px] text-emerald-400 font-mono block font-bold">COLLEGE COMMITMENT</span>
                        <span className="text-white font-semibold">{player.recruitment.committedCollege}</span>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-mono text-[10px]">The Peddie School</span>
                      <button
                        onClick={() => setActivePlayerModal(player)}
                        className="px-2.5 py-1 rounded-md bg-amber-500/15 hover:bg-amber-400 text-amber-300 hover:text-slate-950 font-bold text-[11px] transition-all flex items-center gap-1 shrink-0"
                      >
                        View Dossier
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
                    <th className="p-3">Athlete Name</th>
                    <th className="p-3">Grade</th>
                    <th className="p-3">Positions</th>
                    <th className="p-3">Class Year</th>
                    <th className="p-3">Height</th>
                    <th className="p-3">Status / Commitment</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {filteredPlayers.map((player) => (
                    <tr key={player.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3 font-bold text-amber-400">#{player.jerseyNumber}</td>
                      <td className="p-3">
                        <div className="font-bold text-white">{player.name}</div>
                        <div className="text-[10px] text-slate-400 font-sans">The Peddie School</div>
                      </td>
                      <td className="p-3 text-slate-300">{player.gradeLevel}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-bold text-[10px]">
                          {player.positions.join(', ')}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">Class of {player.classYear}</td>
                      <td className="p-3 text-slate-300">{player.height || '—'}</td>
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
                        <button
                          onClick={() => setActivePlayerModal(player)}
                          className="px-2.5 py-1 rounded bg-amber-400/20 text-amber-300 hover:bg-amber-400 hover:text-slate-950 font-bold text-[10px] transition-all"
                        >
                          Dossier
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

      {/* Interactive Scouting Dossier Modal */}
      {activePlayerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-white/15 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
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
                      {activePlayerModal.positions.join(', ')}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono">
                      {activePlayerModal.gradeLevel} (Class of {activePlayerModal.classYear})
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    The Peddie School · Head Coach: Mark Fabish
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
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Bio & Details */}
              <div className="grid grid-cols-3 gap-3 font-mono">
                <div className="p-3 rounded-xl bg-slate-950 border border-white/5 text-center">
                  <div className="text-[10px] text-slate-500">JERSEY #</div>
                  <div className="text-base font-bold text-amber-400 mt-0.5">#{activePlayerModal.jerseyNumber}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-white/5 text-center">
                  <div className="text-[10px] text-slate-500">POSITIONS</div>
                  <div className="text-sm font-bold text-white mt-0.5">{activePlayerModal.positions.join(', ')}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-white/5 text-center">
                  <div className="text-[10px] text-slate-500">HEIGHT</div>
                  <div className="text-sm font-bold text-slate-200 mt-0.5">{activePlayerModal.height || '—'}</div>
                </div>
              </div>

              {/* Roster Summary */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-2">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  Roster Verification & Notes
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activePlayerModal.scoutingSummary}
                </p>
                <ul className="space-y-1 mt-2">
                  {activePlayerModal.strengths.map((str, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* College Commitment */}
              {activePlayerModal.recruitment?.committedCollege && (
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5" />
                    Collegiate Commitment
                  </h4>
                  <p className="text-sm font-bold text-white">
                    {activePlayerModal.recruitment.committedCollege}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">
                Official 2025–26 Peddie Falcons Varsity Football
              </span>

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
