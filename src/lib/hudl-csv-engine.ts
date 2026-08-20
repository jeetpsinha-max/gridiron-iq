// ============================================================================
// Peddie Football Analytics — Bi-Directional Hudl CSV Engine
// Ingests raw Hudl CSVs & exports enriched telemetry with EPA & spatial columns
// ============================================================================

import { HudlInputRow, HudlExportRow, PlayAnalysisData } from './data-schemas';

export class HudlCsvEngine {
  /**
   * Parses standard Hudl CSV text into structured PlayAnalysisData records.
   */
  public parseHudlCsv(csvText: string, gameId: string = 'imported-hudl-game'): PlayAnalysisData[] {
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const plays: PlayAnalysisData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle quoted commas
      const values = this.parseCsvLine(line);
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || '';
      });

      const odk = (row['ODK'] || 'O').toUpperCase();
      const unit = odk === 'D' ? 'DEFENSE' : odk === 'K' ? 'SPECIAL_TEAMS' : 'OFFENSE';
      const down = parseInt(row['DN'] || '1', 10) || 1;
      const distance = parseInt(row['DIST'] || '10', 10) || 10;
      const yardLine = parseInt(row['YARD LN'] || '35', 10) || 35;
      const gainLoss = parseFloat(row['GN_LS'] || row['RESULT'] || '4') || 4;
      const isSuccess = (down === 1 && gainLoss >= distance * 0.5) ||
                        (down === 2 && gainLoss >= distance * 0.7) ||
                        (down >= 3 && gainLoss >= distance);

      const calculatedEpa = isSuccess ? Number((0.45 + (gainLoss * 0.08)).toFixed(2)) : Number((-0.35 + (gainLoss * 0.05)).toFixed(2));

      plays.push({
        id: `hudl-play-${i}-${Date.now()}`,
        gameId,
        playNumber: i,
        quarter: (parseInt(row['QTR'] || '1', 10) as any) || 1,
        gameClock: row['TIME'] || '12:00',
        videoTimestampStart: (i - 1) * 30,
        videoTimestampSnap: (i - 1) * 30 + 5,
        videoTimestampEnd: (i - 1) * 30 + 15,
        down: (down >= 1 && down <= 4 ? down : 1) as any,
        distance,
        yardLine,
        hash: (row['HASH'] || 'MIDDLE').toUpperCase() as any,
        unit,
        possession: unit === 'DEFENSE' ? 'OPPONENT' : 'PEDDIE',
        offensiveFormation: row['OFF FORM'] || 'Shotgun Spread',
        offensivePersonnel: '11',
        motionType: (row['MOTION'] || 'NONE').toUpperCase() as any,
        defensiveFront: row['DEF FRONT'] || '4-3 Over',
        defensivePackage: '4-3',
        coverageScheme: (row['COVERAGE'] || 'COVER_3').toUpperCase() as any,
        playType: (row['PLAY TYPE'] || (gainLoss > 12 ? 'PASS' : 'RUN')).toUpperCase() as any,
        playActionFake: false,
        yardsGained: gainLoss,
        epa: calculatedEpa,
        successRate: isSuccess,
        isFirstDown: gainLoss >= distance,
        isTouchdown: gainLoss >= yardLine,
        isTurnover: row['RESULT']?.toLowerCase().includes('int') || row['RESULT']?.toLowerCase().includes('fum') || false,
        isPenalty: false,
        playDescription: `Play #${i}: ${row['OFF FORM'] || 'Formation'} ${row['PLAY TYPE'] || 'Play'} for ${gainLoss} yards against ${row['COVERAGE'] || 'Cover 3'}.`,
        telestrationStrokes: [],
        assignmentLogs: [],
        spatialMetrics: {
          snapToPressureTimeSec: unit === 'DEFENSE' ? 2.1 : 3.1,
          pocketIntegrity: 'CLEAN',
          separationVectors: [],
        },
      });
    }

    return plays;
  }

  /**
   * Exports PlayAnalysis records back to enriched Hudl CSV string with custom EPA/Pressure columns.
   */
  public exportEnrichedHudlCsv(plays: PlayAnalysisData[]): string {
    const headers = [
      'PLAY_NUM',
      'ODK',
      'QTR',
      'TIME',
      'DN',
      'DIST',
      'YARD_LN',
      'HASH',
      'OFF_FORM',
      'DEF_FRONT',
      'COVERAGE',
      'PLAY_TYPE',
      'GN_LS',
      'RESULT',
      'EPA',
      'SUCCESS_RATE',
      'TIME_TO_PRESSURE_SEC',
      'SEPARATION_YDS',
      'PRIMARY_TARGET',
      'DEF_PLAYMAKER'
    ];

    const rows = plays.map(p => {
      const row: HudlExportRow = {
        PLAY_NUM: p.playNumber,
        ODK: p.unit === 'DEFENSE' ? 'D' : p.unit === 'SPECIAL_TEAMS' ? 'K' : 'O',
        QTR: p.quarter,
        TIME: p.gameClock,
        DN: p.down,
        DIST: p.distance,
        YARD_LN: p.yardLine,
        HASH: p.hash,
        OFF_FORM: p.offensiveFormation,
        DEF_FRONT: p.defensiveFront,
        COVERAGE: p.coverageScheme,
        PLAY_TYPE: p.playType,
        GN_LS: p.yardsGained,
        RESULT: p.isTouchdown ? 'TOUCHDOWN' : p.isTurnover ? 'TURNOVER' : p.isFirstDown ? '1ST DOWN' : 'TACKLE',
        EPA: Number(p.epa.toFixed(2)),
        SUCCESS_RATE: p.successRate ? '1' : '0',
        TIME_TO_PRESSURE_SEC: p.spatialMetrics?.snapToPressureTimeSec ?? 2.8,
        SEPARATION_YDS: p.isTouchdown ? 4.8 : p.successRate ? 2.8 : 1.1,
        PRIMARY_TARGET: p.targetPlayerJersey ? `#${p.targetPlayerJersey}` : 'N/A',
        DEF_PLAYMAKER: p.defensivePlayMakerJersey ? `#${p.defensivePlayMakerJersey} ${p.defensivePlayMakerName || ''}` : 'N/A',
      };

      return [
        row.PLAY_NUM,
        row.ODK,
        row.QTR,
        row.TIME,
        row.DN,
        row.DIST,
        row.YARD_LN,
        row.HASH,
        `"${row.OFF_FORM}"`,
        `"${row.DEF_FRONT}"`,
        `"${row.COVERAGE}"`,
        row.PLAY_TYPE,
        row.GN_LS,
        row.RESULT,
        row.EPA,
        row.SUCCESS_RATE,
        row.TIME_TO_PRESSURE_SEC,
        row.SEPARATION_YDS,
        `"${row.PRIMARY_TARGET}"`,
        `"${row.DEF_PLAYMAKER}"`,
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  }
}

export const hudlCsvEngine = new HudlCsvEngine();
