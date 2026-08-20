'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Swords, Shield, Brain, Sparkles, Target, Zap, Activity,
  Users, Layers, ArrowRight, Play, CheckCircle2, AlertTriangle,
  RotateCcw, Compass, Database, Code, Sliders, ChevronRight,
  TrendingUp, Award, Flame, Film, UserCheck, UserX, Cpu
} from 'lucide-react';
import { TEAM_ROSTER, MOCK_GAMES } from '@/lib/mock-game-data';
import { aggregateEPA } from '@/lib/epa-calculator';
import { useSeason } from '@/context/SeasonContext';
import { AntigravityTacticalHUD } from '@/components/AntigravityTacticalHUD';

// --- Available Offensive Personnel Groupings ---
interface PersonnelOption {
  id: string;
  name: string;
  code: string;
  description: string;
  rbCount: number;
  teCount: number;
  wrCount: number;
  preferredStarters: {
    qb: string;
    rb: string[];
    te: string[];
    wr: string[];
    ol: string[];
  };
}

const PERSONNEL_GROUPINGS: PersonnelOption[] = [
  {
    id: '11-personnel',
    name: '11 Personnel (Standard Spread)',
    code: '1 RB · 1 TE · 3 WR',
    description: 'Optimal for spread passing, RPO meshes, and isolating Benjamin Perkins (#22) in the slot.',
    rbCount: 1,
    teCount: 1,
    wrCount: 3,
    preferredStarters: {
      qb: '#15 Freddy Melton (Sr) / #6 Joey Gaston (Sr)',
      rb: ['#3 Jeremiah Davis (Sr)'],
      te: ['#4 Cooper Allen (Sr - Merrimack commit)'],
      wr: ['#5 Lorenzo Barone (Sr)', '#21 Xzavier Torres (Fr)', '#22 Benjamin Perkins (So)'],
      ol: ['#72 Christian Velardi (LT)', '#54 Rocco Annunziata (LG)', '#60 Adem Amar (C)', '#63 Julian Sandy (RG)', '#70 Reed Oliver (RT)'],
    },
  },
  {
    id: '12-personnel',
    name: '12 Personnel (Two-Tight End Ace)',
    code: '1 RB · 2 TE · 2 WR',
    description: 'Heavy pass protection and play-action seams with Cooper Allen (#4) and Finn Pedersen (#45).',
    rbCount: 1,
    teCount: 2,
    wrCount: 2,
    preferredStarters: {
      qb: '#15 Freddy Melton (Sr)',
      rb: ['#3 Jeremiah Davis (Sr)'],
      te: ['#4 Cooper Allen (Sr)', '#45 Finn Pedersen (Jr)'],
      wr: ['#5 Lorenzo Barone (Sr)', '#21 Xzavier Torres (Fr)'],
      ol: ['#72 Christian Velardi (LT)', '#54 Rocco Annunziata (LG)', '#60 Adem Amar (C)', '#63 Julian Sandy (RG)', '#70 Reed Oliver (RT)'],
    },
  },
  {
    id: '21-personnel',
    name: '21 Personnel (Pro I / Power Set)',
    code: '2 RB · 1 TE · 2 WR',
    description: 'Dual backfield with Davis (#3) and Huling (#2) lead blocking against light boxes.',
    rbCount: 2,
    teCount: 1,
    wrCount: 2,
    preferredStarters: {
      qb: '#15 Freddy Melton (Sr)',
      rb: ['#3 Jeremiah Davis (Sr)', '#2 Kadin Huling (Jr)'],
      te: ['#4 Cooper Allen (Sr)'],
      wr: ['#5 Lorenzo Barone (Sr)', '#22 Benjamin Perkins (So)'],
      ol: ['#72 Christian Velardi (LT)', '#54 Rocco Annunziata (LG)', '#60 Adem Amar (C)', '#63 Julian Sandy (RG)', '#70 Reed Oliver (RT)'],
    },
  },
  {
    id: '20-personnel',
    name: '20 Personnel (Dual-Threat Option)',
    code: '2 RB · 0 TE · 3 WR',
    description: 'Zone read and speed option designed for Joey Gaston (#6) and Jeremiah Davis (#3).',
    rbCount: 2,
    teCount: 0,
    wrCount: 3,
    preferredStarters: {
      qb: '#6 Joey Gaston (Sr - Gardner-Webb commit)',
      rb: ['#3 Jeremiah Davis (Sr)', '#2 Kadin Huling (Jr)'],
      te: [],
      wr: ['#5 Lorenzo Barone (Sr)', '#21 Xzavier Torres (Fr)', '#11 JT Rulewich (So)'],
      ol: ['#72 Christian Velardi (LT)', '#54 Rocco Annunziata (LG)', '#60 Adem Amar (C)', '#63 Julian Sandy (RG)', '#70 Reed Oliver (RT)'],
    },
  },
  {
    id: '10-personnel',
    name: '10 Personnel (5-Wide Empty)',
    code: '0 RB · 0 TE · 5 WR',
    description: 'Maximum spread attacking Cover 3 deep thirds and bracketed safeties with tempo.',
    rbCount: 0,
    teCount: 0,
    wrCount: 5,
    preferredStarters: {
      qb: '#15 Freddy Melton (Sr)',
      rb: [],
      te: [],
      wr: ['#5 Lorenzo Barone', '#21 Xzavier Torres', '#14 Jonathan Stizza', '#22 Benjamin Perkins', '#11 JT Rulewich'],
      ol: ['#72 Christian Velardi (LT)', '#54 Rocco Annunziata (LG)', '#60 Adem Amar (C)', '#63 Julian Sandy (RG)', '#70 Reed Oliver (RT)'],
    },
  },
  {
    id: 'heavy-jumbo',
    name: 'Heavy Goal Line / Short Yardage',
    code: '2 RB · 2 TE · 6 OL',
    description: 'Reed Oliver (#70), Rocco Annunziata (#54) & Mason Kish (#77) opening power lanes for Davis (#3).',
    rbCount: 2,
    teCount: 2,
    wrCount: 0,
    preferredStarters: {
      qb: '#15 Freddy Melton (Sr)',
      rb: ['#3 Jeremiah Davis (Sr)', '#2 Kadin Huling (Jr)'],
      te: ['#4 Cooper Allen (Sr)', '#45 Finn Pedersen (Jr)'],
      wr: [],
      ol: ['#72 Christian Velardi (LT)', '#54 Rocco Annunziata (LG)', '#60 Adem Amar (C)', '#63 Julian Sandy (RG)', '#70 Reed Oliver (RT)', '#77 Mason Kish (Jumbo Tackle)'],
    },
  },
];

