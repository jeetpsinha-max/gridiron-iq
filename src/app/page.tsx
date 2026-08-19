'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload, Link, PlayCircle, ArrowRight, Video,
  Zap, BarChart3, Users, MessageSquare, Target,
  ChevronRight, Film, Sparkles, Shield, TrendingUp,
  Activity, Award
} from 'lucide-react';
import { usePeddieSACStore } from '@/lib/store';
import { MOCK_GAMES } from '@/lib/mock-game-data';
import { GameSession } from '@/types/football';
import { generateId } from '@/lib/utils';

export default function HomePage() {
  const router = useRouter();
  const addGame = usePeddieSACStore(s => s.addGame);
  const games = usePeddieSACStore(s => s.games);

  const [videoUrl, setVideoUrl] = useState('');
  const [title, setTitle] = useState('');
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleIngest = async () => {
    if (!videoUrl && !title) return;
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('videoUrl', videoUrl);
      formData.append('title', title || 'Peddie Falcons 2025 Film Session');
      formData.append('homeTeam', homeTeam || 'Peddie Falcons');
      formData.append('awayTeam', awayTeam || 'Opponent');

      const res = await fetch('/api/ingest', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.success) {
        // Auto-analyze with mock vision engine
        const analyzeRes = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoUrl: data.game.videoUrl, gameId: data.game.id }),
        });
        const analyzeData = await analyzeRes.json();

        const newGame: GameSession = {
          ...data.game,
          plays: analyzeData.plays ?? [],
          analysisStatus: 'COMPLETED',
          duration: 3600,
        };

        addGame(newGame);
        router.push(`/dashboard/film-room/${newGame.id}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
      setVideoUrl(URL.createObjectURL(file));
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
      setVideoUrl(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-screen bg-[#07070c] text-white relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-15%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[150px] pointer-events-none" />

      {/* Top Navigation */}
      <nav className="relative z-20 max-w-7xl mx-auto px-6 py-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Shield className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-tight text-white font-mono">Peddie Football Analytics</h1>
              <span className="px-2 py-0.5 rounded bg-amber-400/20 border border-amber-400/40 text-[10px] font-bold text-amber-300">
                2025–2026 PEDDIE FALCONS HUDL
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Sports Analytics & Coaching · AI-Powered Film Intelligence</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => router.push(`/dashboard/players/peddie-blair-2025`)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 border border-white/15 text-slate-200 font-bold text-xs hover:border-amber-400 hover:text-amber-300 transition-all shadow-md"
          >
            <Users className="w-4 h-4 text-amber-400" />
            2025–26 Player Tracker
          </button>
          {games.length > 0 && (
            <button
              onClick={() => router.push(`/dashboard`)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all shadow-md"
            >
              <Film className="w-4 h-4" />
              Go to Command Center
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </nav>

      {/* Main Hero & Ingestion Hub */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-12 pb-20">
        
        {/* Improved Home Screen HUD */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-12 animate-fade-in-up">
          <div className="p-4 rounded-xl bg-slate-900/40 border border-white/10 backdrop-blur-md hover:border-amber-400/30 transition-all flex flex-col justify-between group shadow-lg">
            <div>
              <div className="text-[10px] text-slate-400 font-mono tracking-wider">9 SEASON GAMES</div>
              <div className="text-2xl font-black text-white mt-1 group-hover:text-amber-300 transition-colors">VARSITY SCHED</div>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-3">MAPL Conference & Rivalries</div>
          </div>
          
          <div className="p-4 rounded-xl bg-slate-900/40 border border-white/10 backdrop-blur-md hover:border-amber-400/30 transition-all flex flex-col justify-between group shadow-lg">
            <div>
              <div className="text-[10px] text-slate-400 font-mono tracking-wider">292 PLAYS SEGMENTED</div>
              <div className="text-2xl font-black text-white mt-1 group-hover:text-amber-300 transition-colors">FILM DETECTED</div>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-3">Pre-Snap Motions & Routes</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/40 border border-white/10 backdrop-blur-md hover:border-cyan-400/30 transition-all flex flex-col justify-between group shadow-lg">
            <div>
              <div className="text-[10px] text-slate-400 font-mono tracking-wider">38 VARSITY PLAYERS</div>
              <div className="text-2xl font-black text-cyan-300 mt-1">ACTIVE ROSTER</div>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-3">1-100 Performance Rankings</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/40 border border-white/10 backdrop-blur-md hover:border-emerald-400/30 transition-all flex flex-col justify-between group shadow-lg">
            <div>
              <div className="text-[10px] text-slate-400 font-mono tracking-wider">+1.51 MOTION EPA LIFT</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">ADVANCED ML</div>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-3">Self-Scouting Tendency Models</div>
          </div>
        </div>

        {/* Banner */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Award className="w-3.5 h-3.5" />
            2025–2026 Peddie School Falcons Varsity Football · Hudl Film Engine
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4 leading-tight">
            All-22 Film Breakdown with<br />
            <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-cyan-400 bg-clip-text text-transparent">
              Dynamic 22-Man X's & O's Tracking
            </span>
          </h2>
          <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Ingest Hudl reels, YouTube streams, or raw camera files. Automatically detect pre-snap motions, route concepts, and render every Offense player as <strong className="text-amber-400">'O'</strong> and Defense as <strong className="text-red-400">'X'</strong> with sub-second accuracy.
          </p>
        </div>

        {/* Ingest Form Card */}
        <div className="max-w-2xl mx-auto mb-16 bg-slate-900/80 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Import Hudl or Game Film
            </h3>
            <span className="text-xs font-mono text-slate-400">Hudl URL · YouTube · File Upload</span>
          </div>

          {/* Drag & Drop */}
          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center mb-4 transition-all cursor-pointer ${
              isDragging ? 'border-amber-400 bg-amber-500/10 scale-[1.01]' : 'border-white/10 hover:border-white/20 bg-slate-950/40'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" accept="video/*,.mp4,.mov,.webm" className="hidden" onChange={handleFileSelect} />
            <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <p className="text-xs font-semibold text-slate-200">
              Drag and drop all-22 footage or <span className="text-amber-400 underline">browse files</span>
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Supports .mp4, .mov, .webm</p>
          </div>

          {/* URL Input */}
          <div className="relative mb-4">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Link className="w-4 h-4" />
            </div>
            <input
              type="url"
              placeholder="Paste Hudl film URL (e.g. https://fan.hudl.com/peddie-blair-2025)..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-3 gap-2.5 mb-5">
            <input
              placeholder="Game Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            <input
              placeholder="Home Team (e.g. Peddie Falcons)"
              value={homeTeam}
              onChange={(e) => setHomeTeam(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            <input
              placeholder="Away Team (e.g. Blair Buccaneers)"
              value={awayTeam}
              onChange={(e) => setAwayTeam(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <button
            onClick={handleIngest}
            disabled={isLoading || (!videoUrl && !title)}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:opacity-95 transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                Analyzing Peddie Falcons Film...
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4" />
                Analyze Game Film
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-14">
          {[
            { icon: Users, title: "22-Man X's & O's Tracking", desc: "Offense rendered as 'O' (Peddie) and Defense as 'X' with real-time trajectory vectors." },
            { icon: Target, title: "Pre-Snap Motion Engine", desc: "Jet sweeps, orbit motions, and TE trades with motion velocity and defensive reaction tagging." },
            { icon: BarChart3, title: "Coaching-Grade EPA", desc: "Expected Points Added & situational conversion matrices for Coach Mark Fabish." },
            { icon: MessageSquare, title: "@Mention Team Hub", desc: "Tag players like @#15_Melton, @#3_Davis, @#5_Barone, and assign coaching action items." },
          ].map((feat, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-900/60 border border-white/10 hover:border-amber-400/40 transition-all group">
              <div className="w-9 h-9 rounded-lg bg-amber-500/15 flex items-center justify-center mb-3 text-amber-400 group-hover:scale-110 transition-transform">
                <feat.icon className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white mb-1">{feat.title}</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>

        {/* Featured 2025 Peddie School Falcons Hudl Sessions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Film className="w-4 h-4 text-amber-400" />
              Featured 2025 Peddie School Falcons Game Film
            </h3>
            <span className="text-xs text-slate-400 font-mono">MAPL Conference Schedule</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {games.map(game => (
              <div
                key={game.id}
                onClick={() => router.push(`/dashboard/film-room/${game.id}`)}
                className="p-4 rounded-xl bg-slate-900/80 border border-white/10 hover:border-amber-400/60 hover:bg-slate-900 transition-all cursor-pointer group shadow-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 group-hover:scale-105 transition-transform shrink-0">
                    <PlayCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                      {game.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {game.homeTeam} vs {game.awayTeam} · {game.date} · <span className="text-amber-400 font-bold">{game.plays.length} plays</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/30 text-[10px] font-bold text-amber-300">
                    HUDL FILM
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 border-t border-white/10 text-[11px] text-slate-500 font-mono">
        Peddie Football Analytics © 2025 · Sports Analytics & Coaching · The Peddie School Falcons · Built for Coaches & Analysts
      </footer>
    </div>
  );
}
