"""
=============================================================================
GridironIQ — Official 38-Player Roster Dataset Generator
Directly Grounded on the 2025–2026 NJ.com High School Sports PDF
=============================================================================
"""

import json

OFFICIAL_ROSTER = [
    {"num": 2, "name": "Kadin Huling", "gr": "Jr.", "class": "2027", "grade": "Junior", "pos": ["RB", "LB"], "primary": "RB", "ht": None, "wt": None},
    {"num": 3, "name": "Jeremiah Davis", "gr": "Sr.", "class": "2026", "grade": "Senior", "pos": ["RB", "DB"], "primary": "RB", "ht": None, "wt": None},
    {"num": 4, "name": "Cooper Allen", "gr": "Sr.", "class": "2026", "grade": "Senior", "pos": ["TE", "DL"], "primary": "TE", "ht": "6-3", "wt": None, "commit": "Merrimack College (Division 1 FCS)"},
    {"num": 5, "name": "Lorenzo Barone", "gr": "Sr.", "class": "2026", "grade": "Senior", "pos": ["WR", "DB"], "primary": "WR", "ht": None, "wt": None},
    {"num": 6, "name": "Joey Gaston", "gr": "Sr.", "class": "2026", "grade": "Senior", "pos": ["QB"], "primary": "QB", "ht": None, "wt": None, "commit": "Gardner-Webb University (Division 1 FCS)"},
    {"num": 8, "name": "Bodee Thibodeau", "gr": "Jr.", "class": "2027", "grade": "Junior", "pos": ["WR", "DB"], "primary": "WR", "ht": None, "wt": None},
    {"num": 9, "name": "Griffin Brennan", "gr": "Jr.", "class": "2027", "grade": "Junior", "pos": ["QB", "LB"], "primary": "QB", "ht": None, "wt": None},
    {"num": 10, "name": "Augie Cassidy", "gr": "So.", "class": "2028", "grade": "Sophomore", "pos": ["RB", "LB"], "primary": "RB", "ht": None, "wt": None},
    {"num": 11, "name": "JT Rulewich", "gr": "So.", "class": "2028", "grade": "Sophomore", "pos": ["WR"], "primary": "WR", "ht": "6-0", "wt": None},
    {"num": 14, "name": "Jonathan Stizza", "gr": "Jr.", "class": "2027", "grade": "Junior", "pos": ["WR", "DB"], "primary": "WR", "ht": None, "wt": None},
    {"num": 15, "name": "Freddy Melton", "gr": "Sr.", "class": "2026", "grade": "Senior", "pos": ["QB"], "primary": "QB", "ht": None, "wt": None},
    {"num": 16, "name": "Griffin Suthammanont", "gr": "Jr.", "class": "2027", "grade": "Junior", "pos": ["WR", "DB"], "primary": "WR", "ht": None, "wt": None},
    {"num": 18, "name": "Aarav Kumar", "gr": "Sr.", "class": "2026", "grade": "Senior", "pos": ["WR", "DB"], "primary": "WR", "ht": None, "wt": None},
    {"num": 19, "name": "Gennaro Sirrota", "gr": "Fr.", "class": "2029", "grade": "Freshman", "pos": ["WR", "DB"], "primary": "WR", "ht": None, "wt": None},
    {"num": 20, "name": "Bryce Layade", "gr": "So.", "class": "2028", "grade": "Sophomore", "pos": ["RB", "LB"], "primary": "RB", "ht": None, "wt": None},
    {"num": 21, "name": "Xzavier Torres", "gr": "Fr.", "class": "2029", "grade": "Freshman", "pos": ["WR", "LB"], "primary": "WR", "ht": None, "wt": None},
    {"num": 22, "name": "Benjamin Perkins", "gr": "So.", "class": "2028", "grade": "Sophomore", "pos": ["WR", "DB"], "primary": "WR", "ht": None, "wt": None},
    {"num": 26, "name": "Ethan DeChant", "gr": "So.", "class": "2028", "grade": "Sophomore", "pos": ["WR", "DB"], "primary": "WR", "ht": None, "wt": None},
    {"num": 30, "name": "Caleb Feinberg", "gr": "Jr.", "class": "2027", "grade": "Junior", "pos": ["K", "P"], "primary": "K", "ht": None, "wt": None},
    {"num": 32, "name": "Ahaan Agrawal", "gr": "Fr.", "class": "2029", "grade": "Freshman", "pos": ["WR", "DB"], "primary": "WR", "ht": None, "wt": None},
    {"num": 33, "name": "Aaron Motley", "gr": "Fr.", "class": "2029", "grade": "Freshman", "pos": ["RB", "DB"], "primary": "RB", "ht": None, "wt": None},
    {"num": 34, "name": "David Adesola", "gr": "Fr.", "class": "2029", "grade": "Freshman", "pos": ["RB", "LB"], "primary": "RB", "ht": None, "wt": None},
    {"num": 36, "name": "Caden Daniel", "gr": "Fr.", "class": "2029", "grade": "Freshman", "pos": ["WR", "DL"], "primary": "WR", "ht": None, "wt": None},
    {"num": 40, "name": "Ari Feinberg", "gr": "So.", "class": "2028", "grade": "Sophomore", "pos": ["OL", "LB"], "primary": "OL", "ht": None, "wt": None},
    {"num": 42, "name": "Maverick Mullervy", "gr": "Fr.", "class": "2029", "grade": "Freshman", "pos": ["TE", "LB"], "primary": "TE", "ht": None, "wt": None},
    {"num": 45, "name": "Finn Pedersen", "gr": "Jr.", "class": "2027", "grade": "Junior", "pos": ["TE", "DL"], "primary": "TE", "ht": None, "wt": None},
    {"num": 48, "name": "Jordan Bennet", "gr": "Fr.", "class": "2029", "grade": "Freshman", "pos": ["RB", "LB"], "primary": "RB", "ht": None, "wt": None},
    {"num": 54, "name": "Rocco Annunziata", "gr": "Fr.", "class": "2029", "grade": "Freshman", "pos": ["OL", "DL"], "primary": "OL", "ht": None, "wt": None},
    {"num": 56, "name": "Nathan Adler", "gr": "Fr.", "class": "2029", "grade": "Freshman", "pos": ["OL", "DL"], "primary": "OL", "ht": None, "wt": None},
    {"num": 57, "name": "Colby Hartpence", "gr": "Fr.", "class": "2029", "grade": "Freshman", "pos": ["OL", "DL"], "primary": "OL", "ht": None, "wt": None},
    {"num": 60, "name": "Adem Amar", "gr": "Jr.", "class": "2027", "grade": "Junior", "pos": ["OL", "DL"], "primary": "OL", "ht": None, "wt": None},
    {"num": 63, "name": "Julian Sandy", "gr": "Jr.", "class": "2027", "grade": "Junior", "pos": ["OL", "DL"], "primary": "OL", "ht": None, "wt": None},
    {"num": 68, "name": "Hawthorne Hughes-Pearsall", "gr": "Fr.", "class": "2029", "grade": "Freshman", "pos": ["OL", "DL"], "primary": "OL", "ht": None, "wt": None},
    {"num": 70, "name": "Reed Oliver", "gr": "Sr.", "class": "2026", "grade": "Senior", "pos": ["OL", "DL"], "primary": "DL", "ht": None, "wt": None, "commit": "Marist College (Division 1 FCS)"},
    {"num": 72, "name": "Christian Velardi", "gr": "Sr.", "class": "2026", "grade": "Senior", "pos": ["OL"], "primary": "OL", "ht": None, "wt": None, "commit": "Fordham University (Division 1 FCS)"},
    {"num": 76, "name": "Rj Francois", "gr": "Fr.", "class": "2029", "grade": "Freshman", "pos": ["OL", "DL"], "primary": "OL", "ht": None, "wt": None},
    {"num": 77, "name": "Mason Kish", "gr": "So.", "class": "2028", "grade": "Sophomore", "pos": ["OL", "DL"], "primary": "DL", "ht": None, "wt": None},
    {"num": 80, "name": "Om Balchandani", "gr": "Fr.", "class": "2029", "grade": "Freshman", "pos": ["WR", "DL"], "primary": "WR", "ht": None, "wt": None}
]

