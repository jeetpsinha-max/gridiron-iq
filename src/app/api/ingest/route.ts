// ============================================================================
// GridironIQ — Video Ingestion API Route
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { generateId } from '@/lib/utils';
import { GameSession, VideoSource } from '@/types/football';

function detectVideoSource(url: string): VideoSource {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YOUTUBE';
  if (url.includes('hudl.com')) return 'HUDL';
  return 'FILE_UPLOAD';
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const videoUrl = formData.get('videoUrl') as string | null;
    const videoFile = formData.get('videoFile') as File | null;
    const title = (formData.get('title') as string) || 'Untitled Game';
    const homeTeam = (formData.get('homeTeam') as string) || 'Home';
    const awayTeam = (formData.get('awayTeam') as string) || 'Away';
    const date = (formData.get('date') as string) || new Date().toISOString().split('T')[0];

    let source: VideoSource = 'FILE_UPLOAD';
    let resolvedUrl = '';
    let thumbnailUrl: string | undefined;

    if (videoUrl) {
      source = detectVideoSource(videoUrl);
      resolvedUrl = videoUrl;

      if (source === 'YOUTUBE') {
        const ytId = extractYouTubeId(videoUrl);
        if (ytId) {
          thumbnailUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
        }
      }
    } else if (videoFile) {
      // In production, upload to cloud storage
      // For now, create a local blob URL reference
      resolvedUrl = `/uploads/${videoFile.name}`;
      source = 'FILE_UPLOAD';
    } else {
      return NextResponse.json(
        { error: 'No video URL or file provided' },
        { status: 400 }
      );
    }

    const gameSession: GameSession = {
      id: generateId(),
      title,
      homeTeam,
      awayTeam,
      date,
      season: new Date(date).getFullYear().toString(),
      videoUrl: resolvedUrl,
      videoSource: source,
      thumbnailUrl,
      duration: 0,
      analysisStatus: 'PENDING',
      plays: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      game: gameSession,
      message: `Game "${title}" imported successfully from ${source}. Ready for analysis.`,
    });
  } catch (error) {
    console.error('Ingest error:', error);
    return NextResponse.json(
      { error: 'Failed to ingest video' },
      { status: 500 }
    );
  }
}
