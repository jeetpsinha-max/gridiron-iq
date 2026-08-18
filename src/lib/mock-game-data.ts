// ============================================================================
// GridironIQ — Comprehensive Mock Game Data
// ============================================================================
// Pre-populated with realistic game sessions, plays with pre-snap motions,
// coaching comments with @mentions, and action items for immediate testing.

import {
  GameSession, PlayAnalysis, PlayComment, CoachingActionItem,
  UserMention, Notification, DriveInfo, TeamBoxScore, FieldHeatmapPoint,
} from '@/types/football';

// ---- Team Roster / Mentionable Users ----

export const TEAM_ROSTER: UserMention[] = [
  { id: 'u1', name: 'Marcus Williams', role: 'PLAYER', jerseyNumber: 12, position: 'QB' },
  { id: 'u2', name: 'Jamal Carter', role: 'PLAYER', jerseyNumber: 22, position: 'RB' },
  { id: 'u3', name: 'DeShawn Harris', role: 'PLAYER', jerseyNumber: 4, position: 'WR' },
  { id: 'u4', name: 'Tyler Brooks', role: 'PLAYER', jerseyNumber: 88, position: 'TE' },
  { id: 'u5', name: 'Marcus Chen', role: 'PLAYER', jerseyNumber: 7, position: 'WR' },
  { id: 'u6', name: 'David Okafor', role: 'PLAYER', jerseyNumber: 55, position: 'LB' },
  { id: 'u7', name: 'Anthony Reeves', role: 'PLAYER', jerseyNumber: 21, position: 'CB' },
  { id: 'u8', name: 'Isaiah Thompson', role: 'PLAYER', jerseyNumber: 33, position: 'SS' },
  { id: 'u9', name: 'Coach Miller', role: 'COACH', position: 'Head Coach' },
  { id: 'u10', name: 'Coach Davis', role: 'COORDINATOR', position: 'Offensive Coordinator' },
  { id: 'u11', name: 'Coach Jackson', role: 'COORDINATOR', position: 'Defensive Coordinator' },
  { id: 'u12', name: 'Alex Rivera', role: 'ANALYST', position: 'Film Analyst' },
  { id: 'u13', name: 'Jordan Mitchell', role: 'PLAYER', jerseyNumber: 75, position: 'OT' },
  { id: 'u14', name: 'Caleb Foster', role: 'PLAYER', jerseyNumber: 99, position: 'DE' },
  { id: 'u15', name: 'Ryan Patel', role: 'PLAYER', jerseyNumber: 1, position: 'K' },
];

export function findUser(id: string): UserMention {
  return TEAM_ROSTER.find(u => u.id === id) ?? TEAM_ROSTER[0];
}

// ---- Play Data Factory ----

function makeComment(
  id: string, playId: string, timestamp: number,
  authorId: string, text: string, mentionIds: string[] = []
): PlayComment {
  return {
    id,
    playId,
    timestamp,
    author: findUser(authorId),
    text,
    mentions: mentionIds.map(findUser),
    createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
  };
}

