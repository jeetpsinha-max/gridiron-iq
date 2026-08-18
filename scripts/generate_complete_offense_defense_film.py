"""
=============================================================================
GridironIQ — Full Season Offense & Defense Multi-Game Play Dataset Generator
Generates 270+ granular, authentic plays across all 9 games of 2025-2026 season.
Includes complete Peddie Defense playbooks, Havoc metrics, and 22-player tracking.
=============================================================================
"""

import json

# Games specification
GAMES_DEF = [
    {
        "id": "peddie-immaculata-2025",
        "title": "Week 1: @ Immaculata (L 45-33)",
        "opponent": "Immaculata Spartans",
        "score_home": 45,
        "score_away": 33,
        "date": "Sep 5, 2025 · 7:00 PM",
        "location": "Somerville, NJ",
        "result": "L 45-33",
        "off_plays": 16,
        "def_plays": 14,
        "duration": 180
    },
    {
        "id": "peddie-wscp-2025",
        "title": "Week 2: vs Wyoming Seminary (L 29-13)",
        "opponent": "Wyoming Seminary College Prep",
        "score_home": 13,
        "score_away": 29,
        "date": "Sep 13, 2025 · 1:00 PM",
        "location": "Hightstown, NJ",
        "result": "L 29-13",
        "off_plays": 15,
        "def_plays": 15,
        "duration": 180
    },
    {
        "id": "peddie-kiski-2025",
        "title": "Week 3: vs Kiski School (L 27-13)",
        "opponent": "The Kiski School",
        "score_home": 13,
        "score_away": 27,
        "date": "Sep 20, 2025 · 2:00 PM",
        "location": "Hightstown, NJ",
        "result": "L 27-13",
        "off_plays": 15,
        "def_plays": 15,
        "duration": 180
    },
    {
        "id": "peddie-germantown-2025",
        "title": "Week 4: @ Germantown Academy (L 19-14)",
        "opponent": "Germantown Academy",
        "score_home": 19,
        "score_away": 14,
        "date": "Sep 27, 2025 · 1:00 PM",
        "location": "Fort Washington, PA",
        "result": "L 19-14",
        "off_plays": 16,
        "def_plays": 16,
        "duration": 180
    },
    {
        "id": "peddie-lawrenceville-2025",
        "title": "Week 5: @ Lawrenceville School (L 50-6)",
        "opponent": "Lawrenceville Big Red",
        "score_home": 50,
        "score_away": 6,
        "date": "Oct 4, 2025 · 7:00 PM",
        "location": "Lawrenceville, NJ",
        "result": "L 50-6",
        "off_plays": 14,
        "def_plays": 16,
        "duration": 180
    },
    {
        "id": "peddie-hill-2025",
        "title": "Week 6: vs Hill School (W 40-20 Homecoming)",
        "opponent": "The Hill School Rams",
        "score_home": 40,
        "score_away": 20,
        "date": "Oct 11, 2025 · 2:00 PM",
        "location": "Hightstown, NJ",
        "result": "W 40-20",
        "off_plays": 18,
        "def_plays": 18,
        "duration": 180
    },
    {
        "id": "peddie-pennington-2025",
        "title": "Week 7: vs Pennington (L 36-6)",
        "opponent": "The Pennington School",
        "score_home": 6,
        "score_away": 36,
        "date": "Oct 25, 2025 · 2:00 PM",
        "location": "Hightstown, NJ",
        "result": "L 36-6",
        "off_plays": 14,
        "def_plays": 16,
        "duration": 180
    },
    {
        "id": "peddie-stlukes-2025",
        "title": "Week 8: @ St. Luke's (W 53-21)",
        "opponent": "St. Luke's Crusaders",
        "score_home": 21,
        "score_away": 53,
        "date": "Nov 1, 2025 · 2:00 PM",
        "location": "New Canaan, CT",
        "result": "W 53-21",
        "off_plays": 20,
        "def_plays": 18,
        "duration": 180
    },
    {
        "id": "peddie-blair-2025",
        "title": "Week 9: @ Blair Academy (L 42-18 Rivalry)",
        "opponent": "Blair Academy Buccaneers",
        "score_home": 42,
        "score_away": 18,
        "date": "Nov 8, 2025 · 2:00 PM",
        "location": "Blairstown, NJ",
        "result": "L 42-18",
        "off_plays": 18,
        "def_plays": 18,
        "duration": 180
    }
]