lines = [
    "// ============================================================================",
    "// GridironIQ — 2025–2026 Peddie School Falcons Official Varsity Roster",
    "// Grounded on Official NJ.com High School Sports PDF & Athletic Records",
    "// Head Coach: Mark Fabish | Assistant Coaches: Ethan Kibrick, Deyvon Brooks, Chris Gonzalez",
    "// ============================================================================",
    "",
    "import { PlayerProfile } from '@/types/football';",
    "",
    "export const PEDDIE_PLAYERS: PlayerProfile[] = ["
]

for p in OFFICIAL_ROSTER:
    pid = f"peddie-p{p['num']}-{p['name'].lower().split()[-1]}"
    pos_list = json.dumps(p['pos'])
    ht_str = f"'{p['ht']}'" if p['ht'] else "undefined"
    commit_str = f"'{p['commit']}'" if "commit" in p else "undefined"
    status_str = "'COMMITTED'" if "commit" in p else "'SCOUTED'"
    
    recruitment_block = f"""    recruitment: {{
      rating: 'DEVELOPING',
      status: {status_str},
      interestedColleges: [],
      offers: [],
      committedCollege: {commit_str},
    }},"""

    lines.append(f"""  // --------------------------------------------------------------------------
  // #{p['num']} {p['name']} — {p['primary']} ({p['grade']}, Class of {p['class']})
  // --------------------------------------------------------------------------
  {{
    id: '{pid}',
    name: '{p['name']}',
    jerseyNumber: {p['num']},
    positions: {pos_list},
    primaryPosition: '{p['primary']}',
    classYear: '{p['class']}',
    gradeLevel: '{p['grade']}',
    height: {ht_str},
    highSchool: 'The Peddie School',
    strengths: [
      'Official 2025–2026 Peddie Falcons varsity roster member verified on NJ.com',
      'Coached by Head Coach Mark Fabish and assistants Ethan Kibrick, Deyvon Brooks, and Chris Gonzalez'
    ],
    weaknesses: [
      'Continuing varsity technical development'
    ],
    scoutingSummary: '2025–2026 Peddie School varsity football athlete ({p["grade"]}). Listed as #{p["num"]} playing {", ".join(p["pos"])}.',
{recruitment_block}
    keyFilmPlays: [],
  }},""")

