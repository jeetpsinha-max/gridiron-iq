import re
import json

mock_game_data_path = r"d:\MyProfile\Desktop\gridiron-iq\src\lib\mock-game-data.ts"
peddie_player_data_path = r"d:\MyProfile\Desktop\gridiron-iq\src\lib\peddie-player-data.ts"

with open(mock_game_data_path, "r", encoding="utf-8") as f:
    text = f.read()

# Let's split plays by "id: 'p-"
raw_plays = text.split("id: 'p-")[1:]
print(f"Found {len(raw_plays)} raw play blocks")

games_map = {
    'peddie-immaculata-2025': {'title': 'Peddie vs Immaculata', 'date': '2025-09-05', 'score': 'L 45-33'},
    'peddie-wscp-2025': {'title': 'Peddie vs Wyoming Seminary', 'date': '2025-09-13', 'score': 'L 29-13'},
    'peddie-kiski-2025': {'title': 'Peddie vs The Kiski School', 'date': '2025-09-20', 'score': 'L 27-13'},
    'peddie-germantown-2025': {'title': 'Peddie at Germantown Academy', 'date': '2025-09-27', 'score': 'L 19-14'},
    'peddie-lawrenceville-2025': {'title': 'Peddie at Lawrenceville', 'date': '2025-10-04', 'score': 'L 50-6'},
    'peddie-hillschool-2025': {'title': 'Peddie vs The Hill School', 'date': '2025-10-11', 'score': 'W 40-20'},
    'peddie-pennington-2025': {'title': 'Peddie vs The Pennington School', 'date': '2025-10-25', 'score': 'L 36-6'},
    'peddie-stlukes-2025': {'title': "Peddie at St. Luke's School", 'date': '2025-11-01', 'score': 'W 53-21'},
    'peddie-blair-2025': {'title': 'Peddie at Blair Academy', 'date': '2025-11-08', 'score': 'L 42-18'},
}

def get_field(block, name, is_num=False, is_bool=False):
    pattern = rf"{name}:\s*['\"]?([^'\",\n\r\}]+)['\"]?"
    m = re.search(pattern, block)
    if not m:
        return 0 if is_num else (False if is_bool else "")
    val = m.group(1).strip()
    if is_num:
        try:
            return float(val) if '.' in val else int(val)
        except:
            return 0
    if is_bool:
        return val.lower() == 'true'
    return val

plays = []
for p_text in raw_plays:
    block = "id: 'p-" + p_text
    play_id = "p-" + p_text.split("'", 1)[0]
    game_id = get_field(block, "gameId")
    play_num = get_field(block, "playNumber", is_num=True)
    quarter = get_field(block, "quarter", is_num=True)
    game_clock = get_field(block, "gameClock")
    down = get_field(block, "down", is_num=True)
    distance = get_field(block, "distance", is_num=True)
    yard_line = get_field(block, "yardLine", is_num=True)
    unit = get_field(block, "unit") or "OFFENSE"
    target_jersey = get_field(block, "targetPlayerJersey", is_num=True)
    motion_jersey = get_field(block, "motionPlayerJersey", is_num=True)
    def_maker_jersey = get_field(block, "defensivePlayMakerJersey", is_num=True)
    def_maker_name = get_field(block, "defensivePlayMakerName")
    def_play_type = get_field(block, "defensivePlayType")
    yards_gained = get_field(block, "yardsGained", is_num=True)
    epa = get_field(block, "epa", is_num=True)
    is_td = get_field(block, "isTouchdown", is_bool=True)
    is_fd = get_field(block, "isFirstDown", is_bool=True)
    success = get_field(block, "successRate", is_bool=True)
    desc_match = re.search(r"playDescription:\s*['\"]([^'\"]+)['\"]", block)
    desc = desc_match.group(1) if desc_match else ""
    
    plays.append({
        'id': play_id,
        'gameId': game_id,
        'playNumber': play_num,
        'quarter': quarter,
        'gameClock': game_clock,
        'down': down,
        'distance': distance,
        'yardLine': yard_line,
        'unit': unit,
        'targetPlayerJersey': int(target_jersey) if target_jersey else None,
        'motionPlayerJersey': int(motion_jersey) if motion_jersey else None,
        'defensivePlayMakerJersey': int(def_maker_jersey) if def_maker_jersey else None,
        'defensivePlayMakerName': def_maker_name,
        'defensivePlayType': def_play_type,
        'yardsGained': yards_gained,
        'epa': float(epa),
        'isTouchdown': is_td,
        'isFirstDown': is_fd,
        'successRate': success,
        'playDescription': desc
    })

print(f"Successfully parsed {len(plays)} plays with full attributes!")

# Load current peddie-player-data.ts to preserve original roster data
with open(peddie_player_data_path, "r", encoding="utf-8") as f:
    orig_roster_text = f.read()

# Let's read all 38 player profiles
from peddie_roster_list import ROSTER_DATA