# Offense play templates
OFFENSE_TEMPLATES = [
    {
        "type": "PASS", "concept": "Melton to Barone Deep Seam vs Cover 2", "formation": "Peddie Gun 11 Trips Right",
        "personnel": "11", "motion": "JET_SWEEP", "motion_dir": "LEFT", "motion_j": 5, "motion_name": "Lorenzo Barone",
        "qb_j": 15, "qb_name": "Freddy Melton", "rb_j": 3, "rb_name": "Jeremiah Davis",
        "target_j": 5, "target_name": "Lorenzo Barone", "blocking": "PASS_PRO", "route": "VERTICALS",
        "front": "4-3 Under", "pkg": "4-3", "coverage": "COVER_2", "reaction": "Safety rotates toward motion boundary.",
        "yards": 28, "epa": 1.85, "success": True, "first_down": True, "td": False, "pa": False,
        "desc_tmpl": "Freddy Melton delivers a 28-yard strike on a seam route to Lorenzo Barone behind the linebackers.",
        "target_x": 35, "target_y": 37, "los_y": 65, "fd_y": 55
    },
    {
        "type": "RUN", "concept": "Jeremiah Davis Outside Zone Cutback", "formation": "Peddie Pistol 12 Heavy",
        "personnel": "12", "motion": "ORBIT", "motion_dir": "RIGHT", "motion_j": 4, "motion_name": "Cooper Allen",
        "qb_j": 15, "qb_name": "Freddy Melton", "rb_j": 3, "rb_name": "Jeremiah Davis",
        "target_j": 3, "target_name": "Jeremiah Davis", "blocking": "OUTSIDE_ZONE", "route": "MESH",
        "front": "4-3 Over", "pkg": "4-3", "coverage": "COVER_3", "reaction": "Strong safety rolls into the box.",
        "yards": 24, "epa": 3.20, "success": True, "first_down": True, "td": True, "pa": False,
        "desc_tmpl": "TOUCHDOWN PEDDIE: Jeremiah Davis cuts outside behind Christian Velardi's block for a 24-yard TD.",
        "target_x": 85, "target_y": 10, "los_y": 76, "fd_y": 72
    },
    {
        "type": "PASS", "concept": "Melton Corner Route to Cooper Allen", "formation": "Peddie Gun 11 Spread",
        "personnel": "11", "motion": "FLY", "motion_dir": "LEFT", "motion_j": 6, "motion_name": "Joey Gaston",
        "qb_j": 15, "qb_name": "Freddy Melton", "rb_j": 3, "rb_name": "Jeremiah Davis",
        "target_j": 4, "target_name": "Cooper Allen", "blocking": "PASS_PRO", "route": "SMASH",
        "front": "3-3-5 Nickel", "pkg": "NICKEL", "coverage": "COVER_4", "reaction": "Cornerback bails into deep quarter.",
        "yards": 18, "epa": 1.65, "success": True, "first_down": True, "td": False, "pa": True,
        "desc_tmpl": "Freddy Melton steps up in the pocket and connects with Cooper Allen on an 18-yard corner route.",
        "target_x": 75, "target_y": 37, "los_y": 55, "fd_y": 47
    },
    {
        "type": "PASS", "concept": "Quick Slant to Benjamin Perkins", "formation": "Peddie Gun 11 Bunch",
        "personnel": "11", "motion": "JET_SWEEP", "motion_dir": "RIGHT", "motion_j": 22, "motion_name": "Benjamin Perkins",
        "qb_j": 15, "qb_name": "Freddy Melton", "rb_j": 3, "rb_name": "Jeremiah Davis",
        "target_j": 22, "target_name": "Benjamin Perkins", "blocking": "PASS_PRO", "route": "SLANT_FLAT",
        "front": "3-4 Base", "pkg": "3-4", "coverage": "COVER_3", "reaction": "Linebacker flows hard toward bunch set.",
        "yards": 14, "epa": 1.45, "success": True, "first_down": True, "td": False, "pa": False,
        "desc_tmpl": "Freddy Melton fires a quick slant to Benjamin Perkins (#22) who accelerates for a 14-yard first down.",
        "target_x": 52, "target_y": 56, "los_y": 70, "fd_y": 60
    },
    {
        "type": "RUN", "concept": "Kadin Huling B-Gap Power", "formation": "Peddie I-Formation 21",
        "personnel": "21", "motion": "NONE", "motion_dir": "NONE", "motion_j": 2, "motion_name": "Kadin Huling",
        "qb_j": 15, "qb_name": "Freddy Melton", "rb_j": 2, "rb_name": "Kadin Huling",
        "target_j": 2, "target_name": "Kadin Huling", "blocking": "POWER_G", "route": "CROSSING",
        "front": "4-4 Stack", "pkg": "4-4", "coverage": "COVER_1", "reaction": "Linebackers trigger downhill.",
        "yards": 9, "epa": 0.85, "success": True, "first_down": False, "td": False, "pa": False,
        "desc_tmpl": "Kadin Huling (#2) hammers through the B-gap behind pulling guard Nathan Adler for a 9-yard gain.",
        "target_x": 48, "target_y": 61, "los_y": 70, "fd_y": 60
    },
    {
        "type": "PASS", "concept": "JT Rulewich 15-yd Intermediate Dig", "formation": "Peddie Gun 10 Empty",
        "personnel": "10", "motion": "ORBIT", "motion_dir": "LEFT", "motion_j": 11, "motion_name": "JT Rulewich",
        "qb_j": 15, "qb_name": "Freddy Melton", "rb_j": 3, "rb_name": "Jeremiah Davis",
        "target_j": 11, "target_name": "JT Rulewich", "blocking": "PASS_PRO", "route": "DIG",
        "front": "Nickel 4-2-5", "pkg": "NICKEL", "coverage": "QUARTERS", "reaction": "Safety widens with orbit route.",
        "yards": 15, "epa": 1.55, "success": True, "first_down": True, "td": False, "pa": False,
        "desc_tmpl": "Freddy Melton connects with sophomore receiver JT Rulewich (#11) across the middle for a 15-yard gain.",
        "target_x": 45, "target_y": 45, "los_y": 60, "fd_y": 50
    },
    {
        "type": "RUN", "concept": "Joey Gaston QB Option Keeper", "formation": "Peddie Pistol Option",
        "personnel": "11", "motion": "ORBIT", "motion_dir": "RIGHT", "motion_j": 5, "motion_name": "Lorenzo Barone",
        "qb_j": 6, "qb_name": "Joey Gaston", "rb_j": 3, "rb_name": "Jeremiah Davis",
        "target_j": 6, "target_name": "Joey Gaston", "blocking": "ZONE_READ", "route": "FLAT",
        "front": "3-3-5 Stack", "pkg": "3-3", "coverage": "COVER_3", "reaction": "Defensive end crashes on dive back.",
        "yards": 17, "epa": 1.90, "success": True, "first_down": True, "td": False, "pa": False,
        "desc_tmpl": "Joey Gaston (#6) reads the unblocked defensive end, keeps the option, and scrambles 17 yards down the sideline.",
        "target_x": 82, "target_y": 48, "los_y": 65, "fd_y": 55
    },
    {
        "type": "PASS", "concept": "Griffin Suthammanont Bubble Screen", "formation": "Peddie Gun 11 Trips Left",
        "personnel": "11", "motion": "FAST_MOTION", "motion_dir": "LEFT", "motion_j": 16, "motion_name": "Griffin Suthammanont",
        "qb_j": 15, "qb_name": "Freddy Melton", "rb_j": 3, "rb_name": "Jeremiah Davis",
        "target_j": 16, "target_name": "Griffin Suthammanont", "blocking": "SCREEN", "route": "SCREEN",
        "front": "4-2-5 Nickel", "pkg": "NICKEL", "coverage": "COVER_2", "reaction": "Cornerback triggers on screen release.",
        "yards": 12, "epa": 1.15, "success": True, "first_down": True, "td": False, "pa": False,
        "desc_tmpl": "Quick bubble screen out to Griffin Suthammanont (#16), who cuts inside for a 12-yard first down.",
        "target_x": 22, "target_y": 53, "los_y": 65, "fd_y": 55
    },
    {
        "type": "PASS", "concept": "Griffin Brennan 35-yd TD to Barone", "formation": "Peddie Gun 11 Spread",
        "personnel": "11", "motion": "JET_SWEEP", "motion_dir": "RIGHT", "motion_j": 5, "motion_name": "Lorenzo Barone",
        "qb_j": 9, "qb_name": "Griffin Brennan", "rb_j": 3, "rb_name": "Jeremiah Davis",
        "target_j": 5, "target_name": "Lorenzo Barone", "blocking": "PASS_PRO", "route": "POST",
        "front": "4-3 Base", "pkg": "4-3", "coverage": "COVER_3", "reaction": "Safety bites on intermediate crosser.",
        "yards": 35, "epa": 3.75, "success": True, "first_down": True, "td": True, "pa": True,
        "desc_tmpl": "TOUCHDOWN PEDDIE: Griffin Brennan (#9) launches a 35-yard post touchdown strike to Lorenzo Barone in the endzone.",
        "target_x": 78, "target_y": 10, "los_y": 45, "fd_y": 35
    },
    {
        "type": "RUN", "concept": "Jeremiah Davis Inside Zone Conversion", "formation": "Peddie Pistol 11",
        "personnel": "11", "motion": "NONE", "motion_dir": "NONE", "motion_j": 3, "motion_name": "Jeremiah Davis",
        "qb_j": 15, "qb_name": "Freddy Melton", "rb_j": 3, "rb_name": "Jeremiah Davis",
        "target_j": 3, "target_name": "Jeremiah Davis", "blocking": "INSIDE_ZONE", "route": "NONE",
        "front": "5-2 Goal Line", "pkg": "GOAL_LINE", "coverage": "COVER_0", "reaction": "All 11 defenders in the box.",
        "yards": 4, "epa": 0.65, "success": True, "first_down": True, "td": False, "pa": False,
        "desc_tmpl": "Jeremiah Davis lowers his shoulder behind Reed Oliver (#70) and churns through contact for a hard-fought 4-yard conversion.",
        "target_x": 50, "target_y": 66, "los_y": 70, "fd_y": 68
    }
]

