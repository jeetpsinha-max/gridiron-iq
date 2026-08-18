'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Maximize, Settings, Pen, ArrowUpRight, Circle, Highlighter,
  Eraser, Undo2, MessageSquare, ListChecks, ChevronRight,
  ChevronDown, Clock, Hash, Crosshair, Zap, Filter,
  Search, RotateCcw, Send, AtSign, Plus, X,
  Gauge, Target, TrendingUp, Film, Eye, EyeOff, Navigation,
  Shield, Users, Activity, Sparkles
} from 'lucide-react';
import { useGridironStore } from '@/lib/store';
import { PlayAnalysis, UserMention, ActionPriority, TrackedPlayer, PlayTrackingData } from '@/types/football';
import {
  formatTime, getMotionBadgeColor, getPlayTypeBadgeColor,
  getEpaColor, getPriorityColor, getStatusColor, generateId,
} from '@/lib/utils';
import { TEAM_ROSTER, CURRENT_USER } from '@/lib/mock-game-data';

// ============================================================================
// 1. 22-Player Tracking Overlay Component (O's for Offense, X's for Defense)
// ============================================================================

interface PlayerOverlayProps {
  trackingData: PlayTrackingData;
  currentTime: number;
  playStart: number;
  playMotion?: number;
  playSnap: number;
  playEnd: number;
  showVectors: boolean;
  showCoverage: boolean;
  showLabels: boolean;
  activePlay: PlayAnalysis;
}

