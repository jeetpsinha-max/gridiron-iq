// ============================================================================
// GridironIQ / PitchVision — Core Football Analytics Type Definitions
// ============================================================================

// --- Play & Action Enums ---

export type PlayType =
  | 'PASS'
  | 'RUN'
  | 'PLAY_ACTION_BOOT'
  | 'RPO'
  | 'SCREEN'
  | 'DRAW'
  | 'PUNT'
  | 'FIELD_GOAL'
  | 'TRICK_REVERSE'
  | 'TURNOVER';

export type PreSnapMotionType =
  | 'NONE'
  | 'JET_SWEEP'
  | 'ORBIT'
  | 'FLY'
  | 'RETURN'
  | 'TRADE_TE'
  | 'SHIFT_BACKFIELD';

export type MotionDirection = 'LEFT' | 'RIGHT';

export type ActionItemStatus = 'TODO' | 'IN_REVIEW' | 'RESOLVED';
export type ActionPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type OffensivePersonnel = '11' | '12' | '13' | '21' | '22' | '10' | '20';
export type DefensivePackage = '4-3' | '3-4' | 'NICKEL' | 'DIME' | 'GOAL_LINE' | 'PREVENT';

export type HashMark = 'LEFT' | 'MIDDLE' | 'RIGHT';
export type Quarter = 1 | 2 | 3 | 4 | 5;
export type Down = 1 | 2 | 3 | 4;

export type CoverageScheme =
  | 'COVER_0'
  | 'COVER_1'
  | 'COVER_2'
  | 'COVER_3'
  | 'COVER_4'
  | 'COVER_6'
  | 'MAN_FREE'
  | 'MAN_PRESS'
  | 'TAMPA_2'
  | 'QUARTERS';

export type BlockingScheme =
  | 'INSIDE_ZONE'
  | 'OUTSIDE_ZONE'
  | 'GAP_POWER'
  | 'GAP_COUNTER'
  | 'TRAP'
  | 'DRAW'
  | 'PASS_PRO'
  | 'SCREEN_RELEASE';

export type RouteConcept =
  | 'MESH'
  | 'SMASH'
  | 'FLOOD'
  | 'Y_CROSS'
  | 'VERTICALS'
  | 'CURL_FLAT'
  | 'SLANT_FLAT'
  | 'FOUR_VERTS'
  | 'DAGGER'
  | 'POST_WHEEL'
  | 'LEVELS'
  | 'DRIVE';

export type RunGap = 'A_LEFT' | 'A_RIGHT' | 'B_LEFT' | 'B_RIGHT' | 'C_LEFT' | 'C_RIGHT' | 'OFF_TACKLE_LEFT' | 'OFF_TACKLE_RIGHT' | 'OUTSIDE_LEFT' | 'OUTSIDE_RIGHT';

// --- User & Mention Types ---

export type UserRole = 'PLAYER' | 'COACH' | 'COORDINATOR' | 'ANALYST';

export interface UserMention {
  id: string;
  name: string;
  role: UserRole;
  jerseyNumber?: number;
  position?: string;
  avatarUrl?: string;
}

// --- Comment & Collaboration Types ---

export interface PlayComment {
  id: string;
  playId: string;
  timestamp: number; // Video second marker
  author: UserMention;
  text: string;
  mentions: UserMention[];
  createdAt: string;
  isRead?: boolean;
}

export interface CoachingActionItem {
  id: string;
  playId: string;
  gameId: string;
  title: string;
  description: string;
  assignedTo: UserMention;
  assignedBy: UserMention;
  priority: ActionPriority;
  status: ActionItemStatus;
  videoTimestamp: number;
  telestrationSnapshotUrl?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Telestration Types ---

export type TelestrationToolType = 'PEN' | 'ARROW' | 'SPOTLIGHT' | 'ROUTE_LINE' | 'ERASER';

export interface TelestrationStroke {
  id: string;
  tool: TelestrationToolType;
  color: string;
  lineWidth: number;
  points: { x: number; y: number }[];
  timestamp: number;
}

// --- Dynamic 22-Player Tracking Overlay Types (X's & O's) ---

export interface PlayerTrackingPoint {
  x: number; // 0 to 100 on field percentage (width)
  y: number; // 0 to 100 on field percentage (length/depth)
}

export interface TrackedPlayer {
  id: string;
  side: 'OFFENSE' | 'DEFENSE'; // OFFENSE = 'O', DEFENSE = 'X'
  jerseyNumber: number;
  name: string;
  position: string;
  isTargetOrBallCarrier?: boolean;
  isMotionPlayer?: boolean;
  // Dynamic trajectory points across 4 phases: [preSnap, motion, snap, postSnap]
  trajectory: {
    preSnap: PlayerTrackingPoint;
    motion?: PlayerTrackingPoint;
    snap: PlayerTrackingPoint;
    postSnap: PlayerTrackingPoint;
  };
  vectorLabel?: string; // e.g. "Jet Sweep 22.4 mph", "Deep Post 18 yds", "B-Gap Blitz"
}

export interface PlayTrackingData {
  offense: TrackedPlayer[]; // 11 O's (Peddie Falcons)
  defense: TrackedPlayer[]; // 11 X's (Opponent)
  lineOfScrimmageY: number; // Yardline %
  firstDownY: number; // 1st Down marker %
  playConceptName?: string; // e.g. "Peddie Orbit Mesh Wheel vs Cover 3"
}

// --- Play Analysis (Core Model) ---

export interface PlayAnalysis {
  id: string;
  gameId: string;
  playNumber: number;
  quarter: Quarter;
  gameClock: string;
  videoTimestampStart: number;
  videoTimestampMotion?: number;
  videoTimestampSnap: number;
  videoTimestampEnd: number;
  down: Down;
  distance: number;
  yardLine: number;
  hash: HashMark;