# Peddie Defense play templates
DEFENSE_TEMPLATES = [
    {
        "type": "PASS", "concept": "Reed Oliver Edge Strip-Sack (Havoc)", "formation": "Opp Gun 11 Spread",
        "personnel": "11", "motion": "NONE", "motion_dir": "NONE", "motion_j": 0, "motion_name": "None",
        "qb_j": 12, "qb_name": "Opp QB", "rb_j": 28, "rb_name": "Opp RB",
        "target_j": 70, "target_name": "Reed Oliver", "blocking": "PASS_PRO", "route": "VERTICALS",
        "front": "Peddie 4-3 Over", "pkg": "4-3", "coverage": "COVER_1", "reaction": "Reed Oliver (#70) executes explosive speed-to-power rip move.",
        "yards": -8, "epa": -2.85, "success": False, "first_down": False, "td": False, "pa": False,
        "def_maker_j": 70, "def_maker_name": "Reed Oliver", "def_type": "SACK",
        "desc_tmpl": "DEFENSIVE HAVOC: Senior defensive lineman Reed Oliver (#70) beats the left tackle off the edge for an 8-yard strip-sack, recovered by Cooper Allen (#4)!",
        "target_x": 48, "target_y": 73, "los_y": 65, "fd_y": 55
    },
    {
        "type": "PASS", "concept": "Jeremiah Davis 28-yd Interception Return", "formation": "Opp Gun 10 Empty",
        "personnel": "10", "motion": "JET_SWEEP", "motion_dir": "RIGHT", "motion_j": 81, "motion_name": "Opp WR",
        "qb_j": 12, "qb_name": "Opp QB", "rb_j": 28, "rb_name": "Opp RB",
        "target_j": 3, "target_name": "Jeremiah Davis", "blocking": "PASS_PRO", "route": "POST",
        "front": "Peddie 3-3-5 Nickel", "pkg": "NICKEL", "coverage": "COVER_3", "reaction": "Free safety Jeremiah Davis (#3) reads QB eyes and jumps deep post.",
        "yards": 0, "epa": -4.20, "success": False, "first_down": False, "td": False, "pa": False,
        "def_maker_j": 3, "def_maker_name": "Jeremiah Davis", "def_type": "INT",
        "desc_tmpl": "TURNOVER: Senior safety Jeremiah Davis (#3) intercepts the pass on the post route and returns it 28 yards into opposing territory!",
        "target_x": 52, "target_y": 40, "los_y": 50, "fd_y": 40
    },
    {
        "type": "RUN", "concept": "Kadin Huling 4th & Goal Stuff (TFL)", "formation": "Opp I-Formation Heavy",
        "personnel": "22", "motion": "NONE", "motion_dir": "NONE", "motion_j": 0, "motion_name": "None",
        "qb_j": 12, "qb_name": "Opp QB", "rb_j": 28, "rb_name": "Opp RB",
        "target_j": 2, "target_name": "Kadin Huling", "blocking": "GAP_POWER", "route": "NONE",
        "front": "Peddie 6-2 Goal Line", "pkg": "GOAL_LINE", "coverage": "MAN_PRESS", "reaction": "Linebackers Kadin Huling (#2) & Augie Cassidy (#10) fire downhill into A-gap.",
        "yards": -2, "epa": -3.50, "success": False, "first_down": False, "td": False, "pa": False,
        "def_maker_j": 2, "def_maker_name": "Kadin Huling", "def_type": "GOAL_LINE_STAND",
        "desc_tmpl": "4TH DOWN GOAL LINE STAND: Kadin Huling (#2) explodes into the A-gap and stonewalls the running back for a 2-yard loss, forcing a turnover on downs!",
        "target_x": 50, "target_y": 88, "los_y": 86, "fd_y": 85
    },
    {
        "type": "PASS", "concept": "Lorenzo Barone 3rd Down Pass Breakup (PBU)", "formation": "Opp Gun 11 Trips Left",
        "personnel": "11", "motion": "ORBIT", "motion_dir": "LEFT", "motion_j": 84, "motion_name": "Opp WR",
        "qb_j": 12, "qb_name": "Opp QB", "rb_j": 28, "rb_name": "Opp RB",
        "target_j": 5, "target_name": "Lorenzo Barone", "blocking": "PASS_PRO", "route": "OUT",
        "front": "Peddie Dime 3-2-6", "pkg": "DIME", "coverage": "TAMPA_2", "reaction": "Cornerback Lorenzo Barone (#5) drives on the out route at the catch point.",
        "yards": 0, "epa": -1.65, "success": False, "first_down": False, "td": False, "pa": False,
        "def_maker_j": 5, "def_maker_name": "Lorenzo Barone", "def_type": "PBU",
        "desc_tmpl": "DEFENSIVE STOP: Lorenzo Barone (#5) delivers a physical pass breakup at the boundary on 3rd & 9 to force a 4th down punt.",
        "target_x": 15, "target_y": 55, "los_y": 65, "fd_y": 56
    },
    {
        "type": "PASS", "concept": "Cooper Allen A-Gap Blitz Sack", "formation": "Opp Gun 11 Bunch",
        "personnel": "11", "motion": "SHIFT", "motion_dir": "RIGHT", "motion_j": 88, "motion_name": "Opp WR",
        "qb_j": 12, "qb_name": "Opp QB", "rb_j": 28, "rb_name": "Opp RB",
        "target_j": 4, "target_name": "Cooper Allen", "blocking": "PASS_PRO", "route": "CROSSING",
        "front": "Peddie 5-2 Fire Blitz", "pkg": "BLITZ", "coverage": "COVER_0", "reaction": "Defensive tackle Cooper Allen (#4) shoots through the center/guard gap untouched.",
        "yards": -6, "epa": -2.10, "success": False, "first_down": False, "td": False, "pa": False,
        "def_maker_j": 4, "def_maker_name": "Cooper Allen", "def_type": "SACK",
        "desc_tmpl": "SACK: Cooper Allen (#4) overpowers the interior offensive line on a 3rd down fire blitz for a 6-yard sack!",
        "target_x": 50, "target_y": 71, "los_y": 65, "fd_y": 57
    },
    {
        "type": "RUN", "concept": "Griffin Brennan Perimeter TFL", "formation": "Opp Pistol 12",
        "personnel": "12", "motion": "FLY", "motion_dir": "LEFT", "motion_j": 82, "motion_name": "Opp WR",
        "qb_j": 12, "qb_name": "Opp QB", "rb_j": 28, "rb_name": "Opp RB",
        "target_j": 9, "target_name": "Griffin Brennan", "blocking": "OUTSIDE_ZONE", "route": "NONE",
        "front": "Peddie 4-3 Under", "pkg": "4-3", "coverage": "QUARTERS", "reaction": "Linebacker Griffin Brennan (#9) diagnoses perimeter stretch and sheds blocking tight end.",
        "yards": -4, "epa": -1.40, "success": False, "first_down": False, "td": False, "pa": False,
        "def_maker_j": 9, "def_maker_name": "Griffin Brennan", "def_type": "TFL",
        "desc_tmpl": "TACKLE FOR LOSS: Linebacker Griffin Brennan (#9) blows up the outside stretch for a 4-yard loss.",
        "target_x": 20, "target_y": 69, "los_y": 65, "fd_y": 55
    },
    {
        "type": "PASS", "concept": "Benjamin Perkins Red Zone Interception", "formation": "Opp Gun 11 Spread",
        "personnel": "11", "motion": "JET_SWEEP", "motion_dir": "LEFT", "motion_j": 85, "motion_name": "Opp WR",
        "qb_j": 12, "qb_name": "Opp QB", "rb_j": 28, "rb_name": "Opp RB",
        "target_j": 22, "target_name": "Benjamin Perkins", "blocking": "PASS_PRO", "route": "CORNER",
        "front": "Peddie 4-2-5 Nickel", "pkg": "NICKEL", "coverage": "COVER_2", "reaction": "Benjamin Perkins (#22) plays trail technique and leaps for the interception.",
        "yards": 0, "epa": -4.50, "success": False, "first_down": False, "td": False, "pa": False,
        "def_maker_j": 22, "def_maker_name": "Benjamin Perkins", "def_type": "INT",
        "desc_tmpl": "RED ZONE TURNOVER: Sophomore defensive back Benjamin Perkins (#22) undercuts the corner route in the endzone for a critical interception!",
        "target_x": 80, "target_y": 12, "los_y": 28, "fd_y": 18
    },
    {
        "type": "PASS", "concept": "Jonathan Stizza Slot Blitz & QB Hurry", "formation": "Opp Gun 10 Spread",
        "personnel": "10", "motion": "NONE", "motion_dir": "NONE", "motion_j": 0, "motion_name": "None",
        "qb_j": 12, "qb_name": "Opp QB", "rb_j": 28, "rb_name": "Opp RB",
        "target_j": 14, "target_name": "Jonathan Stizza", "blocking": "PASS_PRO", "route": "DIG",
        "front": "Peddie Nickel Blitz", "pkg": "NICKEL", "coverage": "COVER_1", "reaction": "Jonathan Stizza (#14) times snap count from slot and flushes QB out of pocket.",
        "yards": 0, "epa": -1.35, "success": False, "first_down": False, "td": False, "pa": False,
        "def_maker_j": 14, "def_maker_name": "Jonathan Stizza", "def_type": "PRESSURE",
        "desc_tmpl": "DEFENSIVE PRESSURE: Jonathan Stizza (#14) comes off the edge on a slot blitz, forcing an off-balance incompletion on 3rd & 6.",
        "target_x": 45, "target_y": 55, "los_y": 60, "fd_y": 54
    },
    {
        "type": "RUN", "concept": "Mason Kish & Nathan Adler Interior Stuff", "formation": "Opp Pistol 21",
        "personnel": "21", "motion": "NONE", "motion_dir": "NONE", "motion_j": 0, "motion_name": "None",
        "qb_j": 12, "qb_name": "Opp QB", "rb_j": 28, "rb_name": "Opp RB",
        "target_j": 77, "target_name": "Mason Kish", "blocking": "INSIDE_ZONE", "route": "NONE",
        "front": "Peddie 3-4 Okie", "pkg": "3-4", "coverage": "COVER_4", "reaction": "Mason Kish (#77) anchors against double-team, enabling Nathan Adler (#56) to make stop.",
        "yards": 0, "epa": -0.90, "success": False, "first_down": False, "td": False, "pa": False,
        "def_maker_j": 77, "def_maker_name": "Mason Kish", "def_type": "STOP",
        "desc_tmpl": "3RD DOWN STOP: Mason Kish (#77) and Nathan Adler (#56) clog the interior gaps to stop the run for no gain.",
        "target_x": 50, "target_y": 66, "los_y": 66, "fd_y": 64
    },
    {
        "type": "PASS", "concept": "Bodee Thibodeau 3rd Down Open-Field Tackle", "formation": "Opp Gun 11 Spread",
        "personnel": "11", "motion": "FAST_MOTION", "motion_dir": "RIGHT", "motion_j": 86, "motion_name": "Opp WR",
        "qb_j": 12, "qb_name": "Opp QB", "rb_j": 28, "rb_name": "Opp RB",
        "target_j": 8, "target_name": "Bodee Thibodeau", "blocking": "SCREEN", "route": "SCREEN",
        "front": "Peddie 4-2-5 Nickel", "pkg": "NICKEL", "coverage": "COVER_3", "reaction": "Bodee Thibodeau (#8) triggers instantly on perimeter screen.",
        "yards": 2, "epa": -1.10, "success": False, "first_down": False, "td": False, "pa": False,
        "def_maker_j": 8, "def_maker_name": "Bodee Thibodeau", "def_type": "STOP",
        "desc_tmpl": "3RD DOWN STOP: Bodee Thibodeau (#8) makes a textbook open-field tackle on a screen 4 yards short of the line to gain.",
        "target_x": 75, "target_y": 62, "los_y": 65, "fd_y": 59
    }
]

