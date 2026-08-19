'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  ListChecks, Clock, Eye, CheckCircle2, AlertTriangle,
  User, Play, ChevronRight, Filter, RotateCcw,
} from 'lucide-react';
import { usePeddieSACStore } from '@/lib/store';
import { CoachingActionItem, ActionItemStatus, ActionPriority } from '@/types/football';
import { getPriorityColor, getStatusColor, formatTime } from '@/lib/utils';

function ActionCard({ item, onStatusChange }: {
  item: CoachingActionItem;
  onStatusChange: (id: string, status: ActionItemStatus) => void;
}) {
  const { activeGame, setActiveGame } = usePeddieSACStore();
  const play = activeGame?.plays.find(p => p.id === item.playId);

  return (
    <div className="glass-card-sm p-4 mb-3 animate-fade-in-up hover:border-[var(--border-hover)] transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-semibold flex-1 mr-2" style={{ color: 'var(--text-primary)' }}>
          {item.title}
        </h4>
        <span className={`badge text-[10px] shrink-0 ${getPriorityColor(item.priority)}`}>
          {item.priority === 'CRITICAL' && <AlertTriangle className="w-3 h-3" />}
          {item.priority}
        </span>
      </div>

      {/* Description */}
      {item.description && (
        <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-muted)' }}>
          {item.description}
        </p>
      )}

      {/* Play reference */}
      {play && (
        <div className="flex items-center gap-2 mb-3 px-2.5 py-1.5 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
          <Play className="w-3 h-3" style={{ color: 'var(--accent-primary)' }} />
          <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
            Play #{play.playNumber} · Q{play.quarter} · {play.playType.replace(/_/g, ' ')}
          </span>
          <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
            @ {formatTime(item.videoTimestamp)}
          </span>
        </div>
      )}

      {/* Assignee + Status Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', color: 'white' }}>
            {item.assignedTo.jerseyNumber ?? item.assignedTo.name.charAt(0)}
          </div>
          <div>
            <p className="text-[11px] font-medium" style={{ color: 'var(--text-primary)' }}>{item.assignedTo.name}</p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {item.assignedTo.position}
              {item.assignedTo.jerseyNumber ? ` #${item.assignedTo.jerseyNumber}` : ''}
            </p>
          </div>
        </div>

        {/* Status dropdown */}
        <select
          value={item.status}
          onChange={(e) => onStatusChange(item.id, e.target.value as ActionItemStatus)}
          className="text-[11px] px-2 py-1 rounded border-none outline-none cursor-pointer"
          style={{
            background: item.status === 'TODO' ? 'rgba(107,107,130,0.15)' : item.status === 'IN_REVIEW' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
            color: item.status === 'TODO' ? 'var(--text-muted)' : item.status === 'IN_REVIEW' ? '#f59e0b' : '#10b981',
          }}
        >
          <option value="TODO">TODO</option>
          <option value="IN_REVIEW">IN REVIEW</option>
          <option value="RESOLVED">RESOLVED</option>
        </select>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 mt-2 pt-2 border-t" style={{ borderColor: 'var(--border-primary)' }}>
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          by {item.assignedBy.name}
        </span>
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          · {item.createdAt ? item.createdAt.slice(0, 10) : ''}
        </span>
      </div>
    </div>
  );
}

function KanbanColumn({ title, icon: Icon, items, status, color, onStatusChange }: {
  title: string;
  icon: React.ElementType;
  items: CoachingActionItem[];
  status: ActionItemStatus;
  color: string;
  onStatusChange: (id: string, status: ActionItemStatus) => void;
}) {
  return (
    <div className="kanban-column flex flex-col">
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
        </div>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full font-mono"
          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
          {items.length}
        </span>
      </div>
      <div className="flex-1 p-3 overflow-y-auto">
        {items.length === 0 ? (
          <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
            <Icon className="w-6 h-6 mx-auto mb-2 opacity-30" />
            <p className="text-xs">No items</p>
          </div>
        ) : (
          items.map(item => (
            <ActionCard key={item.id} item={item} onStatusChange={onStatusChange} />
          ))
        )}
      </div>
    </div>
  );
}

export default function ActionsPage() {
  const params = useParams();
  const gameId = params.id as string;
  const { setActiveGame, activeGame, actionItems, updateActionItemStatus } = usePeddieSACStore();
  const [priorityFilter, setPriorityFilter] = useState<ActionPriority | 'ALL'>('ALL');

  useEffect(() => {
    setActiveGame(gameId);
  }, [gameId, setActiveGame]);

  const filteredItems = priorityFilter === 'ALL'
    ? actionItems
    : actionItems.filter(a => a.priority === priorityFilter);

  const todoItems = filteredItems.filter(a => a.status === 'TODO');
  const reviewItems = filteredItems.filter(a => a.status === 'IN_REVIEW');
  const resolvedItems = filteredItems.filter(a => a.status === 'RESOLVED');

  if (!activeGame) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-56px)]" style={{ color: 'var(--text-muted)' }}>
        Loading action items...
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-56px)] overflow-hidden flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <ListChecks className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
            Coaching Action Items
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {activeGame.title} · {actionItems.length} total items
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(p => (
            <button key={p}
              onClick={() => setPriorityFilter(p)}
              className={`badge text-[10px] cursor-pointer transition-opacity ${p === 'ALL' ? '' : getPriorityColor(p)}`}
              style={{
                opacity: priorityFilter === p ? 1 : 0.4,
                ...(p === 'ALL' ? { background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', borderColor: 'var(--border-primary)' } : {}),
              }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 grid grid-cols-3 gap-4 p-6 overflow-hidden">
        <KanbanColumn
          title="To Do"
          icon={Clock}
          items={todoItems}
          status="TODO"
          color="var(--text-muted)"
          onStatusChange={updateActionItemStatus}
        />
        <KanbanColumn
          title="In Review"
          icon={Eye}
          items={reviewItems}
          status="IN_REVIEW"
          color="var(--accent-amber)"
          onStatusChange={updateActionItemStatus}
        />
        <KanbanColumn
          title="Resolved"
          icon={CheckCircle2}
          items={resolvedItems}
          status="RESOLVED"
          color="var(--accent-emerald)"
          onStatusChange={updateActionItemStatus}
        />
      </div>
    </div>
  );
}
