'use client';

import { useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  BarChart3, TrendingUp, Target, Zap, Activity,
  ArrowUpRight, ArrowDownRight, Minus,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart,
} from 'recharts';
import { useGridironStore } from '@/lib/store';
import { PlayAnalysis, PreSnapMotionType, PlayType } from '@/types/football';
import { aggregateEPA } from '@/lib/epa-calculator';
import { MOCK_BOX_SCORE, MOCK_DRIVES, MOCK_HEATMAP_POINTS } from '@/lib/mock-game-data';
import { getEpaColor } from '@/lib/utils';

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'];

// ---- Metric Card ----
function MetricCard({ label, value, subtitle, trend, icon: Icon }: {
  label: string; value: string | number; subtitle?: string;
  trend?: 'up' | 'down' | 'neutral'; icon?: React.ElementType;
}) {
  return (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</span>
        {Icon && <Icon className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{value}</span>
        {trend && (
          <span className="flex items-center gap-0.5 text-xs font-medium mb-1" style={{
            color: trend === 'up' ? 'var(--accent-emerald)' : trend === 'down' ? 'var(--accent-red)' : 'var(--text-muted)',
          }}>
            {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : trend === 'down' ? <ArrowDownRight className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
          </span>
        )}
      </div>
      {subtitle && <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
    </div>
  );
}

// ---- Field Heatmap SVG ----
function FieldHeatmap({ plays }: { plays: PlayAnalysis[] }) {
  const heatPoints = MOCK_HEATMAP_POINTS;

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
        <Target className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
        Play Location Heatmap
      </h3>
      <div className="relative">
        <svg viewBox="0 0 600 300" className="w-full field-svg" style={{ maxHeight: '300px' }}>
          {/* Field background */}
          <rect x="0" y="0" width="600" height="300" fill="#1a5d1a" rx="8" />

          {/* Yard lines */}
          {Array.from({ length: 11 }, (_, i) => (
            <g key={i}>
              <line x1={60 + i * 48} y1={15} x2={60 + i * 48} y2={285} stroke="white" strokeWidth="0.5" opacity="0.3" />
              <text x={60 + i * 48} y={298} fill="white" fontSize="8" textAnchor="middle" opacity="0.4">
                {i === 0 || i === 10 ? 'G' : i < 5 ? `${i}0` : i === 5 ? '50' : `${10 - i}0`}
              </text>
            </g>
          ))}

          {/* End zones */}
          <rect x="0" y="0" width="60" height="300" fill="rgba(239,68,68,0.15)" rx="8" />
          <rect x="540" y="0" width="60" height="300" fill="rgba(59,130,246,0.15)" />
          <text x="30" y="155" fill="white" fontSize="10" textAnchor="middle" opacity="0.3" transform="rotate(-90, 30, 155)">END ZONE</text>
          <text x="570" y="155" fill="white" fontSize="10" textAnchor="middle" opacity="0.3" transform="rotate(90, 570, 155)">END ZONE</text>

          {/* Hash marks */}
          {Array.from({ length: 50 }, (_, i) => (
            <g key={`h${i}`}>
              <line x1={60 + i * 9.6} y1={100} x2={60 + i * 9.6 + 4} y2={100} stroke="white" strokeWidth="0.3" opacity="0.2" />
              <line x1={60 + i * 9.6} y1={200} x2={60 + i * 9.6 + 4} y2={200} stroke="white" strokeWidth="0.3" opacity="0.2" />
            </g>
          ))}

          {/* Heatmap points */}
          {heatPoints.map((pt, i) => (
            <g key={i}>
              <circle
                cx={60 + (pt.y / 100) * 480}
                cy={15 + (pt.x / 100) * 270}
                r={12 + pt.intensity * 8}
                fill={pt.yardsGained > 10 ? '#10b981' : pt.yardsGained > 0 ? '#f59e0b' : '#ef4444'}
                opacity={0.2 + pt.intensity * 0.3}
              />
              <circle
                cx={60 + (pt.y / 100) * 480}
                cy={15 + (pt.x / 100) * 270}
                r={4}
                fill={pt.yardsGained > 10 ? '#10b981' : pt.yardsGained > 0 ? '#f59e0b' : '#ef4444'}
                opacity={0.8}
              />
            </g>
          ))}

          {/* Motion vectors */}
          {plays.filter(p => p.motionType !== 'NONE').slice(0, 6).map((play, i) => {
            const startX = 60 + (play.yardLine / 100) * 480;
            const startY = play.hash === 'LEFT' ? 80 : play.hash === 'RIGHT' ? 220 : 150;
            const endX = startX + (play.motionDirection === 'RIGHT' ? 40 : -40);
            return (
              <g key={`mv${i}`}>
                <line x1={startX} y1={startY} x2={endX} y2={startY}
                  stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 3"
                  className="motion-path" opacity="0.6" />
                <circle cx={startX} cy={startY} r="3" fill="#f59e0b" opacity="0.8" />
                <polygon
                  points={play.motionDirection === 'RIGHT'
                    ? `${endX},${startY - 4} ${endX + 8},${startY} ${endX},${startY + 4}`
                    : `${endX},${startY - 4} ${endX - 8},${startY} ${endX},${startY + 4}`}
                  fill="#f59e0b" opacity="0.8"
                />
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-3">
          {[
            { color: '#10b981', label: 'Explosive (10+ yds)' },
            { color: '#f59e0b', label: 'Positive (1-9 yds)' },
            { color: '#ef4444', label: 'Negative' },
            { color: '#f59e0b', label: 'Motion path', dashed: true },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5">
              {item.dashed ? (
                <div className="w-4 border-t-2 border-dashed" style={{ borderColor: item.color }} />
              ) : (
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
              )}
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- Custom Tooltip ----
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload) return null;
  return (
    <div className="glass-card-sm p-3 text-xs" style={{ minWidth: '120px' }}>
      <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="flex justify-between gap-4" style={{ color: entry.color }}>
          <span>{entry.name}:</span>
          <span className="font-mono font-bold">{typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}</span>
        </p>
      ))}
    </div>
  );
}

// ---- Main Analytics Page ----
export default function AnalyticsPage() {
  const params = useParams();
  const gameId = params.id as string;
  const { setActiveGame, activeGame } = useGridironStore();

  useEffect(() => {
    setActiveGame(gameId);
  }, [gameId, setActiveGame]);

  const plays = activeGame?.plays ?? [];

  // Motion tendency data
  const motionData = useMemo(() => {
    const motionTypes: PreSnapMotionType[] = ['NONE', 'JET_SWEEP', 'ORBIT', 'FLY', 'RETURN', 'TRADE_TE', 'SHIFT_BACKFIELD'];
    return motionTypes.map(type => {
      const filtered = plays.filter(p => p.motionType === type);
      if (filtered.length === 0) return null;
      const stats = aggregateEPA(filtered);
      return {
        name: type === 'NONE' ? 'Static' : type.replace(/_/g, ' '),
        plays: filtered.length,
        avgYards: Number((filtered.reduce((s, p) => s + p.yardsGained, 0) / filtered.length).toFixed(1)),
        avgEpa: stats.avgEpa,
        successRate: stats.successRate,
        tds: filtered.filter(p => p.isTouchdown).length,
      };
    }).filter(Boolean);
  }, [plays]);

  // Play type data
  const playTypeData = useMemo(() => {
    const types: PlayType[] = ['PASS', 'RUN', 'RPO', 'PLAY_ACTION_BOOT', 'SCREEN', 'DRAW'];
    return types.map(type => {
      const filtered = plays.filter(p => p.playType === type);
      if (filtered.length === 0) return null;
      return {
        name: type.replace(/_/g, ' '),
        plays: filtered.length,
        avgYards: Number((filtered.reduce((s, p) => s + p.yardsGained, 0) / filtered.length).toFixed(1)),
        avgEpa: Number((filtered.reduce((s, p) => s + p.epa, 0) / filtered.length).toFixed(2)),
      };
    }).filter(Boolean);
  }, [plays]);

  // Down efficiency data
  const downData = useMemo(() => {
    return [1, 2, 3, 4].map(down => {
      const filtered = plays.filter(p => p.down === down);
      if (filtered.length === 0) return { down: `${down}${['st', 'nd', 'rd', 'th'][down - 1]}`, plays: 0, successRate: 0, avgEpa: 0 };
      const successful = filtered.filter(p => p.isFirstDown || p.isTouchdown).length;
      return {
        down: `${down}${['st', 'nd', 'rd', 'th'][down - 1]}`,
        plays: filtered.length,
        successRate: Number((successful / filtered.length * 100).toFixed(0)),
        avgEpa: Number((filtered.reduce((s, p) => s + p.epa, 0) / filtered.length).toFixed(2)),
      };
    });
  }, [plays]);

  // Motion vs Static comparison
  const motionComparison = useMemo(() => {
    const withMotion = plays.filter(p => p.motionType !== 'NONE');
    const withoutMotion = plays.filter(p => p.motionType === 'NONE');
    const motionStats = aggregateEPA(withMotion);
    const staticStats = aggregateEPA(withoutMotion);
    return [
      { name: 'With Motion', avgYards: withMotion.length ? Number((withMotion.reduce((s, p) => s + p.yardsGained, 0) / withMotion.length).toFixed(1)) : 0, avgEpa: motionStats.avgEpa, successRate: motionStats.successRate, plays: withMotion.length },
      { name: 'Static', avgYards: withoutMotion.length ? Number((withoutMotion.reduce((s, p) => s + p.yardsGained, 0) / withoutMotion.length).toFixed(1)) : 0, avgEpa: staticStats.avgEpa, successRate: staticStats.successRate, plays: withoutMotion.length },
    ];
  }, [plays]);

  // Play-action comparison
  const paComparison = useMemo(() => {
    const paPlays = plays.filter(p => p.playActionFake);
    const dropback = plays.filter(p => p.playType === 'PASS' && !p.playActionFake);
    return [
      { name: 'Play Action', avgYards: paPlays.length ? Number((paPlays.reduce((s, p) => s + p.yardsGained, 0) / paPlays.length).toFixed(1)) : 0, avgEpa: paPlays.length ? Number((paPlays.reduce((s, p) => s + p.epa, 0) / paPlays.length).toFixed(2)) : 0, plays: paPlays.length },
      { name: 'Standard Drop', avgYards: dropback.length ? Number((dropback.reduce((s, p) => s + p.yardsGained, 0) / dropback.length).toFixed(1)) : 0, avgEpa: dropback.length ? Number((dropback.reduce((s, p) => s + p.epa, 0) / dropback.length).toFixed(2)) : 0, plays: dropback.length },
    ];
  }, [plays]);

  // Coverage breakdown
  const coverageData = useMemo(() => {
    const coverageMap = new Map<string, PlayAnalysis[]>();
    plays.forEach(p => {
      const c = p.coverageScheme.replace(/_/g, ' ');
      if (!coverageMap.has(c)) coverageMap.set(c, []);
      coverageMap.get(c)!.push(p);
    });
    return Array.from(coverageMap.entries()).map(([name, plys]) => ({
      name,
      plays: plys.length,
      avgYards: Number((plys.reduce((s, p) => s + p.yardsGained, 0) / plys.length).toFixed(1)),
      avgEpa: Number((plys.reduce((s, p) => s + p.epa, 0) / plys.length).toFixed(2)),
    })).sort((a, b) => b.plays - a.plays);
  }, [plays]);

  // EPA by quarter
  const quarterData = useMemo(() => {
    return [1, 2, 3, 4].map(q => {
      const filtered = plays.filter(p => p.quarter === q);
      return {
        quarter: `Q${q}`,
        totalEpa: Number(filtered.reduce((s, p) => s + p.epa, 0).toFixed(2)),
        plays: filtered.length,
        avgEpa: filtered.length ? Number((filtered.reduce((s, p) => s + p.epa, 0) / filtered.length).toFixed(2)) : 0,
      };
    });
  }, [plays]);

  const totalStats = aggregateEPA(plays);
  const box = MOCK_BOX_SCORE;

  if (!activeGame) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-56px)]" style={{ color: 'var(--text-muted)' }}>
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-56px)] overflow-y-auto p-6" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <BarChart3 className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
              Game Analytics
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {activeGame.title} · {activeGame.homeTeam} vs {activeGame.awayTeam}
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <MetricCard label="Total Plays" value={plays.length} icon={Target} />
          <MetricCard label="Avg EPA/Play" value={totalStats.avgEpa.toFixed(2)} trend={totalStats.avgEpa > 0 ? 'up' : 'down'} icon={TrendingUp} />
          <MetricCard label="Success Rate" value={`${totalStats.successRate}%`} trend={totalStats.successRate > 50 ? 'up' : 'down'} icon={Activity} />
          <MetricCard label="Total Yards" value={box.totalYards} subtitle={`${box.passingYards} pass · ${box.rushingYards} rush`} icon={Zap} />
          <MetricCard label="Explosive Rate" value={`${totalStats.explosivePlayRate}%`} subtitle="15+ yard plays" trend="up" />
          <MetricCard label="Turnovers" value={box.turnovers} trend={box.turnovers <= 1 ? 'up' : 'down'} />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Motion Tendency Chart */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Zap className="w-4 h-4" style={{ color: 'var(--accent-amber)' }} />
              Pre-Snap Motion Tendency
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={motionData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#6b6b82', fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                <YAxis tick={{ fill: '#6b6b82', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="avgYards" name="Avg Yards" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avgEpa" name="Avg EPA" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Motion vs Static Comparison */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Activity className="w-4 h-4" style={{ color: 'var(--accent-emerald)' }} />
              Motion vs. Static Efficiency
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {motionComparison.map((d, i) => (
                <div key={i} className="p-4 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
                  <p className="text-xs font-medium mb-2" style={{ color: i === 0 ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                    {d.name} ({d.plays} plays)
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span style={{ color: 'var(--text-muted)' }}>Avg Yards</span>
                      <span className="font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{d.avgYards}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span style={{ color: 'var(--text-muted)' }}>Avg EPA</span>
                      <span className={`font-bold font-mono ${getEpaColor(d.avgEpa)}`}>{d.avgEpa.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span style={{ color: 'var(--text-muted)' }}>Success Rate</span>
                      <span className="font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{d.successRate}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={motionComparison} layout="vertical" barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" tick={{ fill: '#6b6b82', fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#6b6b82', fontSize: 11 }} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="avgEpa" name="Avg EPA" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Play Type Distribution */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Play Type Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={playTypeData} dataKey="plays" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50}
                  paddingAngle={3} stroke="none">
                  {playTypeData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Down Efficiency */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Down Efficiency</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={downData} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="down" tick={{ fill: '#6b6b82', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6b6b82', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="successRate" name="Success %" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* EPA by Quarter */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>EPA by Quarter</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={quarterData}>
                <defs>
                  <linearGradient id="epaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="quarter" tick={{ fill: '#6b6b82', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6b6b82', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="totalEpa" name="Total EPA" stroke="#6366f1" fill="url(#epaGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Field Heatmap */}
        <FieldHeatmap plays={plays} />

        {/* Coverage Breakdown + Play-Action + Box Score */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Coverage Breakdown */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Defensive Coverage Breakdown</h3>
            <div className="space-y-2">
              {coverageData.map((c, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{c.name}</span>
                    <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>({c.plays})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>{c.avgYards}y</span>
                    <span className={`text-xs font-bold font-mono ${getEpaColor(c.avgEpa)}`}>{c.avgEpa > 0 ? '+' : ''}{c.avgEpa}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Play-Action Comparison */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Play-Action Effectiveness</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={paComparison} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#6b6b82', fontSize: 10 }} />
                <YAxis tick={{ fill: '#6b6b82', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="avgYards" name="Avg Yards" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Box Score Summary */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Box Score</h3>
            <div className="space-y-2">
              {[
                { label: 'Total Yards', value: box.totalYards },
                { label: 'Passing Yards', value: box.passingYards },
                { label: 'Rushing Yards', value: box.rushingYards },
                { label: 'First Downs', value: box.firstDowns },
                { label: '3rd Down', value: `${box.thirdDownConversions}/${box.thirdDownAttempts}` },
                { label: 'Red Zone', value: `${box.redZoneScores}/${box.redZoneAttempts}` },
                { label: 'Turnovers', value: box.turnovers },
                { label: 'Penalties', value: `${box.penalties} (${box.penaltyYards} yds)` },
                { label: 'TOP', value: box.timeOfPossession },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                  <span className="text-xs font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Drive Summaries */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Drive Summaries</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                  {['#', 'Qtr', 'Start', 'Plays', 'Yards', 'Result', 'TOP'].map(h => (
                    <th key={h} className="text-left py-2 px-3 font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_DRIVES.map((drive, i) => (
                  <tr key={drive.id} className="border-b transition-colors hover:bg-white/[0.02]" style={{ borderColor: 'var(--border-primary)' }}>
                    <td className="py-2.5 px-3 font-mono" style={{ color: 'var(--text-primary)' }}>{i + 1}</td>
                    <td className="py-2.5 px-3" style={{ color: 'var(--text-secondary)' }}>Q{drive.startQuarter}</td>
                    <td className="py-2.5 px-3 font-mono" style={{ color: 'var(--text-secondary)' }}>Own {drive.startYardLine}</td>
                    <td className="py-2.5 px-3 font-mono" style={{ color: 'var(--text-secondary)' }}>{drive.plays}</td>
                    <td className="py-2.5 px-3 font-mono" style={{ color: 'var(--text-primary)' }}>{drive.yards}</td>
                    <td className="py-2.5 px-3">
                      <span className="badge text-[9px]" style={{
                        background: drive.result === 'TOUCHDOWN' ? 'rgba(16,185,129,0.15)' : drive.result === 'FIELD_GOAL' ? 'rgba(245,158,11,0.15)' : drive.result === 'TURNOVER' ? 'rgba(239,68,68,0.15)' : 'rgba(107,107,130,0.15)',
                        color: drive.result === 'TOUCHDOWN' ? '#10b981' : drive.result === 'FIELD_GOAL' ? '#f59e0b' : drive.result === 'TURNOVER' ? '#ef4444' : '#6b6b82',
                        borderColor: 'transparent',
                      }}>
                        {drive.result}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono" style={{ color: 'var(--text-muted)' }}>{drive.timeOfPossession}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
