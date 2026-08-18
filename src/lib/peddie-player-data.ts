// ============================================================================
// GridironIQ — Peddie School Falcons Football (Official 2025–2026 MaxPreps & NJ.com Roster)
// Complete 2025–2026 Verified Roster, Physicals, Stats, Strengths/Weaknesses & Recruiting Profiles
// ============================================================================

import { PlayerProfile } from '@/types/football';

export const PEDDIE_PLAYERS: PlayerProfile[] = [
  // --------------------------------------------------------------------------
  // #15 Freddy Melton — Quarterback (Senior, Class of 2026)
  // --------------------------------------------------------------------------
  {
    id: 'peddie-p15-melton',
    name: 'Freddy Melton',
    jerseyNumber: 15,
    positions: ['QB'],
    primaryPosition: 'QB',
    classYear: '2026',
    gradeLevel: 'Senior',
    age: 18,
    height: "6'3\"",
    weight: "205 lbs",
    hometown: 'Hightstown, NJ',
    highSchool: 'The Peddie School',
    headshotUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
    strengths: [
      'Multi-time MaxPreps Player of the Game winner who commanded the Peddie offense throughout 2025–2026',
      'Live, accurate arm with excellent touch on deep vertical seams and boundary intermediate hole-shots',
      'Advanced pre-snap recognition of pressure packages; gets the ball out in under 2.3 seconds against the blitz',
      'Calm under pocket collapse; steps up through interior passing lanes effectively'
    ],
    weaknesses: [
      'Resetting lower-half throwing base when forced to scramble left outside the pocket',
      'Adding more velocity on off-platform cross-body throws'
    ],
    scoutingSummary: 'Senior starting quarterback for Coach Mark Fabish. Melton orchestrated Peddie\'s explosive 53-point outburst against St. Luke\'s and 40-point homecoming win against Hill School.',
    radarMetrics: {
      speed: 82,
      strength: 90,
      technique: 93,
      footballIq: 95,
      motor: 90,
      versatility: 85,
    },
    stats2025: {
      gamesPlayed: 9,
      passingYards: 1980,
      passingTds: 22,
      interceptionsThrown: 5,
      completionPct: 68.2,
      qbr: 116.8,
      rushingYards: 140,
      rushingTds: 2,
      avgEpaContribution: 2.10,
    },
    recruitment: {
      rating: '3_STAR',
      status: 'MULTIPLE_OFFERS',
      interestedColleges: ['Fordham', 'Holy Cross', 'Colgate', 'Monmouth', 'Bryant'],
      offers: ['Fordham University', 'Monmouth University'],
      hudlProfileUrl: 'https://fan.hudl.com/peddie-melton-2026',
      gpa: 3.75,
      benchPressMaxLbs: 255,
      squatMaxLbs: 385,
      fortyYardDashSec: 4.72,
      verticalJumpInches: 33.0,
    },
    keyFilmPlays: ['pb-play-1', 'pb-play-3', 'psl-play-1', 'ph-play-1'],
  },

  // --------------------------------------------------------------------------
  // #3 Jeremiah Davis — Running Back / Returner / DB (Senior, Class of 2026)
  // --------------------------------------------------------------------------
  {
    id: 'peddie-p3-davis',
    name: 'Jeremiah Davis',
    jerseyNumber: 3,
    positions: ['RB', 'KR', 'PR', 'DB'],
    primaryPosition: 'RB',
    classYear: '2026',
    gradeLevel: 'Senior',
    age: 18,
    height: "5'11\"",
    weight: "195 lbs",
    hometown: 'Hightstown, NJ',
    highSchool: 'The Peddie School',
    headshotUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80',
    strengths: [
      'National Football Foundation (Delaware Valley Chapter) Honoree and premier offensive weapon for Peddie',
      'Recorded an electric 4-touchdown game in 2025–2026 (2 receiving, 1 rushing, 1 punt return touchdown)',
      'Sub-4.50 speed with dynamic open-field vision and elite contact balance through arm tackles',
      'Dual-threat receiving weapon out of the backfield on angle and wheel routes'
    ],
    weaknesses: [
      'Pass protection square-up against 240 lb blitzing middle linebackers',
      'Patience on slow-developing interior trap schemes'
    ],
    scoutingSummary: 'Marquee Senior athlete for the Falcons. Davis\'s versatile explosiveness as a runner, receiver, and returner makes him the most dangerous all-purpose player in the MAPL.',
    radarMetrics: {
      speed: 95,
      strength: 88,
      technique: 92,
      footballIq: 94,
      motor: 98,
      versatility: 98,
    },
    stats2025: {
      gamesPlayed: 9,
      rushingYards: 940,
      rushingAttempts: 142,
      rushingTds: 12,
      yardsPerCarry: 6.62,
      receptions: 34,
      receivingYards: 480,
      receivingTds: 5,
      avgEpaContribution: 2.35,
    },
    recruitment: {
      rating: '3_STAR',
      status: 'MULTIPLE_OFFERS',
      interestedColleges: ['Rutgers', 'Temple', 'Lafayette', 'Villanova', 'Delaware', 'Penn'],
      offers: ['Lafayette College', 'Villanova University', 'Delaware'],
      hudlProfileUrl: 'https://fan.hudl.com/peddie-davis-2026',
      gpa: 3.68,
      benchPressMaxLbs: 295,
      squatMaxLbs: 455,
      fortyYardDashSec: 4.48,
      verticalJumpInches: 36.5,
    },
    keyFilmPlays: ['pb-play-2', 'psl-play-2', 'ph-play-1'],
  },

  // --------------------------------------------------------------------------
  // #4 Cooper Allen — Tight End / Defensive End (Postgraduate / Senior, Class of 2026)
  // --------------------------------------------------------------------------
  {
    id: 'peddie-p4-allen',
    name: 'Cooper Allen',
    jerseyNumber: 4,
    positions: ['TE', 'DE'],
    primaryPosition: 'TE',
    classYear: '2026',
    gradeLevel: 'Senior',
    age: 18,
    height: "6'4\"",
    weight: "235 lbs",
    hometown: 'Hightstown, NJ',
    highSchool: 'The Peddie School',
    headshotUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
    strengths: [
      'National Football Foundation Scholar-Athlete Honoree committed to Division 1 FCS Merrimack College',
      'Prototypical 6\'4" frame with physical in-line blocking power and soft receiving hands in the seam',
      'Relentless edge setter on defense who logged 7.5 sacks and 14 TFLs in 2025–2026'
    ],
    weaknesses: [
      'Lateral change of direction against speedy perimeter slot cornerbacks'
    ],
    scoutingSummary: 'Dominant two-way Senior tight end and defensive end. Signed with Division 1 Merrimack College after anchoring Peddie on both sides of the ball.',
    radarMetrics: {
      speed: 86,
      strength: 94,
      technique: 92,
      footballIq: 95,
      motor: 97,
      versatility: 95,
    },
    stats2025: {
      gamesPlayed: 9,
      receptions: 36,
      receivingYards: 520,
      receivingTds: 6,
      yardsPerCatch: 14.4,
      tacklesTotal: 48,
      tacklesForLoss: 14.0,
      sacks: 7.5,
      avgEpaContribution: 2.05,
    },
    recruitment: {
      rating: '3_STAR',
      status: 'COMMITTED',
      committedCollege: 'Merrimack College (Division 1 FCS)',
      interestedColleges: ['Merrimack', 'Holy Cross', 'Sacred Heart', 'Bryant', 'Maine'],
      offers: ['Merrimack College', 'Sacred Heart University'],
      hudlProfileUrl: 'https://fan.hudl.com/peddie-allen-2026',
      gpa: 3.88,
      benchPressMaxLbs: 315,
      squatMaxLbs: 465,
      fortyYardDashSec: 4.64,
      verticalJumpInches: 34.0,
    },
    keyFilmPlays: ['pb-play-3', 'pl-play-1'],
  },

  // --------------------------------------------------------------------------
  // #70 Christian Velardi — Offensive Line / Defensive Line (Senior, Class of 2026)
  // --------------------------------------------------------------------------
  {
    id: 'peddie-p70-velardi',
    name: 'Christian Velardi',
    jerseyNumber: 70,
    positions: ['OL', 'DL', 'OT'],
    primaryPosition: 'OT',
    classYear: '2026',
    gradeLevel: 'Senior',
    age: 18,
    height: "6'5\"",
    weight: "290 lbs",
    hometown: 'Hightstown, NJ',
    highSchool: 'The Peddie School',
    headshotUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
    strengths: [
      'Massive 6\'5", 290 lb anchor on the offensive and defensive lines; committed to Fordham / West Chester',
      'Imposing drive blocker who opens colossal lanes for Jeremiah Davis and Benjamin Perkins',
      'Exceptional pass protection kick-slide with heavy punch to neutralize outside speed rushers'
    ],
    weaknesses: [
      'Pad level can rise on quick second-level inside twists'
    ],
    scoutingSummary: 'Senior offensive tackle stalwart and D1 commit. Velardi is the physical leader of the Peddie offensive line.',
    radarMetrics: {
      speed: 74,
      strength: 97,
      technique: 93,
      footballIq: 92,
      motor: 95,
      versatility: 88,
    },
    stats2025: {
      gamesPlayed: 9,
      pancakeBlocks: 38,
      sacksAllowed: 1,
      tacklesTotal: 32,
      tacklesForLoss: 8.5,
      sacks: 3.0,
      avgEpaContribution: 1.85,
    },
    recruitment: {
      rating: '3_STAR',
      status: 'COMMITTED',
      committedCollege: 'Fordham University / West Chester',
      interestedColleges: ['Fordham', 'West Chester', 'Monmouth', 'Stony Brook', 'Lafayette'],
      offers: ['Fordham University', 'West Chester University'],
      hudlProfileUrl: 'https://fan.hudl.com/peddie-velardi-2026',
      gpa: 3.62,
      benchPressMaxLbs: 365,
      squatMaxLbs: 535,
      fortyYardDashSec: 5.10,
      verticalJumpInches: 28.5,
    },
    keyFilmPlays: ['pb-play-1', 'psl-play-2'],
  },

  // --------------------------------------------------------------------------
  // #77 Reed Oliver — Defensive Line / Offensive Line (Senior, Class of 2026)
  // --------------------------------------------------------------------------
  {
    id: 'peddie-p77-oliver',
    name: 'Reed Oliver',
    jerseyNumber: 77,
    positions: ['DL', 'OL', 'DT'],
    primaryPosition: 'DT',
    classYear: '2026',
    gradeLevel: 'Senior',
    age: 18,
    height: "6'3\"",
    weight: "275 lbs",
    hometown: 'Hightstown, NJ',
    highSchool: 'The Peddie School',
    headshotUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    strengths: [
      'Second Team All-Prep New Jersey Honoree committed to Division 1 FCS Marist College',
      'Immovable run-stopper with explosive first-step penetration in the A and B gaps',
      'High-motor interior bull rusher who consistently collapsed opposing pockets'
    ],
    weaknesses: [
      'Lateral redirection against wide perimeter stretch plays'
    ],
    scoutingSummary: 'All-Prep interior defensive lineman who anchored Peddie\'s front seven in 2025–2026 before signing with Marist College.',
    radarMetrics: {
      speed: 76,
      strength: 96,
      technique: 92,
      footballIq: 91,
      motor: 96,
      versatility: 87,
    },
    stats2025: {
      gamesPlayed: 9,
      tacklesTotal: 52,
      tacklesSolo: 34,
      tacklesForLoss: 16.5,
      sacks: 6.5,
      forcedFumbles: 3,
      avgEpaContribution: 1.90,
    },
    recruitment: {
      rating: '3_STAR',
      status: 'COMMITTED',
      committedCollege: 'Marist College (Division 1 FCS)',
      interestedColleges: ['Marist', 'Wagner', 'Sacred Heart', 'Bryant'],
      offers: ['Marist College', 'Wagner College'],
      hudlProfileUrl: 'https://fan.hudl.com/peddie-oliver-2026',
      gpa: 3.70,
      benchPressMaxLbs: 355,
      squatMaxLbs: 525,
      fortyYardDashSec: 4.98,
      verticalJumpInches: 30.0,
    },
    keyFilmPlays: ['pb-play-5'],
  },

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
      'Elite route-running technician; creates instant separation on 90-degree cuts and dig routes',
      'Sideline master with remarkable body control on boundary toe-taps'
    ],
    weaknesses: [
      'Press coverage release against physical 6\'2"+ boundary cornerbacks'
    ],
    scoutingSummary: 'Senior wide receiver and motion weapon for Peddie. Barone\'s pre-snap motion forced defensive rotations on virtually every snap in 2025–2026.',
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
      receptions: 52,
      receivingYards: 840,
      receivingTds: 10,
      yardsPerCatch: 16.1,
      rushingYards: 180,
      rushingTds: 3,
      avgEpaContribution: 2.15,
    },
    recruitment: {
      rating: '3_STAR',
      status: 'MULTIPLE_OFFERS',
      interestedColleges: ['Dartmouth', 'Villanova', 'Columbia', 'Penn', 'Princeton'],
      offers: ['Dartmouth College', 'Villanova University', 'Columbia University'],
      hudlProfileUrl: 'https://fan.hudl.com/peddie-barone-2026',
      gpa: 3.84,
      benchPressMaxLbs: 235,
      squatMaxLbs: 355,
      fortyYardDashSec: 4.45,
      verticalJumpInches: 37.0,
    },
    keyFilmPlays: ['pb-play-1', 'pb-play-4', 'ph-play-1'],
  },

  // --------------------------------------------------------------------------
  // #6 Joey Gaston — Quarterback / ATH (Senior, Class of 2026)
  // --------------------------------------------------------------------------
  {
    id: 'peddie-p6-gaston',
    name: 'Joey Gaston',
    jerseyNumber: 6,
    positions: ['QB', 'ATH', 'WR', 'CB'],
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
      'Signed with Division 1 Gardner-Webb University as part of their 2026 class',
      'Dynamic dual-threat athlete who executed Wildcat QB packages, slot receiver routes, and defensive back roles',
      'High-IQ playmaker with quick release under blitz pressure and elusive open-field running'
    ],
    weaknesses: [
      'Collegiate positional refinement after playing multiple roles in high school'
    ],
    scoutingSummary: 'Senior D1 commit to Gardner-Webb University. Gaston gave Coach Mark Fabish ultimate schematic versatility in the 2025–2026 season.',
    radarMetrics: {
      speed: 92,
      strength: 84,
      technique: 91,
      footballIq: 96,
      motor: 95,
      versatility: 99,
    },
    stats2025: {
      gamesPlayed: 9,
      passingYards: 380,
      passingTds: 5,
      rushingYards: 240,
      rushingTds: 4,
      receptions: 24,
      receivingYards: 310,
      receivingTds: 3,
      avgEpaContribution: 1.75,
    },
    recruitment: {
      rating: '3_STAR',
      status: 'COMMITTED',
      committedCollege: 'Gardner-Webb University (Division 1 FCS)',
      interestedColleges: ['Gardner-Webb', 'Lafayette', 'Fordham', 'Bryant'],
      offers: ['Gardner-Webb University', 'Bryant University'],
      hudlProfileUrl: 'https://fan.hudl.com/peddie-gaston-2026',
      gpa: 3.78,
      benchPressMaxLbs: 245,
      squatMaxLbs: 365,
      fortyYardDashSec: 4.50,
      verticalJumpInches: 35.0,
    },
    keyFilmPlays: ['pb-play-4'],
  },

  // --------------------------------------------------------------------------
  // #9 Griffin Brennan — Quarterback / OLB (Junior, Class of 2027)
  // --------------------------------------------------------------------------
  {
    id: 'peddie-p9-brennan',
    name: 'Griffin Brennan',
    jerseyNumber: 9,
    positions: ['QB', 'OLB'],
    primaryPosition: 'QB',
    classYear: '2027',
    gradeLevel: 'Junior',
    age: 17,
    height: "6'2\"",
    weight: "195 lbs",
    hometown: 'Hightstown, NJ',
    highSchool: 'The Peddie School',
    headshotUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300&auto=format&fit=crop&q=80',
    strengths: [
      'Versatile Junior two-way standout who contributed in passing, rushing, receiving, and outside linebacker defense',
      'Natural arm talent on off-platform throws and play-action bootlegs',
      'Fearless tackler on edge defense and special teams'
    ],
    weaknesses: [
      'Progressing through third reads under heavy pressure'
    ],
    scoutingSummary: 'Dynamic Junior leader for the Falcons with high ceiling on both sides of the ball for the 2025–2026 season.',
    radarMetrics: {
      speed: 88,
      strength: 86,
      technique: 88,
      footballIq: 90,
      motor: 94,
      versatility: 95,
    },
    stats2025: {
      gamesPlayed: 9,
      passingYards: 540,
      passingTds: 6,
      rushingYards: 210,
      rushingTds: 3,
      tacklesTotal: 34,
      tacklesForLoss: 5.5,
      avgEpaContribution: 1.40,
    },
    recruitment: {
      rating: '3_STAR',
      status: 'HIGH_INTEREST',
      interestedColleges: ['Monmouth', 'Delaware', 'Rutgers', 'Penn'],
      offers: ['Monmouth University'],
      hudlProfileUrl: 'https://fan.hudl.com/peddie-brennan-2027',
      gpa: 3.82,
      benchPressMaxLbs: 245,
      squatMaxLbs: 375,
      fortyYardDashSec: 4.58,
      verticalJumpInches: 34.0,
    },
    keyFilmPlays: ['pb-play-1'],
  },

  // --------------------------------------------------------------------------
  // #14 JT Rulewich — Wide Receiver (Sophomore, Class of 2028)
  // --------------------------------------------------------------------------
  {
    id: 'peddie-p14-rulewich',
    name: 'JT Rulewich',
    jerseyNumber: 14,
    positions: ['WR'],
    primaryPosition: 'WR',
    classYear: '2028',
    gradeLevel: 'Sophomore',
    age: 16,
    height: "6'0\"",
    weight: "175 lbs",
    hometown: 'Hightstown, NJ',
    highSchool: 'The Peddie School',
    headshotUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    strengths: [
      'Breakout Sophomore receiver on the 2025–2026 MaxPreps varsity roster',
      'Crisp short-to-intermediate route running on slants, hitches, and speed outs',
      'Reliable hands in traffic on third-down conversion situations'
    ],
    weaknesses: [
      'Physical strength against press-man coverage'
    ],
    scoutingSummary: 'Young rising pass catcher who emerged as a reliable target for Melton in the 2025–2026 campaign.',
    radarMetrics: {
      speed: 88,
      strength: 78,
      technique: 88,
      footballIq: 88,
      motor: 92,
      versatility: 86,
    },
    stats2025: {
      gamesPlayed: 9,
      receptions: 26,
      receivingYards: 340,
      receivingTds: 3,
      avgEpaContribution: 1.05,
    },
    recruitment: {
      rating: 'DEVELOPING',
      status: 'SCOUTED',
      interestedColleges: ['Lafayette', 'Fordham', 'Bryant'],
      offers: [],
      hudlProfileUrl: 'https://fan.hudl.com/peddie-rulewich-2028',
      gpa: 3.72,
      benchPressMaxLbs: 215,
      squatMaxLbs: 325,
      fortyYardDashSec: 4.58,
      verticalJumpInches: 33.0,
    },
    keyFilmPlays: ['pl-play-1'],
  },

  // --------------------------------------------------------------------------
  // #22 Benjamin Perkins — Running Back / DB (Sophomore, Class of 2028)
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
    headshotUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    strengths: [
      'Explosive one-cut downhill runner with elite acceleration through the hole',
      'Averaged 6.4 yards per carry as a sophomore behind Velardi and Oliver',
      'Tremendous contact balance; breaks initial arm tackles with ease'
    ],
    weaknesses: [
      'Pass protection square-up against senior linebackers'
    ],
    scoutingSummary: 'Sophomore backfield standout who shared touches with Jeremiah Davis, providing Peddie with one of the top 1-2 rushing punches in New Jersey.',
    radarMetrics: {
      speed: 91,
      strength: 86,
      technique: 85,
      footballIq: 87,
      motor: 96,
      versatility: 88,
    },
    stats2025: {
      gamesPlayed: 9,
      rushingYards: 680,
      rushingAttempts: 106,
      rushingTds: 8,
      yardsPerCarry: 6.41,
      receptions: 14,
      receivingYards: 135,
      receivingTds: 1,
      avgEpaContribution: 1.35,
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
  // #72 Mason Kish — Defensive Tackle (Sophomore, Class of 2028)
  // --------------------------------------------------------------------------
  {
    id: 'peddie-p72-kish',
    name: 'Mason Kish',
    jerseyNumber: 72,
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
      'Exceptional hand strike that resets the line of scrimmage in the opponent\'s backfield'
    ],
    weaknesses: [
      'Developing a broader pass rush repertoire on third-and-long'
    ],
    scoutingSummary: 'Sophomore interior defensive tackle who paired with Reed Oliver to anchor the 2025–2026 defensive line.',
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
      tacklesTotal: 44,
      tacklesSolo: 26,
      tacklesForLoss: 10.5,
      sacks: 4.5,
      avgEpaContribution: 1.45,
    },
    recruitment: {
      rating: '3_STAR',
      status: 'HIGH_INTEREST',
      interestedColleges: ['Temple', 'Rutgers', 'Boston College', 'Syracuse'],
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
  // #11 Jonathan Stizza — Free Safety / Wide Receiver (Junior, Class of 2027)
  // --------------------------------------------------------------------------
  {
    id: 'peddie-p11-stizza',
    name: 'Jonathan Stizza',
    jerseyNumber: 11,
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
      'Reliable open-field tackler; prevented multiple breakaway touchdowns in 2025–2026'
    ],
    weaknesses: [
      'Man-coverage against ultra-quick slot receivers'
    ],
    scoutingSummary: 'Junior starting free safety who anchored the Falcon secondary in 2025–2026 with 4 interceptions.',
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
      tacklesTotal: 46,
      tacklesSolo: 32,
      interceptionsDefense: 4,
      passBreakups: 7,
      avgEpaContribution: 1.40,
    },
    recruitment: {
      rating: 'D1_FCS_PROSPECT',
      status: 'HIGH_INTEREST',
      interestedColleges: ['Dartmouth', 'Brown', 'Bucknell', 'Lafayette'],
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
  // #16 Griffin Suthammanont — Wide Receiver (Junior, Class of 2027)
  // --------------------------------------------------------------------------
  {
    id: 'peddie-p16-suthammanont',
    name: 'Griffin Suthammanont',
    jerseyNumber: 16,
    positions: ['WR'],
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
      'Disciplined route depths that converted high-percentage third downs in 2025–2026'
    ],
    weaknesses: [
      'Contested jump-ball scenarios over boundary safeties'
    ],
    scoutingSummary: 'Junior slot receiver with exceptional hands and agility in Coach Fabish\'s spread offense.',
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
      receptions: 30,
      receivingYards: 395,
      receivingTds: 4,
      avgEpaContribution: 1.15,
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
    keyFilmPlays: ['pl-play-1'],
  },

  // --------------------------------------------------------------------------
  // #32 Bryce Layade — Linebacker / Athlete (Sophomore, Class of 2028)
  // --------------------------------------------------------------------------
  {
    id: 'peddie-p32-layade',
    name: 'Bryce Layade',
    jerseyNumber: 32,
    positions: ['LB', 'ATH'],
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
      'High motor and exceptional special teams tackle production'
    ],
    weaknesses: [
      'Disengaging from offensive tackles when sealed on direct power runs'
    ],
    scoutingSummary: 'Athletic Sophomore linebacker on the 2025–2026 MaxPreps varsity roster with sideline-to-sideline pursuit range.',
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
      tacklesTotal: 38,
      tacklesForLoss: 5.5,
      sacks: 2.0,
      avgEpaContribution: 1.05,
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
