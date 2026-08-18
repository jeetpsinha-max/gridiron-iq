'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight,
  ChevronDown, Search, Eye, EyeOff, Navigation, Shield, Users,
  Sparkles, TrendingUp, Film, CheckCircle2, MessageSquare, Target,
  Zap, Compass, PlayCircle, RotateCw, Repeat, Radio, Gauge,
  Tv, SplitSquareVertical, Video
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

  const getBallPosition = (ball: BallTrajectory) => {
    const { preSnap, mesh, inAirOrTuck, playEnd: endPt } = ball;
    const meshPt = mesh ?? preSnap;
    if (phase === 'preSnap') {
      return preSnap;
    } else if (phase === 'motion') {
      return preSnap;
    } else if (phase === 'snap') {
      return {
        x: preSnap.x + (meshPt.x - preSnap.x) * phaseProgress,
        y: preSnap.y + (meshPt.y - preSnap.y) * phaseProgress,
      };
    } else {
      if (phaseProgress < 0.5) {
        const subProgress = phaseProgress / 0.5;
        return {
          x: meshPt.x + (inAirOrTuck.x - meshPt.x) * subProgress,
          y: meshPt.y + (inAirOrTuck.y - meshPt.y) * subProgress,
        };
      } else {
        const subProgress = (phaseProgress - 0.5) / 0.5;
        return {
          x: inAirOrTuck.x + (endPt.x - inAirOrTuck.x) * subProgress,
          y: inAirOrTuck.y + (endPt.y - inAirOrTuck.y) * subProgress,
        };
      }
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {/* 1. Line of Scrimmage (Blue) & 1st Down Line (Yellow) */}
      <div
        className="absolute left-0 right-0 h-[2px] bg-blue-500/80 shadow-[0_0_8px_rgba(59,130,246,0.8)] z-0"
        style={{ top: `${trackingData.lineOfScrimmageY}%` }}
      >
        <span className="absolute left-2 -top-4 text-[9px] font-mono font-bold text-blue-400 bg-slate-950/80 px-1 rounded border border-blue-500/30">
          LOS {activePlay.yardLine}
        </span>
      </div>

      <div
        className="absolute left-0 right-0 h-[2px] bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)] z-0"
        style={{ top: `${trackingData.firstDownY}%` }}
      >
        <span className="absolute right-2 -top-4 text-[9px] font-mono font-bold text-amber-300 bg-slate-950/80 px-1 rounded border border-amber-400/30">
          1ST DOWN ({activePlay.distance} YDS)
        </span>
      </div>

      {/* 2. Defensive Coverage Shell Shading / Zones */}
      {showCoverage && (
        <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none">
          {trackingData.defense.map((d, i) => {
            const pos = getPlayerPosition(d);
            return (
              <circle
                key={`cov-${i}`}
                cx={`${pos.x}%`}
                cy={`${pos.y}%`}
                r="35"
                fill={d.position === 'CB' ? 'rgba(239, 68, 68, 0.15)' : d.position === 'FS' || d.position === 'SS' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(245, 158, 11, 0.12)'}
                stroke={d.position === 'CB' ? '#ef4444' : d.position === 'FS' || d.position === 'SS' ? '#a855f7' : '#f59e0b'}
                strokeWidth="1"
                strokeDasharray="4 2"
              />
            );
          })}
        </svg>
      )}

      {/* 3. Pre-Snap Motion & Route Vectors */}
      {showVectors && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {trackingData.offense.map((o, i) => {
            const { trajectory } = o;
            return (
              <g key={`vec-${i}`}>
                <line
                  x1={`${trajectory.snap.x}%`}
                  y1={`${trajectory.snap.y}%`}
                  x2={`${trajectory.postSnap.x}%`}
                  y2={`${trajectory.postSnap.y}%`}
                  stroke={o.isMotionPlayer ? '#f59e0b' : '#38bdf8'}
                  strokeWidth="2.5"
                  strokeDasharray={o.isMotionPlayer ? '4 3' : undefined}
                  opacity="0.8"
                />
                <circle
                  cx={`${trajectory.postSnap.x}%`}
                  cy={`${trajectory.postSnap.y}%`}
                  r="3.5"
                  fill={o.isMotionPlayer ? '#f59e0b' : '#38bdf8'}
                />
              </g>
            );
          })}
        </svg>
      )}

      {/* 4. Offense Players (11 O's - Gold / Blue Glow) */}
      {trackingData.offense.map((player) => {
        const pos = getPlayerPosition(player);
        const isTarget = player.jerseyNumber === activePlay.targetPlayerJersey;
        return (
          <div
            key={player.id}
            className={`absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 transition-all duration-75 ${
              player.isMotionPlayer ? 'z-30' : 'z-20'
            }`}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black font-mono shadow-lg transition-transform ${
                player.isMotionPlayer
                  ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 ring-offset-2 ring-offset-slate-950 scale-110 animate-pulse'
                  : isTarget
                  ? 'bg-emerald-400 text-slate-950 ring-2 ring-emerald-200 ring-offset-2 ring-offset-slate-950 scale-110'
                  : 'bg-blue-600 text-white ring-1 ring-blue-300'
              }`}
            >
              {player.jerseyNumber}
            </div>

            {showLabels && (
              <span className="text-[8px] font-bold text-white font-mono bg-slate-950/80 px-1 rounded shadow mt-0.5 whitespace-nowrap">
                {player.name.split(' ')[1] || player.name} ({player.position})
              </span>
            )}
          </div>
        );
      })}

      {/* 5. Defense Players (11 X's - Crimson / Amber) */}
      {trackingData.defense.map((player) => {
        const pos = getPlayerPosition(player);
        return (
          <div
            key={player.id}
            className="absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 transition-all duration-75 z-20"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            <div className="w-6 h-6 rounded-md bg-rose-600 text-white ring-1 ring-rose-400 flex items-center justify-center text-[9px] font-black font-mono shadow-md">
              {player.jerseyNumber}
            </div>

            {showLabels && (
              <span className="text-[8px] font-bold text-rose-300 font-mono bg-slate-950/80 px-1 rounded shadow mt-0.5 whitespace-nowrap">
                {player.position}
              </span>
            )}
          </div>
        );
      })}

      {/* 6. Real-Time Football (🏈) Trajectory Animation */}
      {showBall && trackingData.ball && (
        (() => {
          const ballPos = getBallPosition(trackingData.ball);
          return (
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 z-40 transition-all duration-75 pointer-events-none"
              style={{ left: `${ballPos.x}%`, top: `${ballPos.y}%` }}
            >
              <div className="relative flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-amber-400/30 animate-ping absolute" />
                <span className="text-base filter drop-shadow-[0_0_8px_rgba(251,191,36,1)] select-none">
                  🏈
                </span>
              </div>
            </div>
          );
        })()
      )}
    </div>
  );
}

// ============================================================================
// 2. Upgraded Video Player with Highlights & All-22 Toggle
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
  const videoElementRef = useRef<HTMLVideoElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<{ x: number; y: number }[]>([]);

  // View Mode: 'VIDEO' (Actual Game Highlights / Film), 'TACTICAL' (All-22 X's & O's), 'SPLIT' (Side-by-Side Dual View)
  const [filmViewMode, setFilmViewMode] = useState<'VIDEO' | 'TACTICAL' | 'SPLIT'>('VIDEO');

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

  // Video Element Synchronization
  useEffect(() => {
    if (!videoElementRef.current) return;
    if (isPlaying) {
      videoElementRef.current.play().catch(() => {});
    } else {
      videoElementRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!videoElementRef.current) return;
    if (Math.abs(videoElementRef.current.currentTime - currentTime) > 0.4) {
      videoElementRef.current.currentTime = currentTime;
    }
    videoElementRef.current.playbackRate = playbackRate;
  }, [currentTime, playbackRate]);

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
      {/* Video Viewport / Dual Split / Canvas Stack */}
      <div className="relative flex-1 bg-slate-900 overflow-hidden flex items-center justify-center">
        {/* VIEW MODE CONTAINER */}
        <div className="absolute inset-0 flex">
          {/* 1. ACTUAL VIDEO FILM / HIGHLIGHTS VIEW */}
          {(filmViewMode === 'VIDEO' || filmViewMode === 'SPLIT') && (
            <div className={`relative h-full bg-black flex items-center justify-center overflow-hidden ${
              filmViewMode === 'SPLIT' ? 'w-1/2 border-r border-white/20' : 'w-full'
            }`}>
              <video
                ref={videoElementRef}
                src={activeGame?.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
                className="w-full h-full object-cover"
                muted
                playsInline
                onTimeUpdate={(e) => {
                  if (isPlaying) {
                    setCurrentTime((e.target as HTMLVideoElement).currentTime);
                  }
                }}
              />

              {/* Broadcast Match Overlay Pill on Actual Video */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-white/15 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-bold text-white font-mono uppercase tracking-wider">
                  HUDL VARSITY HIGHLIGHTS · {activeGame?.title || 'Peddie Football Film'}
                </span>
              </div>
            </div>
          )}

          {/* 2. TACTICAL ALL-22 (X's & O's) VIEW */}
          {(filmViewMode === 'TACTICAL' || filmViewMode === 'SPLIT') && (
            <div className={`relative h-full bg-gradient-to-b from-[#0a2215] via-[#0d2e1c] to-[#0a2215] flex items-center justify-center overflow-hidden ${
              filmViewMode === 'SPLIT' ? 'w-1/2' : 'w-full'
            }`}>
              <svg viewBox="0 0 1000 560" className="absolute inset-0 w-full h-full opacity-35 pointer-events-none">
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

        {/* Top Situational Scoreboard & Game Status HUD */}
        <div className="absolute top-3 left-4 right-4 flex items-center justify-between z-30 pointer-events-auto">
          {/* Live Scoreboard Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/85 border border-white/15 backdrop-blur-md shadow-xl">
            <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider font-mono">
              HUDL FALCON-VISION
            </span>
            {activePlay ? (
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-white">
                <span className={activePlay.unit === 'DEFENSE' ? 'text-emerald-400' : 'text-indigo-400'}>
                  {activePlay.unit === 'DEFENSE' ? '🛡️ PEDDIE DEFENSE' : '⚔️ PEDDIE OFFENSE'}
                </span>
                <span className="text-slate-500">|</span>
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

          {/* VIEW MODE TOGGLE SWITCH (🎥 Highlights vs 🏈 All-22 vs 🔀 Split) */}
          <div className="flex items-center gap-1 bg-slate-950/90 border border-white/20 p-1 rounded-xl shadow-xl backdrop-blur-md font-mono text-xs">
            <button
              onClick={() => setFilmViewMode('VIDEO')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
                filmViewMode === 'VIDEO'
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Watch Actual Game Video Highlights"
            >
              <Video className="w-3.5 h-3.5" />
              <span>🎥 Highlights Film</span>
            </button>

            <button
              onClick={() => setFilmViewMode('TACTICAL')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
                filmViewMode === 'TACTICAL'
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="All-22 X's and O's Tactical Schematic"
            >
              <Users className="w-3.5 h-3.5" />
              <span>🏈 All-22 (X's & O's)</span>
            </button>

            <button
              onClick={() => setFilmViewMode('SPLIT')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
                filmViewMode === 'SPLIT'
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Split Screen: Side-by-Side Video & Schematic"
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span>🔀 Split Screen</span>
            </button>
          </div>
        </div>

        {/* Floating Tactical Layer Toggles (Shown when Tactical or Split is active) */}
        {(filmViewMode === 'TACTICAL' || filmViewMode === 'SPLIT') && (
          <div className="absolute top-14 left-4 flex flex-col gap-1.5 z-30 font-mono">
            <button
              onClick={() => setShowBall(!showBall)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all shadow-md backdrop-blur-md border ${
                showBall
                  ? 'bg-amber-500 text-slate-950 border-amber-300'
                  : 'bg-slate-900/80 text-slate-300 border-white/10 hover:bg-slate-800'
              }`}
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
        )}

        {/* Live Telemetry & AI Coach HUD Floating Card (Top Right) */}
        {activePlay && (
          <div className="absolute top-14 right-4 z-30 font-mono flex flex-col gap-2 max-w-xs pointer-events-auto">
            <div className="bg-slate-950/90 border border-white/15 rounded-xl p-3 backdrop-blur-md shadow-2xl space-y-2">
              <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5" /> Live HUD Telemetry
                </span>
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                  activePlay.epa >= 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {activePlay.epa >= 0 ? `+${activePlay.epa.toFixed(2)} EPA` : `${activePlay.epa.toFixed(2)} EPA`}
                </span>
              </div>

              {/* Motion & Concept Metrics */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-white/5 p-1.5 rounded-lg border border-white/5">
                  <span className="text-[9px] text-slate-400 uppercase block">Pre-Snap Motion</span>
                  <span className="font-bold text-cyan-300 flex items-center gap-1">
                    {activePlay.motionType !== 'NONE' ? (
                      <>
                        <Zap className="w-3 h-3 text-amber-400 animate-pulse" />
                        {activePlay.motionType} ({activePlay.motionDirection || 'DIR'})
                      </>
                    ) : (
                      'STATIC SET'
                    )}
                  </span>
                </div>

                <div className="bg-white/5 p-1.5 rounded-lg border border-white/5">
                  <span className="text-[9px] text-slate-400 uppercase block">Coverage Shell</span>
                  <span className="font-bold text-amber-300">
                    {activePlay.coverageScheme.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Playmaker & Target Highlight */}
              <div className="bg-white/5 p-2 rounded-lg border border-white/5 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase block">
                    {activePlay.unit === 'DEFENSE' ? 'Defensive Stop / Impact' : 'Target / Primary Ballcarrier'}
                  </span>
                  <span className="font-bold text-white">
                    {activePlay.unit === 'DEFENSE'
                      ? (activePlay.defensivePlayMakerName ? `#${activePlay.defensivePlayMakerJersey} ${activePlay.defensivePlayMakerName}` : 'Team Swarm Defense')
                      : (activePlay.targetPlayerJersey ? `#${activePlay.targetPlayerJersey} Target` : 'Falcons Backfield')}
                  </span>
                </div>
                {activePlay.motionType !== 'NONE' && (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    +0.82 Motion Lift
                  </span>
                )}
              </div>

              {/* Direct Link to Offensive Coach Counter */}
              <Link
                href={`/dashboard/offensive-coach/${activeGame?.id || 'peddie-blair-2025'}`}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs transition-all shadow-md hover:shadow-amber-500/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Coach Counter Synthesizer →</span>
              </Link>
            </div>
          </div>
        )}

        {/* Bottom Play Concept Description Bar */}
        {activePlay && (
          <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 border border-white/10 rounded-lg p-2.5 z-20 backdrop-blur-md shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2 font-mono">
                  <span>{activePlay.trackingData?.playConceptName || activePlay.offensiveFormation}</span>
                  {activePlay.unit === 'DEFENSE' && activePlay.defensivePlayMakerName && (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                      PLAYMAKER: #{activePlay.defensivePlayMakerJersey} {activePlay.defensivePlayMakerName} ({activePlay.defensivePlayType})
                    </span>
                  )}
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
                    : p.unit === 'DEFENSE'
                    ? 'w-2.5 h-2.5 rounded-full bg-emerald-400 ring-1 ring-emerald-200 z-15'
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
        <div className="flex items-center justify-between flex-wrap gap-2 font-mono">
          {/* Play-by-Play Step Controls & Precision Jogging */}
          <div className="flex items-center gap-1.5">
            {/* Prev Play */}
            <button
              onClick={handlePrevPlay}
              disabled={currentPlayIndex <= 0}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 hover:bg-slate-800 disabled:opacity-40 text-slate-200 text-xs font-bold transition-all"
              title="Previous Play (Hotkeys: [ or P)"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Prev</span>
            </button>

            {/* Instant Replay (-3s) */}
            <button
              onClick={() => setCurrentTime(Math.max(0, currentTime - 3))}
              className="px-2 py-1.5 rounded-lg bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-all"
              title="Replay 3 Seconds (Hotkey: J)"
            >
              -3s
            </button>

            {/* Jog -0.1s */}
            <button
              onClick={() => setCurrentTime(Math.max(0, currentTime - 0.1))}
              className="px-1.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-400 hover:text-white text-[10px] font-bold transition-all"
              title="Frame Step Back"
            >
              ◀ 0.1s
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-md mx-1"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            {/* Jog +0.1s */}
            <button
              onClick={() => setCurrentTime(Math.min(gameDuration, currentTime + 0.1))}
              className="px-1.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-400 hover:text-white text-[10px] font-bold transition-all"
              title="Frame Step Forward"
            >
              0.1s ▶
            </button>

            {/* Next Play */}
            <button
              onClick={handleNextPlay}
              disabled={currentPlayIndex >= plays.length - 1}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 hover:bg-slate-800 disabled:opacity-40 text-slate-200 text-xs font-bold transition-all"
              title="Next Play (Hotkeys: ] or N)"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Current Timestamp */}
            <span className="text-xs text-slate-400 ml-2">
              {formatTime(currentTime)} / {formatTime(gameDuration)}
            </span>
          </div>

          {/* Sequential Play Control Toggles (Loop, Auto-Advance, Speed) */}
          <div className="flex items-center gap-2">
            {/* Auto-Advance Toggle */}
            <button
              onClick={() => {
                setAutoAdvance(!autoAdvance);
                if (!autoAdvance) setLoopPlay(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                autoAdvance
                  ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                  : 'bg-slate-900 text-slate-400 border-white/10 hover:text-white'
              }`}
              title="Automatically advance to the next play when the current play clip ends"
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>Auto-Advance</span>
            </button>

            {/* Loop Play Toggle */}
            <button
              onClick={() => {
                setLoopPlay(!loopPlay);
                if (!loopPlay) setAutoAdvance(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                loopPlay
                  ? 'bg-amber-500 text-slate-950 border-amber-300'
                  : 'bg-slate-900 text-slate-400 border-white/10 hover:text-white'
              }`}
              title="Loop the current play clip repeatedly"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Loop Play</span>
            </button>

            {/* Playback Speed Menu */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 border border-white/10 text-xs font-bold text-slate-300 hover:text-white"
              >
                <Gauge className="w-3.5 h-3.5 text-amber-400" />
                <span>{playbackRate}x</span>
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-full right-0 mb-1 bg-slate-900 border border-white/15 rounded-lg p-1 shadow-2xl z-50 flex flex-col gap-0.5">
                  {speedOptions.map((rate) => (
                    <button
                      key={rate}
                      onClick={() => {
                        setPlaybackRate(rate);
                        setShowSpeedMenu(false);
                      }}
                      className={`px-3 py-1 rounded text-xs text-left font-bold transition-colors ${
                        playbackRate === rate
                          ? 'bg-amber-400 text-slate-950'
                          : 'text-slate-300 hover:bg-white/10'
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
        <div className="flex items-center gap-2 font-bold text-sm text-white font-mono">
          <Target className="w-4 h-4 text-amber-400" />
          Play-by-Play Ledger ({filtered.length} / {plays.length} Plays)
        </div>
        <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
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
            All ({plays.length})
          </button>
          <button
            onClick={() => setUnitFilter('OFFENSE')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
              unitFilter === 'OFFENSE' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            ⚔️ Off ({plays.filter(p => p.unit === 'OFFENSE').length})
          </button>
          <button
            onClick={() => setUnitFilter('DEFENSE')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
              unitFilter === 'DEFENSE' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            🛡️ Def ({plays.filter(p => p.unit === 'DEFENSE').length})
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
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 border border-white/10 rounded-lg font-mono">
      <div className="p-3 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-2 font-bold text-sm text-white">
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          Coaching Thread & Notes
        </div>
        <span className="text-[11px] text-slate-400">
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
              <span className="text-[10px] text-cyan-400">
                {formatTime(comment.timestamp)}
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
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
  const gameId = (params?.id as string) || 'peddie-blair-2025';
  const { setActiveGame, activeGame } = useGridironStore();

  const [activeTab, setActiveTab] = useState<'plays' | 'notes'>('plays');

  useEffect(() => {
    setActiveGame(gameId);
  }, [gameId, setActiveGame]);

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-[#07070d] text-slate-100 overflow-hidden">
      {/* Top Header Bar */}
      <div className="border-b border-white/10 bg-slate-950/80 px-6 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-mono">
            <Film className="w-4 h-4 text-amber-400" />
            <h1 className="text-sm font-black text-white tracking-tight">
              HUDL ALL-22 FILM ROOM
            </h1>
          </div>

          {/* 9-Game Season Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-white/10 text-xs font-mono">
            <span className="text-slate-400 text-[10px]">GAME:</span>
            <select
              value={gameId}
              onChange={(e) => router.push(`/dashboard/film-room/${e.target.value}`)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-xs"
            >
              {MOCK_GAMES.map(g => (
                <option key={g.id} value={g.id} className="bg-slate-900 text-white">
                  {g.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Nav to Analytics & Players */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <Link
            href={`/dashboard/analytics/${gameId}`}
            className="px-3 py-1 rounded-lg bg-slate-900 border border-white/10 hover:border-amber-400/50 text-slate-300 hover:text-amber-300 font-bold transition-all flex items-center gap-1"
          >
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            <span>ML Analytics</span>
          </Link>
          <Link
            href={`/dashboard/players/${gameId}`}
            className="px-3 py-1 rounded-lg bg-slate-900 border border-white/10 hover:border-amber-400/50 text-slate-300 hover:text-amber-300 font-bold transition-all flex items-center gap-1"
          >
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>Player Tracker</span>
          </Link>
        </div>
      </div>

      {/* Main Content Layout: Left Video/Field Stack + Right Sidebar */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Left Video Player & Tactical Field Canvas (70% width) */}
        <div className="flex-1 h-full min-w-0">
          <VideoPlayer />
        </div>

        {/* Right Sidebar: Play-by-Play Ledger & Coaching Notes (30% width) */}
        <div className="w-96 flex flex-col h-full shrink-0 gap-3">
          {/* Sidebar Tab Switcher */}
          <div className="flex rounded-lg bg-slate-900 border border-white/10 p-0.5 text-xs font-mono">
            <button
              onClick={() => setActiveTab('plays')}
              className={`flex-1 py-1.5 rounded-md font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'plays'
                  ? 'bg-amber-400 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Plays ({activeGame?.plays.length || 0})</span>
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 py-1.5 rounded-md font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'notes'
                  ? 'bg-amber-400 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Coaching Notes</span>
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'plays' ? <PlayByPlayList /> : <CommentFeed />}
        </div>
      </div>
    </div>
  );
}
