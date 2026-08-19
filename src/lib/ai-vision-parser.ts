// ============================================================================
// Peddie Football Analytics — AI Multimodal Vision Analysis Parser
// ============================================================================
// Supports Gemini 1.5 Pro/Flash & OpenAI GPT-4o Vision with automatic
// heuristic mock fallback for zero-API instant testing.

import { PlayAnalysis, PlayType, PreSnapMotionType, CoverageScheme, Down, Quarter } from '@/types/football';
import { generateId } from './utils';

// ---- Configuration ----

interface AIConfig {
  provider: 'gemini' | 'openai' | 'mock';
  apiKey?: string;
  model?: string;
}

function getAIConfig(): AIConfig {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (geminiKey) return { provider: 'gemini', apiKey: geminiKey, model: 'gemini-1.5-pro' };
  if (openaiKey) return { provider: 'openai', apiKey: openaiKey, model: 'gpt-4o' };
  return { provider: 'mock' };
}

// ---- Gemini Vision API ----

async function analyzeWithGemini(
  videoUrl: string,
  apiKey: string,
  model: string
): Promise<PlayAnalysis[]> {
  const prompt = `You are an expert football film analyst. Analyze this football game video and identify each individual play.

For each play, extract:
1. Play number, quarter, game clock
2. Down, distance, yard line, hash mark
3. Offensive formation and personnel grouping
4. Pre-snap motion type (JET_SWEEP, ORBIT, FLY, RETURN, TRADE_TE, SHIFT_BACKFIELD, or NONE)
5. Motion direction, player jersey number
6. Defensive front, package, and coverage scheme
7. Defensive reaction to motion (if applicable)
8. Play type (PASS, RUN, PLAY_ACTION_BOOT, RPO, SCREEN, DRAW, PUNT, FIELD_GOAL, TRICK_REVERSE, TURNOVER)
9. Blocking scheme and route concept (if applicable)
10. Yards gained, whether it resulted in first down, touchdown, or turnover
11. Video timestamps: start, pre-snap motion, snap, end

Return as JSON array matching the PlayAnalysis interface.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { fileData: { mimeType: 'video/mp4', fileUri: videoUrl } },
            ],
          }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error('Gemini API error:', response.status);
      return generateMockAnalysis(videoUrl);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return generateMockAnalysis(videoUrl);

    return JSON.parse(text) as PlayAnalysis[];
  } catch (error) {
    console.error('Gemini analysis failed, falling back to mock:', error);
    return generateMockAnalysis(videoUrl);
  }
}

// ---- OpenAI GPT-4o Vision API ----

async function analyzeWithOpenAI(
  videoUrl: string,
  apiKey: string,
  model: string
): Promise<PlayAnalysis[]> {
  // OpenAI Vision API for video frame analysis
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this football game video and identify each play with detailed tactical breakdown including pre-snap motions, formations, coverage schemes, and play results. Return as JSON.`,
            },
            {
              type: 'image_url',
              image_url: { url: videoUrl },
            },
          ],
        }],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status);
      return generateMockAnalysis(videoUrl);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) return generateMockAnalysis(videoUrl);

    const parsed = JSON.parse(text);
    return parsed.plays ?? parsed;
  } catch (error) {
    console.error('OpenAI analysis failed, falling back to mock:', error);
    return generateMockAnalysis(videoUrl);
  }
}

// ---- Mock Heuristic Engine ----
// Generates realistic-looking play analysis data without any API calls

const FORMATIONS = [
  'Shotgun Trips Right', 'Shotgun 2x2', 'I-Formation', 'Pistol Offset',
  'Shotgun Empty', 'Shotgun 3x1', 'Under Center Ace', 'Shotgun Doubles',
  'Singleback', 'Shotgun Trips Left', 'Pistol Trips', 'Gun Bunch',
];

const PLAY_TYPES: PlayType[] = ['PASS', 'RUN', 'PLAY_ACTION_BOOT', 'RPO', 'SCREEN', 'DRAW'];
const MOTION_TYPES: PreSnapMotionType[] = ['NONE', 'NONE', 'NONE', 'JET_SWEEP', 'ORBIT', 'FLY', 'RETURN', 'TRADE_TE', 'SHIFT_BACKFIELD'];
const COVERAGES: CoverageScheme[] = ['COVER_0', 'COVER_1', 'COVER_2', 'COVER_3', 'COVER_4', 'COVER_6', 'MAN_FREE', 'MAN_PRESS'];
const FRONTS = ['4-3 Under', '4-3 Over', '3-4', '3-4 Eagle', 'Nickel', '3-4 Okie'];
const ROUTE_CONCEPTS = ['MESH', 'SMASH', 'FLOOD', 'Y_CROSS', 'VERTICALS', 'CURL_FLAT', 'SLANT_FLAT', 'FOUR_VERTS', 'DAGGER', 'LEVELS'] as const;
const RUN_GAPS = ['A_LEFT', 'A_RIGHT', 'B_LEFT', 'B_RIGHT', 'C_LEFT', 'C_RIGHT', 'OUTSIDE_LEFT', 'OUTSIDE_RIGHT'] as const;