lines.append("""];

// ============================================================================
// Helper Queries
// ============================================================================

export function getPlayerById(id: string): PlayerProfile | undefined {
  return PEDDIE_PLAYERS.find(p => p.id === id);
}

export function getPlayerByJerseyNumber(jerseyNumber: number): PlayerProfile | undefined {
  return PEDDIE_PLAYERS.find(p => p.jerseyNumber === jerseyNumber);
}

export function getPlayersByClass(classYear: string): PlayerProfile[] {
  return PEDDIE_PLAYERS.filter(p => p.classYear === classYear);
}

export function getPlayersByPosition(position: string): PlayerProfile[] {
  return PEDDIE_PLAYERS.filter(p => p.positions.includes(position) || p.primaryPosition === position);
}

export function searchPlayers(query: string): PlayerProfile[] {
  const q = query.toLowerCase().trim();
  if (!q) return PEDDIE_PLAYERS;
  return PEDDIE_PLAYERS.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.jerseyNumber.toString().includes(q) ||
    p.primaryPosition.toLowerCase().includes(q) ||
    p.classYear.includes(q) ||
    p.gradeLevel.toLowerCase().includes(q)
  );
}
""")

content = "\n".join(lines)

with open(r"d:\MyProfile\Desktop\gridiron-iq\src\lib\peddie-player-data.ts", "w", encoding="utf-8") as f:
    f.write(content)

print(f"Generated peddie-player-data.ts with {len(OFFICIAL_ROSTER)} verified athletes.")
