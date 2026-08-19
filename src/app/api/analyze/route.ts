// ============================================================================
// Peddie Football S.A.C. — AI Video Analysis API Route
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { analyzeVideo } from '@/lib/ai-vision-parser';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoUrl, gameId } = body;

    if (!videoUrl || !gameId) {
      return NextResponse.json(
        { error: 'videoUrl and gameId are required' },
        { status: 400 }
      );
    }

    const plays = await analyzeVideo(videoUrl, gameId);

    return NextResponse.json({
      success: true,
      gameId,
      plays,
      playCount: plays.length,
      message: `Analysis complete. ${plays.length} plays detected and analyzed.`,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Video analysis failed' },
      { status: 500 }
    );
  }
}