def generate_full_file():
    code_lines = []
    
    with open(r"d:\MyProfile\Desktop\gridiron-iq\scripts\compile_all_season_film.py", "r", encoding="utf-8") as f:
        src = f.read()
    
    header_content = src.split('header = """')[1].split('"""')[0]
    code_lines.append(header_content)
    code_lines.append("\n// ----------------------------------------------------------------------------\n// 3. Complete 9-Game Offense & Defense Play Datasets (270+ Plays)\n// ----------------------------------------------------------------------------\n")
    
    all_game_play_var_names = []
    
    for g_idx, game in enumerate(GAMES_DEF):
        var_name = f"GAME_{g_idx+1}_PLAYS"
        all_game_play_var_names.append((game["id"], var_name, game))
        code_lines.append(f"// Game {g_idx+1}: {game['title']}")
        code_lines.append(f"export const {var_name}: PlayAnalysis[] = [")
        
        tot_plays = game["off_plays"] + game["def_plays"]
        v_time_step = max(5, int(game["duration"] / tot_plays))
        
        play_counter = 1
        
        # Interleave Offense and Defense drives
        for turn_idx in range(max(game["off_plays"], game["def_plays"])):
            # Offense play
            if turn_idx < game["off_plays"]:
                p_idx = play_counter - 1
                tmpl = OFFENSE_TEMPLATES[turn_idx % len(OFFENSE_TEMPLATES)]
                p_id = f"p-{game['id']}-off-{turn_idx+1}"
                
                qtr = min(4, 1 + (p_idx * 4 // tot_plays))
                mins = 14 - ((p_idx % 4) * 3)
                secs = (p_idx * 17) % 60
                clock = f"{mins:02d}:{secs:02d}"
                
                v_start = p_idx * v_time_step + 5
                v_end = v_start + v_time_step - 2
                
                down = 1 + (turn_idx % 4)
                dist = 10 if down == 1 else (7 if down == 2 else (4 if down == 3 else 2))
                yard_line = 20 + ((turn_idx * 7) % 60)
                hash_m = "LEFT" if turn_idx % 3 == 0 else ("RIGHT" if turn_idx % 3 == 1 else "MIDDLE")
                
                desc_json = json.dumps(tmpl["desc_tmpl"])
                formation_json = json.dumps(tmpl["formation"])
                personnel_json = json.dumps(tmpl["personnel"])
                motion_json = json.dumps(tmpl["motion"])
                motion_dir_json = json.dumps(tmpl["motion_dir"])
                blocking_json = json.dumps(tmpl["blocking"])
                route_json = json.dumps(tmpl["route"])
                front_json = json.dumps(tmpl["front"])
                pkg_json = json.dumps(tmpl["pkg"])
                coverage_json = json.dumps(tmpl["coverage"])
                reaction_json = json.dumps(tmpl["reaction"])
                type_json = json.dumps(tmpl["type"])
                concept_json = json.dumps(tmpl["concept"])
                qb_name_json = json.dumps(tmpl["qb_name"])
                rb_name_json = json.dumps(tmpl["rb_name"])
                motion_name_json = json.dumps(tmpl["motion_name"])
                target_name_json = json.dumps(tmpl["target_name"])
                
                code_lines.append(f"""  {{
    id: '{p_id}',
    gameId: '{game["id"]}',
    playNumber: {play_counter},
    quarter: {qtr},
    gameClock: '{clock}',
    videoTimestampStart: {v_start},
    videoTimestampMotion: {v_start+2},
    videoTimestampSnap: {v_start+5},
    videoTimestampEnd: {v_end},
    down: {down},
    distance: {dist},
    yardLine: {yard_line},
    hash: '{hash_m}',
    unit: 'OFFENSE',
    offensiveFormation: {formation_json},
    offensivePersonnel: {personnel_json},
    motionType: {motion_json},
    motionDirection: {motion_dir_json},
    motionPlayerJersey: {tmpl["motion_j"]},
    blockingScheme: {blocking_json},
    routeConcept: {route_json},
    defensiveFront: {front_json},
    defensivePackage: {pkg_json},
    coverageScheme: {coverage_json},
    defenseReactionToMotion: {reaction_json},
    playType: {type_json},
    playActionFake: {str(tmpl["pa"]).lower()},
    targetPlayerJersey: {tmpl["target_j"]},
    yardsGained: {tmpl["yards"]},
    epa: {tmpl["epa"]:.2f},
    successRate: {str(tmpl["success"]).lower()},
    isFirstDown: {str(tmpl["first_down"]).lower()},
    isTouchdown: {str(tmpl["td"]).lower()},
    isTurnover: false,
    isPenalty: false,
    playDescription: {desc_json},
    trackingData: buildPeddieTrackingData({{
      losY: {tmpl["los_y"]}, firstDownY: {tmpl["fd_y"]}, qbJersey: {tmpl["qb_j"]}, qbName: {qb_name_json},
      rbJersey: {tmpl["rb_j"]}, rbName: {rb_name_json}, motionJersey: {tmpl["motion_j"]}, motionName: {motion_name_json},
      targetJersey: {tmpl["target_j"]}, targetName: {target_name_json}, passTargetX: {tmpl["target_x"]}, passTargetY: {tmpl["target_y"]},
      playConcept: {concept_json}
    }}),
    comments: [],
    actionItems: [],
    telestrationStrokes: [],
  }},""")
                play_counter += 1

            # Defense play
            if turn_idx < game["def_plays"]:
                p_idx = play_counter - 1
                dtmpl = DEFENSE_TEMPLATES[turn_idx % len(DEFENSE_TEMPLATES)]
                p_id = f"p-{game['id']}-def-{turn_idx+1}"
                
                qtr = min(4, 1 + (p_idx * 4 // tot_plays))
                mins = 14 - ((p_idx % 4) * 3)
                secs = (p_idx * 17) % 60
                clock = f"{mins:02d}:{secs:02d}"
                
                v_start = p_idx * v_time_step + 5
                v_end = v_start + v_time_step - 2
                
                down = 1 + (turn_idx % 4)
                dist = 10 if down == 1 else (7 if down == 2 else (4 if down == 3 else 2))
                yard_line = 30 + ((turn_idx * 5) % 50)
                hash_m = "LEFT" if turn_idx % 3 == 1 else ("RIGHT" if turn_idx % 3 == 2 else "MIDDLE")
                
                desc_json = json.dumps(dtmpl["desc_tmpl"])
                formation_json = json.dumps(dtmpl["formation"])
                personnel_json = json.dumps(dtmpl["personnel"])
                motion_json = json.dumps(dtmpl["motion"])
                motion_dir_json = json.dumps(dtmpl["motion_dir"])
                blocking_json = json.dumps(dtmpl["blocking"])
                route_json = json.dumps(dtmpl["route"])
                front_json = json.dumps(dtmpl["front"])
                pkg_json = json.dumps(dtmpl["pkg"])
                coverage_json = json.dumps(dtmpl["coverage"])
                reaction_json = json.dumps(dtmpl["reaction"])
                type_json = json.dumps(dtmpl["type"])
                concept_json = json.dumps(dtmpl["concept"])
                qb_name_json = json.dumps(dtmpl["qb_name"])
                rb_name_json = json.dumps(dtmpl["rb_name"])
                motion_name_json = json.dumps(dtmpl["motion_name"])
                def_maker_name_json = json.dumps(dtmpl["def_maker_name"])
                def_type_json = json.dumps(dtmpl["def_type"])
                
                code_lines.append(f"""  {{
    id: '{p_id}',
    gameId: '{game["id"]}',
    playNumber: {play_counter},
    quarter: {qtr},
    gameClock: '{clock}',
    videoTimestampStart: {v_start},
    videoTimestampMotion: {v_start+2},
    videoTimestampSnap: {v_start+5},
    videoTimestampEnd: {v_end},
    down: {down},
    distance: {dist},
    yardLine: {yard_line},
    hash: '{hash_m}',
    unit: 'DEFENSE',
    defensivePlayMakerJersey: {dtmpl["def_maker_j"]},
    defensivePlayMakerName: {def_maker_name_json},
    defensivePlayType: {def_type_json},
    offensiveFormation: {formation_json},
    offensivePersonnel: {personnel_json},
    motionType: {motion_json},
    motionDirection: {motion_dir_json},
    motionPlayerJersey: {dtmpl["motion_j"]},
    blockingScheme: {blocking_json},
    routeConcept: {route_json},
    defensiveFront: {front_json},
    defensivePackage: {pkg_json},
    coverageScheme: {coverage_json},
    defenseReactionToMotion: {reaction_json},
    playType: {type_json},
    playActionFake: {str(dtmpl["pa"]).lower()},
    targetPlayerJersey: {dtmpl["target_j"]},
    yardsGained: {dtmpl["yards"]},
    epa: {dtmpl["epa"]:.2f},
    successRate: {str(dtmpl["success"]).lower()},
    isFirstDown: {str(dtmpl["first_down"]).lower()},
    isTouchdown: {str(dtmpl["td"]).lower()},
    isTurnover: {str(dtmpl["def_type"] in ["INT", "GOAL_LINE_STAND"]).lower()},
    isPenalty: false,
    playDescription: {desc_json},
    trackingData: buildPeddieTrackingData({{
      losY: {dtmpl["los_y"]}, firstDownY: {dtmpl["fd_y"]}, qbJersey: {dtmpl["qb_j"]}, qbName: {qb_name_json},
      rbJersey: {dtmpl["rb_j"]}, rbName: {rb_name_json}, motionJersey: {dtmpl["motion_j"]}, motionName: {motion_name_json},
      targetJersey: {dtmpl["def_maker_j"]}, targetName: {def_maker_name_json}, passTargetX: {dtmpl["target_x"]}, passTargetY: {dtmpl["target_y"]},
      playConcept: {concept_json}
    }}),
    comments: [],
    actionItems: [],
    telestrationStrokes: [],
  }},""")
                play_counter += 1
            
        code_lines.append("];\n")
        
    code_lines.append("// ----------------------------------------------------------------------------\n// 4. MOCK_GAMES Master Dataset (All 9 Official Games)\n// ----------------------------------------------------------------------------\n")
    code_lines.append("export const MOCK_GAMES: GameSession[] = [")
    for g_id, var_name, g_info in all_game_play_var_names:
        title_json = json.dumps(g_info["title"])
        opp_json = json.dumps(g_info["opponent"])
        date_json = json.dumps(g_info["date"])
        code_lines.append(f"""  {{
    id: '{g_id}',
    title: {title_json},
    date: {date_json},
    opponent: {opp_json},
    homeTeam: 'Peddie Falcons',
    awayTeam: {opp_json},
    homeScore: {g_info["score_home"]},
    awayScore: {g_info["score_away"]},
    duration: {g_info["duration"]},
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    plays: {var_name},
  }},""")
    code_lines.append("];\n")

    code_lines.append("export const MOCK_PLAYS: PlayAnalysis[] = GAME_9_PLAYS;\n")

    code_lines.append("""export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    userId: 'coach-fabish',
    type: 'MENTION',
    title: 'Coach Fabish tagged you in a play review',
    message: 'Check out the Edge Strip-Sack by Reed Oliver on Play #2 vs Blair Academy.',
    playId: 'p-peddie-blair-2025-def-1',
    isRead: false,
    createdAt: '2025-11-09T10:30:00Z',
  },
  {
    id: 'notif-2',
    userId: 'coach-fabish',
    type: 'ACTION_ITEM',
    title: 'New Scouting Action Item',
    message: 'Review safety rotation vs Trips Bunch formation before practice.',
    playId: 'p-peddie-blair-2025-off-1',
    isRead: false,
    createdAt: '2025-11-09T11:00:00Z',
  },
];\n""")

    code_lines.append("""// ----------------------------------------------------------------------------
// 5. Game Level Box Scores, Drive Ledgers & Analytics Aggregations
// ----------------------------------------------------------------------------

export const MOCK_BOX_SCORE: TeamBoxScore = {
  teamName: 'Peddie Falcons',
  pointsByQuarter: [7, 13, 7, 13],
  totalPoints: 40,
  passingYards: 245,
  rushingYards: 168,
  totalYards: 413,
  firstDowns: 19,
  thirdDownEfficiency: '7/11 (63.6%)',
  fourthDownEfficiency: '2/2 (100%)',
  turnovers: 0,
  penalties: '3-25 yds',
  timeOfPossession: '26:45',
};

export const MOCK_DRIVES: DriveInfo[] = [
  {
    id: 'd1', driveNumber: 1, quarter: 1, startTime: '15:00', endTime: '11:20',
    startYardLine: 25, endYardLine: 100, playCount: 8, yardsGained: 75,
    result: 'TOUCHDOWN', epaTotal: 3.45,
  },
  {
    id: 'd2', driveNumber: 2, quarter: 2, startTime: '09:40', endTime: '06:10',
    startYardLine: 35, endYardLine: 100, playCount: 6, yardsGained: 65,
    result: 'TOUCHDOWN', epaTotal: 2.80,
  },
  {
    id: 'd3', driveNumber: 3, quarter: 3, startTime: '12:00', endTime: '08:30',
    startYardLine: 20, endYardLine: 100, playCount: 7, yardsGained: 80,
    result: 'TOUCHDOWN', epaTotal: 3.10,
  },
  {
    id: 'd4', driveNumber: 4, quarter: 4, startTime: '07:15', endTime: '02:40',
    startYardLine: 30, endYardLine: 100, playCount: 9, yardsGained: 70,
    result: 'TOUCHDOWN', epaTotal: 2.95,
  }
];

export const MOCK_HEATMAP_POINTS: FieldHeatmapPoint[] = [
  { x: 35, y: 37, intensity: 0.9, yardsGained: 28, playType: 'PASS' },
  { x: 85, y: 10, intensity: 0.95, yardsGained: 24, playType: 'RUN' },
  { x: 75, y: 37, intensity: 0.8, yardsGained: 18, playType: 'PASS' },
  { x: 52, y: 56, intensity: 0.75, yardsGained: 14, playType: 'PASS' },
  { x: 48, y: 61, intensity: 0.7, yardsGained: 9, playType: 'RUN' },
  { x: 45, y: 45, intensity: 0.8, yardsGained: 15, playType: 'PASS' },
  { x: 82, y: 48, intensity: 0.85, yardsGained: 17, playType: 'RUN' },
  { x: 22, y: 53, intensity: 0.75, yardsGained: 12, playType: 'PASS' },
  { x: 78, y: 10, intensity: 0.95, yardsGained: 35, playType: 'PASS' },
  { x: 50, y: 66, intensity: 0.65, yardsGained: 4, playType: 'RUN' },
  { x: 88, y: 54, intensity: 0.75, yardsGained: 11, playType: 'PASS' },
  { x: 52, y: 10, intensity: 0.95, yardsGained: 16, playType: 'PASS' },
];
""")

    output = "\n".join(code_lines)
    with open(r"d:\MyProfile\Desktop\gridiron-iq\src\lib\mock-game-data.ts", "w", encoding="utf-8") as f:
        f.write(output)
    
    tot_generated = sum(g['off_plays'] + g['def_plays'] for g in GAMES_DEF)
    print(f"Successfully generated mock-game-data.ts with {len(GAMES_DEF)} games and {tot_generated} Offense & Defense plays!")

generate_full_file()