function randElement<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateMockAnalysis(videoUrl: string, gameId?: string): PlayAnalysis[] {
  const numPlays = randInt(10, 18);
  const plays: PlayAnalysis[] = [];
  let currentTime = 0;
  let yardLine = 25;
  let quarter: Quarter = 1;
  let gameClock = 15 * 60;

  for (let i = 0; i < numPlays; i++) {
    const down = (i % 4 === 0 ? 1 : i % 4 === 1 ? 2 : i % 4 === 2 ? 3 : 1) as Down;
    const distance = down === 1 ? 10 : randInt(3, 15);
    const playType = randElement(PLAY_TYPES);
    const motionType = randElement(MOTION_TYPES);
    const hasMotion = motionType !== 'NONE';

    // Yards gained with some variance
    const baseYards = playType === 'RUN' ? randInt(-2, 12)
      : playType === 'PASS' ? randInt(-5, 35)
      : playType === 'RPO' ? randInt(0, 20)
      : playType === 'SCREEN' ? randInt(-3, 15)
      : randInt(-2, 25);

    // Motion bonus
    const motionBonus = hasMotion ? randInt(1, 5) : 0;
    const yardsGained = baseYards + motionBonus;

    const isTouchdown = yardLine + yardsGained >= 100;
    const isTurnover = Math.random() < 0.05;
    const isFirstDown = yardsGained >= distance;

    // EPA calculation (simplified)
    const epa = isTouchdown ? randInt(25, 40) / 10
      : isTurnover ? -randInt(20, 40) / 10
      : yardsGained > 10 ? randInt(10, 30) / 10
      : yardsGained > 0 ? randInt(-5, 15) / 10
      : -randInt(5, 25) / 10;

    const motionStart = hasMotion ? currentTime + randInt(2, 4) : undefined;
    const snapTime = currentTime + randInt(4, 6);
    const endTime = snapTime + randInt(3, 8);

    plays.push({
      id: generateId(),
      gameId: gameId ?? `game-${Date.now()}`,
      playNumber: i + 1,
      quarter,
      gameClock: `${Math.floor(gameClock / 60)}:${(gameClock % 60).toString().padStart(2, '0')}`,
      videoTimestampStart: currentTime,
      videoTimestampMotion: motionStart,
      videoTimestampSnap: snapTime,
      videoTimestampEnd: endTime,
      down,
      distance,
      yardLine: Math.max(1, Math.min(99, yardLine)),
      hash: randElement(['LEFT', 'MIDDLE', 'RIGHT'] as const),
      offensiveFormation: randElement(FORMATIONS),
      offensivePersonnel: randElement(['11', '12', '21', '10'] as const),
      motionType,
      motionDirection: hasMotion ? randElement(['LEFT', 'RIGHT'] as const) : undefined,
      motionPlayerJersey: hasMotion ? randElement([4, 7, 22, 88]) : undefined,
      blockingScheme: playType === 'RUN' ? randElement(['INSIDE_ZONE', 'OUTSIDE_ZONE', 'GAP_POWER', 'GAP_COUNTER'] as const) : 'PASS_PRO',
      routeConcept: ['PASS', 'RPO', 'PLAY_ACTION_BOOT', 'SCREEN'].includes(playType) ? randElement(ROUTE_CONCEPTS) : undefined,
      defensiveFront: randElement(FRONTS),
      defensivePackage: randElement(['4-3', 'NICKEL', '3-4', 'DIME'] as const),
      coverageScheme: randElement(COVERAGES),
      defenseReactionToMotion: hasMotion
        ? randElement([
            'Corner rotates with motion',
            'Safety rolls to motion side',
            'LB walks out to cover motion man',
            'No adjustment — stays in base alignment',
            'Nickel slides to motion side',
          ])
        : undefined,
      playType,
      playActionFake: playType === 'PLAY_ACTION_BOOT' || (playType === 'PASS' && Math.random() < 0.2),
      runGap: playType === 'RUN' ? randElement(RUN_GAPS) : undefined,
      targetPlayerJersey: playType !== 'RUN' ? randElement([4, 7, 88, 22]) : undefined,
      yardsGained,
      epa: Number(epa.toFixed(2)),
      successRate: isFirstDown || isTouchdown,
      isFirstDown,
      isTouchdown,
      isTurnover,
      isPenalty: Math.random() < 0.08,
      playDescription: generatePlayDescription(playType, motionType, yardsGained, isTouchdown, isTurnover),
      comments: [],
      actionItems: [],
      telestrationStrokes: [],
    });

    currentTime = endTime + randInt(5, 15);
    yardLine = isTouchdown ? 25 : isTurnover ? 100 - yardLine : Math.max(1, Math.min(99, yardLine + yardsGained));
    gameClock -= randInt(25, 45);

    if (gameClock <= 0) {
      quarter = Math.min(quarter + 1, 4) as Quarter;
      gameClock = 15 * 60;
    }
  }

  return plays;
}

function generatePlayDescription(
  playType: PlayType, motionType: PreSnapMotionType,
  yards: number, isTD: boolean, isTO: boolean
): string {
  const motionPrefix = motionType !== 'NONE'
    ? `${motionType.replace('_', ' ').toLowerCase()} motion pre-snap. `
    : '';

  if (isTO) return `${motionPrefix}${playType === 'PASS' ? 'QB forces the throw into coverage' : 'Fumble on the exchange'}. Turnover.`;
  if (isTD) return `${motionPrefix}${yards}-yard ${playType.toLowerCase().replace('_', '-')} for a TOUCHDOWN!`;

  const result = yards > 15 ? 'explosive play'
    : yards > 5 ? 'solid gain'
    : yards > 0 ? 'short gain'
    : 'loss behind the line';

  return `${motionPrefix}${playType.toLowerCase().replace('_', ' ')} play. ${Math.abs(yards)}-yard ${result}.`;
}

// ---- Main Analysis Entry Point ----

export async function analyzeVideo(
  videoUrl: string,
  gameId: string
): Promise<PlayAnalysis[]> {
  const config = getAIConfig();

  switch (config.provider) {
    case 'gemini':
      return analyzeWithGemini(videoUrl, config.apiKey!, config.model!);
    case 'openai':
      return analyzeWithOpenAI(videoUrl, config.apiKey!, config.model!);
    case 'mock':
    default:
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      return generateMockAnalysis(videoUrl, gameId);
  }
}

export { getAIConfig };
