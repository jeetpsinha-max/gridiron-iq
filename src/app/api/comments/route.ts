// ============================================================================
// Peddie Football Analytics — Comments & @Mentions API Route
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { generateId } from '@/lib/utils';
import { PlayComment, UserMention } from '@/types/football';
import { TEAM_ROSTER } from '@/lib/mock-game-data';

// Parse @mentions from comment text
function extractMentions(text: string): UserMention[] {
  const mentionPattern = /@([a-zA-Z_#0-9\s]+?)(?=\s|$|[,.])/g;
  const mentions: UserMention[] = [];
  let match: RegExpExecArray | null;

  while ((match = mentionPattern.exec(text)) !== null) {
    const mentionText = match[1].trim();

    // Match against roster
    const user = TEAM_ROSTER.find(u => {
      const nameMatch = u.name.toLowerCase() === mentionText.toLowerCase();
      const jerseyMatch = mentionText.startsWith('#') &&
        u.jerseyNumber?.toString() === mentionText.slice(1).split('_')[0];
      const positionMatch = u.position?.toLowerCase() === mentionText.toLowerCase();
      return nameMatch || jerseyMatch || positionMatch;
    });

    if (user && !mentions.find(m => m.id === user.id)) {
      mentions.push(user);
    }
  }

  return mentions;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playId, text, authorId, timestamp } = body;

    if (!playId || !text || !authorId) {
      return NextResponse.json(
        { error: 'playId, text, and authorId are required' },
        { status: 400 }
      );
    }

    const author = TEAM_ROSTER.find(u => u.id === authorId) ?? TEAM_ROSTER[0];
    const mentions = extractMentions(text);

    const comment: PlayComment = {
      id: generateId(),
      playId,
      timestamp: timestamp ?? 0,
      author,
      text,
      mentions,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      comment,
      mentionedUsers: mentions.map(m => m.name),
    });
  } catch (error) {
    console.error('Comment error:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    roster: TEAM_ROSTER,
    mentionableNames: TEAM_ROSTER.map(u => ({
      id: u.id,
      label: u.jerseyNumber ? `#${u.jerseyNumber} ${u.name}` : u.name,
      name: u.name,
      role: u.role,
      position: u.position,
    })),
  });
}
