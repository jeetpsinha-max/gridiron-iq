'use client';

import { useEffect, useState, useRef, useCallback, useMemo, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight,
  ChevronDown, Search, Eye, EyeOff, Navigation, Shield, Users,
  Sparkles, TrendingUp, Film, CheckCircle2, MessageSquare, Target,
  Zap, Compass, PlayCircle, RotateCw, Repeat, Radio, Gauge,
  Tv, SplitSquareVertical, Video, Flame, Award, Trophy, Globe,
  Volume2, VolumeX, Maximize2, AlertCircle, RefreshCw
} from 'lucide-react';
import { usePeddieSACStore } from '@/lib/store';
import { PlayAnalysis, TrackedPlayer, PlayTrackingData, BallTrajectory } from '@/types/football';
import {
  formatTime, getPlayTypeBadgeColor,
  getEpaColor,
} from '@/lib/utils';
import { TEAM_ROSTER, MOCK_GAMES } from '@/lib/mock-game-data';
import { useSeason } from '@/context/SeasonContext';
import { BroadcastHud } from '@/components/video-player/BroadcastHud';
import { SpatialCanvasOverlay } from '@/components/video-player/SpatialCanvasOverlay';
import { TelestrationSuite } from '@/components/video-player/TelestrationSuite';
import { discoveryEngine, IngestionLogMessage } from '@/lib/discovery-engine';
import { geminiWorkers } from '@/lib/agents/gemini-workers';
import { hudlCsvEngine } from '@/lib/hudl-csv-engine';

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
// 2. High-Definition Broadcast Turf & Play Highlight Simulator Engine
// ============================================================================

interface BroadcastHighlightCanvasProps {
  activePlay: PlayAnalysis;
  currentTime: number;
  isPlaying: boolean;
  gameDuration: number;
  highlightMode: boolean;
}

