// ============================================================================
// GridironIQ — Zustand State Store
// ============================================================================
// Centralized state for video playback sync, active play filtering,
// mention/notification management, and coaching action items.

import { create } from 'zustand';
import {
  PlayAnalysis, PlayComment, CoachingActionItem,
  Notification, UserMention, PlayType, PreSnapMotionType,
  Down, ActionItemStatus, ActionPriority, GameSession,
} from '@/types/football';
import { MOCK_GAMES, MOCK_NOTIFICATIONS, MOCK_PLAYS, TEAM_ROSTER } from './mock-game-data';

// ---- Filter State ----

interface PlayFilters {
  playTypes: PlayType[];
  motionTypes: PreSnapMotionType[];
  downs: Down[];
  quarter: number | null;
  minYards: number | null;
  maxYards: number | null;
  hasMotion: boolean | null;
  searchQuery: string;
}

const DEFAULT_FILTERS: PlayFilters = {
  playTypes: [],
  motionTypes: [],
  downs: [],
  quarter: null,
  minYards: null,
  maxYards: null,
  hasMotion: null,
  searchQuery: '',
};

// ---- Telestration State ----

interface TelestrationState {
  activeTool: 'PEN' | 'ARROW' | 'SPOTLIGHT' | 'ROUTE_LINE' | 'ERASER' | null;
  activeColor: string;
  lineWidth: number;
  isDrawing: boolean;
}

// ---- Main Store ----

interface GridironStore {
  // Game sessions
  games: GameSession[];
  activeGameId: string | null;
  activeGame: GameSession | null;

  // Video player
  currentTime: number;
  isPlaying: boolean;
  playbackRate: number;
  duration: number;

  // Active play
  activePlayId: string | null;
  activePlay: PlayAnalysis | null;

  // Play filtering
  filters: PlayFilters;
  filteredPlays: PlayAnalysis[];

  // Collaboration
  notifications: Notification[];
  unreadCount: number;
  mentionableUsers: UserMention[];

  // Comments
  commentDraft: string;

  // Action items
  actionItems: CoachingActionItem[];
  isActionDrawerOpen: boolean;

  // Telestration
  telestration: TelestrationState;

  // UI state
  isSidebarOpen: boolean;
  activeTab: 'plays' | 'comments' | 'actions';

  // Actions
  setActiveGame: (gameId: string) => void;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackRate: (rate: number) => void;
  setDuration: (duration: number) => void;
  setActivePlay: (playId: string | null) => void;
  seekToPlay: (play: PlayAnalysis) => void;

  // Filter actions
  setFilters: (filters: Partial<PlayFilters>) => void;
  resetFilters: () => void;
  applyFilters: () => void;

  // Collaboration actions
  addComment: (playId: string, comment: PlayComment) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  setCommentDraft: (text: string) => void;

  // Action item actions
  addActionItem: (item: CoachingActionItem) => void;
  updateActionItemStatus: (itemId: string, status: ActionItemStatus) => void;
  toggleActionDrawer: () => void;

  // Telestration actions
  setTelestrationTool: (tool: TelestrationState['activeTool']) => void;
  setTelestrationColor: (color: string) => void;
  setTelestrationLineWidth: (width: number) => void;

  // UI actions
  toggleSidebar: () => void;
  setActiveTab: (tab: 'plays' | 'comments' | 'actions') => void;

  // Ingest
  addGame: (game: GameSession) => void;
}

function filterPlays(plays: PlayAnalysis[], filters: PlayFilters): PlayAnalysis[] {
  return plays.filter(play => {
    if (filters.playTypes.length > 0 && !filters.playTypes.includes(play.playType)) return false;
    if (filters.motionTypes.length > 0 && !filters.motionTypes.includes(play.motionType)) return false;
    if (filters.downs.length > 0 && !filters.downs.includes(play.down)) return false;
    if (filters.quarter !== null && play.quarter !== filters.quarter) return false;
    if (filters.minYards !== null && play.yardsGained < filters.minYards) return false;
    if (filters.maxYards !== null && play.yardsGained > filters.maxYards) return false;
    if (filters.hasMotion === true && play.motionType === 'NONE') return false;
    if (filters.hasMotion === false && play.motionType !== 'NONE') return false;
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      return (
        play.playDescription.toLowerCase().includes(q) ||
        play.offensiveFormation.toLowerCase().includes(q) ||
        play.playType.toLowerCase().includes(q) ||
        play.motionType.toLowerCase().includes(q)
      );
    }
    return true;
  });
}

