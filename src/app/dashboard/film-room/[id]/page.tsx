'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight,
  ChevronDown, Search, Eye, EyeOff, Navigation, Shield, Users,
  Sparkles, TrendingUp, Film, CheckCircle2, MessageSquare, Target,
  Zap, Compass, PlayCircle, RotateCw, Repeat, Radio, Gauge
} from 'lucide-react';
import { useGridironStore } from '@/lib/store';
import { PlayAnalysis, TrackedPlayer, PlayTrackingData, BallTrajectory } from '@/types/football';
import {
  formatTime, getPlayTypeBadgeColor,
  getEpaColor,
} from '@/lib/utils';
import { TEAM_ROSTER, MOCK_GAMES } from '@/lib/mock-game-data';

// ============================================================================
// 1. 22-Player & 🏈 Real-time Ball Tracking Overlay (X's, O's, & Football)
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
  showBall: boolean;
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
  showBall,
  activePlay,
}: PlayerOverlayProps) {
  let phase: 'preSnap' | 'motion' | 'snap' | 'postSnap' = 'preSnap';
  let phaseProgress = 0;

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

  // Compute Live Football Ball Coordinates across the 4 Play Phases
  const getBallPosition = (ball: BallTrajectory) => {
    const pre = ball.preSnap;
    const msh = ball.mesh ?? pre;
    const mid = ball.inAirOrTuck;
    const end = ball.playEnd;

    if (phase === 'preSnap' || phase === 'motion') {
      return pre;
    } else if (phase === 'snap') {
      return {
        x: pre.x + (msh.x - pre.x) * phaseProgress,
        y: pre.y + (msh.y - pre.y) * phaseProgress,
      };
    } else {
      // postSnap
      if (phaseProgress < 0.45) {
        const subP = phaseProgress / 0.45;
        return {
          x: msh.x + (mid.x - msh.x) * subP,
          y: msh.y + (mid.y - msh.y) * subP,
        };
      } else {
        const subP = (phaseProgress - 0.45) / 0.55;
        return {
          x: mid.x + (end.x - mid.x) * subP,
          y: mid.y + (end.y - mid.y) * subP,
        };
      }
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
      {/* Field Tactical Grid Lines & Line of Scrimmage */}
      <svg className="w-full h-full absolute inset-0">
        <defs>
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

            {/* Defense Pursuit Angles (Red Dotted Lines) */}
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

            {/* Ball Flight Vector Line */}
            {trackingData.ball && showBall && (
              <line
                x1={`${trackingData.ball.preSnap.x}%`}
                y1={`${trackingData.ball.preSnap.y}%`}
                x2={`${trackingData.ball.playEnd.x}%`}
                y2={`${trackingData.ball.playEnd.y}%`}
                stroke="#fbbf24"
                strokeWidth="2"
                strokeDasharray="2 3"
                opacity="0.75"
              />
            )}
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

      {/* 🏈 Real-Time Football Location & Velocity Tracking Marker */}
      {trackingData.ball && showBall && (
        (() => {
          const ball = trackingData.ball;
          const bPos = getBallPosition(ball);

          return (
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-100 flex flex-col items-center pointer-events-none"
              style={{
                left: `${bPos.x}%`,
                top: `${bPos.y}%`,
                zIndex: 35,
              }}
            >
              {/* Pulsing Football Icon */}
              <div className="relative flex items-center justify-center">
                <div className="absolute w-8 h-8 rounded-full bg-amber-400/40 animate-ping" />
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 border-2 border-white shadow-[0_0_16px_rgba(251,191,36,0.9)] flex items-center justify-center text-xs">
                  🏈
                </div>
              </div>

              {/* Ball Telemetry Tag */}
              {showLabels && (
                <span className="mt-0.5 px-1.5 py-0.2 rounded text-[8px] font-black tracking-wider font-mono uppercase bg-black/90 text-amber-300 border border-amber-400/60 shadow-md">
                  BALL {ball.ballVelocityMph ? `(${ball.ballVelocityMph} MPH)` : ''}
                </span>
              )}
            </div>
          );
        })()
      )}
    </div>
  );
}

// ============================================================================
// 2. Upgraded Video Player with Scoreboard HUD & Play-by-Play Controls
// ============================================================================

function VideoPlayer() {
  const {
    currentTime, isPlaying, playbackRate,
    setCurrentTime, setIsPlaying, setPlaybackRate,
    activePlay, activeGame, setActivePlay, seekToPlay,
    telestration,
  } = useGridironStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<{ x: number; y: number }[]>([]);

  // Tactical Overlay View Controls (X's, O's, Ball, Routes, Coverage)
  const [showPlayerTracking, setShowPlayerTracking] = useState(true);
  const [showBall, setShowBall] = useState(true);
  const [showVectors, setShowVectors] = useState(true);
  const [showCoverage, setShowCoverage] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [loopPlay, setLoopPlay] = useState(true);
  const [autoAdvance, setAutoAdvance] = useState(false);

  const speedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const plays = activeGame?.plays ?? [];
  const gameDuration = activeGame?.duration ?? 180;
  const progressPct = (currentTime / gameDuration) * 100;

  // Compute Active Play Index in the Full Game Sequence
  const currentPlayIndex = useMemo(() => {
    if (!activePlay) return -1;
    return plays.findIndex(p => p.id === activePlay.id);
  }, [plays, activePlay]);

  // Previous and Next Play Handlers
  const handlePrevPlay = useCallback(() => {
    if (currentPlayIndex > 0) {
      const prev = plays[currentPlayIndex - 1];
      setActivePlay(prev.id);
      seekToPlay(prev);
    }
  }, [plays, currentPlayIndex, setActivePlay, seekToPlay]);

  const handleNextPlay = useCallback(() => {
    if (currentPlayIndex >= 0 && currentPlayIndex < plays.length - 1) {
      const next = plays[currentPlayIndex + 1];
      setActivePlay(next.id);
      seekToPlay(next);
    }
  }, [plays, currentPlayIndex, setActivePlay, seekToPlay]);

  // Playback Loop & Auto-Advance / Loop Handler
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTime(Math.min(currentTime + 0.1 * playbackRate, gameDuration));
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying, currentTime, playbackRate, setCurrentTime, gameDuration]);

  // Check play boundary for Loop vs Auto-Advance
  useEffect(() => {
    if (!activePlay || !isPlaying) return;
    if (currentTime >= activePlay.videoTimestampEnd) {
      if (loopPlay) {
        setCurrentTime(activePlay.videoTimestampStart);
      } else if (autoAdvance) {
        handleNextPlay();
      } else {
        setIsPlaying(false);
      }
    }
  }, [currentTime, activePlay, isPlaying, loopPlay, autoAdvance, handleNextPlay, setCurrentTime, setIsPlaying]);

  // Keyboard hotkeys (J-K-L, Space, Arrows, [ / ] for Play-by-Play)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
      switch (e.key) {
        case ' ':
        case 'k': e.preventDefault(); setIsPlaying(!isPlaying); break;
        case 'j': e.preventDefault(); setCurrentTime(Math.max(0, currentTime - 5)); break;
        case 'l': e.preventDefault(); setCurrentTime(Math.min(currentTime + 5, gameDuration)); break;
        case '[':
        case 'p': e.preventDefault(); handlePrevPlay(); break;
        case ']':
        case 'n': e.preventDefault(); handleNextPlay(); break;
        case 'ArrowLeft': e.preventDefault(); setCurrentTime(Math.max(0, currentTime - 1)); break;
        case 'ArrowRight': e.preventDefault(); setCurrentTime(Math.min(currentTime + 1, gameDuration)); break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isPlaying, currentTime, setIsPlaying, setCurrentTime, gameDuration, handlePrevPlay, handleNextPlay]);

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
    setCurrentStroke([]);
  }, [isDrawing]);

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    setCurrentTime(pct * gameDuration);
  };

  return (
    <div className="relative flex flex-col h-full bg-slate-950 rounded-xl overflow-hidden border border-white/10 shadow-2xl">
      {/* Video Viewport / Canvas Stack */}
      <div className="relative flex-1 bg-slate-900 overflow-hidden flex items-center justify-center">
        {/* Synthetic Football Field Canvas */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a2215] via-[#0d2e1c] to-[#0a2215] flex items-center justify-center">
          <svg viewBox="0 0 1000 560" className="absolute inset-0 w-full h-full opacity-35">
            <rect x="0" y="0" width="1000" height="560" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="3" />
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
            {Array.from({ length: 9 }, (_, i) => (
              <g key={`hash-${i}`}>
                <line x1="380" y1={60 + i * 55} x2="400" y2={60 + i * 55} stroke="white" strokeWidth="2" strokeOpacity="0.5" />
                <line x1="600" y1={60 + i * 55} x2="620" y2={60 + i * 55} stroke="white" strokeWidth="2" strokeOpacity="0.5" />
              </g>
            ))}
          </svg>

          {/* Top Situational Scoreboard & Game Status HUD */}
          <div className="absolute top-3 left-4 right-4 flex items-center justify-between z-30 pointer-events-auto">
            {/* Live Scoreboard Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/85 border border-white/15 backdrop-blur-md shadow-xl">
              <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider font-mono">
                HUDL FALCON-VISION
              </span>
              {activePlay ? (
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-white">
                  <span className="text-amber-400">Q{activePlay.quarter}</span>
                  <span className="text-slate-500">|</span>
                  <span>{activePlay.gameClock}</span>
                  <span className="text-slate-500">|</span>
                  <span className="text-cyan-300">{activePlay.down}&{activePlay.distance}</span>
                  <span className="text-slate-500">|</span>
                  <span className="text-slate-300">Ball on {activePlay.yardLine} ({activePlay.hash})</span>
                </div>
              ) : (
                <span className="text-xs font-mono text-slate-300">PEDDIE 2025–2026 VARSITY FILM</span>
              )}
            </div>

            {/* Ball Telemetry Indicator */}
            {activePlay?.trackingData?.ball && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/85 border border-amber-400/30 backdrop-blur-md shadow-xl">
                <span className="text-xs">🏈</span>
                <div className="flex items-center gap-1.5 text-xs font-mono">
                  <span className="font-bold text-amber-300">
                    #{activePlay.trackingData.ball.carrierJersey} {activePlay.trackingData.ball.carrierName}
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-black">
                    {activePlay.trackingData.ball.ballVelocityMph} MPH
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 22-Player & Ball Dynamic Tracking Overlay */}
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
              showBall={showBall}
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
                    {activePlay.isTouchdown && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 text-[9px] font-black">
                        TOUCHDOWN
                      </span>
                    )}
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

      {/* Floating Tactical Layer Toggles on Field */}
      <div className="absolute top-14 left-4 flex flex-col gap-1.5 z-30">
        <button
          onClick={() => setShowBall(!showBall)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all shadow-md backdrop-blur-md border ${
            showBall
              ? 'bg-amber-500 text-slate-950 border-amber-300'
              : 'bg-slate-900/80 text-slate-300 border-white/10 hover:bg-slate-800'
          }`}
          title="Toggle Real-Time Football Location & Trajectory"
        >
          <span>🏈</span>
          {showBall ? 'Ball: ON' : 'Ball: OFF'}
        </button>

        <button
          onClick={() => setShowPlayerTracking(!showPlayerTracking)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all shadow-md backdrop-blur-md border ${
            showPlayerTracking
              ? 'bg-blue-600 text-white border-blue-400'
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

      {/* Upgraded Video Control Bar & Play-by-Play Nav */}
      <div className="bg-slate-950 border-t border-white/10 p-3 flex flex-col gap-2.5 z-40">
        {/* Interactive Scrub Timeline with Play Markers */}
        <div
          ref={progressRef}
          onClick={handleProgressBarClick}
          className="relative w-full h-3.5 bg-slate-800/80 rounded-full cursor-pointer overflow-visible group"
        >
          {/* Active Played Fill */}
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all"
            style={{ width: `${progressPct}%` }}
          />

          {/* Individual Play Markers on Timeline */}
          {plays.map((p) => {
            const playStartPct = (p.videoTimestampStart / gameDuration) * 100;
            const isSelected = activePlay?.id === p.id;
            return (
              <div
                key={p.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePlay(p.id);
                  seekToPlay(p);
                }}
                className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-transform hover:scale-150 cursor-pointer ${
                  p.isTouchdown
                    ? 'w-3.5 h-3.5 rounded-full bg-amber-400 ring-2 ring-white z-20'
                    : isSelected
                    ? 'w-3 h-3 rounded-full bg-cyan-400 ring-2 ring-cyan-200 z-20'
                    : 'w-2 h-2 rounded-full bg-slate-400 hover:bg-white z-10'
                }`}
                style={{ left: `${playStartPct}%` }}
                title={`Play #${p.playNumber}: Q${p.quarter} (${p.down}&${p.distance}) - ${p.playDescription}`}
              />
            );
          })}
        </div>

        {/* Play-by-Play Transport Controls & Loop / Auto-Advance Toggles */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Play-by-Play Step Controls */}
          <div className="flex items-center gap-2">
            {/* Prev Play */}
            <button
              onClick={handlePrevPlay}
              disabled={currentPlayIndex <= 0}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 hover:bg-slate-800 disabled:opacity-40 text-slate-200 text-xs font-bold transition-all"
              title="Previous Play (Hotkeys: [ or P)"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Prev Play</span>
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-md"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            {/* Next Play */}
            <button
              onClick={handleNextPlay}
              disabled={currentPlayIndex >= plays.length - 1}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 hover:bg-slate-800 disabled:opacity-40 text-slate-200 text-xs font-bold transition-all"
              title="Next Play (Hotkeys: ] or N)"
            >
              <span>Next Play</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Play Counter Badge */}
            <div className="ml-2 px-2.5 py-1 rounded-md bg-slate-900 border border-white/10 font-mono text-xs text-amber-400 font-bold">
              Play {currentPlayIndex + 1} of {plays.length}
            </div>
          </div>

          {/* Time and Mode Toggles */}
          <div className="flex items-center gap-2">
            {/* Auto-Advance Toggle */}
            <button
              onClick={() => {
                setAutoAdvance(!autoAdvance);
                if (!autoAdvance) setLoopPlay(false);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-bold transition-all border ${
                autoAdvance
                  ? 'bg-cyan-500 text-slate-950 border-cyan-300'
                  : 'bg-slate-900 text-slate-400 border-white/10 hover:text-white'
              }`}
              title="Automatically advance to the next play when the current play finishes"
            >
              <Radio className="w-3.5 h-3.5" />
              Auto-Advance
            </button>

            {/* Loop Play Toggle */}
            <button
              onClick={() => {
                setLoopPlay(!loopPlay);
                if (!loopPlay) setAutoAdvance(false);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-bold transition-all border ${
                loopPlay
                  ? 'bg-amber-500 text-slate-950 border-amber-300'
                  : 'bg-slate-900 text-slate-400 border-white/10 hover:text-white'
              }`}
              title="Continuously loop current play"
            >
              <Repeat className="w-3.5 h-3.5" />
              Loop Play
            </button>

            {/* Speed Selector */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="px-2.5 py-1 rounded bg-slate-900 border border-white/10 hover:border-white/30 text-xs font-mono font-bold text-slate-200"
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

            <span className="font-mono text-xs text-slate-400">
              {formatTime(currentTime)} / {formatTime(gameDuration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 3. Play-by-Play Table Component with Continuous Play Stream
// ============================================================================

function PlayByPlayList() {
  const { activeGame, activePlay, setActivePlay, seekToPlay } = useGridironStore();
  const plays = activeGame?.plays ?? [];

  const [unitFilter, setUnitFilter] = useState<'ALL' | 'OFFENSE' | 'DEFENSE'>('ALL');
  const [quarterFilter, setQuarterFilter] = useState<'ALL' | 1 | 2 | 3 | 4>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    return plays.filter(p => {
      if (unitFilter !== 'ALL' && p.unit && p.unit !== unitFilter) return false;
      if (quarterFilter !== 'ALL' && p.quarter !== quarterFilter) return false;
      if (typeFilter !== 'ALL' && p.playType !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.playDescription.toLowerCase().includes(q) ||
          p.offensiveFormation.toLowerCase().includes(q) ||
          p.coverageScheme.toLowerCase().includes(q) ||
          (p.defensivePlayMakerName && p.defensivePlayMakerName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [plays, unitFilter, quarterFilter, typeFilter, searchQuery]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 border border-white/10 rounded-lg">
      {/* Header with Play Count */}
      <div className="p-3 border-b border-white/10 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-sm text-white">
          <Target className="w-4 h-4 text-amber-400" />
          Play-by-Play Ledger ({filtered.length} / {plays.length} Plays)
        </div>
        <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
          Hudl All-22
        </span>
      </div>

      {/* Filter Tabs (Unit, Quarter & Search) */}
      <div className="p-2 border-b border-white/10 bg-slate-900/40 space-y-2">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search plays (e.g. Oliver, Sack, Perkins, Melton)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1 text-xs bg-slate-950 border border-white/10 rounded-md text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
          />
        </div>

        {/* Unit Filter (Offense / Defense / All) */}
        <div className="flex items-center gap-1 font-mono">
          <button
            onClick={() => setUnitFilter('ALL')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
              unitFilter === 'ALL' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Plays ({plays.length})
          </button>
          <button
            onClick={() => setUnitFilter('OFFENSE')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
              unitFilter === 'OFFENSE' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            ⚔️ Offense ({plays.filter(p => p.unit === 'OFFENSE').length})
          </button>
          <button
            onClick={() => setUnitFilter('DEFENSE')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
              unitFilter === 'DEFENSE' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            🛡️ Defense ({plays.filter(p => p.unit === 'DEFENSE').length})
          </button>
        </div>

        {/* Quarter Chips */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 font-mono">
          {(['ALL', 1, 2, 3, 4] as const).map(q => (
            <button
              key={`q-${q}`}
              onClick={() => setQuarterFilter(q)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                quarterFilter === q
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              {q === 'ALL' ? 'All Qtrs' : `Q${q}`}
            </button>
          ))}
        </div>
      </div>

      {/* Play Ledger List */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/5">
        {filtered.map(play => {
          const isSelected = activePlay?.id === play.id;
          const isDefense = play.unit === 'DEFENSE';
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
              <div className="flex items-center justify-between mb-1.5 font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">
                    #{play.playNumber}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">
                    Q{play.quarter} · {play.gameClock}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-amber-300">
                    {play.down}&{play.distance}
                  </span>
                  {isDefense ? (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/30">
                      DEFENSE
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-bold border border-indigo-500/30">
                      OFFENSE
                    </span>
                  )}
                  {play.isTouchdown && (
                    <span className="px-1 py-0.2 rounded bg-amber-500 text-slate-950 text-[9px] font-black tracking-wider">
                      TD
                    </span>
                  )}
                </div>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${getEpaColor(play.epa)}`}>
                  {play.epa >= 0 ? `+${play.epa.toFixed(2)}` : play.epa.toFixed(2)} EPA
                </span>
              </div>

              <div className="text-xs text-slate-300 font-medium mb-1.5 line-clamp-2">
                {play.playDescription}
              </div>

              <div className="flex items-center gap-1.5 flex-wrap font-mono">
                {isDefense && play.defensivePlayMakerName ? (
                  <span className="badge text-[9px] px-1.5 py-0.2 font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                    #{play.defensivePlayMakerJersey} {play.defensivePlayMakerName} ({play.defensivePlayType})
                  </span>
                ) : (
                  <span className={`badge text-[9px] px-1.5 py-0.2 font-bold ${getPlayTypeBadgeColor(play.playType)}`}>
                    {play.playType}
                  </span>
                )}
                {play.motionType !== 'NONE' && (
                  <span className="badge badge-motion text-[9px] px-1.5 py-0.2">
                    {play.motionType}
                  </span>
                )}
                <span className="badge badge-coverage text-[9px] px-1.5 py-0.2">
                  {play.coverageScheme}
                </span>
                <span className="text-[10px] font-mono text-slate-400 ml-auto">
                  {play.yardsGained >= 0 ? `+${play.yardsGained}` : play.yardsGained} yds
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
// 4. Coaching Notes Feed
// ============================================================================

function CommentFeed() {
  const { activeGame, activePlay } = useGridironStore();
  const [commentText, setCommentText] = useState('');

  const plays = activeGame?.plays ?? [];
  const currentComments = activePlay ? activePlay.comments : plays.flatMap(p => p.comments);

  const handleSend = () => {
    if (!commentText.trim()) return;
    setCommentText('');
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 border border-white/10 rounded-lg">
      <div className="p-3 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-2 font-bold text-sm text-white">
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          Coaching Thread & Notes
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
            placeholder="Add coaching note (e.g. @#15_Melton)..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-3 py-1.5 rounded-md bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
          <button
            onClick={handleSend}
            className="px-3 py-1.5 rounded-md bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors flex items-center gap-1"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 5. Main Film Room Page Shell with 9-Game Dropdown Selector
// ============================================================================

export default function FilmRoomPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;
  const { setActiveGame, activeGame } = useGridironStore();
  const [activeTab, setActiveTab] = useState<'plays' | 'comments'>('plays');
  const [showGameSelector, setShowGameSelector] = useState(false);

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
    <div className="flex flex-col h-[calc(100vh-56px)] bg-slate-950 overflow-hidden">
      {/* Top 9-Game Selector Header Bar */}
      <div className="h-14 px-4 border-b border-white/10 bg-slate-900/90 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 relative">
          <button
            onClick={() => setShowGameSelector(!showGameSelector)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 hover:border-amber-400/50 transition-all text-left"
          >
            <Film className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                {activeGame.title}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {activeGame.date} · {activeGame.homeTeam} vs {activeGame.awayTeam} ({activeGame.plays.length} Plays)
              </div>
            </div>
          </button>

          {/* Dropdown Menu to Select Across All 9 Season Games */}
          {showGameSelector && (
            <div className="absolute top-full left-0 mt-1.5 w-96 max-h-96 overflow-y-auto rounded-xl bg-slate-950 border border-white/20 shadow-2xl p-1.5 z-50 divide-y divide-white/5">
              <div className="px-3 py-1.5 text-[10px] font-bold text-amber-400 uppercase tracking-wider font-mono">
                Peddie School 2025–2026 Schedule & Hudl Film (9 Games)
              </div>
              {MOCK_GAMES.map(g => {
                const isCurrent = g.id === activeGame.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => {
                      setShowGameSelector(false);
                      router.push(`/dashboard/film-room/${g.id}`);
                    }}
                    className={`w-full p-2.5 rounded-lg text-left transition-all flex items-center justify-between ${
                      isCurrent
                        ? 'bg-amber-500/20 text-white border border-amber-400/40'
                        : 'hover:bg-white/5 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-white">
                        {g.title}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {g.date} · {g.plays.length} Analyzed Plays
                      </div>
                    </div>
                    {isCurrent && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Links to Player Tracker & Analytics */}
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/players/${activeGame.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-white/10 transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            Player Tracker
          </Link>
          <Link
            href={`/dashboard/analytics/${activeGame.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-white/10 transition-colors"
          >
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            Analytics
          </Link>
        </div>
      </div>

      {/* Main Film Room Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Video Player with Real-Time Ball & 22-Player Tracking Overlay */}
        <div className="flex-1 flex flex-col p-4 min-w-0 overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <VideoPlayer />
          </div>
        </div>

        {/* Right: Play-by-Play Ledger & Coaching Feed */}
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
              All Plays ({activeGame.plays.length})
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
    </div>
  );
}