function BroadcastHighlightCanvas({
  activePlay,
  currentTime,
  isPlaying,
  gameDuration,
  highlightMode,
}: BroadcastHighlightCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const playStart = activePlay?.videoTimestampStart ?? 0;
  const playSnap = activePlay?.videoTimestampSnap ?? (playStart + 3);
  const playEnd = activePlay?.videoTimestampEnd ?? (playStart + 8);
  const playDuration = Math.max(playEnd - playStart, 1);
  const playProgress = Math.max(0, Math.min(1, (currentTime - playStart) / playDuration));

  // Determine play climax state (Touchdown, Sack, First Down, Stop)
  const isTouchdown = activePlay?.isTouchdown;
  const isSack = activePlay?.defensivePlayType === 'SACK' || activePlay?.playDescription.includes('SACK');
  const isTurnover = activePlay?.isTurnover || activePlay?.defensivePlayType === 'INT' || activePlay?.playDescription.includes('INTERCEPTION');
  const isFirstDown = activePlay?.isFirstDown && !isTouchdown;
  const isFourthDownStop = activePlay?.down === 4 && activePlay?.unit === 'DEFENSE' && !activePlay?.isFirstDown;

  // Render 60fps Broadcast Field and Realistic Player Motion
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;

      // 1. Stadium Turf Background with Realistic Mowed Grass Pattern
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#0a2e18');
      grad.addColorStop(0.5, '#0f3d20');
      grad.addColorStop(1, '#082413');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Alternating 5-Yard Mowed Turf Stripes
      const stripeCount = 10;
      for (let i = 0; i < stripeCount; i++) {
        if (i % 2 === 0) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
          ctx.fillRect(0, (h / stripeCount) * i, w, h / stripeCount);
        }
      }

      // 2. Field Markings & Yard Lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      for (let i = 1; i < stripeCount; i++) {
        const y = (h / stripeCount) * i;
        ctx.beginPath();
        ctx.moveTo(40, y);
        ctx.lineTo(w - 40, y);
        ctx.stroke();

        // Collegiate Hash Marks
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.moveTo(w * 0.38, y - 6);
        ctx.lineTo(w * 0.38, y + 6);
        ctx.moveTo(w * 0.62, y - 6);
        ctx.lineTo(w * 0.62, y + 6);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      }

      // 3. Yard Numbers (e.g. 10, 20, 30, 40, 50)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.font = 'bold 22px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const yardLabels = ['10', '20', '30', '40', '50', '40', '30', '20', '10'];
      yardLabels.forEach((num, idx) => {
        const y = (h / (yardLabels.length + 1)) * (idx + 1);
        ctx.fillText(num, 75, y);
        ctx.fillText(num, w - 75, y);
      });

      // 4. Line of Scrimmage (Blue) & First Down Marker (Gold)
      const losY = h * 0.55;
      const gainY = losY - (h * 0.22);

      // Blue Line of Scrimmage
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.85)';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#3b82f6';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(0, losY);
      ctx.lineTo(w, losY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Yellow First Down Line
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.9)';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(0, gainY);
      ctx.lineTo(w, gainY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 5. Draw Animated Offensive Formations & Player Routes
      const qbStartX = w * 0.5;
      const qbStartY = losY + 45;
      const qbDropback = Math.min(35, playProgress * 50);
      const qbCurX = qbStartX;
      const qbCurY = qbStartY + qbDropback;

      // Primary Target Receiver
      const targetStartX = w * 0.28;
      const targetStartY = losY + 10;
      const targetEndX = isTouchdown ? w * 0.35 : w * 0.32;
      const targetEndY = isTouchdown ? h * 0.12 : losY - (h * 0.35);

      const targetCurX = targetStartX + (targetEndX - targetStartX) * playProgress;
      const targetCurY = targetStartY + (targetEndY - targetStartY) * playProgress;

      // Draw Route Line
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(targetStartX, targetStartY);
      ctx.lineTo(targetEndX, targetEndY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Football Spiral Trajectory
      if (playProgress > 0.3) {
        const throwProgress = (playProgress - 0.3) / 0.7;
        const ballX = qbCurX + (targetCurX - qbCurX) * throwProgress;
        const ballY = qbCurY + (targetCurY - qbCurY) * throwProgress;
        const ballArc = Math.sin(throwProgress * Math.PI) * 40;

        // Ball Shadow on Turf
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(ballX, ballY, 8, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // 3D Parabolic Football with Gold Glow
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#854d0e';
        ctx.beginPath();
        ctx.ellipse(ballX, ballY - ballArc, 10, 6, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        // White Ball Laces
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(ballX - 3, ballY - ballArc - 2);
        ctx.lineTo(ballX + 3, ballY - ballArc + 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // 6. Draw Offensive Players (Navy/Gold Sprites)
      const offensivePositions = [
        { name: 'QB', num: activePlay?.targetPlayerJersey === 6 ? '6' : '15', x: qbCurX, y: qbCurY, isTarget: false },
        { name: 'WR1', num: activePlay?.targetPlayerJersey ? `${activePlay.targetPlayerJersey}` : '5', x: targetCurX, y: targetCurY, isTarget: true },
        { name: 'RB', num: '3', x: w * 0.58, y: losY + 45 + (playProgress * 20), isTarget: false },
        { name: 'WR2', num: '8', x: w * 0.78, y: losY - (playProgress * 80), isTarget: false },
        { name: 'TE', num: '4', x: w * 0.65, y: losY - (playProgress * 60), isTarget: false },
        { name: 'LT', num: '70', x: w * 0.42, y: losY + 10, isTarget: false },
        { name: 'LG', num: '54', x: w * 0.46, y: losY + 10, isTarget: false },
        { name: 'C', num: '63', x: w * 0.50, y: losY + 10, isTarget: false },
        { name: 'RG', num: '60', x: w * 0.54, y: losY + 10, isTarget: false },
        { name: 'RT', num: '72', x: w * 0.58, y: losY + 10, isTarget: false },
      ];

      offensivePositions.forEach((p) => {
        // Player Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(p.x, p.y + 12, 10, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Player Circle (Navy Blue / Gold Ring)
        ctx.fillStyle = p.isTarget ? '#10b981' : '#1e3a8a';
        ctx.strokeStyle = p.isTarget ? '#34d399' : '#f59e0b';
        ctx.lineWidth = p.isTarget ? 3 : 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Player Jersey Number
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.num, p.x, p.y);
      });

      // 7. Draw Defensive Players (Crimson Sprites with Coverage Vectors)
      const defPlaymakerJersey = activePlay?.defensivePlayMakerJersey;
      const defensivePositions = [
        { name: 'MLB', num: '10', x: w * 0.48, y: losY - 35 - (playProgress * (isSack ? 20 : -10)), isHavoc: defPlaymakerJersey === 10 },
        { name: 'WLB', num: '2', x: w * 0.38, y: losY - 35, isHavoc: defPlaymakerJersey === 2 },
        { name: 'DE', num: '70', x: w * 0.36, y: losY - 10, isHavoc: defPlaymakerJersey === 70 },
        { name: 'DT', num: '54', x: w * 0.46, y: losY - 8, isHavoc: defPlaymakerJersey === 54 },
        { name: 'DT', num: '77', x: w * 0.54, y: losY - 8, isHavoc: defPlaymakerJersey === 77 },
        { name: 'DE', num: '45', x: w * 0.64, y: losY - 10, isHavoc: defPlaymakerJersey === 45 },
        { name: 'CB1', num: '5', x: targetCurX + 15, y: targetCurY - 15, isHavoc: defPlaymakerJersey === 5 },
        { name: 'CB2', num: '14', x: w * 0.82, y: losY - 60, isHavoc: defPlaymakerJersey === 14 },
        { name: 'FS', num: '3', x: w * 0.45, y: losY - 120, isHavoc: defPlaymakerJersey === 3 },
        { name: 'SS', num: '8', x: w * 0.60, y: losY - 100, isHavoc: defPlaymakerJersey === 8 },
        { name: 'OLB', num: '21', x: w * 0.26, y: losY - 30, isHavoc: defPlaymakerJersey === 21 },
      ];

      defensivePositions.forEach((d) => {
        // Spotlight Havoc Playmaker (e.g. August Cassidy, Reed Oliver, Rocco Annunziata, Xzavier Torres)
        if (d.isHavoc) {
          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#34d399';
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.arc(d.x, d.y, 22 + Math.sin(Date.now() / 200) * 3, 0, Math.PI * 2);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(d.x, d.y + 11, 9, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Crimson Defender Circle
        ctx.fillStyle = '#dc2626';
        ctx.strokeStyle = d.isHavoc ? '#34d399' : '#fca5a5';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(d.x, d.y, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Number
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(d.num, d.x, d.y);
      });

      // 8. Dramatic Climax Popups at Play End (Touchdown / Sack / 4th Down Stop / Interception)
      if (playProgress > 0.75) {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (isTouchdown) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
          ctx.fillRect(w * 0.2, h * 0.38, w * 0.6, 70);
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 3;
          ctx.strokeRect(w * 0.2, h * 0.38, w * 0.6, 70);

          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 20;
          ctx.fillStyle = '#fbbf24';
          ctx.font = '900 28px sans-serif';
          ctx.fillText('🏈 TOUCHDOWN! +6 PTS', w * 0.5, h * 0.43);
          ctx.font = 'bold 13px monospace';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(`EXPLOSIVE SCORING DRIVE · EPA +${activePlay?.epa?.toFixed(2) || '2.80'}`, w * 0.5, h * 0.48);
        } else if (isSack) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
          ctx.fillRect(w * 0.2, h * 0.38, w * 0.6, 70);
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 3;
          ctx.strokeRect(w * 0.2, h * 0.38, w * 0.6, 70);

          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 20;
          ctx.fillStyle = '#f87171';
          ctx.font = '900 28px sans-serif';
          ctx.fillText('💥 SACK! DEFENSIVE HAVOC', w * 0.5, h * 0.43);
          ctx.font = 'bold 13px monospace';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(`PLAYMAKER: #${defPlaymakerJersey || '10'} ${activePlay?.defensivePlayMakerName || 'Peddie Defense'}`, w * 0.5, h * 0.48);
        } else if (isTurnover) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
          ctx.fillRect(w * 0.2, h * 0.38, w * 0.6, 70);
          ctx.strokeStyle = '#a855f7';
          ctx.lineWidth = 3;
          ctx.strokeRect(w * 0.2, h * 0.38, w * 0.6, 70);

          ctx.shadowColor = '#a855f7';
          ctx.shadowBlur = 20;
          ctx.fillStyle = '#c084fc';
          ctx.font = '900 28px sans-serif';
          ctx.fillText('🔒 TURNOVER! TAKEAWAY', w * 0.5, h * 0.43);
          ctx.font = 'bold 13px monospace';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(`INTERCEPTION FORCED BY #${defPlaymakerJersey || '5'}`, w * 0.5, h * 0.48);
        } else if (isFourthDownStop) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
          ctx.fillRect(w * 0.2, h * 0.38, w * 0.6, 70);
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 3;
          ctx.strokeRect(w * 0.2, h * 0.38, w * 0.6, 70);

          ctx.shadowColor = '#3b82f6';
          ctx.shadowBlur = 20;
          ctx.fillStyle = '#60a5fa';
          ctx.font = '900 26px sans-serif';
          ctx.fillText('🛑 4TH DOWN GOAL-LINE STAND!', w * 0.5, h * 0.43);
          ctx.font = 'bold 13px monospace';
          ctx.fillStyle = '#ffffff';
          ctx.fillText('TURNOVER ON DOWNS · FALCONS BALL', w * 0.5, h * 0.48);
        }
        ctx.restore();
      }
    };

    render();
  }, [activePlay, playProgress, isTouchdown, isSack, isTurnover, isFirstDown, isFourthDownStop]);

  return (
    <div className="relative w-full h-full bg-[#051c0e] flex items-center justify-center overflow-hidden">
      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        className="w-full h-full object-contain select-none"
      />
    </div>
  );
}