function PlayerTrackingOverlay({
  trackingData,
  currentTime,
  playStart,
  playMotion,
  playSnap,
  playEnd,
  showVectors,
  showCoverage,
  showLabels,
  activePlay,
}: PlayerOverlayProps) {
  // Determine play phase based on video currentTime:
  // Phase 0: Pre-snap alignment (before motion)
  // Phase 1: Pre-snap motion (between motion & snap)
  // Phase 2: Snap & mesh (between snap & snap+1.5s)
  // Phase 3: Route running & post-snap execution (after snap+1.5s)
  
  let phase: 'preSnap' | 'motion' | 'snap' | 'postSnap' = 'preSnap';
  let phaseProgress = 0; // 0 to 1

  const motionTime = playMotion ?? (playSnap - 2.5);

  if (currentTime < motionTime) {
    phase = 'preSnap';
    phaseProgress = Math.max(0, Math.min(1, (currentTime - playStart) / Math.max(motionTime - playStart, 0.5)));
  } else if (currentTime < playSnap) {
    phase = 'motion';
    phaseProgress = Math.max(0, Math.min(1, (currentTime - motionTime) / Math.max(playSnap - motionTime, 0.5)));
  } else if (currentTime < playSnap + 1.5) {
    phase = 'snap';
    phaseProgress = Math.max(0, Math.min(1, (currentTime - playSnap) / 1.5));
  } else {
    phase = 'postSnap';
    phaseProgress = Math.max(0, Math.min(1, (currentTime - (playSnap + 1.5)) / Math.max(playEnd - (playSnap + 1.5), 1)));
  }

  // Interpolate coordinates between phases
  const getPlayerPosition = (player: TrackedPlayer) => {
    const { trajectory } = player;
    const pre = trajectory.preSnap;
    const mot = trajectory.motion ?? pre;
    const snp = trajectory.snap;
    const post = trajectory.postSnap;

    if (phase === 'preSnap') {
      return pre;
    } else if (phase === 'motion') {
      if (player.isMotionPlayer && trajectory.motion) {
        return {
          x: pre.x + (mot.x - pre.x) * phaseProgress,
          y: pre.y + (mot.y - pre.y) * phaseProgress,
        };
      }
      return pre;
    } else if (phase === 'snap') {
      const startPoint = player.isMotionPlayer && trajectory.motion ? mot : pre;
      return {
        x: startPoint.x + (snp.x - startPoint.x) * phaseProgress,
        y: startPoint.y + (snp.y - startPoint.y) * phaseProgress,
      };
    } else {
      return {
        x: snp.x + (post.x - snp.x) * phaseProgress,
        y: snp.y + (post.y - snp.y) * phaseProgress,
      };
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
      {/* Field Tactical Grid Lines */}
      <svg className="w-full h-full absolute inset-0">
        <defs>
          <linearGradient id="offenseGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="defenseGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#b91c1c" stopOpacity="0.8" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Line of Scrimmage (Blue) & 1st Down Line (Yellow) */}
        <line
          x1="5%"
          y1={`${trackingData.lineOfScrimmageY}%`}
          x2="95%"
          y2={`${trackingData.lineOfScrimmageY}%`}
          stroke="#3b82f6"
          strokeWidth="2.5"
          strokeDasharray="6 4"
          opacity="0.85"
        />
        <line
          x1="5%"
          y1={`${trackingData.firstDownY}%`}
          x2="95%"
          y2={`${trackingData.firstDownY}%`}
          stroke="#eab308"
          strokeWidth="2.5"
          opacity="0.85"
        />

        {/* Coverage Zone Shading */}
        {showCoverage && (
          <g opacity="0.18">
            <rect x="10%" y="10%" width="26%" height="30%" fill="#ef4444" rx="10" />
            <rect x="37%" y="5%" width="26%" height="35%" fill="#ef4444" rx="10" />
            <rect x="64%" y="10%" width="26%" height="30%" fill="#ef4444" rx="10" />
          </g>
        )}

        {/* Trajectory Vectors (Routes and Pursuit Paths) */}
        {showVectors && (
          <g>
            {/* Offense Route Paths (Gold Dotted Lines) */}
            {trackingData.offense.map(player => {
              const start = player.trajectory.snap;
              const end = player.trajectory.postSnap;
              return (
                <g key={`vec-o-${player.id}`}>
                  <line
                    x1={`${start.x}%`}
                    y1={`${start.y}%`}
                    x2={`${end.x}%`}
                    y2={`${end.y}%`}
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    opacity={player.isTargetOrBallCarrier ? 0.95 : 0.45}
                  />
                  {player.vectorLabel && showLabels && (
                    <text
                      x={`${end.x}%`}
                      y={`${end.y - 2.5}%`}
                      fill="#fef08a"
                      fontSize="9"
                      fontWeight="600"
                      textAnchor="middle"
                      opacity="0.85"
                    >
                      {player.vectorLabel}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Defense Pursuit Angles (Red Solid/Dotted Lines) */}
            {trackingData.defense.map(player => {
              const start = player.trajectory.preSnap;
              const end = player.trajectory.postSnap;
              return (
                <line
                  key={`vec-d-${player.id}`}
                  x1={`${start.x}%`}
                  y1={`${start.y}%`}
                  x2={`${end.x}%`}
                  y2={`${end.y}%`}
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  opacity="0.5"
                />
              );
            })}
          </g>
        )}
      </svg>

      {/* Render 11 Offense Players (O's - Peddie Falcons) */}
      {trackingData.offense.map(player => {
        const pos = getPlayerPosition(player);
        const isBallCarrier = player.isTargetOrBallCarrier;
        const isMotion = player.isMotionPlayer;

        return (
          <div
            key={player.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-150 flex flex-col items-center"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              zIndex: isBallCarrier ? 25 : 20,
            }}
          >
            {/* O Badge */}
            <div
              className={`relative flex items-center justify-center rounded-full font-bold transition-transform ${
                isBallCarrier
                  ? 'w-7 h-7 ring-2 ring-amber-300 shadow-lg scale-110'
                  : 'w-6 h-6'
              }`}
              style={{
                background: isBallCarrier
                  ? 'linear-gradient(135deg, #fbbf24, #d97706)'
                  : 'linear-gradient(135deg, #1e3a8a, #0f172a)',
                border: '2px solid #fbbf24',
                color: '#fff',
                fontSize: '10px',
                boxShadow: isBallCarrier
                  ? '0 0 14px rgba(251, 191, 36, 0.8)'
                  : '0 2px 6px rgba(0,0,0,0.6)',
              }}
            >
              <span className="font-mono">{player.jerseyNumber}</span>
              {/* O Indicator Ring */}
              <div
                className="absolute -inset-1 rounded-full border border-amber-400 opacity-40 animate-pulse"
                style={{ display: isMotion ? 'block' : 'none' }}
              />
            </div>

            {/* Label */}
            {showLabels && (
              <span
                className="mt-0.5 px-1 py-0.2 rounded text-[8px] font-semibold tracking-wider font-mono uppercase backdrop-blur-sm"
                style={{
                  background: 'rgba(15, 23, 42, 0.85)',
                  color: isBallCarrier ? '#fde047' : '#e2e8f0',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                }}
              >
                {player.position} {player.name.split(' ')[1] || player.name}
              </span>
            )}
          </div>
        );
      })}

      {/* Render 11 Defense Players (X's - Opponent Defense) */}
      {trackingData.defense.map(player => {
        const pos = getPlayerPosition(player);

        return (
          <div
            key={player.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-150 flex flex-col items-center"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              zIndex: 18,
            }}
          >
            {/* X Badge */}
            <div
              className="relative flex items-center justify-center w-6 h-6 rounded-md font-bold transition-transform"
              style={{
                background: 'linear-gradient(135deg, #7f1d1d, #450a0a)',
                border: '2px solid #ef4444',
                color: '#fca5a5',
                fontSize: '10px',
                boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)',
              }}
            >
              <span className="font-mono">X{player.jerseyNumber}</span>
            </div>

            {/* Label */}
            {showLabels && (
              <span
                className="mt-0.5 px-1 py-0.2 rounded text-[8px] font-semibold tracking-wider font-mono uppercase backdrop-blur-sm"
                style={{
                  background: 'rgba(30, 10, 10, 0.85)',
                  color: '#fca5a5',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }}
              >
                {player.position}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// 2. Video Player & Tactical HUD Component
// ============================================================================

function VideoPlayer() {
  const {
    currentTime, isPlaying, playbackRate, duration,
    setCurrentTime, setIsPlaying, setPlaybackRate, setDuration,
    activePlay, activeGame,
    telestration, setTelestrationTool, setTelestrationColor,
  } = useGridironStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<{ points: { x: number; y: number }[]; color: string; width: number }[]>([]);
  const [currentStroke, setCurrentStroke] = useState<{ x: number; y: number }[]>([]);

  // Tactical Overlay View Controls (X's & O's)
  const [showPlayerTracking, setShowPlayerTracking] = useState(true);
  const [showVectors, setShowVectors] = useState(true);
  const [showCoverage, setShowCoverage] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  const speedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // Playback loop simulation
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTime(Math.min(currentTime + 0.1 * playbackRate, activeGame?.duration ?? 180));
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying, currentTime, playbackRate, setCurrentTime, activeGame?.duration]);

  // Keyboard hotkeys (J-K-L, Space, Arrows)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
      switch (e.key) {
        case ' ':
        case 'k': e.preventDefault(); setIsPlaying(!isPlaying); break;
        case 'j': e.preventDefault(); setCurrentTime(Math.max(0, currentTime - 5)); break;
        case 'l': e.preventDefault(); setCurrentTime(Math.min(currentTime + 5, activeGame?.duration ?? 180)); break;
        case 'ArrowLeft': e.preventDefault(); setCurrentTime(Math.max(0, currentTime - 1)); break;
        case 'ArrowRight': e.preventDefault(); setCurrentTime(Math.min(currentTime + 1, activeGame?.duration ?? 180)); break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isPlaying, currentTime, setIsPlaying, setCurrentTime, activeGame?.duration]);

  // Canvas drawing handlers
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

  const gameDuration = activeGame?.duration ?? 180;
  const progressPct = (currentTime / gameDuration) * 100;

  const telestrationTools = [
    { tool: 'PEN' as const, icon: Pen, label: 'Freehand Pen' },
    { tool: 'ARROW' as const, icon: ArrowUpRight, label: 'Directional Arrow' },
    { tool: 'SPOTLIGHT' as const, icon: Circle, label: 'Player Spotlight' },
    { tool: 'ROUTE_LINE' as const, icon: Crosshair, label: 'Route Path' },
    { tool: 'ERASER' as const, icon: Eraser, label: 'Eraser' },
  ];

  const colors = ['#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#ffffff'];

  return (
    <div className="relative flex flex-col bg-black rounded-lg overflow-hidden border border-white/10 shadow-2xl">
      {/* Top HUD Telemetry Bar */}
      {activePlay && (
        <div className="bg-slate-950/95 border-b border-white/10 px-4 py-2.5 flex items-center justify-between z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold font-mono">
              <Activity className="w-3.5 h-3.5" />
              PLAY #{activePlay.playNumber}
            </div>
            <div className="text-xs font-semibold text-white/90">
              Q{activePlay.quarter} · {activePlay.gameClock} · <span className="text-amber-400 font-bold">{activePlay.down}&{activePlay.distance}</span> on {activePlay.yardLine} YD
            </div>
            <div className={`badge text-[11px] px-2 py-0.5 font-bold ${getPlayTypeBadgeColor(activePlay.playType)}`}>
              {activePlay.playType.replace(/_/g, ' ')}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activePlay.motionType !== 'NONE' && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold">
                <Zap className="w-3 h-3" />
                {activePlay.motionType.replace(/_/g, ' ')} (#{activePlay.motionPlayerJersey})
              </div>
            )}
            <div className={`px-2 py-0.5 rounded font-mono text-xs font-bold ${getEpaColor(activePlay.epa)}`}>
              {activePlay.epa >= 0 ? `+${activePlay.epa.toFixed(2)}` : activePlay.epa.toFixed(2)} EPA
            </div>
            <div className="text-xs text-white/60 font-mono">
              +{activePlay.yardsGained} YDS
            </div>
          </div>
        </div>
      )}

      {/* Main Video & Tactical Canvas Viewport */}
      <div className="relative aspect-video bg-slate-950 overflow-hidden">
        {/* Realistic Gridiron Field Background Layer */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background: 'radial-gradient(ellipse at center, #0f3420 0%, #0d2818 60%, #08180e 100%)',
          }}
        >
          {/* Field Markings & Yardlines */}
          <svg viewBox="0 0 1000 560" className="absolute inset-0 w-full h-full opacity-35">
            {/* Endzones */}
            <rect x="0" y="0" width="1000" height="560" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="3" />
            {/* Yardlines */}
            {Array.from({ length: 9 }, (_, i) => (
              <line
                key={i}
                x1="40"
                y1={60 + i * 55}
                x2="960"
                y2={60 + i * 55}
                stroke="white"
                strokeWidth="1.5"
                strokeOpacity="0.3"
              />
            ))}
            {/* Hashmarks */}
            {Array.from({ length: 9 }, (_, i) => (
              <g key={`hash-${i}`}>
                <line x1="380" y1={60 + i * 55} x2="400" y2={60 + i * 55} stroke="white" strokeWidth="2" strokeOpacity="0.5" />
                <line x1="600" y1={60 + i * 55} x2="620" y2={60 + i * 55} stroke="white" strokeWidth="2" strokeOpacity="0.5" />
              </g>
            ))}
          </svg>

          {/* Hudl Watermark & Camera Angle Badge */}
          <div className="absolute top-3 left-4 flex items-center gap-2 z-10">
            <span className="px-2 py-0.5 rounded bg-black/70 border border-white/10 text-[10px] font-bold text-amber-400 uppercase tracking-wider font-mono">
              HUDL FALCON-VISION CAM 1
            </span>
            <span className="px-2 py-0.5 rounded bg-black/70 border border-white/10 text-[10px] font-semibold text-slate-300">
              PEDDIE 2025 ALL-22 FILM
            </span>
          </div>

          {/* 22-Player Dynamic Tracking Overlay (O's for Offense, X's for Defense) */}
          {activePlay?.trackingData && showPlayerTracking && (
            <PlayerTrackingOverlay
              trackingData={activePlay.trackingData}
              currentTime={currentTime}
              playStart={activePlay.videoTimestampStart}
              playMotion={activePlay.videoTimestampMotion}
              playSnap={activePlay.videoTimestampSnap}
              playEnd={activePlay.videoTimestampEnd}
              showVectors={showVectors}
              showCoverage={showCoverage}
              showLabels={showLabels}
              activePlay={activePlay}
            />
          )}

          {/* Bottom Play Concept Description Bar */}
          {activePlay && (
            <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 border border-white/10 rounded-lg p-2.5 z-20 backdrop-blur-md shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    {activePlay.trackingData?.playConceptName || activePlay.offensiveFormation}
                  </div>
                  <div className="text-[11px] text-slate-400 line-clamp-1">
                    {activePlay.playDescription}
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                  Coverage Scheme
                </div>
                <div className="text-xs font-bold text-amber-300 font-mono">
                  {activePlay.coverageScheme.replace(/_/g, ' ')}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Freehand Telestration Canvas Layer */}
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          className="absolute inset-0 w-full h-full"
          style={{
            cursor: telestration.activeTool ? 'crosshair' : 'default',
            zIndex: telestration.activeTool ? 35 : 5,
          }}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
        />
      </div>

      {/* Floating Tactical Layer Toggles (X's & O's, Routes, Coverage) */}
      <div className="absolute top-14 left-4 flex flex-col gap-1.5 z-30">
        <button
          onClick={() => setShowPlayerTracking(!showPlayerTracking)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all shadow-md backdrop-blur-md border ${
            showPlayerTracking
              ? 'bg-amber-500/90 text-slate-950 border-amber-300'
              : 'bg-slate-900/80 text-slate-300 border-white/10 hover:bg-slate-800'
          }`}
          title="Toggle 22-Man X's and O's Player Tracking"
        >
          <Users className="w-3.5 h-3.5" />
          {showPlayerTracking ? "X's & O's: ON" : "X's & O's: OFF"}
        </button>

        {showPlayerTracking && (
          <>
            <button
              onClick={() => setShowVectors(!showVectors)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all shadow-md backdrop-blur-md border ${
                showVectors
                  ? 'bg-cyan-500/80 text-slate-950 border-cyan-300'
                  : 'bg-slate-900/80 text-slate-300 border-white/10 hover:bg-slate-800'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              Routes & Motion
            </button>

            <button
              onClick={() => setShowCoverage(!showCoverage)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all shadow-md backdrop-blur-md border ${
                showCoverage
                  ? 'bg-red-500/80 text-white border-red-300'
                  : 'bg-slate-900/80 text-slate-300 border-white/10 hover:bg-slate-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Coverage Shell
            </button>

            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all shadow-md backdrop-blur-md border ${
                showLabels
                  ? 'bg-purple-500/80 text-white border-purple-300'
                  : 'bg-slate-900/80 text-slate-300 border-white/10 hover:bg-slate-800'
              }`}
            >
              {showLabels ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              Player Names
            </button>
          </>
        )}
      </div>

      {/* Floating Telestration Toolbar (Right side) */}
      <div className="absolute top-14 right-4 flex flex-col gap-1.5 z-30 bg-slate-950/80 border border-white/10 p-1.5 rounded-lg backdrop-blur-md shadow-xl">
        {telestrationTools.map(({ tool, icon: Icon, label }) => (
          <button
            key={tool}
            onClick={() => setTelestrationTool(telestration.activeTool === tool ? null : tool)}
            className={`w-8 h-8 rounded flex items-center justify-center transition-all ${
              telestration.activeTool === tool
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title={label}
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
        <div className="h-px bg-white/10 my-0.5" />
        <button
          onClick={undoStroke}
          className="w-8 h-8 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10"
          title="Undo"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={clearCanvas}
          className="w-8 h-8 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10"
          title="Clear All"
        >
          <X className="w-4 h-4" />
        </button>
        {/* Color Palette */}
        <div className="flex flex-col gap-1 mt-1 items-center">
          {colors.map(c => (
            <button
              key={c}
              onClick={() => setTelestrationColor(c)}
              className={`w-4 h-4 rounded-full border transition-transform ${
                telestration.activeColor === c ? 'scale-125 border-white' : 'border-transparent opacity-70'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* Bottom Playback & Scrubber Controls */}
      <div className="bg-slate-950 px-4 py-3 border-t border-white/10 flex flex-col gap-2">
        {/* Timeline Scrubber */}
        <div
          ref={progressRef}
          onClick={(e) => {
            if (!progressRef.current) return;
            const rect = progressRef.current.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            setCurrentTime(pct * gameDuration);
          }}
          className="relative h-2.5 bg-slate-800 rounded-full cursor-pointer overflow-hidden group"
        >
          {/* Progress bar */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all"
            style={{ width: `${progressPct}%` }}
          />
          {/* Play markers */}
          {activeGame?.plays.map(p => (
            <div
              key={p.id}
              className="absolute top-0 bottom-0 w-1 bg-white/40 group-hover:bg-white/80 transition-colors"
              style={{ left: `${(p.videoTimestampStart / gameDuration) * 100}%` }}
              title={`Play #${p.playNumber}: ${p.playDescription}`}
            />
          ))}
        </div>

        {/* Action Controls & Timestamps */}
        <div className="flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center hover:bg-amber-400 transition-transform font-bold"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>
            <button
              onClick={() => setCurrentTime(Math.max(0, currentTime - 5))}
              className="p-1.5 hover:text-white transition-colors"
              title="Back 5s (J)"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentTime(Math.min(gameDuration, currentTime + 5))}
              className="p-1.5 hover:text-white transition-colors"
              title="Forward 5s (L)"
            >
              <SkipForward className="w-4 h-4" />
            </button>
            <span className="font-mono text-slate-400 font-semibold">
              {formatTime(currentTime)} / {formatTime(gameDuration)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Speed Selector */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="px-2 py-1 rounded bg-slate-900 border border-white/10 hover:border-white/30 text-xs font-mono font-bold"
              >
                {playbackRate}x
              </button>
              {showSpeedMenu && (
                <div className="absolute bottom-full right-0 mb-1 bg-slate-900 border border-white/10 rounded-md shadow-xl py-1 z-50 flex flex-col">
                  {speedOptions.map(rate => (
                    <button
                      key={rate}
                      onClick={() => {
                        setPlaybackRate(rate);
                        setShowSpeedMenu(false);
                      }}
                      className={`px-3 py-1 text-xs text-left font-mono hover:bg-white/10 ${
                        playbackRate === rate ? 'text-amber-400 font-bold' : 'text-slate-300'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 3. Play-by-Play Table Component
// ============================================================================

function PlayByPlayList() {
  const { activeGame, activePlay, setActivePlay, seekToPlay } = useGridironStore();
  const plays = activeGame?.plays ?? [];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 border border-white/10 rounded-lg">
      <div className="p-3 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-2 font-bold text-sm text-white">
          <Target className="w-4 h-4 text-amber-400" />
          Play Ledger ({plays.length} Plays Detected)
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Peddie Falcons 2025 Film
        </span>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-white/5">
        {plays.map(play => {
          const isSelected = activePlay?.id === play.id;
          return (
            <div
              key={play.id}
              onClick={() => {
                setActivePlay(play.id);
                seekToPlay(play);
              }}
              className={`p-3 cursor-pointer transition-all ${
                isSelected
                  ? 'bg-amber-500/15 border-l-4 border-amber-400'
                  : 'hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-white">
                    #{play.playNumber}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">
                    Q{play.quarter} · {play.gameClock}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-amber-300">
                    {play.down}&{play.distance}
                  </span>
                </div>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${getEpaColor(play.epa)}`}>
                  {play.epa >= 0 ? `+${play.epa.toFixed(2)}` : play.epa.toFixed(2)} EPA
                </span>
              </div>

              <div className="text-xs text-slate-300 font-medium mb-1.5 line-clamp-2">
                {play.playDescription}
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`badge text-[9px] px-1.5 py-0.2 font-bold ${getPlayTypeBadgeColor(play.playType)}`}>
                  {play.playType}
                </span>
                {play.motionType !== 'NONE' && (
                  <span className="badge badge-motion text-[9px] px-1.5 py-0.2">
                    {play.motionType}
                  </span>
                )}
                <span className="badge badge-coverage text-[9px] px-1.5 py-0.2">
                  {play.coverageScheme}
                </span>
                <span className="text-[10px] font-mono text-slate-400 ml-auto">
                  +{play.yardsGained} yds
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// 4. Collaborative Comments & @Mention Feed
// ============================================================================

function CommentFeed() {
  const { activeGame, activePlay, currentTime } = useGridironStore();
  const [commentText, setCommentText] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');

  const plays = activeGame?.plays ?? [];
  const currentComments = activePlay ? activePlay.comments : plays.flatMap(p => p.comments);

  const handleSend = () => {
    if (!commentText.trim()) return;
    // Add comment logic
    setCommentText('');
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 border border-white/10 rounded-lg">
      <div className="p-3 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-2 font-bold text-sm text-white">
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          Coaching Thread & @Mentions
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          {currentComments.length} Notes
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {currentComments.map(comment => (
          <div key={comment.id} className="p-2.5 rounded-lg bg-white/5 border border-white/5 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-amber-300">{comment.author.name}</span>
                <span className="text-[10px] text-slate-400">({comment.author.position || comment.author.role})</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400">
                {formatTime(comment.timestamp)}
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {comment.text}
            </p>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-white/10 bg-slate-900/80">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type comment or @player (e.g. @#2_McFarland)..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-3 py-1.5 rounded-md bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
          <button
            onClick={handleSend}
            className="px-3 py-1.5 rounded-md bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors flex items-center gap-1"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 5. Main Film Room Page Shell
// ============================================================================

export default function FilmRoomPage() {
  const params = useParams();
  const gameId = params.id as string;
  const { setActiveGame, activeGame } = useGridironStore();
  const [activeTab, setActiveTab] = useState<'plays' | 'comments'>('plays');

  useEffect(() => {
    setActiveGame(gameId);
  }, [gameId, setActiveGame]);

  if (!activeGame) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-56px)] text-slate-400">
        <div className="text-center">
          <Film className="w-12 h-12 mx-auto mb-4 opacity-40 animate-pulse text-amber-400" />
          <p className="text-lg font-semibold mb-2 text-white">Loading Peddie Falcons Film Room...</p>
          <p className="text-sm">Fetching Hudl all-22 game footage and tracking models.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-56px)] bg-slate-950 overflow-hidden">
      {/* Left 70%: Video Player with Dynamic 22-Player Tracking Overlay */}
      <div className="flex-1 flex flex-col p-4 min-w-0 overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-amber-400" />
              {activeGame.title}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeGame.homeTeam} vs {activeGame.awayTeam} · {activeGame.season} · Hudl 2025 Reel
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <VideoPlayer />
        </div>
      </div>

      {/* Right 30%: Play Ledger & Coaching Feed */}
      <div className="w-96 flex flex-col p-4 pl-0 gap-3 border-l border-white/10 bg-slate-900/40">
        {/* Tab switcher */}
        <div className="flex bg-slate-950 p-1 rounded-lg border border-white/10">
          <button
            onClick={() => setActiveTab('plays')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'plays'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            Plays ({activeGame.plays.length})
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'comments'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Coaching Notes
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'plays' ? <PlayByPlayList /> : <CommentFeed />}
      </div>
    </div>
  );
}