export const useGridironStore = create<GridironStore>((set, get) => ({
  // Initial state
  games: MOCK_GAMES,
  activeGameId: null,
  activeGame: null,

  currentTime: 0,
  isPlaying: false,
  playbackRate: 1,
  duration: 0,

  activePlayId: null,
  activePlay: null,

  filters: DEFAULT_FILTERS,
  filteredPlays: [],

  notifications: MOCK_NOTIFICATIONS,
  unreadCount: MOCK_NOTIFICATIONS.filter(n => !n.isRead).length,
  mentionableUsers: TEAM_ROSTER,

  commentDraft: '',

  actionItems: MOCK_PLAYS.flatMap(p => p.actionItems),
  isActionDrawerOpen: false,

  telestration: {
    activeTool: null,
    activeColor: '#ef4444',
    lineWidth: 3,
    isDrawing: false,
  },

  isSidebarOpen: true,
  activeTab: 'plays',

  // Actions
  setActiveGame: (gameId) => {
    const game = get().games.find(g => g.id === gameId) ?? null;
    const plays = game?.plays ?? [];
    const allActions = plays.flatMap(p => p.actionItems);
    const firstPlay = plays.length > 0 ? plays[0] : null;
    set({
      activeGameId: gameId,
      activeGame: game,
      filteredPlays: filterPlays(plays, get().filters),
      actionItems: allActions,
      activePlayId: firstPlay?.id ?? null,
      activePlay: firstPlay,
      currentTime: firstPlay?.videoTimestampStart ?? 0,
    });
  },

  setCurrentTime: (time) => set({ currentTime: time }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setPlaybackRate: (rate) => set({ playbackRate: rate }),
  setDuration: (duration) => set({ duration }),

  setActivePlay: (playId) => {
    const game = get().activeGame;
    if (!game) return;
    const play = playId ? game.plays.find(p => p.id === playId) ?? null : null;
    set({ activePlayId: playId, activePlay: play });
  },

  seekToPlay: (play) => {
    set({
      activePlayId: play.id,
      activePlay: play,
      currentTime: play.videoTimestampStart,
    });
  },

  // Filter actions
  setFilters: (newFilters) => {
    const filters = { ...get().filters, ...newFilters };
    const plays = get().activeGame?.plays ?? [];
    set({ filters, filteredPlays: filterPlays(plays, filters) });
  },

  resetFilters: () => {
    const plays = get().activeGame?.plays ?? [];
    set({ filters: DEFAULT_FILTERS, filteredPlays: plays });
  },

  applyFilters: () => {
    const plays = get().activeGame?.plays ?? [];
    set({ filteredPlays: filterPlays(plays, get().filters) });
  },

  // Collaboration
  addComment: (playId, comment) => {
    const game = get().activeGame;
    if (!game) return;
    const updatedPlays = game.plays.map(p => {
      if (p.id === playId) {
        return { ...p, comments: [...p.comments, comment] };
      }
      return p;
    });
    const updatedGame = { ...game, plays: updatedPlays };
    const games = get().games.map(g => g.id === game.id ? updatedGame : g);

    // Create notifications for mentions
    const newNotifications = comment.mentions.map((mention, i) => ({
      id: `notif-${Date.now()}-${i}`,
      type: 'MENTION' as const,
      message: `${comment.author.name} mentioned you in Play #${updatedPlays.find(p => p.id === playId)?.playNumber}`,
      gameId: game.id,
      playId,
      videoTimestamp: comment.timestamp,
      isRead: false,
      createdAt: new Date().toISOString(),
      fromUser: comment.author,
      toUser: mention,
    }));

    set({
      games,
      activeGame: updatedGame,
      filteredPlays: filterPlays(updatedPlays, get().filters),
      activePlay: get().activePlayId === playId
        ? updatedPlays.find(p => p.id === playId) ?? null
        : get().activePlay,
      notifications: [...newNotifications, ...get().notifications],
      unreadCount: get().unreadCount + newNotifications.length,
      commentDraft: '',
    });
  },

  markNotificationRead: (notificationId) => {
    const notifications = get().notifications.map(n =>
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    set({
      notifications,
      unreadCount: notifications.filter(n => !n.isRead).length,
    });
  },

  markAllNotificationsRead: () => {
    set({
      notifications: get().notifications.map(n => ({ ...n, isRead: true })),
      unreadCount: 0,
    });
  },

  setCommentDraft: (text) => set({ commentDraft: text }),

  // Action items
  addActionItem: (item) => {
    const game = get().activeGame;
    if (!game) return;
    const updatedPlays = game.plays.map(p => {
      if (p.id === item.playId) {
        return { ...p, actionItems: [...p.actionItems, item] };
      }
      return p;
    });
    const updatedGame = { ...game, plays: updatedPlays };
    const games = get().games.map(g => g.id === game.id ? updatedGame : g);

    const notification: Notification = {
      id: `notif-action-${Date.now()}`,
      type: 'ACTION_ASSIGNED',
      message: `New action item: "${item.title}"`,
      gameId: game.id,
      playId: item.playId,
      videoTimestamp: item.videoTimestamp,
      isRead: false,
      createdAt: new Date().toISOString(),
      fromUser: item.assignedBy,
      toUser: item.assignedTo,
    };

    set({
      games,
      activeGame: updatedGame,
      filteredPlays: filterPlays(updatedPlays, get().filters),
      actionItems: [...get().actionItems, item],
      notifications: [notification, ...get().notifications],
      unreadCount: get().unreadCount + 1,
    });
  },

  updateActionItemStatus: (itemId, status) => {
    const actionItems = get().actionItems.map(a =>
      a.id === itemId ? { ...a, status, updatedAt: new Date().toISOString() } : a
    );
    set({ actionItems });
  },

  toggleActionDrawer: () => set({ isActionDrawerOpen: !get().isActionDrawerOpen }),

  // Telestration
  setTelestrationTool: (tool) => set({
    telestration: { ...get().telestration, activeTool: tool },
  }),
  setTelestrationColor: (color) => set({
    telestration: { ...get().telestration, activeColor: color },
  }),
  setTelestrationLineWidth: (width) => set({
    telestration: { ...get().telestration, lineWidth: width },
  }),

  // UI
  toggleSidebar: () => set({ isSidebarOpen: !get().isSidebarOpen }),
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Ingest
  addGame: (game) => set({ games: [game, ...get().games] }),
}));