function makeAction(
  id: string, playId: string, gameId: string, title: string,
  desc: string, assignedToId: string, assignedById: string,
  priority: CoachingActionItem['priority'], status: CoachingActionItem['status'],
  timestamp: number
): CoachingActionItem {
  return {
    id, playId, gameId, title, description: desc,
    assignedTo: findUser(assignedToId),
    assignedBy: findUser(assignedById),
    priority, status, videoTimestamp: timestamp,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ---- Mock Plays ----

const GAME_ID = 'game-001';

export const MOCK_PLAYS: PlayAnalysis[] = [
  {
    id: 'play-001', gameId: GAME_ID, playNumber: 1, quarter: 1, gameClock: '15:00',
    videoTimestampStart: 0, videoTimestampMotion: 3.5, videoTimestampSnap: 5.2, videoTimestampEnd: 12.8,
    down: 1, distance: 10, yardLine: 25, hash: 'LEFT',
    offensiveFormation: 'Shotgun Trips Right', offensivePersonnel: '11',
    motionType: 'JET_SWEEP', motionDirection: 'LEFT', motionPlayerJersey: 4,
    blockingScheme: 'OUTSIDE_ZONE', routeConcept: 'SLANT_FLAT',
    defensiveFront: '4-3 Under', defensivePackage: 'NICKEL', coverageScheme: 'COVER_3',
    defenseReactionToMotion: 'Nickel rotates to motion, safety stays high',
    playType: 'RUN', playActionFake: false, runGap: 'OUTSIDE_LEFT',
    yardsGained: 14, epa: 1.32, successRate: true,
    isFirstDown: true, isTouchdown: false, isTurnover: false, isPenalty: false,
    playDescription: 'Jet sweep left with #4 Harris. Outside zone blocking picks up the edge. DB slow to react to motion, Harris gets to second level for 14 yards.',
    comments: [
      makeComment('c1', 'play-001', 5.2, 'u10', 'Great execution on the jet motion. @DeShawn Harris hit the edge perfectly. Love the seal block by @Jordan Mitchell', ['u3', 'u13']),
      makeComment('c2', 'play-001', 8.1, 'u12', 'Notice how the NICKEL rotates late — Cover 3 is vulnerable to jet sweep when the corner sits on the #1 receiver', []),
    ],
    actionItems: [],
    telestrationStrokes: [],
  },
  {
    id: 'play-002', gameId: GAME_ID, playNumber: 2, quarter: 1, gameClock: '14:22',
    videoTimestampStart: 14.0, videoTimestampSnap: 17.8, videoTimestampEnd: 24.5,
    down: 1, distance: 10, yardLine: 39, hash: 'MIDDLE',
    offensiveFormation: 'I-Formation', offensivePersonnel: '21',
    motionType: 'NONE',
    blockingScheme: 'GAP_POWER', routeConcept: undefined,
    defensiveFront: '4-3 Over', defensivePackage: '4-3', coverageScheme: 'COVER_1',
    playType: 'RUN', playActionFake: false, runGap: 'B_RIGHT',
    yardsGained: 4, epa: -0.25, successRate: false,
    isFirstDown: false, isTouchdown: false, isTurnover: false, isPenalty: false,
    playDescription: 'Power right with #22 Carter through the B-gap. Lead blocker kicks out the DE but Mike LB fills quickly. 4-yard gain.',
    comments: [
      makeComment('c3', 'play-002', 18.5, 'u11', '@Jamal Carter needs to press the hole harder. Hesitation gave the LB time to fill.', ['u2']),
    ],
    actionItems: [
      makeAction('a1', 'play-002', GAME_ID, 'Work on pressing B-gap holes', 'Review film on gap discipline and hitting holes at full speed without hesitation.', 'u2', 'u11', 'MEDIUM', 'TODO', 18.5),
    ],
    telestrationStrokes: [],
  },
  {
    id: 'play-003', gameId: GAME_ID, playNumber: 3, quarter: 1, gameClock: '13:48',
    videoTimestampStart: 26.0, videoTimestampMotion: 28.5, videoTimestampSnap: 30.2, videoTimestampEnd: 37.1,
    down: 2, distance: 6, yardLine: 43, hash: 'RIGHT',
    offensiveFormation: 'Shotgun 2x2', offensivePersonnel: '11',
    motionType: 'ORBIT', motionDirection: 'RIGHT', motionPlayerJersey: 22,
    blockingScheme: 'PASS_PRO', routeConcept: 'MESH',
    defensiveFront: '3-4 Eagle', defensivePackage: 'NICKEL', coverageScheme: 'COVER_2',
    defenseReactionToMotion: 'LB walks out to orbit man, opens A-gap',
    playType: 'RPO', playActionFake: false,
    targetPlayerJersey: 88, yardsGained: 18, epa: 2.15, successRate: true,
    isFirstDown: true, isTouchdown: false, isTurnover: false, isPenalty: false,
    playDescription: 'RPO with orbit motion right by #22. LB vacates the box to cover the orbit. QB reads the void and hits #88 Brooks on the mesh crossing route for 18 yards.',
    comments: [
      makeComment('c4', 'play-003', 30.0, 'u10', 'Perfect read by @Marcus Williams! The orbit motion pulled the LB out of the box. @Tyler Brooks ran a crisp mesh route.', ['u1', 'u4']),
      makeComment('c5', 'play-003', 31.5, 'u9', 'This is the RPO game-plan working. We need to keep pressuring their LBs with these motions.', []),
    ],
    actionItems: [],
    telestrationStrokes: [],
  },
  {
    id: 'play-004', gameId: GAME_ID, playNumber: 4, quarter: 1, gameClock: '13:05',
    videoTimestampStart: 38.0, videoTimestampSnap: 41.3, videoTimestampEnd: 47.8,
    down: 1, distance: 10, yardLine: 61, hash: 'LEFT',
    offensiveFormation: 'Pistol Offset', offensivePersonnel: '12',
    motionType: 'TRADE_TE', motionDirection: 'LEFT', motionPlayerJersey: 88,
    blockingScheme: 'INSIDE_ZONE',
    defensiveFront: '4-3 Under', defensivePackage: '4-3', coverageScheme: 'COVER_4',
    defenseReactionToMotion: 'DE widens with TE trade, opens C-gap',
    playType: 'PLAY_ACTION_BOOT', playActionFake: true,
    routeConcept: 'FLOOD', targetPlayerJersey: 7,
    yardsGained: 22, epa: 2.85, successRate: true,
    isFirstDown: true, isTouchdown: false, isTurnover: false, isPenalty: false,
    playDescription: 'Play-action boot left off TE trade motion. Flood concept to the boundary. #7 Chen runs the deep crosser and catches the safety flat-footed for 22 yards.',
    comments: [
      makeComment('c6', 'play-004', 43.0, 'u10', 'The TE trade set this up beautifully. @Marcus Chen — great route discipline on the crosser.', ['u5']),
      makeComment('c7', 'play-004', 44.5, 'u12', 'Cover 4 is getting carved up by our boot game. Their safeties are biting on the run action hard.', []),
    ],
    actionItems: [],
    telestrationStrokes: [],
  },
  {
    id: 'play-005', gameId: GAME_ID, playNumber: 5, quarter: 1, gameClock: '12:20',
    videoTimestampStart: 49.0, videoTimestampSnap: 52.5, videoTimestampEnd: 57.3,
    down: 1, distance: 10, yardLine: 83, hash: 'MIDDLE',
    offensiveFormation: 'Shotgun Empty', offensivePersonnel: '10',
    motionType: 'FLY', motionDirection: 'RIGHT', motionPlayerJersey: 4,
    blockingScheme: 'PASS_PRO', routeConcept: 'FOUR_VERTS',
    defensiveFront: 'Nickel', defensivePackage: 'NICKEL', coverageScheme: 'COVER_3',
    defenseReactionToMotion: 'CB squeezes with fly motion, boundary void opens',
    playType: 'PASS', playActionFake: false,
    targetPlayerJersey: 4, yardsGained: 17, epa: 1.75, successRate: true,
    isFirstDown: true, isTouchdown: true, isTurnover: false, isPenalty: false,
    playDescription: 'Fly motion right by #4 Harris. QB takes one hitch and fires the fade to #4 in the end zone. Corner couldn\'t recover from the fly motion adjustment. TOUCHDOWN!',
    comments: [
      makeComment('c8', 'play-005', 53.0, 'u9', 'GREAT play design! The fly motion froze the CB. @DeShawn Harris finish was elite!', ['u3']),
      makeComment('c9', 'play-005', 54.0, 'u10', '@Marcus Williams excellent timing on the throw. Ball was out before the break. We need more of this motion + fade combo in the red zone.', ['u1']),
    ],
    actionItems: [],
    telestrationStrokes: [],
  },
  {
    id: 'play-006', gameId: GAME_ID, playNumber: 6, quarter: 2, gameClock: '11:45',
    videoTimestampStart: 59.0, videoTimestampSnap: 62.8, videoTimestampEnd: 69.0,
    down: 3, distance: 7, yardLine: 42, hash: 'RIGHT',
    offensiveFormation: 'Shotgun Trips Left', offensivePersonnel: '11',
    motionType: 'NONE',
    blockingScheme: 'PASS_PRO', routeConcept: 'SMASH',
    defensiveFront: '3-4', defensivePackage: 'NICKEL', coverageScheme: 'MAN_PRESS',
    playType: 'PASS', playActionFake: false,
    targetPlayerJersey: 4, yardsGained: -2, epa: -2.1, successRate: false,
    isFirstDown: false, isTouchdown: false, isTurnover: false, isPenalty: false,
    playDescription: 'Third and long. Press man coverage. Edge rusher gets free on a twist stunt. QB sacked for a 2-yard loss.',
    comments: [
      makeComment('c10', 'play-006', 64.0, 'u10', '@Jordan Mitchell got caught by the twist stunt. Need to work on pass pro communication.', ['u13']),
      makeComment('c11', 'play-006', 65.5, 'u11', 'They showed blitz pre-snap. @Marcus Williams should have had a hot route check here.', ['u1']),
    ],
    actionItems: [
      makeAction('a2', 'play-006', GAME_ID, 'Review twist stunt pickup', 'Work on line communication for interior twist stunts — missed the exchange.', 'u13', 'u10', 'HIGH', 'TODO', 64.0),
      makeAction('a3', 'play-006', GAME_ID, 'Fix boundary read on Cover 2', 'When they press and show blitz, check to the hot route. Don\'t hold the ball.', 'u1', 'u10', 'HIGH', 'IN_REVIEW', 65.5),
    ],
    telestrationStrokes: [],
  },
  {
    id: 'play-007', gameId: GAME_ID, playNumber: 7, quarter: 2, gameClock: '8:30',
    videoTimestampStart: 71.0, videoTimestampMotion: 73.8, videoTimestampSnap: 75.5, videoTimestampEnd: 82.0,
    down: 1, distance: 10, yardLine: 30, hash: 'LEFT',
    offensiveFormation: 'Shotgun 3x1', offensivePersonnel: '11',
    motionType: 'RETURN', motionDirection: 'LEFT', motionPlayerJersey: 7,
    blockingScheme: 'INSIDE_ZONE',
    defensiveFront: '4-3', defensivePackage: '4-3', coverageScheme: 'COVER_6',
    defenseReactionToMotion: 'Safety rotates to trips side on return motion',
    playType: 'RUN', playActionFake: false, runGap: 'A_RIGHT',
    yardsGained: 6, epa: 0.45, successRate: true,
    isFirstDown: false, isTouchdown: false, isTurnover: false, isPenalty: false,
    playDescription: 'Return motion by #7 pulls the safety to trips. Inside zone right through the A-gap. #22 Carter reads the double team and cuts back for 6.',
    comments: [
      makeComment('c12', 'play-007', 76.0, 'u12', 'The return motion is diagnostic gold — tells us they\'re in Cover 6 when the safety rotates to trips.', []),
    ],
    actionItems: [],
    telestrationStrokes: [],
  },
  {
    id: 'play-008', gameId: GAME_ID, playNumber: 8, quarter: 2, gameClock: '7:55',
    videoTimestampStart: 84.0, videoTimestampSnap: 87.2, videoTimestampEnd: 93.5,
    down: 2, distance: 4, yardLine: 36, hash: 'MIDDLE',
    offensiveFormation: 'Under Center Ace', offensivePersonnel: '12',
    motionType: 'SHIFT_BACKFIELD', motionDirection: 'RIGHT', motionPlayerJersey: 22,
    blockingScheme: 'GAP_COUNTER',
    defensiveFront: '3-4 Okie', defensivePackage: '3-4', coverageScheme: 'COVER_1',
    defenseReactionToMotion: 'No adjustment — man coverage stays locked',
    playType: 'RUN', playActionFake: false, runGap: 'C_LEFT',
    yardsGained: 8, epa: 0.95, successRate: true,
    isFirstDown: true, isTouchdown: false, isTurnover: false, isPenalty: false,
    playDescription: 'Counter left with RB shift. Guard and tackle pull to the C-gap. Man coverage can\'t help in the box. 8-yard gain and a first down.',
    comments: [],
    actionItems: [],
    telestrationStrokes: [],
  },
  {
    id: 'play-009', gameId: GAME_ID, playNumber: 9, quarter: 3, gameClock: '10:15',
    videoTimestampStart: 95.0, videoTimestampMotion: 97.2, videoTimestampSnap: 99.0, videoTimestampEnd: 106.0,
    down: 1, distance: 10, yardLine: 50, hash: 'RIGHT',
    offensiveFormation: 'Shotgun 2x2', offensivePersonnel: '11',
    motionType: 'JET_SWEEP', motionDirection: 'RIGHT', motionPlayerJersey: 7,
    blockingScheme: 'PASS_PRO', routeConcept: 'DAGGER',
    defensiveFront: 'Nickel', defensivePackage: 'NICKEL', coverageScheme: 'COVER_3',
    defenseReactionToMotion: 'CB follows jet motion, leaving post route single coverage',
    playType: 'PASS', playActionFake: false,
    targetPlayerJersey: 4, yardsGained: 35, epa: 3.2, successRate: true,
    isFirstDown: true, isTouchdown: false, isTurnover: false, isPenalty: false,
    playDescription: 'Jet motion by #7 pulls the corner. QB pumps the jet and throws the deep post to #4 Harris behind the safety. 35-yard gain to the 15.',
    comments: [
      makeComment('c13', 'play-009', 99.5, 'u9', 'EXPLOSIVE PLAY! @Coach Davis the jet motion + post is our bread and butter. Their Cover 3 safety can\'t handle both.', ['u10']),
      makeComment('c14', 'play-009', 101.0, 'u12', 'Third time we\'ve gotten 15+ yards off jet motion reads. Their DC needs to adjust or we keep exploiting this.', []),
    ],
    actionItems: [],
    telestrationStrokes: [],
  },
  {
    id: 'play-010', gameId: GAME_ID, playNumber: 10, quarter: 3, gameClock: '9:45',
    videoTimestampStart: 108.0, videoTimestampSnap: 111.0, videoTimestampEnd: 115.5,
    down: 1, distance: 10, yardLine: 85, hash: 'MIDDLE',
    offensiveFormation: 'Shotgun Doubles', offensivePersonnel: '11',
    motionType: 'NONE',
    blockingScheme: 'SCREEN_RELEASE', routeConcept: 'CURL_FLAT',
    defensiveFront: '4-3 Under', defensivePackage: 'NICKEL', coverageScheme: 'COVER_2',
    playType: 'SCREEN', playActionFake: false,
    targetPlayerJersey: 22, yardsGained: -3, epa: -1.5, successRate: false,
    isFirstDown: false, isTouchdown: false, isTurnover: false, isPenalty: false,
    playDescription: 'RB screen right. Linebacker reads the screen and blows it up in the backfield for a 3-yard loss.',
    comments: [
      makeComment('c15', 'play-010', 112.5, 'u10', 'Screen was sniffed out. @Jamal Carter need to sell the pass pro before releasing.', ['u2']),
    ],
    actionItems: [
      makeAction('a4', 'play-010', GAME_ID, 'Improve screen setup selling', 'Work on 2-count pass pro sell before releasing into the screen route. LBs are reading the immediate release.', 'u2', 'u10', 'MEDIUM', 'TODO', 112.5),
    ],
    telestrationStrokes: [],
  },
  {
    id: 'play-011', gameId: GAME_ID, playNumber: 11, quarter: 3, gameClock: '6:30',
    videoTimestampStart: 117.0, videoTimestampMotion: 119.5, videoTimestampSnap: 121.2, videoTimestampEnd: 128.0,
    down: 3, distance: 8, yardLine: 45, hash: 'LEFT',
    offensiveFormation: 'Shotgun Trips Right', offensivePersonnel: '10',
    motionType: 'FLY', motionDirection: 'LEFT', motionPlayerJersey: 7,
    blockingScheme: 'PASS_PRO', routeConcept: 'Y_CROSS',
    defensiveFront: 'Nickel', defensivePackage: 'DIME', coverageScheme: 'COVER_4',
    defenseReactionToMotion: 'Quarters rotation adjusts cleanly to fly motion',
    playType: 'PASS', playActionFake: false,
    targetPlayerJersey: 88, yardsGained: 12, epa: 1.45, successRate: true,
    isFirstDown: true, isTouchdown: false, isTurnover: false, isPenalty: false,
    playDescription: '3rd and 8. Fly motion left by #7. Quarters handles the motion but the deep cross by #88 Brooks finds a window between zones. 12-yard gain, first down.',
    comments: [
      makeComment('c16', 'play-011', 123.0, 'u10', 'Critical conversion. @Tyler Brooks sat down in the zone perfectly. @Marcus Williams great poise in the pocket on 3rd down.', ['u4', 'u1']),
    ],
    actionItems: [],
    telestrationStrokes: [],
  },
  {
    id: 'play-012', gameId: GAME_ID, playNumber: 12, quarter: 4, gameClock: '4:00',
    videoTimestampStart: 130.0, videoTimestampMotion: 132.8, videoTimestampSnap: 134.5, videoTimestampEnd: 140.0,
    down: 2, distance: 5, yardLine: 70, hash: 'RIGHT',
    offensiveFormation: 'Shotgun 3x1', offensivePersonnel: '11',
    motionType: 'ORBIT', motionDirection: 'LEFT', motionPlayerJersey: 22,
    blockingScheme: 'OUTSIDE_ZONE', routeConcept: 'LEVELS',
    defensiveFront: '3-4', defensivePackage: 'NICKEL', coverageScheme: 'MAN_FREE',
    defenseReactionToMotion: 'Man coverage trails orbit — slow to adjust',
    playType: 'RPO', playActionFake: false,
    targetPlayerJersey: 7, yardsGained: 15, epa: 1.9, successRate: true,
    isFirstDown: true, isTouchdown: false, isTurnover: false, isPenalty: false,
    playDescription: 'RPO with orbit motion. Man coverage slow to adjust. QB pulls the ball and hits #7 Chen on the levels concept for 15 yards.',
    comments: [
      makeComment('c17', 'play-012', 135.0, 'u9', 'This is how we close games. Motion is killing their man coverage. Keep it going @Coach Davis.', ['u10']),
    ],
    actionItems: [],
    telestrationStrokes: [],
  },
  {
    id: 'play-013', gameId: GAME_ID, playNumber: 13, quarter: 4, gameClock: '2:15',
    videoTimestampStart: 142.0, videoTimestampSnap: 145.5, videoTimestampEnd: 150.0,
    down: 1, distance: 10, yardLine: 85, hash: 'MIDDLE',
    offensiveFormation: 'Shotgun Trips Left', offensivePersonnel: '11',
    motionType: 'JET_SWEEP', motionDirection: 'RIGHT', motionPlayerJersey: 4,
    blockingScheme: 'OUTSIDE_ZONE',
    defensiveFront: '4-3', defensivePackage: 'NICKEL', coverageScheme: 'COVER_3',
    defenseReactionToMotion: 'Corner bites on jet fake — boundary wide open',
    playType: 'RUN', playActionFake: false, runGap: 'OUTSIDE_RIGHT',
    yardsGained: 15, epa: 2.1, successRate: true,
    isFirstDown: true, isTouchdown: true, isTurnover: false, isPenalty: false,
    playDescription: 'Jet sweep handoff to #4 Harris on the right side. Corner bites on the fake to the flat. Harris turns the corner and scores! TOUCHDOWN!',
    comments: [
      makeComment('c18', 'play-013', 147.0, 'u9', '🏈 THAT\'S THE GAME! @DeShawn Harris has been incredible today. Jet motion was the key to this drive.', ['u3']),
      makeComment('c19', 'play-013', 148.0, 'u10', 'Third TD involving pre-snap motion. The game plan worked exactly as designed.', []),
    ],
    actionItems: [],
    telestrationStrokes: [],
  },
  {
    id: 'play-014', gameId: GAME_ID, playNumber: 14, quarter: 4, gameClock: '0:45',
    videoTimestampStart: 152.0, videoTimestampSnap: 155.0, videoTimestampEnd: 159.0,
    down: 2, distance: 8, yardLine: 55, hash: 'LEFT',
    offensiveFormation: 'Shotgun Empty', offensivePersonnel: '10',
    motionType: 'NONE',
    blockingScheme: 'PASS_PRO', routeConcept: 'VERTICALS',
    defensiveFront: 'Nickel', defensivePackage: 'DIME', coverageScheme: 'COVER_2',
    playType: 'PASS', playActionFake: false,
    targetPlayerJersey: 4, yardsGained: 0, epa: -3.8, successRate: false,
    isFirstDown: false, isTouchdown: false, isTurnover: true, isPenalty: false,
    playDescription: 'Late in the game, trying to put it away. QB forces the deep ball to #4 who is double-covered. Safety intercepts. TURNOVER.',
    comments: [
      makeComment('c20', 'play-014', 157.0, 'u10', '@Marcus Williams we were up big — no reason to force that throw. Protect the football in these situations.', ['u1']),
      makeComment('c21', 'play-014', 158.0, 'u9', 'Lesson learned. Take the check down or throw it away. Can\'t give them life late.', []),
    ],
    actionItems: [
      makeAction('a5', 'play-014', GAME_ID, 'Game management — late-game decisions', 'Film review: Identify check-down reads and when to throw the ball away in game-sealing situations.', 'u1', 'u9', 'CRITICAL', 'TODO', 157.0),
    ],
    telestrationStrokes: [],
  },
];

// ---- Mock Game Session ----

export const MOCK_GAMES: GameSession[] = [
  {
    id: GAME_ID,
    title: 'State Championship Semi-Final',
    homeTeam: 'Westfield Eagles',
    awayTeam: 'Riverside Panthers',
    date: '2024-11-15',
    season: '2024',
    videoUrl: '/api/mock-video',
    videoSource: 'FILE_UPLOAD',
    thumbnailUrl: undefined,
    duration: 162,
    analysisStatus: 'COMPLETED',
    plays: MOCK_PLAYS,
    createdAt: '2024-11-15T19:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'game-002',
    title: 'Week 10 — District Rivalry',
    homeTeam: 'Westfield Eagles',
    awayTeam: 'Lincoln Wolves',
    date: '2024-11-08',
    season: '2024',
    videoUrl: '/api/mock-video',
    videoSource: 'YOUTUBE',
    thumbnailUrl: undefined,
    duration: 145,
    analysisStatus: 'COMPLETED',
    plays: MOCK_PLAYS.slice(0, 8).map(p => ({ ...p, gameId: 'game-002' })),
    createdAt: '2024-11-08T19:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'game-003',
    title: 'Week 9 — Homecoming Game',
    homeTeam: 'Westfield Eagles',
    awayTeam: 'Central Bears',
    date: '2024-11-01',
    season: '2024',
    videoUrl: '',
    videoSource: 'HUDL',
    thumbnailUrl: undefined,
    duration: 0,
    analysisStatus: 'PENDING',
    plays: [],
    createdAt: '2024-11-01T19:00:00Z',
    updatedAt: new Date().toISOString(),
  },
];

// ---- Mock Notifications ----

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1', type: 'MENTION', message: 'Coach Davis mentioned you in Play #3',
    gameId: GAME_ID, playId: 'play-003', videoTimestamp: 30.0,
    isRead: false, createdAt: new Date(Date.now() - 1800000).toISOString(),
    fromUser: findUser('u10'), toUser: findUser('u1'),
  },
  {
    id: 'n2', type: 'ACTION_ASSIGNED', message: 'New action item: "Fix boundary read on Cover 2"',
    gameId: GAME_ID, playId: 'play-006', videoTimestamp: 65.5,
    isRead: false, createdAt: new Date(Date.now() - 3600000).toISOString(),
    fromUser: findUser('u10'), toUser: findUser('u1'),
  },
  {
    id: 'n3', type: 'MENTION', message: 'Coach Miller mentioned you in Play #5',
    gameId: GAME_ID, playId: 'play-005', videoTimestamp: 53.0,
    isRead: true, createdAt: new Date(Date.now() - 7200000).toISOString(),
    fromUser: findUser('u9'), toUser: findUser('u3'),
  },
  {
    id: 'n4', type: 'ACTION_ASSIGNED', message: 'New action item: "Work on pressing B-gap holes"',
    gameId: GAME_ID, playId: 'play-002', videoTimestamp: 18.5,
    isRead: false, createdAt: new Date(Date.now() - 5400000).toISOString(),
    fromUser: findUser('u11'), toUser: findUser('u2'),
  },
  {
    id: 'n5', type: 'ACTION_ASSIGNED', message: 'CRITICAL: "Game management — late-game decisions"',
    gameId: GAME_ID, playId: 'play-014', videoTimestamp: 157.0,
    isRead: false, createdAt: new Date(Date.now() - 900000).toISOString(),
    fromUser: findUser('u9'), toUser: findUser('u1'),
  },
];

