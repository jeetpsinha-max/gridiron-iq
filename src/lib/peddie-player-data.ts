// ============================================================================
// GridironIQ — Peddie School Falcons Football (2025–2026 Season Player Tracker)
// Complete 2025–2026 Roster, Physicals, 2025-26 Stats & Scouting, Strengths/Weaknesses & Recruitment
// ============================================================================

import { PlayerProfile } from '@/types/football';

export const PEDDIE_PLAYERS: PlayerProfile[] = [
  // --------------------------------------------------------------------------
  // #5 Lorenzo Barone — Wide Receiver / Returner (Senior, Class of 2026)
  // --------------------------------------------------------------------------
  {
    id: 'peddie-p5-barone',
    name: 'Lorenzo Barone',
    jerseyNumber: 5,
    positions: ['WR', 'KR', 'PR'],
    primaryPosition: 'WR',
    classYear: '2026',
    gradeLevel: 'Senior',
    age: 18,
    height: "5'11\"",
    weight: "180 lbs",
    hometown: 'Hightstown, NJ',
    highSchool: 'The Peddie School',
    headshotUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    strengths: [
      'Electrifying 4.45 40-yard speed and 22.1 mph tracked top velocity on Jet Sweeps and Fly motions',
      'Elite route-running technician; explodes out of 90-degree cuts with zero wasted movement',
      'Master of boundary awareness and sideline toe-drag catches in tight coverage',
      'Dynamic open-field vision on kick and punt returns; turns short receptions into 60+ yard scores'
    ],
    weaknesses: [
      'Contested catch radius against physical 6\'2"+ press-man boundary cornerbacks',
      'Needs continued dedication to stalk blocking sustainability on outside run concepts'
    ],
    scoutingSummary: 'Senior team captain and primary offensive catalyst for the 2025–2026 Peddie Falcons. Barone commands safety help over the top on every snap, unlocking space for the entire passing offense.',
    radarMetrics: {
      speed: 96,
      strength: 78,
      technique: 94,
      footballIq: 92,
      motor: 95,
      versatility: 94,
    },
    stats2025: {
      gamesPlayed: 9,
      receptions: 56,
      receivingYards: 895,
      receivingTds: 11,
      yardsPerCatch: 16.0,
      rushingYards: 195,
      rushingTds: 3,
      avgEpaContribution: 2.15,
    },
    recruitment: {
      rating: '3_STAR',
      status: 'MULTIPLE_OFFERS',
      interestedColleges: ['Princeton', 'Penn', 'Dartmouth', 'Villanova', 'Delaware', 'Columbia'],
      offers: ['Dartmouth College', 'Villanova University', 'Columbia University', 'Penn'],
      hudlProfileUrl: 'https://fan.hudl.com/peddie-barone-2026',
      gpa: 3.84,
      benchPressMaxLbs: 235,
      squatMaxLbs: 355,
      fortyYardDashSec: 4.45,
      verticalJumpInches: 37.0,
    },
    keyFilmPlays: ['pb-play-1', 'pb-play-3', 'ph-play-1'],
  },

  // --------------------------------------------------------------------------
  // #55 Jayden Williams — Defensive End / EDGE (Senior, Class of 2026)
  // --------------------------------------------------------------------------
  {
    id: 'peddie-p55-williams',
    name: 'Jayden Williams',
    jerseyNumber: 55,
    positions: ['DE', 'EDGE', 'OLB'],
    primaryPosition: 'DE',
    classYear: '2026',
    gradeLevel: 'Senior',
    age: 18,
    height: "6'4\"",
    weight: "242 lbs",
    hometown: 'Hightstown, NJ',
    highSchool: 'The Peddie School',
    headshotUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
    strengths: [
      'Prototypical 6\'4" Power 4 frame with 80-inch wingspan, rapid get-off, and devastating hand violent chops',
      'Dominant edge setter against the run; consistently sets a firm boundary edge and disengages with power',
      'Unstoppable pass rush motor; led MAPL with 12.0 sacks and 22.5 tackles for loss',
      'Closing speed to chase down dual-threat quarterbacks on naked bootlegs and backside scrambles'
    ],
    weaknesses: [
      'Can occasionally over-pursue on misdirection and boot actions',
      'Refining inside counter-spin when athletic tackles over-set to the perimeter'
    ],
    scoutingSummary: 'Premier 4-star defensive edge prospect in New Jersey for the 2025–2026 season. Williams is a defensive game-wrecker who commands regular double-team pass protection.',
    radarMetrics: {
      speed: 89,
      strength: 96,
      technique: 92,
      footballIq: 91,
      motor: 99,
      versatility: 90,
    },
    stats2025: {
      gamesPlayed: 9,
      tacklesTotal: 64,
      tacklesSolo: 44,
      tacklesForLoss: 22.5,
      sacks: 12.0,
      forcedFumbles: 5,
      passBreakups: 4,
      avgEpaContribution: 2.65,
    },
    recruitment: {
      rating: '4_STAR',
      status: 'MULTIPLE_OFFERS',
      interestedColleges: ['Penn State', 'Rutgers', 'Boston College', 'Syracuse', 'Pittsburgh', 'Maryland', 'Notre Dame'],
      offers: ['Rutgers University', 'Boston College', 'Syracuse University', 'Penn State', 'Maryland'],
      hudlProfileUrl: 'https://fan.hudl.com/peddie-williams-2026',
      gpa: 3.52,
      benchPressMaxLbs: 345,
      squatMaxLbs: 515,
      fortyYardDashSec: 4.62,
      verticalJumpInches: 34.5,
    },
    keyFilmPlays: ['pb-play-5'],
  },

  // --------------------------------------------------------------------------
  // #8 Ari Miller — Tight End / Flex Receiver / Safety (Senior, Class of 2026)
  // --------------------------------------------------------------------------
  {
    id: 'peddie-p8-miller',
    name: 'Ari Miller',
    jerseyNumber: 8,
    positions: ['TE', 'WR', 'S'],
    primaryPosition: 'TE',
    classYear: '2026',
    gradeLevel: 'Senior',
    age: 18,
    height: "6'3\"",
    weight: "220 lbs",
    hometown: 'Hightstown, NJ',
    highSchool: 'The Peddie School',
    headshotUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80',
    strengths: [
      'Complete three-level mismatch who can play in-line Y, detached in the slot, or as an H-Back motion blocker',
      'Terrific seam runner with vice-grip hands and body positioning to box out safeties and linebackers',
      'Physical, punishing edge blocker on outside zone seal blocks'
    ],
    weaknesses: [
      'Pass protection technique against dedicated interior power bull rushers',
      'Lateral redirection against sub-4.5 slot defensive backs'
    ],
    scoutingSummary: 'Versatile Senior flex tight end who serves as the go-to third-down safety valve and red-zone target in the 2025–2026 Peddie playbook.',
    radarMetrics: {
      speed: 87,
      strength: 91,
      technique: 91,
      footballIq: 93,
      motor: 94,
      versatility: 97,
    },
    stats2025: {
      gamesPlayed: 9,
      receptions: 38,
      receivingYards: 560,
      receivingTds: 7,
      yardsPerCatch: 14.7,
      tacklesTotal: 22,
      avgEpaContribution: 1.60,
    },
    recruitment: {
      rating: '3_STAR',
      status: 'MULTIPLE_OFFERS',
      interestedColleges: ['Princeton', 'Harvard', 'Bucknell', 'Colgate', 'Holy Cross', 'Yale'],
      offers: ['Bucknell University', 'Colgate University', 'Princeton University', 'Holy Cross'],
      hudlProfileUrl: 'https://fan.hudl.com/peddie-miller-2026',
      gpa: 3.92,
      benchPressMaxLbs: 295,
      squatMaxLbs: 435,
      fortyYardDashSec: 4.60,
      verticalJumpInches: 35.0,
    },
    keyFilmPlays: ['pb-play-2', 'pb-play-6'],
  },

  // --------------------------------------------------------------------------
  // #6 Joseph Gaston — Quarterback / Wide Receiver / Cornerback (Senior, Class of 2026)
  // --------------------------------------------------------------------------
  {
    id: 'peddie-p6-gaston',
    name: 'Joseph Gaston',
    jerseyNumber: 6,
    positions: ['QB', 'WR', 'CB'],
    primaryPosition: 'ATH',
    classYear: '2026',
    gradeLevel: 'Senior',
    age: 18,
    height: "6'1\"",
    weight: "185 lbs",
    hometown: 'Hightstown, NJ',
    highSchool: 'The Peddie School',
    headshotUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
    strengths: [
      'Incredible football IQ and three-phase versatility (Wildcat QB packages, slot receiver, boundary corner)',
      'Sharp spatial recognition and quick-trigger release under all-out blitz pressures',
      'Smooth change of direction and disciplined leverage in man coverage'
    ],
    weaknesses: [
      'Specializing at one single collegiate position given his multi-role high school usage',
      'Needs continued strength gains for boundary run support'
    ],
    scoutingSummary: 'Senior Swiss-army knife for Coach Mark Fabish who provides leadership, explosive gadget capabilities, and lockdown coverage on defense.',
    radarMetrics: {
      speed: 91,
      strength: 83,
      technique: 90,
      footballIq: 96,
      motor: 94,
      versatility: 99,
    },
    stats2025: {
      gamesPlayed: 9,
      receptions: 31,
      receivingYards: 420,
      receivingTds: 5,
      passingYards: 310,
      passingTds: 4,
      rushingYards: 160,
      tacklesTotal: 26,
      interceptionsDefense: 2,
      avgEpaContribution: 1.50,
    },
    recruitment: {
      rating: 'D1_FCS_PROSPECT',
      status: 'MULTIPLE_OFFERS',
      interestedColleges: ['Middlebury', 'Bowdoin', 'Tufts', 'Lafayette', 'Fordham'],
      offers: ['Tufts University', 'Lafayette College', 'Bowdoin'],
      hudlProfileUrl: 'https://fan.hudl.com/peddie-gaston-2026',
      gpa: 3.88,
      benchPressMaxLbs: 245,
      squatMaxLbs: 365,
      fortyYardDashSec: 4.52,
      verticalJumpInches: 34.5,
    },
    keyFilmPlays: ['pb-play-4'],
  },

  // --------------------------------------------------------------------------
  // #9 Griffin Brennan — Starting Quarterback / Safety (Junior, Class of 2027)
  // --------------------------------------------------------------------------
  {
    id: 'peddie-p9-brennan',
    name: 'Griffin Brennan',
    jerseyNumber: 9,
    positions: ['QB', 'FS'],
    primaryPosition: 'QB',
    classYear: '2027',
    gradeLevel: 'Junior',
    age: 17,
    height: "6'2\"",
    weight: "195 lbs",
    hometown: 'Hightstown, NJ',
    highSchool: 'The Peddie School',
    headshotUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
    strengths: [
      'Stepped into the starting QB role for 2025–2026 with dual-threat mobility, live arm, and poise',
      'Exceptional on off-platform throws and play-action rollout concepts',
      'Anticipation throwing to Lorenzo Barone and Ari Miller across intermediate windows',
      'Dual-threat runner who keeps defensive ends honest on zone read keepers'
    ],
    weaknesses: [
      'Continues to master full-field backside progression reads against simulated zone blitzes',
      'Slide protection and avoiding unnecessary hits on open-field scrambles'
    ],
    scoutingSummary: 'Breakout Junior quarterback for the 2025–2026 season. Brennan combines high-end arm talent with mobility to keep the Peddie offense ranked at the top of the MAPL.',
    radarMetrics: {
      speed: 89,
      strength: 86,
      technique: 88,
      footballIq: 90,
      motor: 92,
      versatility: 93,
    },
    stats2025: {
      gamesPlayed: 9,
      passingYards: 2150,
      passingTds: 24,
      interceptionsThrown: 6,
      completionPct: 66.8,
      qbr: 114.2,
      rushingYards: 340,
      rushingTds: 5,
      avgEpaContribution: 2.20,
    },
    recruitment: {
      rating: '3_STAR',
      status: 'HIGH_INTEREST',
      interestedColleges: ['Rutgers', 'Boston College', 'Penn', 'Syracuse', 'Delaware', 'Monmouth'],
      offers: ['Monmouth University', 'Delaware'],
      hudlProfileUrl: 'https://fan.hudl.com/peddie-brennan-2027',
      gpa: 3.78,
      benchPressMaxLbs: 245,
      squatMaxLbs: 375,
      fortyYardDashSec: 4.58,
      verticalJumpInches: 33.5,
    },
    keyFilmPlays: ['pb-play-1', 'pb-play-3'],
  },

  // --------------------------------------------------------------------------
  // #22 Benjamin Perkins — Running Back / Defensive Back (Sophomore, Class of 2028)
  // --------------------------------------------------------------------------
  {
    id: 'peddie-p22-perkins',
    name: 'Benjamin Perkins',
    jerseyNumber: 22,
    positions: ['RB', 'DB'],
    primaryPosition: 'RB',
    classYear: '2028',
    gradeLevel: 'Sophomore',
    age: 16,
    height: "5'10\"",
    weight: "185 lbs",
    hometown: 'Hightstown, NJ',
    highSchool: 'The Peddie School',
    headshotUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80',
    strengths: [
      'Explosive one-cut downhill runner with tremendous acceleration through the line of scrimmage',
      'Excellent contact balance and low center of gravity; turns 2-yard gains into 8-yard chunks',
      'Relentless motor on special teams coverage and secondary run support'
    ],
    weaknesses: [
      'Blitz pickup pass protection against senior middle linebackers',
      'Patience on slow-developing counter pull schemes'
    ],
    scoutingSummary: 'Starting Sophomore running back for 2025–2026. Perkins stepped into the backfield with explosive burst, pacing the Falcons in rushing touchdowns.',
    radarMetrics: {
      speed: 91,
      strength: 85,
      technique: 84,
      footballIq: 86,
      motor: 96,
      versatility: 88,
    },
    stats2025: {
      gamesPlayed: 9,
      rushingYards: 820,
      rushingAttempts: 124,
      rushingTds: 10,
      yardsPerCarry: 6.61,
      receptions: 15,
      receivingYards: 140,
      receivingTds: 1,
      avgEpaContribution: 1.40,
    },
    recruitment: {
      rating: 'DEVELOPING',
      status: 'SCOUTED',
      interestedColleges: ['Rutgers', 'Temple', 'Lafayette'],
      offers: [],
      hudlProfileUrl: 'https://fan.hudl.com/peddie-perkins-2028',
      gpa: 3.65,
      benchPressMaxLbs: 275,
      squatMaxLbs: 415,
      fortyYardDashSec: 4.54,
      verticalJumpInches: 35.0,
    },
    keyFilmPlays: ['pb-play-2'],
  },

  // --------------------------------------------------------------------------
  // #70 Mason Kish — Defensive Tackle (Sophomore, Class of 2028)
  // --------------------------------------------------------------------------
  {
    id: 'peddie-p70-kish',
    name: 'Mason Kish',
    jerseyNumber: 70,
    positions: ['DT', 'NT'],
    primaryPosition: 'DT',
    classYear: '2028',
    gradeLevel: 'Sophomore',
    age: 16,
    height: "6'2\"",
    weight: "275 lbs",
    hometown: 'Hightstown, NJ',
    highSchool: 'The Peddie School',
    headshotUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    strengths: [
      'Massive 275 lb interior presence; stalwarts against double-teams with heavy base and low pad level',
      'Exceptional hand strike that resets the line of scrimmage in the opponent\'s backfield',
      'Great lateral agility for an interior lineman; chases down perimeter stretch plays'
    ],
    weaknesses: [
      'Developing a broader pass rush move repertoire on third-and-long'
    ],
    scoutingSummary: 'One of the top young interior defensive line prospects in the region. Kish anchors the middle of the 2025–2026 Falcon defense alongside Jayden Williams.',
    radarMetrics: {
      speed: 74,
      strength: 95,
      technique: 88,
      footballIq: 89,
      motor: 94,
      versatility: 82,
    },
    stats2025: {
      gamesPlayed: 9,
      tacklesTotal: 48,
      tacklesSolo: 28,
      tacklesForLoss: 11.5,
      sacks: 5.0,
      forcedFumbles: 2,
      avgEpaContribution: 1.55,
    },
    recruitment: {
      rating: '3_STAR',
      status: 'HIGH_INTEREST',
      interestedColleges: ['Rutgers', 'Boston College', 'Syracuse', 'Temple', 'Penn State'],
      offers: ['Temple University'],
      hudlProfileUrl: 'https://fan.hudl.com/peddie-kish-2028',
      gpa: 3.70,
      benchPressMaxLbs: 335,
      squatMaxLbs: 495,
      fortyYardDashSec: 5.05,
      verticalJumpInches: 29.5,
    },
    keyFilmPlays: ['pb-play-5'],
  },

  // --------------------------------------------------------------------------
  // #15 Jonathan Stizza — Free Safety / Wide Receiver (Junior, Class of 2027)
  // --------------------------------------------------------------------------
  {
    id: 'peddie-p15-stizza',
    name: 'Jonathan Stizza',
    jerseyNumber: 15,
    positions: ['FS', 'WR'],
    primaryPosition: 'FS',
    classYear: '2027',
    gradeLevel: 'Junior',
    age: 17,
    height: "6'1\"",
    weight: "185 lbs",
    hometown: 'Hightstown, NJ',
    highSchool: 'The Peddie School',
    headshotUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    strengths: [
      'Centerfielder range in Cover 1 and Cover 3; reads quarterback eyes and closes with high-end ball skills',
      'Reliable open-field tackler; prevents explosive plays from breaking into touchdowns'
    ],
    weaknesses: [
      'Matching twitchy slot receivers in zero-coverage situations'
    ],
    scoutingSummary: 'Junior starting free safety who anchors the Peddie secondary. Recorded 5 interceptions and 8 pass breakups during the 2025–2026 campaign.',
    radarMetrics: {
      speed: 90,
      strength: 84,
      technique: 90,
      footballIq: 94,
      motor: 93,
      versatility: 90,
    },
    stats2025: {
      gamesPlayed: 9,
      tacklesTotal: 44,
      tacklesSolo: 31,
      interceptionsDefense: 5,
      passBreakups: 8,
      avgEpaContribution: 1.45,
    },
    recruitment: {
      rating: 'D1_FCS_PROSPECT',
      status: 'HIGH_INTEREST',
      interestedColleges: ['Dartmouth', 'Brown', 'Cornell', 'Bucknell', 'Lafayette'],
      offers: ['Bucknell University'],
      hudlProfileUrl: 'https://fan.hudl.com/peddie-stizza-2027',
      gpa: 3.95,
      benchPressMaxLbs: 245,
      squatMaxLbs: 375,
      fortyYardDashSec: 4.55,
      verticalJumpInches: 34.0,
    },
    keyFilmPlays: ['pb-play-5'],
  },

  // --------------------------------------------------------------------------
  // #56 Nick Famularo — Offensive Guard / Linebacker (Junior, Class of 2027)
  // --------------------------------------------------------------------------
  {
    id: 'peddie-p56-famularo',
    name: 'Nick Famularo',
    jerseyNumber: 56,
    positions: ['G', 'LB', 'OL'],
    primaryPosition: 'G',
    classYear: '2027',
    gradeLevel: 'Junior',
    age: 17,
    height: "6'1\"",
    weight: "235 lbs",
    hometown: 'Hightstown, NJ',
    highSchool: 'The Peddie School',
    headshotUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    strengths: [
      'Pound-for-pound powerhouse; leads the team in pulling block execution on counter runs',
      'Relentless motor on defense in goal-line packages'
    ],
    weaknesses: [
      'Arm length against taller defensive ends'
    ],
    scoutingSummary: 'Tough, physical Junior offensive guard who sets the standard for physical football in the trenches.',
    radarMetrics: {
      speed: 78,
      strength: 93,
      technique: 89,
      footballIq: 91,
      motor: 97,
      versatility: 89,
    },
    stats2025: {
      gamesPlayed: 9,
      pancakeBlocks: 26,
      sacksAllowed: 1,
      tacklesTotal: 22,
      avgEpaContribution: 1.15,
    },
    recruitment: {
      rating: 'D3_IVY_PROSPECT',
      status: 'HIGH_INTEREST',
      interestedColleges: ['Williams', 'Amherst', 'Trinity College', 'Middlebury'],
      offers: ['Trinity College'],
      hudlProfileUrl: 'https://fan.hudl.com/peddie-famularo-2027',
      gpa: 3.82,
      benchPressMaxLbs: 325,
      squatMaxLbs: 475,
      fortyYardDashSec: 4.88,
      verticalJumpInches: 30.5,
    },
    keyFilmPlays: ['pb-play-2'],
  },

  // --------------------------------------------------------------------------
  // #68 Michael Ogbutor — Offensive Tackle / Defensive Tackle (Sophomore, Class of 2028)
  // --------------------------------------------------------------------------
  {
    id: 'peddie-p68-ogbutor',
    name: 'Michael Ogbutor',
    jerseyNumber: 68,
    positions: ['OT', 'DT'],
    primaryPosition: 'OT',
    classYear: '2028',
    gradeLevel: 'Sophomore',
    age: 16,
    height: "6'4\"",
    weight: "270 lbs",
    hometown: 'Hightstown, NJ',
    highSchool: 'The Peddie School',
    headshotUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
    strengths: [
      'Rare 6\'4" athletic frame with light feet for a sophomore tackle',
      'Pass protection kick-slide naturally mirrors speed rushers on the perimeter',
      'Huge ceiling with continuous physical maturation'
    ],
    weaknesses: [
      'Second-level anchor against heavy blitz packages'
    ],
    scoutingSummary: 'Starting Sophomore left tackle with elite D1 physical dimensions and high collegiate ceiling.',
    radarMetrics: {
      speed: 76,
      strength: 91,
      technique: 86,
      footballIq: 87,
      motor: 93,
      versatility: 86,
    },
    stats2025: {
      gamesPlayed: 9,
      pancakeBlocks: 22,
      sacksAllowed: 2,
      avgEpaContribution: 1.20,
    },
    recruitment: {
      rating: '3_STAR',
      status: 'HIGH_INTEREST',
      interestedColleges: ['Rutgers', 'Penn State', 'Maryland', 'Boston College'],
      offers: ['Rutgers University'],
      hudlProfileUrl: 'https://fan.hudl.com/peddie-ogbutor-2028',
      gpa: 3.60,
      benchPressMaxLbs: 305,
      squatMaxLbs: 455,
      fortyYardDashSec: 5.02,
      verticalJumpInches: 29.0,
    },
    keyFilmPlays: ['pb-play-1'],
  },

  // --------------------------------------------------------------------------
  // #16 Griffin Suthammanont — Wide Receiver / Cornerback (Junior, Class of 2027)
  // --------------------------------------------------------------------------
  {
    id: 'peddie-p16-suthammanont',
    name: 'Griffin Suthammanont',
    jerseyNumber: 16,
    positions: ['WR', 'CB'],
    primaryPosition: 'WR',
    classYear: '2027',
    gradeLevel: 'Junior',
    age: 17,
    height: "5'10\"",
    weight: "170 lbs",
    hometown: 'Hightstown, NJ',
    highSchool: 'The Peddie School',
    headshotUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
    strengths: [
      'Shiftiness in the slot on option routes, quick slants, and bubble screens',
      'Disciplined route depths that convert high-percentage third downs'
    ],
    weaknesses: [
      'Contested jump-ball scenarios over boundary safeties'
    ],
    scoutingSummary: 'Reliable Junior slot receiver and special teams ace with great hands and agility.',
    radarMetrics: {
      speed: 89,
      strength: 77,
      technique: 90,
      footballIq: 91,
      motor: 93,
      versatility: 88,
    },
    stats2025: {
      gamesPlayed: 9,
      receptions: 29,
      receivingYards: 380,
      receivingTds: 4,
      avgEpaContribution: 1.10,
    },
    recruitment: {
      rating: 'D3_IVY_PROSPECT',
      status: 'HIGH_INTEREST',
      interestedColleges: ['Tufts', 'Bowdoin', 'Williams', 'Amherst'],
      offers: [],
      hudlProfileUrl: 'https://fan.hudl.com/peddie-suthammanont-2027',
      gpa: 3.96,
      benchPressMaxLbs: 215,
      squatMaxLbs: 325,
      fortyYardDashSec: 4.56,
      verticalJumpInches: 33.0,
    },
    keyFilmPlays: ['pb-play-4'],
  },

  // --------------------------------------------------------------------------
  // #19 Aaron (Jihoon) Lee — Defensive Back / Athlete (Junior, Class of 2027)
  // --------------------------------------------------------------------------
  {
    id: 'peddie-p19-lee',
    name: 'Aaron (Jihoon) Lee',
    jerseyNumber: 19,
    positions: ['DB', 'ATH'],
    primaryPosition: 'CB',
    classYear: '2027',
    gradeLevel: 'Junior',
    age: 17,
    height: "5'11\"",
    weight: "175 lbs",
    hometown: 'Hightstown, NJ',
    highSchool: 'The Peddie School',
    headshotUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300&auto=format&fit=crop&q=80',
    strengths: [
      'Quick hip rotation and sticky mirror coverage on speed outs and comeback routes',
      'Disciplined in zone coverage; passes off vertical routes with communication'
    ],
    weaknesses: [
      'Shedding physical stalk blocks from tight ends on boundary outside runs'
    ],
    scoutingSummary: 'Starting Junior cornerback with high football IQ and outstanding coverage discipline.',
    radarMetrics: {
      speed: 89,
      strength: 78,
      technique: 90,
      footballIq: 92,
      motor: 92,
      versatility: 87,
    },
    stats2025: {
      gamesPlayed: 9,
      tacklesTotal: 31,
      interceptionsDefense: 2,
      passBreakups: 7,
      avgEpaContribution: 1.05,
    },
    recruitment: {
      rating: 'D3_IVY_PROSPECT',
      status: 'HIGH_INTEREST',
      interestedColleges: ['Carnegie Mellon', 'MIT', 'Johns Hopkins', 'Emory'],
      offers: [],
      hudlProfileUrl: 'https://fan.hudl.com/peddie-lee-2027',
      gpa: 4.08,
      benchPressMaxLbs: 225,
      squatMaxLbs: 345,
      fortyYardDashSec: 4.58,
      verticalJumpInches: 32.5,
    },
    keyFilmPlays: ['pb-play-5'],
  },

  // --------------------------------------------------------------------------
  // #36 Mason McGovern — Inside Linebacker (Sophomore, Class of 2028)
  // --------------------------------------------------------------------------
  {
    id: 'peddie-p36-mcgovern',
    name: 'Mason McGovern',
    jerseyNumber: 36,
    positions: ['LB', 'MLB'],
    primaryPosition: 'MLB',
    classYear: '2028',
    gradeLevel: 'Sophomore',
    age: 16,
    height: "6'1\"",
    weight: "205 lbs",
    hometown: 'Hightstown, NJ',
    highSchool: 'The Peddie School',
    headshotUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=300&auto=format&fit=crop&q=80',
    strengths: [
      'Downhill thumper who reads guards and flows to the football with violent intent',
      'Solid tackle finisher between the tackles; rarely gets pushed backward'
    ],
    weaknesses: [
      'Pass coverage depth in Tampa 2 middle-hole responsibilities'
    ],
    scoutingSummary: 'Hard-hitting Sophomore middle linebacker who emerged as a tackling machine for the 2025–2026 defense.',
    radarMetrics: {
      speed: 84,
      strength: 90,
      technique: 85,
      footballIq: 88,
      motor: 96,
      versatility: 83,
    },
    stats2025: {
      gamesPlayed: 9,
      tacklesTotal: 58,
      tacklesSolo: 38,
      tacklesForLoss: 8.5,
      sacks: 2.5,
      forcedFumbles: 2,
      avgEpaContribution: 1.35,
    },
    recruitment: {
      rating: 'DEVELOPING',
      status: 'SCOUTED',
      interestedColleges: ['Lafayette', 'Lehigh', 'Fordham', 'Holy Cross'],
      offers: [],
      hudlProfileUrl: 'https://fan.hudl.com/peddie-mcgovern-2028',
      gpa: 3.68,
      benchPressMaxLbs: 275,
      squatMaxLbs: 405,
      fortyYardDashSec: 4.70,
      verticalJumpInches: 32.0,
    },
    keyFilmPlays: ['pb-play-5'],
  },

  // --------------------------------------------------------------------------
  // #32 Bryce Layade — Outside Linebacker / Running Back (Sophomore, Class of 2028)
  // --------------------------------------------------------------------------
  {
    id: 'peddie-p32-layade',
    name: 'Bryce Layade',
    jerseyNumber: 32,
    positions: ['LB', 'RB', 'ATH'],
    primaryPosition: 'OLB',
    classYear: '2028',
    gradeLevel: 'Sophomore',
    age: 16,
    height: "6'0\"",
    weight: "190 lbs",
    hometown: 'Hightstown, NJ',
    highSchool: 'The Peddie School',
    headshotUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    strengths: [
      'Versatile edge defender with closing burst on quarterback scrambles and perimeter sweeps',
      'High motor and exceptional special teams gunner tackle production'
    ],
    weaknesses: [
      'Disengaging from offensive tackles when sealed on direct power runs'
    ],
    scoutingSummary: 'Athletic Sophomore linebacker with sideline-to-sideline pursuit range and special teams impact.',
    radarMetrics: {
      speed: 88,
      strength: 86,
      technique: 84,
      footballIq: 86,
      motor: 94,
      versatility: 91,
    },
    stats2025: {
      gamesPlayed: 9,
      tacklesTotal: 42,
      tacklesForLoss: 6.0,
      sacks: 2.0,
      avgEpaContribution: 1.10,
    },
    recruitment: {
      rating: 'DEVELOPING',
      status: 'SCOUTED',
      interestedColleges: ['Monmouth', 'Bryant', 'Wagner'],
      offers: [],
      hudlProfileUrl: 'https://fan.hudl.com/peddie-layade-2028',
      gpa: 3.55,
      benchPressMaxLbs: 255,
      squatMaxLbs: 385,
      fortyYardDashSec: 4.65,
      verticalJumpInches: 33.0,
    },
    keyFilmPlays: ['pb-play-5'],
  },

  // --------------------------------------------------------------------------
  // #21 Ardanley Then — Cornerback / Safety (Junior, Class of 2027)
  // --------------------------------------------------------------------------
  {
    id: 'peddie-p21-then',
    name: 'Ardanley Then',
    jerseyNumber: 21,
    positions: ['CB', 'S'],
    primaryPosition: 'CB',
    classYear: '2027',
    gradeLevel: 'Junior',
    age: 17,
    height: "5'11\"",
    weight: "175 lbs",
    hometown: 'Hightstown, NJ',
    highSchool: 'The Peddie School',
    headshotUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    strengths: [
      'Fluid hips and recovery speed in deep third coverage',
      'Aggressive punch at the line of scrimmage in press-man coverage'
    ],
    weaknesses: [
      'Eye discipline on double moves and play-action rollout actions'
    ],
    scoutingSummary: 'Junior defensive back providing key depth and starter-level play across the Falcon secondary.',
    radarMetrics: {
      speed: 89,
      strength: 80,
      technique: 87,
      footballIq: 88,
      motor: 91,
      versatility: 88,
    },
    stats2025: {
      gamesPlayed: 9,
      tacklesTotal: 28,
      interceptionsDefense: 2,
      passBreakups: 6,
      avgEpaContribution: 0.95,
    },
    recruitment: {
      rating: 'D3_IVY_PROSPECT',
      status: 'SCOUTED',
      interestedColleges: ['Union', 'Hobart', 'Ithaca', 'Dickinson'],
      offers: [],
      hudlProfileUrl: 'https://fan.hudl.com/peddie-then-2027',
      gpa: 3.65,
      benchPressMaxLbs: 235,
      squatMaxLbs: 355,
      fortyYardDashSec: 4.59,
      verticalJumpInches: 33.0,
    },
    keyFilmPlays: ['pb-play-5'],
  }
];

export function getPlayerById(id: string): PlayerProfile | undefined {
  return PEDDIE_PLAYERS.find(p => p.id === id || p.jerseyNumber.toString() === id);
}

export function getPlayersByClass(classYear: string): PlayerProfile[] {
  return PEDDIE_PLAYERS.filter(p => p.classYear === classYear);
}

export function getPlayersByPosition(pos: string): PlayerProfile[] {
  return PEDDIE_PLAYERS.filter(p => p.positions.includes(pos) || p.primaryPosition === pos);
}
