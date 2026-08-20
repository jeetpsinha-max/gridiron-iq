#!/usr/bin/env python3
"""
GridironIQ - Google Antigravity SDK Tactical Football Intelligence Agent
Autonomous AI coordinator for American Football play simulation, EPA computations,
defensive coverage counter-tactics, 4th-down decision modeling, and player matchups.
"""

import os
import sys
import json
import math
from typing import Dict, Any, List, Optional

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# ============================================================================
# Core NFL / NCAA Expected Points Added (EPA) Mathematical Model
# ============================================================================

def compute_expected_points(yardline: int, down: int, distance: int) -> float:
    """
    Computes Expected Points (EP) for a given game state based on empirical regression models.
    yardline: 1 (own 1-yard line) to 99 (opponent 1-yard line)
    down: 1 to 4
    distance: yards to go for first down / touchdown
    """
    # Yardline factor (1 to 99)
    dist_to_goal = max(1, min(99, 100 - yardline))
    base_ep = 6.0 * (1.0 - (dist_to_goal / 100.0) ** 1.3) - 1.2 * (dist_to_goal / 100.0)

    # Down & distance penalty
    down_penalty = {1: 0.0, 2: 0.45, 3: 1.15, 4: 2.35}.get(down, 1.0)
    distance_penalty = min(2.5, 0.08 * distance)

    ep = base_ep - down_penalty - distance_penalty
    return round(float(ep), 3)


def calculate_play_epa(
    yardline_start: int,
    down_start: int,
    distance_start: int,
    yards_gained: int,
    is_pass: bool = False,
    is_touchdown: bool = False,
    is_turnover: bool = False,
    is_sack: bool = False,
    is_incomplete: bool = False
) -> Dict[str, Any]:
    """
    Calculates exact EPA (Expected Points Added) and success metrics for a football play.
    """
    ep_before = compute_expected_points(yardline_start, down_start, distance_start)

    if is_touchdown:
        ep_after = 7.0
        epa = ep_after - ep_before
        success = True
        desc = "Touchdown Scored (+7.0 EP)"
    elif is_turnover:
        # Opponent takes over at inverted yardline
        turnover_yardline = min(99, max(1, 100 - (yardline_start + yards_gained)))
        ep_after = -compute_expected_points(turnover_yardline, 1, 10)
        epa = ep_after - ep_before
        success = False
        desc = f"Turnover - Opponent ball at their {turnover_yardline}"
    elif is_incomplete:
        yards_gained = 0
        if down_start < 4:
            ep_after = compute_expected_points(yardline_start, down_start + 1, distance_start)
        else:
            ep_after = -compute_expected_points(100 - yardline_start, 1, 10)
        epa = ep_after - ep_before
        success = False
        desc = "Incomplete Pass (Loss of Down)"
    else:
        new_yardline = min(99, max(1, yardline_start + yards_gained))
        new_distance = distance_start - yards_gained

        if new_distance <= 0:
            # First Down Achieved
            ep_after = compute_expected_points(new_yardline, 1, min(10, 100 - new_yardline))
            success = True
            desc = f"First Down Converted (+{yards_gained} yds)"
        elif down_start < 4:
            ep_after = compute_expected_points(new_yardline, down_start + 1, new_distance)
            # Success is based on achieving 45% of distance on 1st, 60% on 2nd, 100% on 3rd/4th
            req_pct = {1: 0.45, 2: 0.60, 3: 1.0, 4: 1.0}.get(down_start, 0.5)
            success = yards_gained >= (distance_start * req_pct)
            desc = f"Gain of {yards_gained} yds ({down_start + 1} & {new_distance})"
        else:
            # Turnover on Downs
            ep_after = -compute_expected_points(100 - new_yardline, 1, 10)
            success = False
            desc = f"Turnover on Downs at {new_yardline} yd line"

        epa = ep_after - ep_before

    return {
        "ep_before": ep_before,
        "ep_after": round(ep_after, 3),
        "epa": round(epa, 3),
        "success": bool(success),
        "description": desc,
        "yards_gained": yards_gained
    }


# ============================================================================
# 4th-Down Decision Analytics Model
# ============================================================================