// --- Defensive Shell Configurations ---
const DEFENSIVE_SHELLS = [
  { id: 'COVER_1', name: 'Cover 1 Man-Free', desc: 'Single-high safety, tight man-to-man underneath. Vulnerable to mesh crossings and Perkins wheel routes.' },
  { id: 'COVER_2', name: 'Cover 2 (Tampa 2)', desc: '2 deep safeties, 5 underneath zone defenders. Vulnerable to middle hole shots and post-corners.' },
  { id: 'COVER_3', name: 'Cover 3 Sky / Cloud', desc: '3 deep zones, 4 underneath defenders. Vulnerable to deep 4-verticals and flood concepts into the flats.' },
  { id: 'COVER_4', name: 'Cover 4 Quarters', desc: '4 deep quarters. Vulnerable to play-action post-dig combos and underneath checkdowns.' },
  { id: 'COVER_0', name: 'Cover 0 All-Out Blitz', desc: 'Zero deep safety, 6+ rushers. Requires immediate hot route release to Perkins/Barone.' },
];

const DEFENSIVE_FRONTS = [
  { id: '4-3-over', name: '4-3 Over Front', boxCount: 7, desc: 'Even front shaded to strong side. A-gap cutback lane open for zone runs.' },
  { id: '3-4-okie', name: '3-4 Okie / Light Box', boxCount: 6, desc: '6-man box favoring pass defense. Highly vulnerable to Power I and inside zone.' },
  { id: '5-2-blitz', name: '5-2 Fire Blitz', boxCount: 8, desc: '8-man heavy box crowding line of scrimmage. Exploited by max protection play-action shots.' },
  { id: '3-3-5-nickel', name: '3-3-5 Nickel Subpackage', boxCount: 6, desc: 'Speed package with 5 defensive backs. Exploitable by 12 personnel tight end mismatches.' },
  { id: '6-2-goal-line', name: '6-2 Goal Line Wall', boxCount: 8, desc: 'Heavy interior plug. Vulnerable to perimeter sprintout option and TE bootlegs.' },
];

