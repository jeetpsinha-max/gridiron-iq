'use client';

import React, { useState } from 'react';
import {
  Brain, Zap, Target, Shield, Award, Sparkles, CheckCircle2,
  ChevronRight, RefreshCw, Calculator, Compass, Flame, Play
} from 'lucide-react';

export function AntigravityTacticalHUD() {
  const [activeTab, setActiveTab] = useState<'COUNTER' | 'FOURTH_DOWN' | 'EPA'>('COUNTER');
  const [down, setDown] = useState<number>(3);
  const [distance, setDistance] = useState<number>(4);
  const [yardline, setYardline] = useState<number>(65); // 1 to 99
  const [coverage, setCoverage] = useState<string>('Cover 3 Sky');
  const [front, setFront] = useState<string>('4-3 Over');
  const [gain, setGain] = useState<number>(12);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);

  const handleQueryAgent = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/antigravity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: activeTab,
          down,
          distance,
          yardline,
          yardsGained: gain,
          coverageScheme: coverage,
          defensiveFront: front,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border border-indigo-500/30 rounded-2xl p-6 shadow-2xl shadow-indigo-950/40 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/25">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Brain className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">Google Antigravity Tactical Co-Pilot</h3>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                Live Agent
              </span>
            </div>
            <p className="text-xs text-slate-400">Autonomous Expected Points, 4th-Down Optimization & Coverage Counter Synthesis</p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs font-medium">
          <button
            onClick={() => { setActiveTab('COUNTER'); setResult(null); }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'COUNTER' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tactical Counter
          </button>
          <button
            onClick={() => { setActiveTab('FOURTH_DOWN'); setResult(null); }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'FOURTH_DOWN' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            4th-Down Model
          </button>
          <button
            onClick={() => { setActiveTab('EPA'); setResult(null); }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'EPA' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Play EPA Engine
          </button>
        </div>
      </div>

      {/* Control Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-5">
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1 block">Down & Distance</label>
          <div className="flex gap-2">
            <select
              value={down}
              onChange={(e) => setDown(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-full"
            >
              <option value={1}>1st Down</option>
              <option value={2}>2nd Down</option>
              <option value={3}>3rd Down</option>
              <option value={4}>4th Down</option>
            </select>
            <input
              type="number"
              min={1}
              max={30}
              value={distance}
              onChange={(e) => setDistance(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-20 text-center"
              placeholder="Yds"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-400 mb-1 block">Field Position (Yardline)</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={1}
              max={99}
              value={yardline}
              onChange={(e) => setYardline(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
            <span className="text-xs font-mono font-bold bg-slate-950 px-2 py-1.5 rounded-lg border border-slate-800 text-indigo-300 min-w-[50px] text-center">
              {yardline > 50 ? `Opp ${100 - yardline}` : `Own ${yardline}`}
            </span>
          </div>
        </div>

        {activeTab === 'COUNTER' && (
          <>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Defensive Coverage</label>
              <select
                value={coverage}
                onChange={(e) => setCoverage(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-full"
              >
                <option value="Cover 3 Sky">Cover 3 Sky</option>
                <option value="Cover 2 Tampa">Cover 2 Tampa</option>
                <option value="Cover 1 Man Free">Cover 1 Man Free</option>
                <option value="Cover 0 Blitz">Cover 0 Zero Blitz</option>
                <option value="Cover 4 Quarters">Cover 4 Quarters</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Defensive Front</label>
              <select
                value={front}
                onChange={(e) => setFront(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-full"
              >
                <option value="4-3 Over">4-3 Over</option>
                <option value="3-4 Odd Tite">3-4 Odd Tite</option>
                <option value="Nickel 4-2-5">Nickel 4-2-5</option>
                <option value="Dime 3-2-6">Dime 3-2-6</option>
                <option value="Bear 5-2 Front">Bear 5-2 Front</option>
              </select>
            </div>
          </>
        )}

        {activeTab === 'EPA' && (
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1 block">Play Yards Gained</label>
            <input
              type="number"
              min={-20}
              max={99}
              value={gain}
              onChange={(e) => setGain(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-full"
            />
          </div>
        )}

        {activeTab === 'FOURTH_DOWN' && (
          <div className="flex items-end">
            <button
              onClick={handleQueryAgent}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
              Evaluate 4th-Down
            </button>
          </div>
        )}
      </div>

      {activeTab !== 'FOURTH_DOWN' && (
        <div className="flex justify-end mb-4">
          <button
            onClick={handleQueryAgent}
            disabled={loading}
            className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold text-xs py-2 px-5 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Execute Antigravity Reasoning
          </button>
        </div>
      )}

      {/* Reasoning Results Presentation */}
      {result && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 bg-slate-950/60 rounded-xl p-4 border border-indigo-500/20">
          {activeTab === 'COUNTER' && result.synthesizedCounterPlay && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Synthesized Counter Scheme
                </span>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  +{result.synthesizedCounterPlay.projectedEpa} Expected EPA
                </span>
              </div>
              <h4 className="text-base font-bold text-white">{result.synthesizedCounterPlay.conceptName}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 font-semibold block mb-1">Primary Read Target:</span>
                  <span className="text-slate-200">{result.synthesizedCounterPlay.primaryTarget}</span>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 font-semibold block mb-1">Secondary & Checkdown:</span>
                  <span className="text-slate-200">{result.synthesizedCounterPlay.secondaryTarget}</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 bg-indigo-950/30 p-3 rounded-lg border border-indigo-900/50">
                <strong className="text-indigo-300 font-semibold">Coaching Directive:</strong> {result.synthesizedCounterPlay.coachingNotes}
              </p>
            </div>
          )}

          {activeTab === 'FOURTH_DOWN' && result.rankedOptions && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  Optimal Recommendation:
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-500 text-white shadow-lg">
                  {result.recommendedAction.replace('_', ' ')}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {result.rankedOptions.map((opt: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border ${
                      idx === 0 ? 'bg-indigo-950/40 border-indigo-500/50' : 'bg-slate-900/50 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span className={idx === 0 ? 'text-indigo-300' : 'text-slate-400'}>{opt.action.replace('_', ' ')}</span>
                      <span className="font-mono text-emerald-400">{opt.expectedValue} EV</span>
                    </div>
                    <p className="text-[11px] text-slate-300">{opt.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'EPA' && result.epa !== undefined && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">EPA Play Outcome</span>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                  result.epa >= 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}>
                  {result.epa >= 0 ? `+${result.epa}` : result.epa} EPA
                </span>
              </div>
              <p className="text-sm font-semibold text-white">{result.description}</p>
              <div className="flex gap-4 text-xs font-mono text-slate-400">
                <span>EP Before: <strong className="text-slate-200">{result.epBefore}</strong></span>
                <span>EP After: <strong className="text-slate-200">{result.epAfter}</strong></span>
                <span>Play Success: <strong className={result.isSuccess ? 'text-emerald-400' : 'text-rose-400'}>{result.isSuccess ? 'YES' : 'NO'}</strong></span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