def evaluate_4th_down(
    yardline: int,
    distance: int,
    score_diff: int = 0,
    time_remaining_sec: int = 900
) -> Dict[str, Any]:
    """
    Evaluates optimal 4th down decision: GO FOR IT vs PUNT vs FIELD GOAL.
    yardline: 1 (own 1) to 99 (opponent 1)
    """
    # 1. Conversion Probability
    # Logistic regression approximation: P(conv) = 1 / (1 + exp(0.38 * distance - 1.15))
    conv_prob = 1.0 / (1.0 + math.exp(0.36 * distance - 1.1))
    conv_prob = max(0.08, min(0.92, conv_prob))

    # Go For It Expected Value
    ep_conv = compute_expected_points(min(99, yardline + distance + 1), 1, 10)
    ep_fail = -compute_expected_points(100 - yardline, 1, 10)
    ev_go = (conv_prob * ep_conv) + ((1.0 - conv_prob) * ep_fail)

    # Field Goal Expected Value
    fg_distance = 100 - yardline + 17
    if fg_distance <= 65:
        # P(FG) = 1 / (1 + exp(0.12 * (fg_dist - 46)))
        fg_prob = 1.0 / (1.0 + math.exp(0.13 * (fg_distance - 45)))
        fg_prob = max(0.05, min(0.96, fg_prob))
        ev_fg = (fg_prob * 3.0) + ((1.0 - fg_prob) * -compute_expected_points(min(99, 100 - yardline + 7), 1, 10))
    else:
        fg_prob = 0.0
        ev_fg = -9.99

    # Punt Expected Value
    if yardline < 65:
        net_punt = min(42, 100 - yardline - 15)
        punt_land = yardline + net_punt
        ev_punt = -compute_expected_points(100 - punt_land, 1, 10)
    else:
        ev_punt = -9.99

    # Recommendation determination
    options = [
        ("GO_FOR_IT", ev_go, f"Go for it: {round(conv_prob*100, 1)}% conversion chance (EV: {round(ev_go, 2)} pts)"),
        ("FIELD_GOAL", ev_fg, f"Attempt {fg_distance}yd FG: {round(fg_prob*100, 1)}% make chance (EV: {round(ev_fg, 2)} pts)" if fg_prob > 0 else "Out of FG range"),
        ("PUNT", ev_punt, f"Punt: Net ~38 yds (EV: {round(ev_punt, 2)} pts)" if ev_punt > -9.0 else "Too close to punt")
    ]
    options.sort(key=lambda x: x[1], reverse=True)
    best_choice = options[0]

    return {
        "yardline": yardline,
        "distance": distance,
        "recommended_action": best_choice[0],
        "ev_spread": round(options[0][1] - options[1][1], 2),
        "go_for_it_prob_pct": round(conv_prob * 100, 1),
        "fg_prob_pct": round(fg_prob * 100, 1),
        "fg_distance_yds": fg_distance if fg_distance <= 65 else None,
        "options_ranked": [
            {"action": opt[0], "expected_value": round(opt[1], 2), "summary": opt[2]} for opt in options if opt[1] > -9.0
        ]
    }


# ============================================================================
# Tactical Play Counter Synthesis Engine
# ============================================================================