// ---- Mock Drive Summaries ----

export const MOCK_DRIVES: DriveInfo[] = [
  { id: 'd1', startQuarter: 1, startYardLine: 25, endYardLine: 100, plays: 5, yards: 75, result: 'TOUCHDOWN', timeOfPossession: '3:45' },
  { id: 'd2', startQuarter: 2, startYardLine: 20, endYardLine: 44, plays: 4, yards: 24, result: 'PUNT', timeOfPossession: '2:15' },
  { id: 'd3', startQuarter: 2, startYardLine: 30, endYardLine: 100, plays: 8, yards: 70, result: 'TOUCHDOWN', timeOfPossession: '5:30' },
  { id: 'd4', startQuarter: 3, startYardLine: 35, endYardLine: 82, plays: 5, yards: 47, result: 'FIELD_GOAL', timeOfPossession: '3:00' },
  { id: 'd5', startQuarter: 4, startYardLine: 40, endYardLine: 100, plays: 6, yards: 60, result: 'TOUCHDOWN', timeOfPossession: '4:15' },
  { id: 'd6', startQuarter: 4, startYardLine: 30, endYardLine: 55, plays: 3, yards: 25, result: 'TURNOVER', timeOfPossession: '1:30' },
];

// ---- Mock Box Score ----

export const MOCK_BOX_SCORE: TeamBoxScore = {
  totalYards: 385,
  passingYards: 242,
  rushingYards: 143,
  totalPlays: 62,
  firstDowns: 22,
  thirdDownConversions: 6,
  thirdDownAttempts: 11,
  fourthDownConversions: 1,
  fourthDownAttempts: 2,
  redZoneScores: 4,
  redZoneAttempts: 5,
  turnovers: 1,
  penalties: 4,
  penaltyYards: 35,
  timeOfPossession: '32:15',
  avgEpa: 0.85,
  successRate: 58.2,
};

