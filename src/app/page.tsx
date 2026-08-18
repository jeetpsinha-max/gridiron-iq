'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload, Link, PlayCircle, ArrowRight, Video,
  Zap, BarChart3, Users, MessageSquare, Target,
  ChevronRight, Film, Sparkles, Shield, TrendingUp,
} from 'lucide-react';
import { useGridironStore } from '@/lib/store';
import { MOCK_GAMES } from '@/lib/mock-game-data';
import { GameSession } from '@/types/football';
import { generateId } from '@/lib/utils';

export default function HomePage() {
  const router = useRouter();
  const addGame = useGridironStore(s => s.addGame);
  const games = useGridironStore(s => s.games);

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
      formData.append('title', title || 'New Game Film');
      formData.append('homeTeam', homeTeam || 'Home');
      formData.append('awayTeam', awayTeam || 'Away');

      const res = await fetch('/api/ingest', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.success) {
        // Auto-analyze with mock engine
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
          duration: 180,
        };

        addGame(newGame);
        router.push(`/dashboard/film-room/${newGame.id}`);
      }
    } catch {
      // Fallback: add directly with mock data
      const mockGame: GameSession = {
        id: generateId(),
        title: title || 'New Game Film',
        homeTeam: homeTeam || 'Home',
        awayTeam: awayTeam || 'Away',
        date: new Date().toISOString().split('T')[0],
        season: '2024',
        videoUrl: videoUrl || '/mock',
        videoSource: videoUrl.includes('youtube') ? 'YOUTUBE' : videoUrl.includes('hudl') ? 'HUDL' : 'FILE_UPLOAD',
        duration: 180,
        analysisStatus: 'COMPLETED',
        plays: MOCK_GAMES[0].plays.map(p => ({ ...p, gameId: generateId() })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addGame(mockGame);
      router.push(`/dashboard/film-room/${mockGame.id}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith('video/') || file.name.match(/\.(mp4|mov|webm)$/i))) {
      setTitle(file.name.replace(/\.[^.]+$/, ''));
      setVideoUrl(`file://${file.name}`);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTitle(file.name.replace(/\.[^.]+$/, ''));
      setVideoUrl(`file://${file.name}`);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, var(--accent-primary), transparent 70%)' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, var(--accent-secondary), transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-[0.02]"
          style={{ background: 'radial-gradient(circle, var(--accent-emerald), transparent 60%)' }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b"
        style={{ borderColor: 'var(--border-primary)', background: 'rgba(10, 10, 15, 0.8)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}>
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>GridironIQ</h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>AI Film Analytics</p>
          </div>
        </div>

        {games.length > 0 && (
          <button
            onClick={() => router.push(`/dashboard/film-room/${games[0].id}`)}
            className="btn-ghost text-sm"
          >
            <Film className="w-4 h-4" />
            Open Film Room
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-24">
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-medium"
            style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
            <Sparkles className="w-4 h-4" />
            AI-Powered Football Film Analysis
          </div>
          <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-5"
            style={{ color: 'var(--text-primary)', lineHeight: 1.1 }}>
            Break Down Film.<br />
            <span style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Elevate Your Game.
            </span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Drop a YouTube link, Hudl URL, or upload game footage. Our AI identifies every play,
            tracks pre-snap motions, and generates coaching-grade analytics in seconds.
          </p>
        </div>

        {/* Import Card */}
        <div className="max-w-2xl mx-auto mb-16 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="glass-card glow-border p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Zap className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
              Import Game Footage
            </h3>

            {/* Drag & Drop Zone */}
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center mb-6 transition-all cursor-pointer ${isDragging ? 'scale-[1.02]' : ''}`}
              style={{
                borderColor: isDragging ? 'var(--accent-primary)' : 'var(--border-primary)',
                background: isDragging ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
              }}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" accept="video/*,.mp4,.mov,.webm" className="hidden" onChange={handleFileSelect} />
              <Upload className="w-10 h-10 mx-auto mb-3" style={{ color: isDragging ? 'var(--accent-primary)' : 'var(--text-muted)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Drag & drop video file or <span style={{ color: 'var(--accent-primary)' }}>browse</span>
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>.mp4, .mov, .webm supported</p>
            </div>

            {/* URL Input */}
            <div className="relative mb-4">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                <Link className="w-4 h-4" />
              </div>
              <input
                type="url"
                placeholder="Paste YouTube URL, Hudl link, or video URL..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="input-field pl-10"
              />
              {videoUrl.includes('youtube') && <Video className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />}
            </div>

            {/* Game Info */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <input placeholder="Game Title" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" />
              <input placeholder="Home Team" value={homeTeam} onChange={(e) => setHomeTeam(e.target.value)} className="input-field" />
              <input placeholder="Away Team" value={awayTeam} onChange={(e) => setAwayTeam(e.target.value)} className="input-field" />
            </div>

            {/* Submit */}
            <button
              onClick={handleIngest}
              disabled={isLoading || (!videoUrl && !title)}
              className="btn-primary w-full justify-center text-base py-3 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing Film...
                </>
              ) : (
                <>
                  <PlayCircle className="w-5 h-5" />
                  Start Analysis
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {[
            { icon: Target, title: 'Pre-Snap Motion Detection', desc: 'Jet sweeps, orbit, fly motions — automatically identified with defensive reactions.' },
            { icon: BarChart3, title: 'EPA Analytics', desc: 'Expected Points Added, success rates, and motion tendency breakdowns per play.' },
            { icon: MessageSquare, title: '@Mention Collaboration', desc: 'Tag coaches and players with timestamped comments directly on the film.' },
            { icon: TrendingUp, title: 'Scouting Reports', desc: 'One-click PDF exports with tendencies, heatmaps, and coaching action items.' },
          ].map((feat, i) => (
            <div key={i} className="metric-card group">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15))' }}>
                <feat.icon className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
              </div>
              <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--text-primary)' }}>{feat.title}</h4>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{feat.desc}</p>
            </div>
          ))}
        </div>

        {/* Recent Games */}
        {games.length > 0 && (
          <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Film className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
              Recent Game Sessions
            </h3>
            <div className="grid gap-3">
              {games.map((game) => (
                <div
                  key={game.id}
                  onClick={() => router.push(`/dashboard/film-room/${game.id}`)}
                  className="glass-card-sm p-5 flex items-center justify-between cursor-pointer hover:border-[var(--border-hover)] transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ background: game.analysisStatus === 'COMPLETED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)' }}>
                      {game.analysisStatus === 'COMPLETED' ? (
                        <PlayCircle className="w-6 h-6" style={{ color: 'var(--accent-emerald)' }} />
                      ) : (
                        <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--accent-amber)', borderTopColor: 'transparent' }} />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{game.title}</h4>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {game.homeTeam} vs {game.awayTeam} · {game.date} · {game.plays.length} plays
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="badge" style={{
                      background: game.videoSource === 'YOUTUBE' ? 'rgba(239, 68, 68, 0.1)' : game.videoSource === 'HUDL' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                      color: game.videoSource === 'YOUTUBE' ? '#ef4444' : game.videoSource === 'HUDL' ? '#f59e0b' : 'var(--accent-primary)',
                      borderColor: 'transparent',
                    }}>
                      {game.videoSource === 'YOUTUBE' && <Video className="w-3 h-3" />}
                      {game.videoSource}
                    </span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" style={{ color: 'var(--text-muted)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 border-t" style={{ borderColor: 'var(--border-primary)' }}>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          GridironIQ © {new Date().getFullYear()} · AI-Powered Football Film Analytics · Built for Coaches
        </p>
      </footer>
    </div>
  );
}
