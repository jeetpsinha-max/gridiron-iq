// ============================================================================
// GridironIQ — Coaching Action Items CRUD API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { generateId } from '@/lib/utils';
import { CoachingActionItem, ActionItemStatus, ActionPriority } from '@/types/football';
import { MOCK_GAMES } from '@/lib/mock-game-data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get('gameId');

  const allActions = MOCK_GAMES.flatMap(g => g.plays.flatMap(p => p.actionItems));
  const filtered = gameId ? allActions.filter(a => a.gameId === gameId) : allActions;

  return NextResponse.json({
    success: true,
    actionItems: filtered,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      playId, gameId, title, description,
      assignedToId, assignedById,
      priority = 'MEDIUM',
      videoTimestamp = 0,
      dueDate,
    } = body;

    if (!playId || !gameId || !title || !assignedToId || !assignedById) {
      return NextResponse.json(
        { error: 'playId, gameId, title, assignedToId, and assignedById are required' },
        { status: 400 }
      );
    }

    const assignedTo = TEAM_ROSTER.find(u => u.id === assignedToId);
    const assignedBy = TEAM_ROSTER.find(u => u.id === assignedById);

    if (!assignedTo || !assignedBy) {
      return NextResponse.json(
        { error: 'Invalid user IDs' },
        { status: 400 }
      );
    }

    const actionItem: CoachingActionItem = {
      id: generateId(),
      playId,
      gameId,
      title,
      description: description ?? '',
      assignedTo,
      assignedBy,
      priority: priority as ActionPriority,
      status: 'TODO',
      videoTimestamp,
      dueDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      actionItem,
    });
  } catch (error) {
    console.error('Action item creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create action item' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, priority } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Action item id is required' },
        { status: 400 }
      );
    }

    const updates: Partial<CoachingActionItem> = {
      updatedAt: new Date().toISOString(),
    };

    if (status) updates.status = status as ActionItemStatus;
    if (priority) updates.priority = priority as ActionPriority;

    return NextResponse.json({
      success: true,
      id,
      updates,
    });
  } catch (error) {
    console.error('Action item update error:', error);
    return NextResponse.json(
      { error: 'Failed to update action item' },
      { status: 500 }
    );
  }
}