// ---- Mock Heatmap Data ----

export const MOCK_HEATMAP_POINTS: FieldHeatmapPoint[] = [
  { x: 30, y: 25, intensity: 0.8, playType: 'RUN', yardsGained: 14, gap: 'OUTSIDE_LEFT' },
  { x: 55, y: 39, intensity: 0.3, playType: 'RUN', yardsGained: 4, gap: 'B_RIGHT' },
  { x: 50, y: 43, intensity: 0.9, playType: 'RPO', yardsGained: 18 },
  { x: 40, y: 61, intensity: 0.95, playType: 'PLAY_ACTION_BOOT', yardsGained: 22 },
  { x: 70, y: 83, intensity: 1.0, playType: 'PASS', yardsGained: 17 },
  { x: 60, y: 42, intensity: 0.5, playType: 'PASS', yardsGained: -2 },
  { x: 45, y: 30, intensity: 0.6, playType: 'RUN', yardsGained: 6, gap: 'A_RIGHT' },
  { x: 48, y: 36, intensity: 0.7, playType: 'RUN', yardsGained: 8, gap: 'C_LEFT' },
  { x: 65, y: 50, intensity: 0.85, playType: 'PASS', yardsGained: 35 },
  { x: 55, y: 85, intensity: 0.4, playType: 'SCREEN', yardsGained: -3 },
  { x: 50, y: 45, intensity: 0.75, playType: 'PASS', yardsGained: 12 },
  { x: 70, y: 85, intensity: 0.95, playType: 'RUN', yardsGained: 15, gap: 'OUTSIDE_RIGHT' },
  { x: 40, y: 70, intensity: 0.8, playType: 'RPO', yardsGained: 15 },
  { x: 55, y: 55, intensity: 0.1, playType: 'PASS', yardsGained: 0 },
];

// ---- Helper: Get game by ID ----
export function getGameById(id: string): GameSession | undefined {
  return MOCK_GAMES.find(g => g.id === id);
}
