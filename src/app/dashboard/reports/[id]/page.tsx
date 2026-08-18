'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  FileText, Download, FileSpreadsheet, Film, Printer,
  ChevronRight, CheckCircle2, BarChart3, Target, Zap,
  Users, MessageSquare, ListChecks,
} from 'lucide-react';
import { useGridironStore } from '@/lib/store';
import { MOCK_BOX_SCORE, MOCK_DRIVES } from '@/lib/mock-game-data';
import { aggregateEPA } from '@/lib/epa-calculator';
import { getEpaColor, formatTime } from '@/lib/utils';

export default function ReportsPage() {
  const params = useParams();
  const gameId = params.id as string;
  const { setActiveGame, activeGame, actionItems } = useGridironStore();
  const [exporting, setExporting] = useState<string | null>(null);

  useEffect(() => {
    setActiveGame(gameId);
  }, [gameId, setActiveGame]);

  const plays = activeGame?.plays ?? [];
  const stats = aggregateEPA(plays);
  const box = MOCK_BOX_SCORE;

  const handleExport = async (type: string) => {
    setExporting(type);
    // Simulate export delay
    await new Promise(r => setTimeout(r, 1500));

    if (type === 'csv') {
      const headers = ['Play#', 'Quarter', 'Clock', 'Down', 'Distance', 'YardLine', 'Formation', 'Motion', 'PlayType', 'Yards', 'EPA', 'Description'];
      const rows = plays.map(p => [
        p.playNumber, p.quarter, p.gameClock, p.down, p.distance, p.yardLine,
        p.offensiveFormation, p.motionType, p.playType, p.yardsGained, p.epa.toFixed(2),
        `"${p.playDescription.replace(/"/g, '""')}"`,
      ]);
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeGame?.title.replace(/\s+/g, '_')}_play_ledger.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }

    if (type === 'actions-csv') {
      const headers = ['Title', 'Description', 'AssignedTo', 'Priority', 'Status', 'Play#', 'Timestamp'];
      const rows = actionItems.map(a => [
        `"${a.title}"`, `"${a.description}"`, a.assignedTo.name, a.priority, a.status,
        plays.find(p => p.id === a.playId)?.playNumber ?? '', formatTime(a.videoTimestamp),
      ]);
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeGame?.title.replace(/\s+/g, '_')}_action_items.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }

    setExporting(null);
  };

  if (!activeGame) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-56px)]" style={{ color: 'var(--text-muted)' }}>
        Loading reports...
      </div>
    );
  }

  const motionPlays = plays.filter(p => p.motionType !== 'NONE');
  const motionPct = plays.length ? Math.round(motionPlays.length / plays.length * 100) : 0;
  const motionStats = aggregateEPA(motionPlays);
  const staticStats = aggregateEPA(plays.filter(p => p.motionType === 'NONE'));

  return (
    <div className="h-[calc(100vh-56px)] overflow-y-auto p-6" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <FileText className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
              Scouting Reports & Exports
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {activeGame.title} · {activeGame.homeTeam} vs {activeGame.awayTeam}
            </p>
          </div>
        </div>

        {/* Export Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* PDF Dossier */}
          <div className="glass-card p-5 group hover:border-[var(--border-hover)] transition-all cursor-pointer"
            onClick={() => handleExport('pdf')}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                <FileText className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Coaching Dossier</h3>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>PDF Scout Card Export</p>
              </div>
            </div>
            <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
              Complete game breakdown with tendencies, heatmaps, motion analysis, and coaching notes in a printable format.
            </p>
            <button className="btn-ghost w-full text-xs justify-center group-hover:border-red-500/30 group-hover:text-red-400">
              {exporting === 'pdf' ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Printer className="w-3.5 h-3.5" />
                  Generate PDF
                  <ChevronRight className="w-3 h-3" />
                </>
              )}
            </button>
          </div>

          {/* CSV Play Ledger */}
          <div className="glass-card p-5 group hover:border-[var(--border-hover)] transition-all cursor-pointer"
            onClick={() => handleExport('csv')}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                <FileSpreadsheet className="w-5 h-5" style={{ color: 'var(--accent-emerald)' }} />
              </div>
              <div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Play Ledger CSV</h3>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Hudl-Compatible Format</p>
              </div>
            </div>
            <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
              Complete play-by-play ledger with formations, motions, yards, EPA, and descriptions. Compatible with Hudl import.
            </p>
            <button className="btn-ghost w-full text-xs justify-center group-hover:border-emerald-500/30 group-hover:text-emerald-400">
              {exporting === 'csv' ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  Download CSV
                  <ChevronRight className="w-3 h-3" />
                </>
              )}
            </button>
          </div>

          {/* Action Items Export */}
          <div className="glass-card p-5 group hover:border-[var(--border-hover)] transition-all cursor-pointer"
            onClick={() => handleExport('actions-csv')}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                <ListChecks className="w-5 h-5" style={{ color: 'var(--accent-amber)' }} />
              </div>
              <div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Action Items Export</h3>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{actionItems.length} items</p>
              </div>
            </div>
            <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
              Export all coaching action items with assignments, priorities, and play references for team distribution.
            </p>
            <button className="btn-ghost w-full text-xs justify-center group-hover:border-amber-500/30 group-hover:text-amber-400">
              {exporting === 'actions-csv' ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  Download CSV
                  <ChevronRight className="w-3 h-3" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Scouting Report Preview */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Target className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
              Scouting Report Preview
            </h2>
            <span className="badge text-[10px]" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', borderColor: 'rgba(99, 102, 241, 0.2)' }}>
              AUTO-GENERATED
            </span>
          </div>

          {/* Game Summary */}
          <div className="p-4 rounded-xl mb-6" style={{ background: 'var(--bg-tertiary)' }}>
            <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Game Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-[10px] uppercase font-medium" style={{ color: 'var(--text-muted)' }}>Total Plays</p>
                <p className="text-xl font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{plays.length}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-medium" style={{ color: 'var(--text-muted)' }}>Total Yards</p>
                <p className="text-xl font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{box.totalYards}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-medium" style={{ color: 'var(--text-muted)' }}>Avg EPA/Play</p>
                <p className={`text-xl font-bold font-mono ${getEpaColor(stats.avgEpa)}`}>{stats.avgEpa > 0 ? '+' : ''}{stats.avgEpa.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-medium" style={{ color: 'var(--text-muted)' }}>Success Rate</p>
                <p className="text-xl font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{stats.successRate}%</p>
              </div>
            </div>
          </div>

          {/* Key Findings */}
          <div className="mb-6">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Zap className="w-4 h-4" style={{ color: 'var(--accent-amber)' }} />
              Key Findings
            </h3>
            <div className="space-y-2">
              {[
                {
                  finding: `Pre-snap motion was used on ${motionPct}% of plays (${motionPlays.length}/${plays.length})`,
                  detail: `Motion plays averaged ${motionStats.avgEpa > 0 ? '+' : ''}${motionStats.avgEpa.toFixed(2)} EPA vs ${staticStats.avgEpa > 0 ? '+' : ''}${staticStats.avgEpa.toFixed(2)} EPA for static plays`,
                  positive: motionStats.avgEpa > staticStats.avgEpa,
                },
                {
                  finding: `Explosive play rate of ${stats.explosivePlayRate}% (15+ yard gains)`,
                  detail: `${plays.filter(p => p.yardsGained >= 15).length} plays of 15+ yards`,
                  positive: stats.explosivePlayRate > 15,
                },
                {
                  finding: `3rd down conversion rate: ${box.thirdDownConversions ?? 7}/${box.thirdDownAttempts ?? 11} (${Math.round((box.thirdDownConversions ?? 7) / (box.thirdDownAttempts ?? 11) * 100)}%)`,
                  detail: `Red zone scoring: ${box.redZoneScores}/${box.redZoneAttempts}`,
                  positive: ((box.thirdDownConversions ?? 7) / (box.thirdDownAttempts ?? 11)) > 0.4,
                },
                {
                  finding: `${plays.filter(p => p.isTouchdown).length} touchdowns, ${box.turnovers} turnover(s)`,
                  detail: `TD-to-TO ratio: ${(plays.filter(p => p.isTouchdown).length / Math.max(box.turnovers, 1)).toFixed(1)}:1`,
                  positive: plays.filter(p => p.isTouchdown).length > box.turnovers,
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0"
                    style={{ color: item.positive ? 'var(--accent-emerald)' : 'var(--accent-amber)' }} />
                  <div>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{item.finding}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Motion Breakdown */}
          <div className="mb-6">
            <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Pre-Snap Motion Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                    {['Motion Type', 'Count', 'Avg Yards', 'Avg EPA', 'Success %', 'TDs'].map(h => (
                      <th key={h} className="text-left py-2 px-3 font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(['NONE', 'JET_SWEEP', 'ORBIT', 'FLY', 'RETURN', 'TRADE_TE', 'SHIFT_BACKFIELD'] as const).map(type => {
                    const filtered = plays.filter(p => p.motionType === type);
                    if (filtered.length === 0) return null;
                    const s = aggregateEPA(filtered);
                    const avgY = (filtered.reduce((sum, p) => sum + p.yardsGained, 0) / filtered.length).toFixed(1);
                    return (
                      <tr key={type} className="border-b" style={{ borderColor: 'var(--border-primary)' }}>
                        <td className="py-2 px-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                          {type === 'NONE' ? 'Static' : type.replace(/_/g, ' ')}
                        </td>
                        <td className="py-2 px-3 font-mono" style={{ color: 'var(--text-secondary)' }}>{filtered.length}</td>
                        <td className="py-2 px-3 font-mono" style={{ color: 'var(--text-secondary)' }}>{avgY}</td>
                        <td className={`py-2 px-3 font-mono font-bold ${getEpaColor(s.avgEpa)}`}>{s.avgEpa > 0 ? '+' : ''}{s.avgEpa.toFixed(2)}</td>
                        <td className="py-2 px-3 font-mono" style={{ color: 'var(--text-secondary)' }}>{s.successRate}%</td>
                        <td className="py-2 px-3 font-mono" style={{ color: 'var(--text-primary)' }}>{filtered.filter(p => p.isTouchdown).length}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Coaching Notes */}
          <div>
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <MessageSquare className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
              Coaching Comments ({plays.reduce((s, p) => s + p.comments.length, 0)} total)
            </h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {plays.flatMap(p => p.comments.map(c => ({ ...c, playNumber: p.playNumber }))).slice(0, 10).map(comment => (
                <div key={comment.id} className="flex items-start gap-2 p-2.5 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                    style={{ background: 'var(--accent-primary)', color: 'white' }}>
                    {comment.author.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold" style={{ color: 'var(--text-primary)' }}>{comment.author.name}</span>
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Play #{comment.playNumber} @ {formatTime(comment.timestamp)}</span>
                    </div>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{comment.text}</p>
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
