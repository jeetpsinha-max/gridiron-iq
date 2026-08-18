'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Maximize, Settings, Pen, ArrowUpRight, Circle, Highlighter,
  Eraser, Undo2, MessageSquare, ListChecks, ChevronRight,
  ChevronDown, Clock, Hash, Crosshair, Zap, Filter,
  Search, RotateCcw, Send, AtSign, Plus, X,
  Gauge, Target, TrendingUp, Film,
} from 'lucide-react';
import { useGridironStore } from '@/lib/store';
import { PlayAnalysis, UserMention, ActionPriority } from '@/types/football';
import {
  formatTime, getMotionBadgeColor, getPlayTypeBadgeColor,
  getEpaColor, getPriorityColor, getStatusColor, generateId,
} from '@/lib/utils';
import { TEAM_ROSTER } from '@/lib/mock-game-data';

// ---- Video Player Component ----
function VideoPlayer() {
  const {
    currentTime, isPlaying, playbackRate, duration,
    setCurrentTime, setIsPlaying, setPlaybackRate, setDuration,
    activePlay, activeGame,
    telestration, setTelestrationTool, setTelestrationColor,
  } = useGridironStore();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<{ points: { x: number; y: number }[]; color: string; width: number }[]>([]);
  const [currentStroke, setCurrentStroke] = useState<{ x: number; y: number }[]>([]);

  const speedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // Simulate playback for demo
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTime(Math.min(currentTime + 0.1 * playbackRate, activeGame?.duration ?? 180));
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying, currentTime, playbackRate, setCurrentTime, activeGame?.duration]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
      switch (e.key) {
        case ' ':
        case 'k': e.preventDefault(); setIsPlaying(!isPlaying); break;
        case 'j': e.preventDefault(); setCurrentTime(Math.max(0, currentTime - 10)); break;
        case 'l': e.preventDefault(); setCurrentTime(Math.min(currentTime + 10, activeGame?.duration ?? 180)); break;
        case 'ArrowLeft': e.preventDefault(); setCurrentTime(Math.max(0, currentTime - 1)); break;
        case 'ArrowRight': e.preventDefault(); setCurrentTime(Math.min(currentTime + 1, activeGame?.duration ?? 180)); break;
        case ',': e.preventDefault(); setCurrentTime(Math.max(0, currentTime - 1/30)); break;
        case '.': e.preventDefault(); setCurrentTime(Math.min(currentTime + 1/30, activeGame?.duration ?? 180)); break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isPlaying, currentTime, setIsPlaying, setCurrentTime, activeGame?.duration]);

  // Draw on canvas
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!telestration.activeTool) return;
    setIsDrawing(true);
    const rect = canvasRef.current!.getBoundingClientRect();
    const point = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setCurrentStroke([point]);
  }, [telestration.activeTool]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const point = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setCurrentStroke(prev => [...prev, point]);

    // Draw in real-time
    const ctx = canvasRef.current.getContext('2d')!;
    if (currentStroke.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = telestration.activeColor;
      ctx.lineWidth = telestration.lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const prev = currentStroke[currentStroke.length - 1];
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }
  }, [isDrawing, currentStroke, telestration]);

  const handleCanvasMouseUp = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentStroke.length > 1) {
      setStrokes(prev => [...prev, { points: currentStroke, color: telestration.activeColor, width: telestration.lineWidth }]);
    }
    setCurrentStroke([]);
  }, [isDrawing, currentStroke, telestration]);

  const clearCanvas = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')!;
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    setStrokes([]);
  };

  const undoStroke = () => {
    setStrokes(prev => prev.slice(0, -1));
    // Redraw remaining strokes
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')!;
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      strokes.slice(0, -1).forEach(stroke => {
        ctx.beginPath();
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        stroke.points.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
      });
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    setCurrentTime(pct * (activeGame?.duration ?? 180));
  };

  const gameDuration = activeGame?.duration ?? 180;
  const progressPct = (currentTime / gameDuration) * 100;

  // Comment markers on timeline
  const commentMarkers = activeGame?.plays.flatMap(p => p.comments.map(c => ({
    pct: (c.timestamp / gameDuration) * 100,
    text: c.text.slice(0, 40),
    author: c.author.name,
  }))) ?? [];

  const telestrationTools = [
    { tool: 'PEN' as const, icon: Pen, label: 'Freehand' },
    { tool: 'ARROW' as const, icon: ArrowUpRight, label: 'Arrow' },
    { tool: 'SPOTLIGHT' as const, icon: Circle, label: 'Spotlight' },
    { tool: 'ROUTE_LINE' as const, icon: Crosshair, label: 'Route' },
    { tool: 'ERASER' as const, icon: Eraser, label: 'Eraser' },
  ];

  const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#ffffff'];

  return (
    <div className="relative" style={{ background: '#000' }}>
      {/* Video / Placeholder */}
      <div className="relative aspect-video bg-black overflow-hidden rounded-t-lg">
        {/* Football field placeholder visual */}
        <div className="absolute inset-0 flex items-center justify-center"
          style={{ background: 'linear-gradient(180deg, #0d2818 0%, #0f3420 50%, #0d2818 100%)' }}>
          {/* Field lines */}
          <svg viewBox="0 0 1000 530" className="absolute inset-0 w-full h-full opacity-20">
            {/* Yard lines */}
            {Array.from({ length: 11 }, (_, i) => (
              <line key={i} x1={100 + i * 80} y1={20} x2={100 + i * 80} y2={510} stroke="white" strokeWidth="1" />
            ))}
            {/* Hash marks */}
            {Array.from({ length: 11 }, (_, i) => (
              <text key={`t${i}`} x={100 + i * 80} y={535} fill="white" fontSize="16" textAnchor="middle" opacity="0.5">
                {i === 0 || i === 10 ? '' : i < 5 ? `${i}0` : i === 5 ? '50' : `${10 - i}0`}
              </text>
            ))}
            {/* Sidelines */}
            <rect x={90} y={15} width={820} height={500} fill="none" stroke="white" strokeWidth="2" />
          </svg>

          {/* Play info overlay */}
          {activePlay && (
            <div className="absolute top-4 left-4 glass-card-sm p-3 animate-fade-in-up" style={{ fontSize: '12px' }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Play #{activePlay.playNumber}</span>
                <span className={`badge ${getPlayTypeBadgeColor(activePlay.playType)}`}>{activePlay.playType.replace('_', ' ')}</span>
              </div>
              <p style={{ color: 'var(--text-muted)' }}>Q{activePlay.quarter} · {activePlay.gameClock} · {activePlay.down}&{activePlay.distance}</p>
            </div>
          )}

          {/* Current play description */}
          {activePlay && (
            <div className="absolute bottom-16 left-4 right-4 glass-card-sm p-3 animate-fade-in-up">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {activePlay.playDescription}
              </p>
            </div>
          )}
        </div>

        {/* Telestration Canvas Overlay */}
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          className="absolute inset-0 w-full h-full"
          style={{ cursor: telestration.activeTool ? 'crosshair' : 'default', zIndex: telestration.activeTool ? 20 : -1 }}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
        />
      </div>

      {/* Telestration Toolbar */}
      <div className="absolute top-3 right-3 flex flex-col gap-1 z-30">
        {telestrationTools.map(({ tool, icon: Icon, label }) => (
          <button
            key={tool}
            onClick={() => setTelestrationTool(telestration.activeTool === tool ? null : tool)}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
            title={label}
            style={{
              background: telestration.activeTool === tool ? 'var(--accent-primary)' : 'rgba(0,0,0,0.6)',
              color: telestration.activeTool === tool ? 'white' : 'var(--text-secondary)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
        <div className="h-px my-1" style={{ background: 'var(--border-primary)' }} />
        <button onClick={undoStroke} className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
          style={{ background: 'rgba(0,0,0,0.6)', color: 'var(--text-secondary)' }} title="Undo">
          <Undo2 className="w-4 h-4" />
        </button>
        <button onClick={clearCanvas} className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
          style={{ background: 'rgba(0,0,0,0.6)', color: 'var(--text-secondary)' }} title="Clear All">
          <X className="w-4 h-4" />
        </button>
        {/* Color picker */}
        <div className="flex flex-col gap-1 mt-1">
          {colors.map(c => (
            <button key={c}
              onClick={() => setTelestrationColor(c)}
              className="w-5 h-5 rounded-full mx-auto transition-transform"
              style={{
                background: c,
                border: telestration.activeColor === c ? '2px solid white' : '1px solid rgba(255,255,255,0.2)',
                transform: telestration.activeColor === c ? 'scale(1.3)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Timeline & Controls */}
      <div className="px-4 py-3" style={{ background: 'var(--bg-secondary)' }}>
        {/* Progress bar with markers */}
        <div ref={progressRef} className="relative h-2 rounded-full cursor-pointer mb-3 group"
          style={{ background: 'var(--bg-tertiary)' }}
          onClick={handleProgressClick}>
          {/* Progress fill */}
          <div className="absolute inset-y-0 left-0 rounded-full transition-all"
            style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))' }} />

          {/* Comment markers */}
          {commentMarkers.map((m, i) => (
            <div key={i} className="timeline-marker" style={{ left: `${m.pct}%`, top: '50%' }}
              title={`${m.author}: ${m.text}`} />
          ))}

          {/* Play segment markers */}
          {activeGame?.plays.map((p, i) => (
            <div key={i} className="absolute top-full mt-1 w-0.5 h-1.5 rounded"
              style={{
                left: `${(p.videoTimestampStart / gameDuration) * 100}%`,
                background: p.motionType !== 'NONE' ? 'var(--accent-amber)' : 'var(--text-muted)',
                opacity: 0.6,
              }} />
          ))}

          {/* Scrubber */}
          <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-lg transition-opacity opacity-0 group-hover:opacity-100"
            style={{
              left: `${progressPct}%`,
              transform: 'translate(-50%, -50%)',
              background: 'white',
              boxShadow: '0 0 8px rgba(99, 102, 241, 0.5)',
            }} />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
              className="p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: 'var(--text-secondary)' }}>
              <SkipBack className="w-4 h-4" />
            </button>
            <button onClick={() => setIsPlaying(!isPlaying)}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
              style={{ background: 'var(--accent-primary)', color: 'white' }}>
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <button onClick={() => setCurrentTime(Math.min(currentTime + 10, gameDuration))}
              className="p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: 'var(--text-secondary)' }}>
              <SkipForward className="w-4 h-4" />
            </button>

            <span className="text-xs font-mono ml-2" style={{ color: 'var(--text-secondary)' }}>
              {formatTime(currentTime)} / {formatTime(gameDuration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Speed control */}
            <div className="relative">
              <button onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors hover:bg-white/5"
                style={{ color: 'var(--text-secondary)' }}>
                <Gauge className="w-3.5 h-3.5" />
                {playbackRate}x
              </button>
              {showSpeedMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowSpeedMenu(false)} />
                  <div className="absolute bottom-full right-0 mb-2 z-50 glass-card-sm p-1 min-w-[80px]">
                    {speedOptions.map(speed => (
                      <button key={speed}
                        onClick={() => { setPlaybackRate(speed); setShowSpeedMenu(false); }}
                        className="w-full text-left px-3 py-1.5 rounded text-xs transition-colors hover:bg-white/5"
                        style={{ color: playbackRate === speed ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: playbackRate === speed ? 600 : 400 }}>
                        {speed}x
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded transition-colors hover:bg-white/5" style={{ color: 'var(--text-secondary)' }}>
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Play By Play Table ----
function PlayByPlayTable() {
  const { filteredPlays, activePlayId, seekToPlay, activeGame } = useGridironStore();
  const plays = filteredPlays.length > 0 ? filteredPlays : (activeGame?.plays ?? []);

  return (
    <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
      {plays.map((play) => (
        <div
          key={play.id}
          onClick={() => seekToPlay(play)}
          className={`play-row px-3 py-2.5 border-b ${activePlayId === play.id ? 'active' : ''}`}
          style={{ borderColor: 'var(--border-primary)' }}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono px-1.5 py-0.5 rounded"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>
                #{play.playNumber}
              </span>
              <span className={`badge text-[10px] ${getPlayTypeBadgeColor(play.playType)}`}>
                {play.playType.replace(/_/g, ' ')}
              </span>
              {play.motionType !== 'NONE' && (
                <span className={`badge text-[10px] ${getMotionBadgeColor(play.motionType)}`}>
                  ⚡ {play.motionType.replace(/_/g, ' ')}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold font-mono ${getEpaColor(play.epa)}`}>
                {play.epa > 0 ? '+' : ''}{play.epa.toFixed(1)} EPA
              </span>
              <span className="text-xs font-mono" style={{ color: play.yardsGained >= 0 ? 'var(--accent-emerald)' : 'var(--accent-red)' }}>
                {play.yardsGained > 0 ? '+' : ''}{play.yardsGained}y
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>
            <span>Q{play.quarter} · {play.gameClock}</span>
            <span>{play.down}&{play.distance}</span>
            <span>{play.offensiveFormation}</span>
            <span>vs {play.coverageScheme.replace(/_/g, ' ')}</span>
          </div>

          <p className="text-xs mt-1 line-clamp-1" style={{ color: 'var(--text-secondary)' }}>
            {play.playDescription}
          </p>

          {/* Comment/action badges */}
          <div className="flex items-center gap-2 mt-1.5">
            {play.comments.length > 0 && (
              <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--accent-primary)' }}>
                <MessageSquare className="w-3 h-3" /> {play.comments.length}
              </span>
            )}
            {play.actionItems.length > 0 && (
              <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--accent-amber)' }}>
                <ListChecks className="w-3 h-3" /> {play.actionItems.length}
              </span>
            )}
            {play.isTouchdown && <span className="text-[10px]">🏈 TD</span>}
            {play.isTurnover && <span className="text-[10px]">❌ TO</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---- Play Filter Bar ----
function PlayFilterBar() {
  const { filters, setFilters, resetFilters } = useGridironStore();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-secondary)' }}>
      <div className="flex items-center gap-2 mb-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          <input
            placeholder="Search plays..."
            value={filters.searchQuery}
            onChange={(e) => setFilters({ searchQuery: e.target.value })}
            className="input-field text-xs py-1.5 pl-8 pr-3"
            style={{ fontSize: '12px' }}
          />
        </div>
        <button onClick={() => setExpanded(!expanded)}
          className="p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: 'var(--text-muted)' }}>
          <Filter className="w-4 h-4" />
        </button>
        {(filters.playTypes.length > 0 || filters.motionTypes.length > 0 || filters.hasMotion !== null) && (
          <button onClick={resetFilters}
            className="p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: 'var(--accent-red)' }}>
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {expanded && (
        <div className="space-y-2 pb-2 animate-fade-in-up">
          {/* Motion filter */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[10px] font-medium uppercase mr-1" style={{ color: 'var(--text-muted)' }}>Motion:</span>
            {(['NONE', 'JET_SWEEP', 'ORBIT', 'FLY', 'RETURN'] as const).map(m => (
              <button key={m}
                onClick={() => {
                  const current = filters.motionTypes;
                  setFilters({ motionTypes: current.includes(m) ? current.filter(t => t !== m) : [...current, m] });
                }}
                className={`badge text-[9px] cursor-pointer transition-opacity ${getMotionBadgeColor(m)} ${filters.motionTypes.includes(m) ? 'opacity-100' : 'opacity-40'}`}>
                {m.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          {/* Play type filter */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[10px] font-medium uppercase mr-1" style={{ color: 'var(--text-muted)' }}>Type:</span>
            {(['PASS', 'RUN', 'RPO', 'PLAY_ACTION_BOOT', 'SCREEN'] as const).map(t => (
              <button key={t}
                onClick={() => {
                  const current = filters.playTypes;
                  setFilters({ playTypes: current.includes(t) ? current.filter(x => x !== t) : [...current, t] });
                }}
                className={`badge text-[9px] cursor-pointer transition-opacity ${getPlayTypeBadgeColor(t)} ${filters.playTypes.includes(t) ? 'opacity-100' : 'opacity-40'}`}>
                {t.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          {/* Has motion toggle */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium uppercase" style={{ color: 'var(--text-muted)' }}>Motion Only:</span>
            <button
              onClick={() => setFilters({ hasMotion: filters.hasMotion === true ? null : true })}
              className="badge text-[9px] cursor-pointer"
              style={{
                background: filters.hasMotion === true ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                color: filters.hasMotion === true ? 'var(--accent-primary)' : 'var(--text-muted)',
                borderColor: filters.hasMotion === true ? 'rgba(99, 102, 241, 0.3)' : 'var(--border-primary)',
              }}>
              ⚡ Motion Plays
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Comment Thread ----
function CommentThread() {
  const { activePlay, activeGame, addComment, currentTime, commentDraft, setCommentDraft } = useGridironStore();
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const comments = activePlay?.comments ?? [];
  const filteredRoster = TEAM_ROSTER.filter(u =>
    u.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
    u.position?.toLowerCase().includes(mentionQuery.toLowerCase()) ||
    u.jerseyNumber?.toString().includes(mentionQuery)
  );

  const handleInput = (text: string) => {
    setCommentDraft(text);
    const lastAt = text.lastIndexOf('@');
    if (lastAt >= 0 && lastAt === text.length - 1) {
      setShowMentions(true);
      setMentionQuery('');
    } else if (lastAt >= 0) {
      const query = text.slice(lastAt + 1);
      if (!query.includes(' ') || query.length < 20) {
        setShowMentions(true);
        setMentionQuery(query);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (user: UserMention) => {
    const lastAt = commentDraft.lastIndexOf('@');
    const before = commentDraft.slice(0, lastAt);
    const name = user.jerseyNumber ? `@#${user.jerseyNumber}_${user.name.replace(/\s/g, '_')}` : `@${user.name.replace(/\s/g, '_')}`;
    setCommentDraft(before + name + ' ');
    setShowMentions(false);
    textareaRef.current?.focus();
  };

  const submitComment = () => {
    if (!commentDraft.trim() || !activePlay || !activeGame) return;
    const mentions: UserMention[] = [];
    const mentionPattern = /@([^\s]+)/g;
    let match;
    while ((match = mentionPattern.exec(commentDraft)) !== null) {
      const mentionText = match[1].replace(/_/g, ' ').replace('#', '');
      const user = TEAM_ROSTER.find(u =>
        u.name.toLowerCase().includes(mentionText.toLowerCase()) ||
        u.jerseyNumber?.toString() === mentionText.split(' ')[0]
      );
      if (user) mentions.push(user);
    }

    addComment(activePlay.id, {
      id: generateId(),
      playId: activePlay.id,
      timestamp: currentTime,
      author: TEAM_ROSTER[8], // Coach Miller as default
      text: commentDraft,
      mentions,
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {!activePlay ? (
          <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs">Select a play to view comments</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs">No comments yet on Play #{activePlay.playNumber}</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="animate-fade-in-up">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold"
                  style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', color: 'white' }}>
                  {comment.author.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{comment.author.name}</span>
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      @ {formatTime(comment.timestamp)}
                    </span>
                    <span className="badge text-[9px]" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)', borderColor: 'transparent' }}>
                      {comment.author.role}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {comment.text.split(/(@[^\s]+)/g).map((part, i) =>
                      part.startsWith('@') ? (
                        <span key={i} className="mention-highlight">{part}</span>
                      ) : (
                        <span key={i}>{part}</span>
                      )
                    )}
                  </p>
                  {comment.mentions.length > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      {comment.mentions.map(m => (
                        <span key={m.id} className="badge text-[9px]" style={{
                          background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', borderColor: 'rgba(99, 102, 241, 0.2)'
                        }}>
                          @{m.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Comment Input */}
      {activePlay && (
        <div className="relative p-3 border-t" style={{ borderColor: 'var(--border-primary)' }}>
          {showMentions && (
            <div className="absolute bottom-full left-3 right-3 mb-1 glass-card-sm max-h-40 overflow-y-auto z-30">
              {filteredRoster.map(user => (
                <button key={user.id}
                  onClick={() => insertMention(user)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-white/5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>
                    {user.jerseyNumber ?? user.name.charAt(0)}
                  </div>
                  <div>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{user.name}</span>
                    <span className="text-[10px] ml-2" style={{ color: 'var(--text-muted)' }}>{user.position} · {user.role}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={commentDraft}
              onChange={(e) => handleInput(e.target.value)}
              placeholder="Type @ to mention players or coaches..."
              className="input-field text-xs resize-none"
              rows={2}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment(); } }}
            />
            <button onClick={submitComment} className="p-2 rounded-lg shrink-0"
              style={{ background: commentDraft.trim() ? 'var(--accent-primary)' : 'var(--bg-tertiary)', color: 'white' }}>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Action Items Panel ----
function ActionItemsPanel() {
  const { activePlay, activeGame, addActionItem, currentTime } = useGridironStore();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [assignedTo, setAssignedTo] = useState('u1');
  const [priority, setPriority] = useState<ActionPriority>('MEDIUM');

  const actions = activePlay?.actionItems ?? [];

  const handleCreate = () => {
    if (!title.trim() || !activePlay || !activeGame) return;
    addActionItem({
      id: generateId(),
      playId: activePlay.id,
      gameId: activeGame.id,
      title,
      description: desc,
      assignedTo: TEAM_ROSTER.find(u => u.id === assignedTo) ?? TEAM_ROSTER[0],
      assignedBy: TEAM_ROSTER[8], // Coach Miller
      priority,
      status: 'TODO',
      videoTimestamp: currentTime,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setTitle('');
    setDesc('');
    setShowForm(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {!activePlay ? (
          <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
            <ListChecks className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs">Select a play to view action items</p>
          </div>
        ) : actions.length === 0 && !showForm ? (
          <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
            <ListChecks className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs">No action items for Play #{activePlay.playNumber}</p>
          </div>
        ) : (
          actions.map((item) => (
            <div key={item.id} className="glass-card-sm p-3 animate-fade-in-up">
              <div className="flex items-start justify-between mb-1">
                <h4 className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{item.title}</h4>
                <span className={`badge text-[9px] ${getPriorityColor(item.priority)}`}>{item.priority}</span>
              </div>
              <p className="text-[11px] mb-2" style={{ color: 'var(--text-muted)' }}>{item.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  → {item.assignedTo.name} {item.assignedTo.jerseyNumber ? `(#${item.assignedTo.jerseyNumber})` : ''}
                </span>
                <span className={`badge text-[9px] ${getStatusColor(item.status)}`}>{item.status.replace('_', ' ')}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {activePlay && (
        <div className="p-3 border-t" style={{ borderColor: 'var(--border-primary)' }}>
          {showForm ? (
            <div className="space-y-2 animate-fade-in-up">
              <input placeholder="Action title..." value={title} onChange={(e) => setTitle(e.target.value)}
                className="input-field text-xs" />
              <textarea placeholder="Description..." value={desc} onChange={(e) => setDesc(e.target.value)}
                className="input-field text-xs resize-none" rows={2} />
              <div className="flex gap-2">
                <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}
                  className="input-field text-xs flex-1">
                  {TEAM_ROSTER.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.jerseyNumber ? `#${u.jerseyNumber} ` : ''}{u.name}
                    </option>
                  ))}
                </select>
                <select value={priority} onChange={(e) => setPriority(e.target.value as ActionPriority)}
                  className="input-field text-xs w-28">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={handleCreate} className="btn-primary text-xs py-1.5 flex-1">Create</button>
                <button onClick={() => setShowForm(false)} className="btn-ghost text-xs py-1.5">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowForm(true)} className="btn-ghost w-full text-xs justify-center">
              <Plus className="w-3.5 h-3.5" /> New Action Item
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ---- Main Film Room Page ----
export default function FilmRoomPage() {
  const params = useParams();
  const gameId = params.id as string;
  const { setActiveGame, activeGame, activeTab, setActiveTab } = useGridironStore();

  useEffect(() => {
    setActiveGame(gameId);
  }, [gameId, setActiveGame]);

  if (!activeGame) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-56px)]" style={{ color: 'var(--text-muted)' }}>
        <div className="text-center">
          <Film className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="text-lg font-semibold mb-2">Loading Film Room...</p>
          <p className="text-sm">Game session not found. Go back to import a game.</p>
        </div>
      </div>
    );
  }

  const tabConfig = [
    { key: 'plays' as const, label: 'Plays', icon: Target, count: activeGame.plays.length },
    { key: 'comments' as const, label: 'Comments', icon: MessageSquare, count: activeGame.plays.reduce((s, p) => s + p.comments.length, 0) },
    { key: 'actions' as const, label: 'Actions', icon: ListChecks, count: activeGame.plays.reduce((s, p) => s + p.actionItems.length, 0) },
  ];

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden">
      {/* Left: Video + Controls */}
      <div className="flex-1 flex flex-col min-w-0">
        <VideoPlayer />

        {/* Quick Play Info Bar */}
        <div className="flex items-center gap-4 px-4 py-2 border-b overflow-x-auto"
          style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-secondary)' }}>
          <div className="flex items-center gap-2 shrink-0">
            <Zap className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
              {activeGame.title}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>{activeGame.plays.length} plays</span>
            <span>·</span>
            <span>{activeGame.plays.filter(p => p.motionType !== 'NONE').length} with motion</span>
            <span>·</span>
            <span>{activeGame.plays.filter(p => p.isTouchdown).length} TDs</span>
            <span>·</span>
            <span className={getEpaColor(activeGame.plays.reduce((s, p) => s + p.epa, 0) / (activeGame.plays.length || 1))}>
              {(activeGame.plays.reduce((s, p) => s + p.epa, 0) / (activeGame.plays.length || 1)).toFixed(2)} avg EPA
            </span>
          </div>
        </div>
      </div>

      {/* Right: Sidebar */}
      <div className="w-[380px] shrink-0 flex flex-col border-l"
        style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-secondary)' }}>
        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: 'var(--border-primary)' }}>
          {tabConfig.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`tab-button flex-1 flex items-center justify-center gap-1.5 py-3 ${activeTab === tab.key ? 'active' : ''}`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              <span className="text-[10px] px-1.5 rounded-full font-semibold"
                style={{
                  background: activeTab === tab.key ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-tertiary)',
                  color: activeTab === tab.key ? 'var(--accent-primary)' : 'var(--text-muted)',
                }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'plays' && (
            <div className="h-full flex flex-col">
              <PlayFilterBar />
              <PlayByPlayTable />
            </div>
          )}
          {activeTab === 'comments' && <CommentThread />}
          {activeTab === 'actions' && <ActionItemsPanel />}
        </div>
      </div>
    </div>
  );
}