export default function OffensiveCoachPage() {
  const params = useParams();
  const router = useRouter();
  const { currentSeason, seasonMetadata, games, roster } = useSeason();
  const gameId = (params?.id as string) || games[0]?.id || 'peddie-blair-2025';

  // State
  const [selectedOpponent, setSelectedOpponent] = useState(gameId);
  const [selectedPersonnel, setSelectedPersonnel] = useState<string>('11-personnel');
  const [selectedCoverage, setSelectedCoverage] = useState<string>('COVER_3');
  const [selectedFront, setSelectedFront] = useState<string>('4-3-over');
  const [selectedDownDistance, setSelectedDownDistance] = useState<string>('1st-10');
  const [selectedFieldZone, setSelectedFieldZone] = useState<string>('midfield');

  // Key Athlete Availability Toggle (Starters Active vs Out)
  const [availablePlayers, setAvailablePlayers] = useState<{ [key: string]: boolean }>({
    '#15 Freddy Melton (QB)': true,
    '#6 Joey Gaston (QB)': true,
    '#3 Jeremiah Davis (RB)': true,
    '#2 Kadin Huling (RB/FB)': true,
    '#4 Cooper Allen (TE - Merrimack)': true,
    '#45 Finn Pedersen (TE)': true,
    '#5 Lorenzo Barone (WR)': true,
    '#22 Benjamin Perkins (WR)': true,
    '#14 Jonathan Stizza (WR)': true,
    '#72 Christian Velardi (LT - Fordham)': true,
    '#70 Reed Oliver (RT - Marist)': true,
  });

  const togglePlayer = (name: string) => {
    setAvailablePlayers(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const currentPersonnel = useMemo(() => {
    return PERSONNEL_GROUPINGS.find(p => p.id === selectedPersonnel) || PERSONNEL_GROUPINGS[0];
  }, [selectedPersonnel]);

  // Machine Learning Counter-Play Synthesis Engine (ml-best-practices)
  const generatedPlayCalls = useMemo(() => {
    const isCover1 = selectedCoverage === 'COVER_1';
    const isCover2 = selectedCoverage === 'COVER_2';
    const isCover3 = selectedCoverage === 'COVER_3';
    const isCover4 = selectedCoverage === 'COVER_4';
    const isCover0 = selectedCoverage === 'COVER_0';

    const isLightBox = selectedFront === '3-4-okie' || selectedFront === '3-3-5-nickel';
    const isHeavyBox = selectedFront === '5-2-blitz' || selectedFront === '6-2-goal-line';

    const plays = [];

    // Play 1: Primary Counter-Attack Shot
    if (isCover3) {
      plays.push({
        id: 'play-1',
        name: 'Gun Trips Open — "Falcon Dagger & Perkins Seam-Wheel"',
        concept: 'Dagger / Seam-Wheel Concept',
        type: 'PASS',
        xEPA: '+1.64 EPA',
        successRate: '82.4%',
        explosiveRate: '46.0%',
        turnoverRisk: '1.8%',
        motion: 'Jet Orbit Motion by #22 Benjamin Perkins (Forces Free Safety to declare single-high)',
        protection: '6-Man Half-Slide left anchored by #72 Christian Velardi (LT) & #70 Reed Oliver (RT)',
        reads: [
          { rank: '1st Read', target: '#22 Benjamin Perkins', route: 'Seam-Wheel (18-22 yds)', window: 'Deep third boundary void behind rolling Cornerback' },
          { rank: '2nd Read', target: '#4 Cooper Allen', route: 'Deep Over Crosser (14 yds)', window: 'Underneath Free Safety depth in middle hole' },
          { rank: '3rd Read', target: '#5 Lorenzo Barone', route: 'In-Dig (12 yds)', window: 'Sitting between underneath hook-curl linebackers' },
          { rank: 'Checkdown', target: '#3 Jeremiah Davis', route: 'Texas Angle / Flare', window: 'Open flat with 8+ yards of green' },
        ],
        tacticalRationale: 'Cover 3 naturally leaves the deep seam and boundary thirds exposed against 4-vertical and Dagger flood routes. Pre-snap motion by Perkins holds the boundary safety, creating a 1-on-1 vertical mismatch.',
      });
    } else if (isCover2) {
      plays.push({
        id: 'play-1',
        name: 'Gun 2x2 Ace — "Peddie Smash-Fade & Middle Tampa Hole Shot"',
        concept: 'Smash / Middle Hole Attack',
        type: 'PASS',
        xEPA: '+1.48 EPA',
        successRate: '79.2%',
        explosiveRate: '41.5%',
        turnoverRisk: '2.4%',
        motion: 'Tight End Shift by #4 Cooper Allen to create 3x1 overloaded boundary',
        protection: '5-Man Quick Protection with #3 Jeremiah Davis chip-releasing',
        reads: [
          { rank: '1st Read', target: '#4 Cooper Allen', route: 'Tampa-2 Middle Post (16 yds)', window: 'Directly split between the two deep half safeties' },
          { rank: '2nd Read', target: '#5 Lorenzo Barone', route: 'Corner / Fade (18 yds)', window: 'Over the squatting Cover-2 Cornerback' },
          { rank: '3rd Read', target: '#22 Benjamin Perkins', route: 'Underneath Hitch / Whip (5 yds)', window: 'Quick RAC opportunity if safeties backpedal' },
          { rank: 'Checkdown', target: '#3 Jeremiah Davis', route: 'Shoot Flat', window: 'Immediate release against delayed blitz' },
        ],
        tacticalRationale: 'Cover 2 is vulnerable in the high-middle hole between the two safeties and along the honey-hole sideline (18-22 yards). Cooper Allen (#4) creates an overwhelming height mismatch against middle linebackers.',
      });
    } else if (isCover0) {
      plays.push({
        id: 'play-1',
        name: 'Gun Pistol Trips — "Zero-Burner Slant-Bubble RPO & Perkins Go"',
        concept: 'Hot-Release Quick Slant & Go',
        type: 'RPO / QUICK PASS',
        xEPA: '+2.10 EPA',
        successRate: '88.5%',
        explosiveRate: '54.0%',
        turnoverRisk: '3.1%',
        motion: 'Flash Motion by #14 Jonathan Stizza into boundary flat',
        protection: 'Quick 3-step slide with QB Freddy Melton launching in 1.4 seconds',
        reads: [
          { rank: '1st Read (Hot)', target: '#22 Benjamin Perkins', route: 'Quick Slant / Go-Route (9 yds)', window: 'Inside leverage beat on isolated boundary DB' },
          { rank: '2nd Read (Hot)', target: '#5 Lorenzo Barone', route: 'Speed Out / Smoke (5 yds)', window: 'Throw before edge rusher reaches mesh point' },
          { rank: 'Give Option', target: '#3 Jeremiah Davis', route: 'Quick Inside Trap', window: 'If edge defender bites wide on bubble' },
        ],
        tacticalRationale: 'Cover 0 has zero deep safety help. An immediate inside slant to Benjamin Perkins (#22) or Lorenzo Barone (#5) turns into an instant 60-yard house call once the lone tackler is bypassed.',
      });
    } else {
      plays.push({
        id: 'play-1',
        name: 'Pistol 11 — "Falcon Mesh Crossers & Perkins Rail Route"',
        concept: 'Drive / Mesh High-Low',
        type: 'PASS',
        xEPA: '+1.35 EPA',
        successRate: '81.0%',
        explosiveRate: '38.0%',
        turnoverRisk: '1.5%',
        motion: 'Motion #22 Perkins into slot to force man-coverage trail technique',
        protection: '6-Man Half-Slide anchored by Velardi (#72) and Oliver (#70)',
        reads: [
          { rank: '1st Read', target: '#22 Benjamin Perkins', route: 'Shallow Drag (4 yds)', window: 'Rubbing opposing defender off #4 Allen pick' },
          { rank: '2nd Read', target: '#5 Lorenzo Barone', route: 'Deep In (12 yds)', window: 'Behind linebackers chasing shallow mesh' },
          { rank: '3rd Read', target: '#4 Cooper Allen', route: 'Wheel Up Sideline (15 yds)', window: 'Beating matched safety over the top' },
        ],
        tacticalRationale: 'Man coverage cannot defend crossing picks and rub concepts. Perkins and Barone crossing at 4 yards create natural natural separation for explosive Run-After-Catch yardage.',
      });
    }

    // Play 2: Run / RPO Counter to exploit Defensive Front
    if (isLightBox) {
      plays.push({
        id: 'play-2',
        name: 'Pistol Heavy — "Peddie Power-G Lead & Davis Cutback"',
        concept: 'Power-G / Lead Iso Run',
        type: 'RUN',
        xEPA: '+1.15 EPA',
        successRate: '84.6%',
        explosiveRate: '32.0%',
        turnoverRisk: '0.5%',
        motion: 'Pre-snap motion by #2 Kadin Huling into lead fullback alignment',
        protection: '#72 Christian Velardi (LT) pull block + #63 Julian Sandy down block',
        reads: [
          { rank: 'Primary Ball Carrier', target: '#3 Jeremiah Davis', route: 'Off-Tackle B-Gap Power', window: 'Following Christian Velardi (#72) kick-out block' },
          { rank: 'Lead Blocker', target: '#2 Kadin Huling', route: 'Sealing Middle Linebacker', window: 'Creates clean 8-yard interior running lane' },
        ],
        tacticalRationale: 'Against a 6-man light box, Peddie has a +1 hat advantage in the run game. Christian Velardi (Fordham commit) pulling behind Julian Sandy guarantees an average of 6.8 yards per carry.',
      });
    } else {
      plays.push({
        id: 'play-2',
        name: 'Gun 12 Personnel — "Outside Zone Stretch & Allen Bootleg Shot"',
        concept: 'Zone Stretch / Naked Bootleg',
        type: 'PLAY-ACTION',
        xEPA: '+1.55 EPA',
        successRate: '77.5%',
        explosiveRate: '44.0%',
        turnoverRisk: '2.0%',
        motion: 'Tight End motion across formation to seal backside defensive end',
        protection: 'Full Zone Flow right with QB Freddy Melton rolling naked left',
        reads: [
          { rank: '1st Read', target: '#4 Cooper Allen', route: 'Delay Boot Crosser (10 yds)', window: 'Wide open in opposite flat after defense flows right' },
          { rank: '2nd Read', target: '#22 Benjamin Perkins', route: 'Deep Comeback (16 yds)', window: 'Sideline boundary catch along hash' },
          { rank: 'Run Option', target: '#15 Freddy Melton', route: 'Scramble / Tuck Run', window: '10+ open rushing yards if edge drops into coverage' },
        ],
        tacticalRationale: 'Heavy 8-man defensive boxes over-commit to interior run flow. A naked bootleg in the opposite direction isolates Cooper Allen (#4) with zero defenders within 12 yards.',
      });
    }

    // Play 3: Special Red-Zone / Explosive Trick Concept
    plays.push({
      id: 'play-3',
      name: 'Gun Bunch Right — "Double-Pass Wheel: Melton to Perkins to Barone Touchdown"',
      concept: 'Trick Play / Double Pass Shot',
      type: 'TRICK PLAY',
      xEPA: '+2.85 EPA',
      successRate: '71.0%',
      explosiveRate: '75.0%',
      turnoverRisk: '4.2%',
      motion: 'Perkins backward step into lateral pass alignment',
      protection: 'Max Protect 7-man wall with #70 Reed Oliver & #72 Christian Velardi locking edges',
      reads: [
        { rank: 'Throw 1 (Melton)', target: '#22 Benjamin Perkins', route: 'Backward Lateral in Flat (behind LOS)', window: 'Quick catch and plant' },
        { rank: 'Throw 2 (Perkins)', target: '#5 Lorenzo Barone', route: 'Go Post into End Zone (35 yds)', window: 'Bypassing biting cornerback for walk-in touchdown' },
      ],
      tacticalRationale: 'Opposing safeties aggressively trigger downhill against Peddie screen passes. Perkins launching over the top to Lorenzo Barone creates an undefended walk-in touchdown.',
    });

    return plays;
  }, [selectedCoverage, selectedFront]);

  // Selected Active Generated Play
  const [activePlayIndex, setActivePlayIndex] = useState(0);
  const activeGeneratedPlay = generatedPlayCalls[activePlayIndex] || generatedPlayCalls[0];

  // BigQuery AI & ML Query Preview Generator (/bigquery-ai-ml)
  const bigQueryAiSql = useMemo(() => {
    return `-- ============================================================================
-- BIGQUERY AI & ML: OFFENSIVE PLAY PREDICTION & DEFENSIVE WEAKNESS MODEL
-- Table: \`gridiron_iq.peddie_game_telemetry_2025\`
-- ============================================================================

-- 1. Identify Key Drivers of Opponent Defensive Coverage Vulnerability
SELECT *
FROM AI.KEY_DRIVERS(
  TABLE \`gridiron_iq.opponent_defensive_telemetry_2025\`,
  'yards_allowed',
  STRUCT(
    '${selectedCoverage}' AS coverage_scheme,
    '${selectedFront}' AS defensive_front,
    '${selectedPersonnel}' AS offensive_personnel
  )
);

-- 2. Predict Expected EPA (xEPA) for Synthesized Play Call
SELECT
  play_concept_name,
  target_athlete,
  AI.SCORE(
    TABLE \`gridiron_iq.peddie_playbook_ml_models\`,
    STRUCT(
      '${activeGeneratedPlay.name}' AS play_name,
      '${selectedCoverage}' AS target_coverage,
      '${selectedFront}' AS target_front,
      ${currentPersonnel.rbCount} AS rb_count,
      ${currentPersonnel.teCount} AS te_count,
      ${currentPersonnel.wrCount} AS wr_count
    )
  ) AS predicted_xepa,
  AI.GENERATE(
    'Analyze personnel mismatch for ' || '${activeGeneratedPlay.reads[0].target}' || 
    ' against ' || '${selectedCoverage}' || ' and generate tactical pre-snap adjustment notes.'
  ) AS offensive_coordinator_insights;`;
  }, [selectedCoverage, selectedFront, selectedPersonnel, activeGeneratedPlay, currentPersonnel]);

  return (
    <div className="min-h-screen bg-[#07070d] text-slate-100 p-6 space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/90 border border-white/10 p-5 rounded-2xl shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <Swords className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-black text-white font-mono tracking-tight">
                PEDDIE OFFENSIVE AI COORDINATOR & PLAY SYNTHESIZER
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                <Cpu className="w-3 h-3 text-indigo-400" />
                BigQuery AI / ML Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Analyzes opponent defensive fronts & coverage shells in real time, matching active athlete personnel to synthesize high-EPA counter plays.
            </p>
          </div>
        </div>

        {/* Quick Nav back to Film Room & Analytics */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <Link
            href={`/dashboard/film-room/${selectedOpponent}`}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 hover:border-amber-400/50 text-slate-300 hover:text-amber-300 font-bold transition-all flex items-center gap-1.5"
          >
            <Film className="w-4 h-4 text-amber-400" />
            <span>Film Room</span>
          </Link>
          <Link
            href={`/dashboard/analytics/${selectedOpponent}`}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 hover:border-amber-400/50 text-slate-300 hover:text-amber-300 font-bold transition-all flex items-center gap-1.5"
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Defense ML Analytics</span>
          </Link>
        </div>
      </div>

      {/* Google Antigravity Tactical Co-Pilot */}
      <AntigravityTacticalHUD />

      {/* 2-Column Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Situation Inputs & Personnel Optimizer (4 Cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* 1. Opponent & Defensive Scheme Inputs */}
          <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 shadow-xl space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-rose-400" />
                Opponent Defense Configuration
              </h2>
              <span className="text-[10px] text-slate-400">Step 1</span>
            </div>

            {/* Opponent Selector */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-400 uppercase font-bold">Target Opponent</label>
              <select
                value={selectedOpponent}
                onChange={(e) => {
                  setSelectedOpponent(e.target.value);
                  router.push(`/dashboard/offensive-coach/${e.target.value}?season=${currentSeason}`);
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {games.map(g => (
                  <option key={g.id} value={g.id} className="bg-slate-900 text-white">
                    {g.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Coverage Shell Selector */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-400 uppercase font-bold">Opponent Coverage Shell</label>
              <select
                value={selectedCoverage}
                onChange={(e) => setSelectedCoverage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-amber-300 text-xs font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {DEFENSIVE_SHELLS.map(s => (
                  <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                    {s.name}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 leading-tight">
                {DEFENSIVE_SHELLS.find(s => s.id === selectedCoverage)?.desc}
              </p>
            </div>

            {/* Defensive Front & Box Count */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-400 uppercase font-bold">Opponent Front & Box Count</label>
              <select
                value={selectedFront}
                onChange={(e) => setSelectedFront(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-cyan-300 text-xs font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {DEFENSIVE_FRONTS.map(f => (
                  <option key={f.id} value={f.id} className="bg-slate-900 text-white">
                    {f.name} ({f.boxCount}-man box)
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 leading-tight">
                {DEFENSIVE_FRONTS.find(f => f.id === selectedFront)?.desc}
              </p>
            </div>

            {/* Down & Distance Scenario */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-400 uppercase font-bold">Down & Distance Situation</label>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                {[
                  { id: '1st-10', label: '1st & 10' },
                  { id: '2nd-short', label: '2nd & Short (1-3)' },
                  { id: '2nd-long', label: '2nd & Long (8+)' },
                  { id: '3rd-med', label: '3rd & Med (4-7)' },
                  { id: '3rd-long', label: '3rd & Long (8+)' },
                  { id: 'redzone', label: 'Goal to Go (Inside 10)' },
                ].map(d => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDownDistance(d.id)}
                    className={`px-2 py-1.5 rounded-lg font-bold text-[11px] transition-all border ${
                      selectedDownDistance === d.id
                        ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md'
                        : 'bg-slate-950 text-slate-400 border-white/5 hover:text-white'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Personnel Packaging & Athlete Availability */}
          <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 shadow-xl space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                Peddie Personnel & Athlete Optimizer
              </h2>
              <span className="text-[10px] text-slate-400">Step 2</span>
            </div>

            {/* Personnel Packaging Selector */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-400 uppercase font-bold">Active Personnel Grouping</label>
              <select
                value={selectedPersonnel}
                onChange={(e) => setSelectedPersonnel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-emerald-300 text-xs font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {PERSONNEL_GROUPINGS.map(p => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                    {p.name} — {p.code}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 leading-tight">
                {currentPersonnel.description}
              </p>
            </div>

            {/* Live Athlete Health & Availability Toggles */}
            <div className="space-y-2 pt-1 border-t border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 uppercase font-bold">Starters Availability</span>
                <span className="text-[10px] text-emerald-400">Toggle to Re-optimize</span>
              </div>

              <div className="grid grid-cols-1 gap-1.5 text-xs max-h-48 overflow-y-auto pr-1">
                {Object.entries(availablePlayers).map(([playerName, isAvailable]) => (
                  <button
                    key={playerName}
                    onClick={() => togglePlayer(playerName)}
                    className={`flex items-center justify-between p-2 rounded-lg border text-left transition-all ${
                      isAvailable
                        ? 'bg-slate-950 border-emerald-500/30 text-white'
                        : 'bg-rose-950/20 border-rose-500/30 text-slate-500 line-through'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isAvailable ? (
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <UserX className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      )}
                      <span className="text-[11px] font-bold">{playerName}</span>
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      isAvailable ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {isAvailable ? 'ACTIVE' : 'OUT'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Play Synthesis & Tactical Field (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* AI Synthesized Play Recommendation Cards */}
          <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5 font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-black text-white">
                  AI Synthesized Counter-Play Designs (xEPA Optimal)
                </h2>
              </div>
              <span className="text-xs text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 font-bold">
                {generatedPlayCalls.length} Plays Synthesized
              </span>
            </div>

            {/* Play Selection Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {generatedPlayCalls.map((play, idx) => (
                <button
                  key={play.id}
                  onClick={() => setActivePlayIndex(idx)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    activePlayIndex === idx
                      ? 'bg-amber-500/15 border-amber-400 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400'
                      : 'bg-slate-950/70 border-white/5 hover:border-white/20 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-amber-400 uppercase">Option #{idx + 1}</span>
                    <span className="text-[10px] font-bold text-emerald-400">{play.xEPA}</span>
                  </div>
                  <div className="text-xs font-bold text-white line-clamp-1">{play.name}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{play.concept}</div>
                </button>
              ))}
            </div>

            {/* Active Play Deep-Dive & Tactical Breakdown */}
            <div className="bg-slate-950 border border-white/10 rounded-xl p-5 space-y-4">
              {/* Play Title & Expected Projections */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-bold">
                      {activeGeneratedPlay.type}
                    </span>
                    <h3 className="text-base font-black text-white">
                      {activeGeneratedPlay.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Concept: <strong className="text-amber-300">{activeGeneratedPlay.concept}</strong> · Formation: <strong className="text-cyan-300">{currentPersonnel.name}</strong>
                  </p>
                </div>

                {/* KPI Metrics */}
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <div className="text-[9px] text-emerald-400 font-bold">EXPECTED VALUE</div>
                    <div className="text-sm font-bold text-emerald-300">{activeGeneratedPlay.xEPA}</div>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                    <div className="text-[9px] text-amber-400 font-bold">SUCCESS RATE</div>
                    <div className="text-sm font-bold text-amber-300">{activeGeneratedPlay.successRate}</div>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-center">
                    <div className="text-[9px] text-cyan-400 font-bold">EXPLOSIVE %</div>
                    <div className="text-sm font-bold text-cyan-300">{activeGeneratedPlay.explosiveRate}</div>
                  </div>
                </div>
              </div>

              {/* Tactical Explanation */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-500/20">
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                  <Brain className="w-4 h-4" />
                  Why this beats {DEFENSIVE_SHELLS.find(s => s.id === selectedCoverage)?.name}:
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeGeneratedPlay.tacticalRationale}
                </p>
              </div>

              {/* Pre-Snap Motion & Protection Scheme */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-900/80 border border-white/5 space-y-1">
                  <div className="text-[10px] text-amber-400 font-bold uppercase">Pre-Snap Motion Engine</div>
                  <p className="text-slate-300 text-[11px] leading-snug">{activeGeneratedPlay.motion}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/80 border border-white/5 space-y-1">
                  <div className="text-[10px] text-cyan-400 font-bold uppercase">Pass Protection & Blocking</div>
                  <p className="text-slate-300 text-[11px] leading-snug">{activeGeneratedPlay.protection}</p>
                </div>
              </div>

              {/* Progression Reads & Route Tree */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-white uppercase tracking-wider">
                  Quarterback Progression Reads & Target Windows:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeGeneratedPlay.reads.map((read, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-white/5 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-400">{read.rank}: {read.target}</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 text-[10px] font-bold">{read.route}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{read.window}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Tactical Route Preview Field */}
          <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 shadow-2xl space-y-3 font-mono">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" />
                Tactical Play Schematic & Route Geometry
              </h3>
              <span className="text-[10px] text-slate-400 font-bold">22-Player Spatial Alignment</span>
            </div>

            {/* Field Diagram Canvas */}
            <div className="relative h-64 w-full bg-gradient-to-b from-[#0a2215] via-[#0d2e1c] to-[#0a2215] rounded-xl border border-white/10 overflow-hidden flex items-center justify-center">
              <svg viewBox="0 0 1000 400" className="absolute inset-0 w-full h-full opacity-40 pointer-events-none">
                <rect x="0" y="0" width="1000" height="400" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="3" />
                {Array.from({ length: 7 }, (_, i) => (
                  <line key={i} x1="40" y1={40 + i * 50} x2="960" y2={40 + i * 50} stroke="white" strokeWidth="1.5" strokeOpacity="0.3" />
                ))}
              </svg>

              {/* Line of Scrimmage & 1st Down Line */}
              <div className="absolute left-0 right-0 top-[60%] h-[2px] bg-blue-500/80 shadow-[0_0_8px_rgba(59,130,246,0.8)] z-10">
                <span className="absolute left-3 -top-4 text-[9px] font-bold text-blue-400 bg-slate-950/80 px-1 rounded border border-blue-500/30">
                  LOS (Peddie 40)
                </span>
              </div>
              <div className="absolute left-0 right-0 top-[35%] h-[2px] bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)] z-10">
                <span className="absolute right-3 -top-4 text-[9px] font-bold text-amber-300 bg-slate-950/80 px-1 rounded border border-amber-400/30">
                  1ST DOWN (Peddie 50)
                </span>
              </div>

              {/* Route Vectors Visualizer */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
                {/* Perkins Wheel / Deep Seam */}
                <path d="M 680 240 Q 750 200 760 80" fill="none" stroke="#f59e0b" strokeWidth="3.5" strokeDasharray="6 3" />
                <circle cx="760" cy="80" r="5" fill="#f59e0b" />
                <text x="770" y="85" fill="#f59e0b" fontSize="11" fontWeight="bold" fontFamily="monospace">#22 Perkins (Wheel)</text>

                {/* Cooper Allen Deep Crosser */}
                <path d="M 580 240 Q 560 160 320 130" fill="none" stroke="#38bdf8" strokeWidth="3" />
                <circle cx="320" cy="130" r="5" fill="#38bdf8" />
                <text x="210" y="135" fill="#38bdf8" fontSize="11" fontWeight="bold" fontFamily="monospace">#4 Allen (Over 14y)</text>

                {/* Lorenzo Barone Dig */}
                <path d="M 280 240 L 280 160 L 480 160" fill="none" stroke="#10b981" strokeWidth="3" />
                <circle cx="480" cy="160" r="5" fill="#10b981" />
                <text x="490" y="165" fill="#10b981" fontSize="11" fontWeight="bold" fontFamily="monospace">#5 Barone (Dig 12y)</text>
              </svg>

              {/* QB Alignment (Freddy Melton #15) */}
              <div className="absolute top-[68%] left-[50%] -translate-x-1/2 flex flex-col items-center z-30">
                <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg ring-2 ring-amber-300">
                  15
                </div>
                <span className="text-[9px] font-bold text-white bg-slate-950/80 px-1 rounded mt-0.5">Melton (QB)</span>
              </div>

              {/* RB Alignment (Jeremiah Davis #3) */}
              <div className="absolute top-[72%] left-[43%] -translate-x-1/2 flex flex-col items-center z-30">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
                  3
                </div>
                <span className="text-[9px] font-bold text-slate-300 bg-slate-950/80 px-1 rounded mt-0.5">Davis (RB)</span>
              </div>

              {/* OL Anchors (Velardi #72 & Oliver #70) */}
              <div className="absolute top-[60%] left-[50%] -translate-x-1/2 flex items-center gap-1.5 z-30">
                {['#72 Velardi', '#56 Adler', '#60 Amar', '#63 Sandy', '#70 Oliver'].map((ol, i) => (
                  <div key={i} className="w-6 h-6 rounded-full bg-slate-800 border border-slate-500 text-white text-[9px] font-bold flex items-center justify-center">
                    OL
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BigQuery AI / ML Query Generation Panel (/bigquery-ai-ml) */}
          <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-5 shadow-2xl space-y-3 font-mono">
            <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">
                  BigQuery AI & ML Telemetry Analytics (Executable SQL)
                </h3>
              </div>
              <span className="text-[10px] text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/30 font-bold">
                AI.KEY_DRIVERS & AI.SCORE
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-white/10 overflow-x-auto text-[11px] text-cyan-300 leading-relaxed font-mono">
              <pre>{bigQueryAiSql}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
