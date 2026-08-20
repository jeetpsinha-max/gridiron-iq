'use client';

// ============================================================================
// Peddie Football Analytics — Broadcast Telestration & Frame-Step Toolbar
// Pen, Arrows, Route Curves, Pass Pro Zone Boxes, Clear Canvas, Playback Speeds
// ============================================================================

import React from 'react';
import {
  PenTool, ArrowRight, Square, Circle, Type, Trash2,
  Play, Pause, SkipBack, SkipForward, RotateCcw, FastForward
} from 'lucide-react';

interface TelestrationSuiteProps {
  activeTool: 'NONE' | 'PEN' | 'ARROW' | 'ZONE_BOX' | 'SPOTLIGHT';
  setActiveTool: (tool: 'NONE' | 'PEN' | 'ARROW' | 'ZONE_BOX' | 'SPOTLIGHT') => void;
  penColor: string;
  setPenColor: (color: string) => void;
  onClearCanvas: () => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStepFrame: (direction: 'prev' | 'next') => void;
  playbackRate: number;
  setPlaybackRate: (rate: number) => void;
}

const COLOR_PALETTE = [
  { name: 'Peddie Gold', color: '#f59e0b' },
  { name: 'Laser Cyan', color: '#06b6d4' },
  { name: 'Havoc Emerald', color: '#10b981' },
  { name: 'Pressure Red', color: '#ef4444' },
  { name: 'Pure White', color: '#ffffff' },
];

export function TelestrationSuite({
  activeTool,
  setActiveTool,
  penColor,
  setPenColor,
  onClearCanvas,
  isPlaying,
  onTogglePlay,
  onStepFrame,
  playbackRate,
  setPlaybackRate,
}: TelestrationSuiteProps) {
  return (
    <div className="flex items-center justify-between gap-3 bg-slate-950/90 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md shadow-xl text-xs font-mono">
      {/* Playback & Frame Transport */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onStepFrame('prev')}
          title="Step Back 1 Frame (1/30s)"
          className="p-1.5 rounded-lg bg-slate-900 border border-white/10 hover:border-amber-400/50 text-slate-300 hover:text-white transition-all"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          onClick={onTogglePlay}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold hover:scale-105 transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20"
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-slate-950" />}
          <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
        </button>

        <button
          onClick={() => onStepFrame('next')}
          title="Step Forward 1 Frame (1/30s)"
          className="p-1.5 rounded-lg bg-slate-900 border border-white/10 hover:border-amber-400/50 text-slate-300 hover:text-white transition-all"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        {/* Speed Selector */}
        <div className="flex items-center gap-1 ml-2 bg-slate-900 p-0.5 rounded-lg border border-white/10">
          {[0.25, 0.5, 0.75, 1.0].map(speed => (
            <button
              key={speed}
              onClick={() => setPlaybackRate(speed)}
              className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                playbackRate === speed ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      {/* Telestration Drawing Tools */}
      <div className="flex items-center gap-1.5">
        <span className="text-slate-500 text-[10px] uppercase font-bold mr-1">DRAW:</span>

        <button
          onClick={() => setActiveTool(activeTool === 'PEN' ? 'NONE' : 'PEN')}
          className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 ${
            activeTool === 'PEN'
              ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md'
              : 'bg-slate-900 text-slate-400 border-white/10 hover:text-white'
          }`}
          title="Freehand Vector Pen"
        >
          <PenTool className="w-3.5 h-3.5" />
          <span className="text-[11px] font-bold">Pen</span>
        </button>

        <button
          onClick={() => setActiveTool(activeTool === 'ARROW' ? 'NONE' : 'ARROW')}
          className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 ${
            activeTool === 'ARROW'
              ? 'bg-cyan-400 text-slate-950 border-cyan-300 shadow-md'
              : 'bg-slate-900 text-slate-400 border-white/10 hover:text-white'
          }`}
          title="Route Vector Arrow"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span className="text-[11px] font-bold">Arrow</span>
        </button>

        <button
          onClick={() => setActiveTool(activeTool === 'ZONE_BOX' ? 'NONE' : 'ZONE_BOX')}
          className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 ${
            activeTool === 'ZONE_BOX'
              ? 'bg-emerald-400 text-slate-950 border-emerald-300 shadow-md'
              : 'bg-slate-900 text-slate-400 border-white/10 hover:text-white'
          }`}
          title="Pass Protection Zone Box"
        >
          <Square className="w-3.5 h-3.5" />
          <span className="text-[11px] font-bold">Zone</span>
        </button>

        {/* Color Picker Swatches */}
        <div className="flex items-center gap-1 ml-2 pl-2 border-l border-white/10">
          {COLOR_PALETTE.map(c => (
            <button
              key={c.color}
              onClick={() => setPenColor(c.color)}
              title={c.name}
              className={`w-4 h-4 rounded-full border transition-all ${
                penColor === c.color ? 'scale-125 border-white ring-2 ring-amber-400/50' : 'border-black/50 opacity-70 hover:opacity-100'
              }`}
              style={{ backgroundColor: c.color }}
            />
          ))}
        </div>

        {/* Clear Canvas */}
        <button
          onClick={onClearCanvas}
          title="Clear Canvas Drawings (Shortcut: C)"
          className="p-1.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:bg-rose-900/60 transition-all ml-2 flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold">Clear (C)</span>
        </button>
      </div>
    </div>
  );
}