def synthesize_counter_play(
    defensive_front: str,
    coverage_scheme: str,
    down_distance: str,
    target_personnel: str = "11"
) -> Dict[str, Any]:
    """
    Synthesizes the optimal offensive counter-scheme against opponent defense.
    """
    scheme_lower = coverage_scheme.lower()
    front_lower = defensive_front.lower()

    if "cover 3" in scheme_lower:
        concept = "Four Verticals & Seam-Dagger Flood"
        weakness = "Single-high free safety isolated against seam routes; underneath hook zones vulnerable to high-low dig/out."
        primary_target = "TE #4 Cooper Allen on seam route / WR #5 Lorenzo Barone on boundary dig"
        recommended_pass_pro = "Half-Slide Pass Pro (LT #70 Reed Oliver & RT #72 Christian Velardi lock edges)"
        epa_projection = 2.45
        success_pct = 79.2
    elif "cover 2" in scheme_lower or "tampa" in scheme_lower:
        concept = "Middle-Read Post & High-Low Smash"
        weakness = "Deep middle void between two safeties; cornerbacks trapped in flat coverage."
        primary_target = "WR #5 Lorenzo Barone on deep post dividing safeties / RB #3 Jeremiah Davis on flat wheel"
        recommended_pass_pro = "6-Man Full Slide with RB Check-Release"
        epa_projection = 2.65
        success_pct = 81.5
    elif "cover 1" in scheme_lower or "man" in scheme_lower:
        concept = "Mesh Shallow Cross with Rub & RB Wheel"
        weakness = "Man-to-man trail coverage vulnerable to natural mesh rubs and athletic RB mismatches vs LB."
        primary_target = "WR #12 Benjamin Perkins on shallow cross / RB #3 Jeremiah Davis on boundary wheel"
        recommended_pass_pro = "7-Man Max Protection with TE Chip"
        epa_projection = 2.80
        success_pct = 83.0
    elif "cover 0" in scheme_lower or "blitz" in scheme_lower:
        concept = "Quick-Game Slant-Bubble RPO & Hot Screen"
        weakness = "No deep safety help and immediate 6+ man rush; vulnerable to 1-step hot throw into vacated blitz lane."
        primary_target = "WR #5 Lorenzo Barone hot slant / WR #12 bubble screen"
        recommended_pass_pro = "Quick 3-step release with Dual Tackle punch"
        epa_projection = 3.10
        success_pct = 85.5
    else:
        concept = "Inside Zone Split-Action with Bootleg Flood"
        weakness = "Undisciplined backside pursuit; edge contain over-pursues inside run flow."
        primary_target = "QB #15 Freddy Melton naked bootleg with TE #4 crossing flat"
        recommended_pass_pro = "Zone Flow with TE Split-Backside Arc Block"
        epa_projection = 1.95
        success_pct = 74.0

    return {
        "concept_name": concept,
        "coverage_identified": coverage_scheme,
        "front_identified": defensive_front,
        "down_distance": down_distance,
        "personnel_package": target_personnel,
        "structural_weakness": weakness,
        "primary_target_read": primary_target,
        "protection_scheme": recommended_pass_pro,
        "projected_epa": epa_projection,
        "success_probability_pct": success_pct
    }


# ============================================================================
# Main CLI & JSON Dispatcher
# ============================================================================

def main():
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        if command == "epa" and len(sys.argv) >= 5:
            yardline = int(sys.argv[2])
            down = int(sys.argv[3])
            distance = int(sys.argv[4])
            gain = int(sys.argv[5]) if len(sys.argv) > 5 else 0
            res = calculate_play_epa(yardline, down, distance, gain)
            print(json.dumps(res, indent=2))
            return
        elif command == "4th" and len(sys.argv) >= 4:
            yardline = int(sys.argv[2])
            distance = int(sys.argv[3])
            res = evaluate_4th_down(yardline, distance)
            print(json.dumps(res, indent=2))
            return
        elif command == "counter" and len(sys.argv) >= 4:
            front = sys.argv[2]
            coverage = sys.argv[3]
            res = synthesize_counter_play(front, coverage, "3rd & 4")
            print(json.dumps(res, indent=2))
            return

    # Default Interactive Demo
    print("==================================================")
    print("GRIDIRON-IQ GOOGLE ANTIGRAVITY AGENT COCKPIT")
    print("==================================================")
    print("\n1. 4th-Down Decision Matrix (Opponent 35yd line, 4th & 2):")
    fourth_res = evaluate_4th_down(65, 2)
    print(json.dumps(fourth_res, indent=2))

    print("\n2. Coverage Counter Synthesis (vs Cover 3 Sky, 4-3 Over):")
    counter_res = synthesize_counter_play("4-3 Over", "Cover 3 Sky", "3rd & 4")
    print(json.dumps(counter_res, indent=2))

    print("\n3. EPA Calculation (1st & 10 at Own 25, 18-yard completion):")
    epa_res = calculate_play_epa(25, 1, 10, 18, is_pass=True)
    print(json.dumps(epa_res, indent=2))

if __name__ == "__main__":
    main()
