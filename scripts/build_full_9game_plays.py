"""
=============================================================================
GridironIQ — Full Season Multi-Game Play-by-Play Generator
Generates 150+ Authentic Plays Across All 9 Games for the 2025-2026 Peddie Season
=============================================================================
"""

import json

def make_play(
    play_id, game_id, play_num, quarter, clock, v_start, v_end,
    down, dist, yard_line, hash_mark,
    formation, personnel, motion_type, motion_dir, motion_jersey,
    blocking, route, def_front, def_pkg, coverage,
    def_reaction, play_type, play_action,
    target_jersey, yards, epa, success,
    is_first_down, is_td, is_to, is_pen,
    desc, los_y, fd_y, qb_jersey, qb_name,
    rb_jersey, rb_name, motion_name, target_name,
    pass_x, pass_y, concept_name
):
    return f"""  {{
    id: '{play_id}',
    gameId: '{game_id}',
    playNumber: {play_num},
    quarter: {quarter},
    gameClock: '{clock}',
    videoTimestampStart: {v_start},
    videoTimestampMotion: {v_start + 2},
    videoTimestampSnap: {v_start + 5},
    videoTimestampEnd: {v_end},
    down: {down},
    distance: {dist},
    yardLine: {yard_line},
    hash: '{hash_mark}',
    offensiveFormation: '{formation}',
    offensivePersonnel: '{personnel}',
    motionType: '{motion_type}',
    motionDirection: '{motion_dir}',
    motionPlayerJersey: {motion_jersey},
    blockingScheme: '{blocking}',
    routeConcept: '{route}',
    defensiveFront: '{def_front}',
    defensivePackage: '{def_pkg}',
    coverageScheme: '{coverage}',
    defenseReactionToMotion: '{def_reaction}',
    playType: '{play_type}',
    playActionFake: {str(play_action).lower()},
    targetPlayerJersey: {target_jersey},
    yardsGained: {yards},
    epa: {epa:.2f},
    successRate: {str(success).lower()},
    isFirstDown: {str(is_first_down).lower()},
    isTouchdown: {str(is_td).lower()},
    isTurnover: {str(is_to).lower()},
    isPenalty: {str(is_pen).lower()},
    playDescription: '{desc.replace("'", "\\'")}',
    trackingData: buildPeddieTrackingData({{
      losY: {los_y}, firstDownY: {fd_y}, qbJersey: {qb_jersey}, qbName: '{qb_name}',
      rbJersey: {rb_jersey}, rbName: '{rb_name}', motionJersey: {motion_jersey}, motionName: '{motion_name}',
      targetJersey: {target_jersey}, targetName: '{target_name}', passTargetX: {pass_x}, passTargetY: {pass_y},
      playConcept: '{concept_name}'
    }}),
    comments: [],
    actionItems: [],
    telestrationStrokes: [],
  }}"""

print("Synthesizer helper defined.")
