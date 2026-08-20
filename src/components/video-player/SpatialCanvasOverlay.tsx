'use client';

// ============================================================================
// Peddie Football Analytics — Spatial Canvas Tracking & Telestration Overlay
// 60fps Broadcast Engine with Pressure Radar, Separation Vectors, and Telestrations
// ============================================================================

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { PlayAnalysisData, Point2D, TelestrationStroke } from '@/lib/data-schemas';

interface SpatialCanvasOverlayProps {
  play: PlayAnalysisData;
  playbackProgress: number; // 0.0 to 1.0 normalized progress of active play
  isPlaying: boolean;
  activeTool?: 'NONE' | 'PEN' | 'ARROW' | 'ZONE_BOX' | 'SPOTLIGHT';
  penColor?: string;
  onTelestrationAdd?: (stroke: TelestrationStroke) => void;
  externalStrokes?: TelestrationStroke[];
}

export function SpatialCanvasOverlay({
  play,
  playbackProgress,
  isPlaying,
  activeTool = 'NONE',
  penColor = '#f59e0b',
  onTelestrationAdd,
  externalStrokes = [],
}: SpatialCanvasOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentStroke, setCurrentStroke] = useState<Point2D[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  // Render loop
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    const losY = h * (play.yardLine / 100);
    const firstDownY = h * (Math.max(5, (play.yardLine - play.distance)) / 100);

    // 1. Draw Field Line of Scrimmage (Gold) & 1st Down Line (Cyan)
    ctx.save();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(0, losY);
    ctx.lineTo(w, losY);
    ctx.stroke();

    // 1st Down Line
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(0, firstDownY);
    ctx.lineTo(w, firstDownY);
    ctx.stroke();
    ctx.restore();

    // 2. Render 22-Player Formations (O's in Gold, X's in Crimson)
    const offensePositions = [
      { name: 'QB', num: '15', x: w * 0.50, y: losY + 45 - (playbackProgress * (play.playType === 'RUN' ? 15 : 5)) },
      { name: 'RB', num: '3', x: w * 0.42, y: losY + 50 - (playbackProgress * (play.playType === 'RUN' ? 60 : 20)) },
      { name: 'LT', num: '72', x: w * 0.38, y: losY + 12 },
      { name: 'LG', num: '54', x: w * 0.44, y: losY + 10 },
      { name: 'C', num: '60', x: w * 0.50, y: losY + 10 },
      { name: 'RG', num: '63', x: w * 0.56, y: losY + 10 },
      { name: 'RT', num: '70', x: w * 0.62, y: losY + 12 },
      { name: 'TE', num: '4', x: w * 0.68, y: losY + 10 - (playbackProgress * 40) },
      { name: 'WR1', num: '5', x: w * 0.18, y: losY + 5 - (playbackProgress * 70) },
      { name: 'WR2', num: '22', x: w * 0.82, y: losY + 5 - (playbackProgress * 85) },
      { name: 'SLOT', num: '21', x: w * 0.28, y: losY + 15 - (playbackProgress * 55) },
    ];

    const defensePositions = [
      { name: 'DE', num: '70', x: w * 0.34, y: losY - 10 + (playbackProgress * 25) },
      { name: 'DT', num: '54', x: w * 0.46, y: losY - 8 + (playbackProgress * 18) },
      { name: 'DT', num: '77', x: w * 0.54, y: losY - 8 + (playbackProgress * 18) },
      { name: 'DE', num: '45', x: w * 0.66, y: losY - 10 + (playbackProgress * 25) },
      { name: 'MLB', num: '10', x: w * 0.50, y: losY - 35 + (playbackProgress * ((play as any).defensivePlayType === 'SACK' ? 35 : 5)) },
      { name: 'WLB', num: '2', x: w * 0.38, y: losY - 35 },
      { name: 'SLB', num: '21', x: w * 0.62, y: losY - 35 },
      { name: 'CB1', num: '5', x: w * 0.18, y: losY - 50 - (playbackProgress * 65) },
      { name: 'CB2', num: '14', x: w * 0.82, y: losY - 50 - (playbackProgress * 75) },
      { name: 'FS', num: '3', x: w * 0.45, y: losY - 110 },
      { name: 'SS', num: '8', x: w * 0.58, y: losY - 90 },
    ];

    // Draw Pressure Radar Concentric Pulse around QB
    const qb = offensePositions[0];
    const pressureTime = play.spatialMetrics?.snapToPressureTimeSec ?? 2.4;
    const isPressureAlert = pressureTime < 2.2;

    ctx.save();
    ctx.strokeStyle = isPressureAlert ? 'rgba(239, 68, 68, 0.7)' : 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    const radarRadius = 35 + Math.sin(Date.now() / 150) * 8;
    ctx.beginPath();
    ctx.arc(qb.x, qb.y, radarRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Draw Separation Vector Lines between Target WR & Defender
    const targetWr = offensePositions.find(p => p.num === String(play.targetPlayerJersey || '22')) || offensePositions[9];
    const targetCb = defensePositions.find(p => p.num === '14') || defensePositions[8];

    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(targetWr.x, targetWr.y);
    ctx.lineTo(targetCb.x, targetCb.y);
    ctx.stroke();

    // Vector separation badge text
    const midX = (targetWr.x + targetCb.x) / 2;
    const midY = (targetWr.y + targetCb.y) / 2;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(midX - 28, midY - 10, 56, 20);
    ctx.strokeStyle = '#38bdf8';
    ctx.strokeRect(midX - 28, midY - 10, 56, 20);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${play.isTouchdown ? '4.8' : '2.4'} YDS`, midX, midY);
    ctx.restore();

    // Render Offense Players (Gold O's)
    offensePositions.forEach(o => {
      ctx.save();
      ctx.fillStyle = '#f59e0b';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(o.x, o.y, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(o.num, o.x, o.y);
      ctx.restore();
    });

    // Render Defense Players (Crimson X's)
    defensePositions.forEach(d => {
      ctx.save();
      const isHavoc = play.defensivePlayMakerJersey === parseInt(d.num, 10);
      ctx.fillStyle = isHavoc ? '#10b981' : '#ef4444';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = isHavoc ? 3 : 2;
      ctx.beginPath();
      ctx.arc(d.x, d.y, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(d.num, d.x, d.y);
      ctx.restore();
    });

    // 3. Render Telestration Strokes
    const allStrokes = [...externalStrokes];
    allStrokes.forEach(stroke => {
      if (stroke.points.length < 2) return;
      ctx.save();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      const p0 = stroke.points[0];
      ctx.moveTo((p0.x / 100) * w, (p0.y / 100) * h);
      for (let i = 1; i < stroke.points.length; i++) {
        const pt = stroke.points[i];
        ctx.lineTo((pt.x / 100) * w, (pt.y / 100) * h);
      }
      ctx.stroke();
      ctx.restore();
    });

    // Render live active drawing stroke
    if (currentStroke.length > 1) {
      ctx.save();
      ctx.strokeStyle = penColor;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      const p0 = currentStroke[0];
      ctx.moveTo((p0.x / 100) * w, (p0.y / 100) * h);
      for (let i = 1; i < currentStroke.length; i++) {
        const pt = currentStroke[i];
        ctx.lineTo((pt.x / 100) * w, (pt.y / 100) * h);
      }
      ctx.stroke();
      ctx.restore();
    }
  }, [play, playbackProgress, externalStrokes, currentStroke, penColor]);

  useEffect(() => {
    let animId: number;
    const loop = () => {
      render();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [render]);

  // Drawing Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'NONE') return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setIsDrawing(true);
    setCurrentStroke([{ x, y }]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || activeTool === 'NONE') return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCurrentStroke(prev => [...prev, { x, y }]);
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentStroke.length > 1 && onTelestrationAdd) {
      onTelestrationAdd({
        id: `stroke-${Date.now()}`,
        tool: activeTool === 'PEN' ? 'PEN' : 'ARROW',
        color: penColor,
        lineWidth: 4,
        points: currentStroke,
        timestamp: playbackProgress * 30,
      });
    }
    setCurrentStroke([]);
  };

  return (
    <canvas
      ref={canvasRef}
      width={1280}
      height={720}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={`absolute inset-0 w-full h-full object-contain ${
        activeTool !== 'NONE' ? 'cursor-crosshair z-20 pointer-events-auto' : 'pointer-events-none z-10'
      }`}
    />
  );
}