  // Offensive context
  offensiveFormation: string;
  offensivePersonnel: OffensivePersonnel;
  motionType: PreSnapMotionType;
  motionDirection?: MotionDirection;
  motionPlayerJersey?: number;
  blockingScheme?: BlockingScheme;
  routeConcept?: RouteConcept;

  // Defensive context
  defensiveFront: string;
  defensivePackage: DefensivePackage;
  coverageScheme: CoverageScheme;
  defenseReactionToMotion?: string;

  // Play result
  playType: PlayType;
  playActionFake: boolean;
  runGap?: RunGap;
  targetPlayerJersey?: number;
  yardsGained: number;
  epa: number;
  successRate: boolean;
  isFirstDown: boolean;
  isTouchdown: boolean;
  isTurnover: boolean;
  isPenalty: boolean;
  penaltyDescription?: string;

  // Description
  playDescription: string;

  // Collaboration
  comments: PlayComment[];
  actionItems: CoachingActionItem[];
  telestrationStrokes: TelestrationStroke[];

  // 22-Player Tracking Overlay Data (11 O's & 11 X's)
  trackingData?: PlayTrackingData;
}

// --- Game Session ---

export type VideoSource = 'YOUTUBE' | 'HUDL' | 'FILE_UPLOAD';
export type AnalysisStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface GameSession {
  id: string;
  title: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  season: string;
  videoUrl: string;
  videoSource: VideoSource;
  thumbnailUrl?: string;
  duration: number; // seconds
  analysisStatus: AnalysisStatus;
  plays: PlayAnalysis[];
  createdAt: string;
  updatedAt: string;
}

// --- Analytics Aggregation Types ---

export interface MotionTendency {
  motionType: PreSnapMotionType;
  totalPlays: number;
  avgYards: number;
  avgEpa: number;
  successRate: number;
  touchdowns: number;
  turnovers: number;
}

export interface PlayTypeTendency {
  playType: PlayType;
  totalPlays: number;
  avgYards: number;
  avgEpa: number;
  successRate: number;
  withMotion: number;
  withoutMotion: number;
}

export interface DownDistanceSummary {
  down: Down;
  avgDistance: number;
  totalPlays: number;
  successRate: number;
  avgEpa: number;
  conversionRate: number;
  passRate: number;
  runRate: number;
}

export interface DriveInfo {
  id: string;
  startQuarter: Quarter;
  startYardLine: number;
  endYardLine: number;
  plays: number;
  yards: number;
  result: 'TOUCHDOWN' | 'FIELD_GOAL' | 'PUNT' | 'TURNOVER' | 'END_OF_HALF' | 'DOWNS';
  timeOfPossession: string;
}

export interface TeamBoxScore {
  totalYards: number;
  passingYards: number;
  rushingYards: number;
  totalPlays: number;
  firstDowns: number;
  thirdDownConversions: number;
  thirdDownAttempts: number;
  fourthDownConversions: number;
  fourthDownAttempts: number;
  redZoneScores: number;
  redZoneAttempts: number;
  turnovers: number;
  penalties: number;
  penaltyYards: number;
  timeOfPossession: string;
  avgEpa: number;
  successRate: number;
}

// --- Notification Types ---

export interface Notification {
  id: string;
  type: 'MENTION' | 'ACTION_ASSIGNED' | 'ACTION_STATUS_CHANGE' | 'COMMENT_REPLY';
  message: string;
  gameId: string;
  playId?: string;
  videoTimestamp?: number;
  isRead: boolean;
  createdAt: string;
  fromUser: UserMention;
  toUser: UserMention;
}

// --- Field Heatmap Data ---

export interface FieldHeatmapPoint {
  x: number; // 0-100 field width percentage
  y: number; // 0-100 field length percentage  
  intensity: number; // 0-1
  playType: PlayType;
  yardsGained: number;
  gap?: RunGap;
}

export interface RouteVector {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  playerJersey: number;
  routeType: string;
  targeted: boolean;
  completed: boolean;
}

export interface MotionVector {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  playerJersey: number;
  motionType: PreSnapMotionType;
}