// ============================================================================
// 3. Upgraded Video Player with Highlights & All-22 Toggle
// ============================================================================

function VideoPlayer({
  initialPlayId,
  autoHighlight,
  autoStart,
}: {
  initialPlayId?: string | null;
  autoHighlight?: boolean;
  autoStart?: boolean;
}) {
  const {
    currentTime, isPlaying, playbackRate,
    setCurrentTime, setIsPlaying, setPlaybackRate,
    activePlay, activeGame, setActivePlay, seekToPlay,
    telestration,
  } = usePeddieSACStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const videoElementRef = useRef<HTMLVideoElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<{ x: number; y: number }[]>([]);

  // View Mode: 'VIDEO' (Actual Game Highlights / Film), 'TACTICAL' (All-22 X's & O's), 'SPLIT' (Side-by-Side Dual View)
  const [filmViewMode, setFilmViewMode] = useState<'VIDEO' | 'TACTICAL' | 'SPLIT'>('VIDEO');

  // Highlight Auto-Play Continuous Reel Mode
  const [highlightReelMode, setHighlightReelMode] = useState(autoHighlight || false);
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

  // Filter Highlight-worthy plays for Auto-Play Reel
  const highlightPlays = useMemo(() => {
    return plays.filter(p =>
      p.isTouchdown ||
      p.defensivePlayType === 'SACK' ||
      p.defensivePlayType === 'INT' ||
      p.defensivePlayType === 'GOAL_LINE_STAND' ||
      p.yardsGained >= 15 ||
      p.epa >= 2.0 ||
      p.down === 4
    );
  }, [plays]);

  // Compute Active Play Index
  const currentPlayIndex = useMemo(() => {
    if (!activePlay) return -1;
    return plays.findIndex(p => p.id === activePlay.id);
  }, [plays, activePlay]);

  // Previous and Next Play Handlers
  const handlePrevPlay = useCallback(() => {
    if (highlightReelMode) {
      const curHighlightIdx = highlightPlays.findIndex(p => p.id === activePlay?.id);
      if (curHighlightIdx > 0) {
        const prevH = highlightPlays[curHighlightIdx - 1];
        setActivePlay(prevH.id);
        seekToPlay(prevH);
        return;
      }
    }
    if (currentPlayIndex > 0) {
      const prev = plays[currentPlayIndex - 1];
      setActivePlay(prev.id);
      seekToPlay(prev);
    }
  }, [highlightReelMode, highlightPlays, activePlay, currentPlayIndex, plays, setActivePlay, seekToPlay]);

  const handleNextPlay = useCallback(() => {
    if (highlightReelMode) {
      const curHighlightIdx = highlightPlays.findIndex(p => p.id === activePlay?.id);
      if (curHighlightIdx >= 0 && curHighlightIdx < highlightPlays.length - 1) {
        const nextH = highlightPlays[curHighlightIdx + 1];
        setActivePlay(nextH.id);
        seekToPlay(nextH);
        return;
      }
    }
    if (currentPlayIndex >= 0 && currentPlayIndex < plays.length - 1) {
      const next = plays[currentPlayIndex + 1];
      setActivePlay(next.id);
      seekToPlay(next);
    }
  }, [highlightReelMode, highlightPlays, activePlay, currentPlayIndex, plays, setActivePlay, seekToPlay]);

  // Handle Initial Query Param Selection (e.g. ?play=p-xxx)
  useEffect(() => {
    if (initialPlayId && plays.length > 0) {
      const matched = plays.find(p => p.id === initialPlayId);
      if (matched) {
        setActivePlay(matched.id);
        seekToPlay(matched);
        if (autoStart) {
          setIsPlaying(true);
        }
      }
    }
  }, [initialPlayId, plays, autoStart, setActivePlay, seekToPlay, setIsPlaying]);

  // Playback Loop & Auto-Advance / Loop Handler
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTime(Math.min(currentTime + 0.1 * playbackRate, gameDuration));
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying, currentTime, playbackRate, setCurrentTime, gameDuration]);

  // Check play boundary for Loop vs Auto-Advance vs Highlight Reel
  useEffect(() => {
    if (!activePlay || !isPlaying) return;
    if (currentTime >= activePlay.videoTimestampEnd) {
      if (highlightReelMode) {
        handleNextPlay();
      } else if (loopPlay) {
        setCurrentTime(activePlay.videoTimestampStart);
      } else if (autoAdvance) {
        handleNextPlay();
      } else {
        setIsPlaying(false);
      }
    }
  }, [currentTime, activePlay, isPlaying, highlightReelMode, loopPlay, autoAdvance, handleNextPlay, setCurrentTime, setIsPlaying]);

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
          {/* 1. ACTUAL VIDEO FILM / BROADCAST HIGHLIGHTS VIEW */}
          {(filmViewMode === 'VIDEO' || filmViewMode === 'SPLIT') && (
            <div className={`relative h-full bg-slate-950 flex items-center justify-center overflow-hidden ${
              filmViewMode === 'SPLIT' ? 'w-1/2 border-r border-white/20' : 'w-full'
            }`}>
              {/* Broadcast Highlight Simulator Canvas (Guaranteed 60fps interactive render) */}
              {activePlay && (
                <>
                  <BroadcastHighlightCanvas
                    activePlay={activePlay}
                    currentTime={currentTime}
                    isPlaying={isPlaying}
                    gameDuration={gameDuration}
                    highlightMode={highlightReelMode}
                  />
                  <BroadcastHud
                    play={activePlay as any}
                    playbackTimeSec={currentTime}
                    homeTeam="PEDDIE"
                    awayTeam={activeGame?.opponent?.toUpperCase() || 'OPPONENT'}
                    homeScore={activeGame?.homeScore ?? 28}
                    awayScore={activeGame?.awayScore ?? 14}
                    gameClock={activePlay?.gameClock || '10:45'}
                    quarter={activePlay?.quarter || 1}
                    pressureTimeSec={activePlay?.unit === 'DEFENSE' ? 2.1 : 3.2}
                  />
                </>
              )}

              {/* Live Playmaker Spotlight Overlay on Video */}
              {activePlay && (
                <div className="absolute bottom-6 left-4 z-20 max-w-md p-3 rounded-xl bg-slate-950/90 border border-white/15 backdrop-blur-md shadow-2xl space-y-1.5 font-mono">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                        {activePlay.unit === 'DEFENSE' ? '🛡️ DEFENSIVE HAVOC PLAYMAKER' : '⚔️ OFFENSIVE PLAYMAKER'}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      activePlay.epa >= 0 ? 'text-emerald-400 bg-emerald-500/20' : 'text-rose-400 bg-rose-500/20'
                    }`}>
                      {activePlay.epa >= 0 ? `+${activePlay.epa.toFixed(2)}` : activePlay.epa.toFixed(2)} EPA
                    </span>
                  </div>

                  <div className="text-xs font-bold text-white font-sans line-clamp-1">
                    {activePlay.unit === 'DEFENSE' && activePlay.defensivePlayMakerName ? (
                      <span className="text-emerald-300">
                        #{activePlay.defensivePlayMakerJersey} {activePlay.defensivePlayMakerName} ({activePlay.defensivePlayType})
                      </span>
                    ) : (
                      <span className="text-amber-300">
                        {activePlay.playDescription.split(':')[0] || activePlay.playDescription}
                      </span>
                    )}
                  </div>

                  <div className="text-[10px] text-slate-300 flex items-center gap-2 pt-1 border-t border-white/10">
                    <span>Q{activePlay.quarter} · {activePlay.gameClock}</span>
                    <span>·</span>
                    <span className="text-cyan-300 font-bold">{activePlay.down}&{activePlay.distance}</span>
                    <span>·</span>
                    <span>{activePlay.offensiveFormation}</span>
                    <span>·</span>
                    <span className="text-amber-300">{activePlay.coverageScheme}</span>
                  </div>
                </div>
              )}
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

        {/* Floating Tactical Layer Toggles */}
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
                      ? 'bg-purple-500/80 text-white border-purple-300'
                      : 'bg-slate-900/80 text-slate-300 border-white/10 hover:bg-slate-800'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  Coverage Zones
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Scrub Timeline & Scrub Bar */}
      <div className="p-3 bg-slate-950 border-t border-white/10 flex flex-col gap-2 shrink-0 select-none">
        <div
          ref={progressRef}
          onClick={handleProgressBarClick}
          className="relative w-full h-3 bg-slate-800 rounded-full overflow-hidden cursor-pointer group"
        >
          {/* Base Background Track */}
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full relative"
            style={{ width: `${progressPct}%` }}
          />

          {/* Active Play Highlight Span on Scrubber */}
          {activePlay && (
            <div
              className="absolute top-0 bottom-0 bg-amber-400/40 border-x border-amber-300"
              style={{
                left: `${(activePlay.videoTimestampStart / gameDuration) * 100}%`,
                width: `${Math.max(1.5, ((activePlay.videoTimestampEnd - activePlay.videoTimestampStart) / gameDuration) * 100)}%`,
              }}
            />
          )}

          {/* Scrubber Playhead Handle */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-lg border-2 border-amber-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{ left: `${progressPct}%` }}
          />
        </div>

        {/* Media Controls Toolbar */}
        <div className="flex items-center justify-between font-mono text-xs">
          {/* Left Play Controls */}
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
              className="p-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black transition-all shadow-md mx-1"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
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

          {/* Center: Highlights Reel Mode Button */}
          <button
            onClick={() => {
              setHighlightReelMode(!highlightReelMode);
              if (!highlightReelMode) {
                setIsPlaying(true);
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all border shadow-lg ${
              highlightReelMode
                ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 text-slate-950 border-amber-300 shadow-amber-500/30 animate-pulse'
                : 'bg-slate-900 text-amber-300 border-amber-500/30 hover:border-amber-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>{highlightReelMode ? '🌟 AUTO-HIGHLIGHT REEL: ON' : '🌟 PLAY HIGHLIGHTS REEL'}</span>
          </button>

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
// 4. Play-by-Play Table Component with Highlight Category Filters
// ============================================================================

function PlayByPlayList() {
  const { activeGame, activePlay, setActivePlay, seekToPlay, setIsPlaying } = usePeddieSACStore();
  const plays = activeGame?.plays ?? [];

  const [highlightFilter, setHighlightFilter] = useState<'ALL' | 'HIGHLIGHTS' | 'TOUCHDOWNS' | 'EXPLOSIVE' | 'SACKS' | 'TURNOVERS' | 'FOURTH_DOWN'>('ALL');
  const [unitFilter, setUnitFilter] = useState<'ALL' | 'OFFENSE' | 'DEFENSE'>('ALL');
  const [quarterFilter, setQuarterFilter] = useState<'ALL' | 1 | 2 | 3 | 4>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    return plays.filter(p => {
      // Highlight filter
      if (highlightFilter === 'HIGHLIGHTS') {
        const isH = p.isTouchdown || p.defensivePlayType === 'SACK' || p.defensivePlayType === 'INT' || p.defensivePlayType === 'GOAL_LINE_STAND' || p.yardsGained >= 15 || p.epa >= 2.0 || p.down === 4;
        if (!isH) return false;
      } else if (highlightFilter === 'TOUCHDOWNS') {
        if (!p.isTouchdown) return false;
      } else if (highlightFilter === 'EXPLOSIVE') {
        if (p.yardsGained < 15) return false;
      } else if (highlightFilter === 'SACKS') {
        if (p.defensivePlayType !== 'SACK' && !p.playDescription.includes('SACK') && p.defensivePlayType !== 'TFL') return false;
      } else if (highlightFilter === 'TURNOVERS') {
        if (!p.isTurnover && p.defensivePlayType !== 'INT' && !p.playDescription.includes('INTERCEPTION') && !p.playDescription.includes('TURNOVER')) return false;
      } else if (highlightFilter === 'FOURTH_DOWN') {
        if (p.down !== 4) return false;
      }

      if (unitFilter !== 'ALL' && p.unit && p.unit !== unitFilter) return false;
      if (quarterFilter !== 'ALL' && p.quarter !== quarterFilter) return false;
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
  }, [plays, highlightFilter, unitFilter, quarterFilter, searchQuery]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 border border-white/10 rounded-lg">
      {/* Header with Play Count */}
      <div className="p-3 border-b border-white/10 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-sm text-white font-mono">
          <Target className="w-4 h-4 text-amber-400" />
          Play-by-Play Ledger ({filtered.length} / {plays.length} Plays)
        </div>
        <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
          Hudl Falcon-Vision
        </span>
      </div>

      {/* Highlight Category Filters */}
      <div className="p-2 border-b border-white/10 bg-slate-900/40 space-y-2">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search plays (e.g. Cassidy, Gaston, Oliver, TD, Sack)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1 text-xs bg-slate-950 border border-white/10 rounded-md text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
          />
        </div>

        {/* Highlight Quick Filters */}
        <div className="flex items-center gap-1 font-mono flex-wrap">
          <button
            onClick={() => setHighlightFilter('ALL')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
              highlightFilter === 'ALL' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Plays
          </button>
          <button
            onClick={() => setHighlightFilter('HIGHLIGHTS')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all flex items-center gap-1 ${
              highlightFilter === 'HIGHLIGHTS' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-amber-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            ⭐ Highlights
          </button>
          <button
            onClick={() => setHighlightFilter('TOUCHDOWNS')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
              highlightFilter === 'TOUCHDOWNS' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-emerald-400 hover:text-white'
            }`}
          >
            🏈 Touchdowns
          </button>
          <button
            onClick={() => setHighlightFilter('EXPLOSIVE')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
              highlightFilter === 'EXPLOSIVE' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-cyan-300 hover:text-white'
            }`}
          >
            💥 +15y Plays
          </button>
          <button
            onClick={() => setHighlightFilter('SACKS')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
              highlightFilter === 'SACKS' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-rose-300 hover:text-white'
            }`}
          >
            🛡️ Sacks & TFLs
          </button>
          <button
            onClick={() => setHighlightFilter('TURNOVERS')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
              highlightFilter === 'TURNOVERS' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-purple-300 hover:text-white'
            }`}
          >
            🔒 Takeaways
          </button>
        </div>
      </div>

      {/* Play Cards List */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/5 p-1 space-y-1">
        {filtered.map((play) => {
          const isCurrent = activePlay?.id === play.id;
          return (
            <div
              key={play.id}
              onClick={() => {
                setActivePlay(play.id);
                seekToPlay(play);
                setIsPlaying(true);
              }}
              className={`p-3 rounded-lg cursor-pointer transition-all ${
                isCurrent
                  ? 'bg-amber-500/15 border border-amber-400/50 shadow-md'
                  : 'hover:bg-slate-900 border border-transparent'
              }`}
            >
              <div className="flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-1.5">
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    play.unit === 'DEFENSE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-indigo-500/20 text-indigo-300'
                  }`}>
                    {play.unit === 'DEFENSE' ? 'DEF' : 'OFF'}
                  </span>
                  <span className="font-bold text-white">Q{play.quarter} ({play.gameClock})</span>
                  <span className="text-cyan-300 font-bold">{play.down}&{play.distance}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    play.epa >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                  }`}>
                    {play.epa >= 0 ? `+${play.epa.toFixed(2)}` : play.epa.toFixed(2)} EPA
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-200 mt-1 font-sans line-clamp-2 leading-relaxed">
                {play.playDescription}
              </p>

              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/5 font-mono text-[10px] text-slate-400">
                <div className="flex items-center gap-2">
                  <span>{play.offensiveFormation}</span>
                  <span>·</span>
                  <span className="text-amber-300">{play.coverageScheme}</span>
                </div>

                <button className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1">
                  <Play className="w-3 h-3 fill-current" />
                  <span>Watch</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// 5. Coaching Comment Feed Component
// ============================================================================

interface CoachingComment {
  id: string;
  playId: string;
  author: { name: string; role: string };
  text: string;
  createdAt: string;
}

function CommentFeed() {
  const { activePlay } = usePeddieSACStore();
  const [commentText, setCommentText] = useState('');
  const [localComments, setLocalComments] = useState<CoachingComment[]>([
    {
      id: 'c-1',
      playId: activePlay?.id || '',
      author: { name: 'Coach Pat Ruley', role: 'Head Coach' },
      text: 'Great pre-snap read and gap penetration by the front 7.',
      createdAt: new Date().toISOString(),
    }
  ]);

  const playComments = useMemo(() => {
    if (!activePlay) return [];
    return localComments.filter(c => c.playId === activePlay.id);
  }, [localComments, activePlay]);

  const handleSend = () => {
    if (!commentText.trim() || !activePlay) return;
    const newComment: CoachingComment = {
      id: `c-${Date.now()}`,
      playId: activePlay.id,
      author: { name: 'Coach Staff', role: 'Varsity Coach' },
      text: commentText.trim(),
      createdAt: new Date().toISOString(),
    };
    setLocalComments(prev => [newComment, ...prev]);
    setCommentText('');
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 border border-white/10 rounded-lg">
      <div className="p-3 border-b border-white/10 bg-slate-900/60 flex items-center justify-between font-mono">
        <div className="flex items-center gap-2 font-bold text-sm text-white">
          <MessageSquare className="w-4 h-4 text-amber-400" />
          Coaching Collaboration Notes
        </div>
        <span className="text-[10px] text-slate-400">
          {playComments.length} Notes
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {playComments.length === 0 ? (
          <p className="text-xs text-slate-500 font-sans italic text-center py-6">
            No coaching notes for this play yet. Add breakdown notes below.
          </p>
        ) : (
          playComments.map((c) => (
            <div key={c.id} className="p-2.5 rounded-lg bg-slate-900 border border-white/5 space-y-1 font-mono">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-amber-400">{c.author.name}</span>
                <span className="text-slate-500">{new Date(c.createdAt).toLocaleTimeString()}</span>
              </div>
              <p className="text-xs text-slate-200 font-sans">{c.text}</p>
            </div>
          ))
        )}
      </div>

      <div className="p-3 border-t border-white/10 bg-slate-900/60 font-mono">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Add coaching note (e.g. @#10_Cassidy A-gap read)..."
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
// 6. Main Film Room Content with SearchParams Handling & Suspense
// ============================================================================

function FilmRoomContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currentSeason, seasonMetadata, games, plays: allSeasonPlays } = useSeason();
  const gameId = (params?.id as string) || games[0]?.id || 'peddie-blair-2025';
  const { setActiveGame, activeGame } = usePeddieSACStore();

  const [activeTab, setActiveTab] = useState<'plays' | 'notes'>('plays');
  const [showDiscoveryLogs, setShowDiscoveryLogs] = useState(false);
  const [ingestionLogs, setIngestionLogs] = useState<IngestionLogMessage[]>([]);
  const [nlpQuery, setNlpQuery] = useState('');
  const [filteredPlaysCount, setFilteredPlaysCount] = useState<number | null>(null);

  const initialPlayId = searchParams.get('play');
  const autoHighlight = searchParams.get('highlight') === 'true';
  const autoStart = searchParams.get('autoplay') === 'true';

  useEffect(() => {
    setActiveGame(gameId);
  }, [gameId, setActiveGame]);

  useEffect(() => {
    const unsub = discoveryEngine.subscribe(logs => {
      setIngestionLogs(logs);
    });
    return unsub;
  }, []);

  const handleNlpSearch = async (queryText: string) => {
    if (!queryText.trim()) {
      setFilteredPlaysCount(null);
      return;
    }
    const filter = geminiWorkers.parseNaturalLanguageQuery(queryText);
    const gamePlays = activeGame?.plays || allSeasonPlays;
    const matched = geminiWorkers.filterPlays(gamePlays as any, filter);
    setFilteredPlaysCount(matched.length);
    discoveryEngine.addLog('INFO', `Gemini NLP Filter parsed: "${queryText}" -> ${matched.length} matching plays`);
  };

  const handleExportHudlCsv = () => {
    const gamePlays = activeGame?.plays || allSeasonPlays;
    const csvContent = hudlCsvEngine.exportEnrichedHudlCsv(gamePlays as any);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `peddie_${gameId}_enriched_hudl.csv`;
    a.click();
    URL.revokeObjectURL(url);
    discoveryEngine.addLog('SUCCESS', `Exported enriched Hudl CSV with EPA, Pressure, and Separation columns.`);
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-[#07070d] text-slate-100 overflow-hidden">
      {/* Top Header Bar */}
      <div className="border-b border-white/10 bg-slate-950/90 px-4 md:px-6 py-2 flex flex-col md:flex-row md:items-center justify-between gap-2.5 shrink-0">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 font-mono">
            <Film className="w-4 h-4 text-amber-400" />
            <h1 className="text-sm font-black text-white tracking-tight">
              HUDL ALL-22 FILM ROOM
            </h1>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
              {seasonMetadata.shortLabel}
            </span>
          </div>

          {/* Season Games Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-white/10 text-xs font-mono">
            <span className="text-slate-400 text-[10px]">GAME:</span>
            <select
              value={gameId}
              onChange={(e) => router.push(`/dashboard/film-room/${e.target.value}?season=${currentSeason}`)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-xs max-w-[180px] truncate"
            >
              {games.map(g => (
                <option key={g.id} value={g.id} className="bg-slate-900 text-white">
                  {g.title}
                </option>
              ))}
            </select>
          </div>

          {/* NLP Natural Language Film Search */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-white/10 px-2.5 py-1 rounded-lg text-xs font-mono max-w-sm flex-1">
            <Search className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <input
              type="text"
              placeholder="Search: 3rd & med vs Cover 3, pressure <2.5s..."
              value={nlpQuery}
              onChange={(e) => setNlpQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleNlpSearch(nlpQuery)}
              className="bg-transparent text-white text-xs placeholder-slate-500 focus:outline-none w-full"
            />
            {filteredPlaysCount !== null && (
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded font-bold shrink-0">
                {filteredPlaysCount} Plays
              </span>
            )}
          </div>
        </div>

        {/* Quick Nav Action Suite */}
        <div className="flex items-center gap-2 font-mono text-xs flex-wrap">
          <button
            onClick={() => setShowDiscoveryLogs(!showDiscoveryLogs)}
            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 hover:border-cyan-400/50 text-slate-300 hover:text-cyan-300 font-bold transition-all flex items-center gap-1"
            title="Toggle Live Real Data Discovery Logs"
          >
            <Radio className={`w-3.5 h-3.5 ${showDiscoveryLogs ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`} />
            <span>Telemetry Stream</span>
          </button>

          <button
            onClick={handleExportHudlCsv}
            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 hover:border-amber-400/50 text-slate-300 hover:text-amber-300 font-bold transition-all flex items-center gap-1"
            title="Export Enriched Hudl CSV"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>Hudl CSV</span>
          </button>

          <Link
            href="/dashboard/call-sheet"
            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 hover:border-emerald-400/50 text-slate-300 hover:text-emerald-300 font-bold transition-all flex items-center gap-1"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Call Sheet</span>
          </Link>

          <Link
            href="/dashboard/player-portal"
            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 hover:border-cyan-400/50 text-slate-300 hover:text-cyan-300 font-bold transition-all flex items-center gap-1"
          >
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>Player Portal</span>
          </Link>
        </div>
      </div>

      {/* Discovery & Ingestion Drawer (Collapsible) */}
      {showDiscoveryLogs && (
        <div className="bg-slate-950 border-b border-white/15 px-6 py-2.5 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-3 overflow-x-auto">
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/30 shrink-0 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              MAPL DISCOVERY ENGINE
            </span>
            <div className="text-[11px] text-slate-300 truncate max-w-xl">
              {ingestionLogs[0]?.message || 'Listening for authentic Peddie Football telemetry feeds across MaxPreps & Hudl...'}
            </div>
          </div>
          <button
            onClick={() => discoveryEngine.discoverSeasonData(currentSeason)}
            className="px-2.5 py-1 rounded bg-slate-900 border border-white/10 hover:border-amber-400 text-[10px] font-bold text-amber-300 shrink-0"
          >
            Re-Scrape Feeds
          </button>
        </div>
      )}

      {/* Main Content Layout: Left Video/Field Stack + Right Sidebar */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Left Video Player & Tactical Field Canvas (70% width) */}
        <div className="flex-1 h-full min-w-0">
          <VideoPlayer
            initialPlayId={initialPlayId}
            autoHighlight={autoHighlight}
            autoStart={autoStart}
          />
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

export default function FilmRoomPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-slate-950 flex items-center justify-center text-amber-400 font-mono text-xs">Loading Falcon-Vision Film Room...</div>}>
      <FilmRoomContent />
    </Suspense>
  );
}
