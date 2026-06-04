export const initialPlayoffMatches = [
  // OCTAVOS DE FINAL
  { id: 49, round: 'octavos', name: 'OF1', homePlaceholder: '1° Grupo A', awayPlaceholder: '2° Grupo B', home: null, away: null, homeScore: null, awayScore: null, homePenalties: null, awayPenalties: null, scorers: [], assists: [], date: '2026-07-05T15:00:00Z' },
  { id: 50, round: 'octavos', name: 'OF2', homePlaceholder: '1° Grupo C', awayPlaceholder: '2° Grupo D', home: null, away: null, homeScore: null, awayScore: null, homePenalties: null, awayPenalties: null, scorers: [], assists: [], date: '2026-07-05T19:00:00Z' },
  { id: 51, round: 'octavos', name: 'OF3', homePlaceholder: '1° Grupo D', awayPlaceholder: '2° Grupo C', home: null, away: null, homeScore: null, awayScore: null, homePenalties: null, awayPenalties: null, scorers: [], assists: [], date: '2026-07-06T15:00:00Z' },
  { id: 52, round: 'octavos', name: 'OF4', homePlaceholder: '1° Grupo B', awayPlaceholder: '2° Grupo A', home: null, away: null, homeScore: null, awayScore: null, homePenalties: null, awayPenalties: null, scorers: [], assists: [], date: '2026-07-06T19:00:00Z' },
  { id: 53, round: 'octavos', name: 'OF5', homePlaceholder: '1° Grupo E', awayPlaceholder: '2° Grupo F', home: null, away: null, homeScore: null, awayScore: null, homePenalties: null, awayPenalties: null, scorers: [], assists: [], date: '2026-07-07T15:00:00Z' },
  { id: 54, round: 'octavos', name: 'OF6', homePlaceholder: '1° Grupo G', awayPlaceholder: '2° Grupo H', home: null, away: null, homeScore: null, awayScore: null, homePenalties: null, awayPenalties: null, scorers: [], assists: [], date: '2026-07-07T19:00:00Z' },
  { id: 55, round: 'octavos', name: 'OF7', homePlaceholder: '1° Grupo F', awayPlaceholder: '2° Grupo E', home: null, away: null, homeScore: null, awayScore: null, homePenalties: null, awayPenalties: null, scorers: [], assists: [], date: '2026-07-08T15:00:00Z' },
  { id: 56, round: 'octavos', name: 'OF8', homePlaceholder: '1° Grupo H', awayPlaceholder: '2° Grupo G', home: null, away: null, homeScore: null, awayScore: null, homePenalties: null, awayPenalties: null, scorers: [], assists: [], date: '2026-07-08T19:00:00Z' },

  // CUARTOS DE FINAL
  { id: 57, round: 'cuartos', name: 'CF1', homePlaceholder: 'Ganador OF1', awayPlaceholder: 'Ganador OF2', home: null, away: null, homeScore: null, awayScore: null, homePenalties: null, awayPenalties: null, scorers: [], assists: [], date: '2026-07-10T15:00:00Z' },
  { id: 58, round: 'cuartos', name: 'CF2', homePlaceholder: 'Ganador OF5', awayPlaceholder: 'Ganador OF6', home: null, away: null, homeScore: null, awayScore: null, homePenalties: null, awayPenalties: null, scorers: [], assists: [], date: '2026-07-10T19:00:00Z' },
  { id: 59, round: 'cuartos', name: 'CF3', homePlaceholder: 'Ganador OF3', awayPlaceholder: 'Ganador OF4', home: null, away: null, homeScore: null, awayScore: null, homePenalties: null, awayPenalties: null, scorers: [], assists: [], date: '2026-07-11T15:00:00Z' },
  { id: 60, round: 'cuartos', name: 'CF4', homePlaceholder: 'Ganador OF7', awayPlaceholder: 'Ganador OF8', home: null, away: null, homeScore: null, awayScore: null, homePenalties: null, awayPenalties: null, scorers: [], assists: [], date: '2026-07-11T19:00:00Z' },

  // SEMIFINALES
  { id: 61, round: 'semifinales', name: 'SF1', homePlaceholder: 'Ganador CF1', awayPlaceholder: 'Ganador CF2', home: null, away: null, homeScore: null, awayScore: null, homePenalties: null, awayPenalties: null, scorers: [], assists: [], date: '2026-07-14T19:00:00Z' },
  { id: 62, round: 'semifinales', name: 'SF2', homePlaceholder: 'Ganador CF3', awayPlaceholder: 'Ganador CF4', home: null, away: null, homeScore: null, awayScore: null, homePenalties: null, awayPenalties: null, scorers: [], assists: [], date: '2026-07-15T19:00:00Z' },

  // TERCER PUESTO
  { id: 63, round: 'tercer-puesto', name: '3P', homePlaceholder: 'Perdedor SF1', awayPlaceholder: 'Perdedor SF2', home: null, away: null, homeScore: null, awayScore: null, homePenalties: null, awayPenalties: null, scorers: [], assists: [], date: '2026-07-18T15:00:00Z' },

  // FINAL
  { id: 64, round: 'final', name: 'F', homePlaceholder: 'Ganador SF1', awayPlaceholder: 'Ganador SF2', home: null, away: null, homeScore: null, awayScore: null, homePenalties: null, awayPenalties: null, scorers: [], assists: [], date: '2026-07-19T15:00:00Z' }
];

/**
 * Obtiene el ganador de un partido de playoffs (o null si no se jugó).
 */
export function getMatchWinner(match) {
  if (match.homeScore === null || match.awayScore === null) return null;
  if (Number(match.homeScore) > Number(match.awayScore)) return match.home;
  if (Number(match.homeScore) < Number(match.awayScore)) return match.away;
  
  // Si empatan, se define por penales
  if (match.homePenalties !== null && match.awayPenalties !== null) {
    return Number(match.homePenalties) > Number(match.awayPenalties) ? match.home : match.away;
  }
  return null;
}

/**
 * Obtiene el perdedor de un partido de playoffs (o null si no se jugó).
 */
export function getMatchLoser(match) {
  if (match.homeScore === null || match.awayScore === null) return null;
  if (Number(match.homeScore) > Number(match.awayScore)) return match.away;
  if (Number(match.homeScore) < Number(match.awayScore)) return match.home;
  
  if (match.homePenalties !== null && match.awayPenalties !== null) {
    return Number(match.homePenalties) > Number(match.awayPenalties) ? match.away : match.home;
  }
  return null;
}

/**
 * Propaga los equipos en el bracket de playoffs basándose en la fase de grupos y los resultados de playoffs anteriores.
 * Si un equipo cambia, se limpian los marcadores del partido afectado y sus subsecuentes.
 */
export function propagateBracket(playoffMatches, groupTables, groupMatches) {
  const matchMap = {};
  playoffMatches.forEach(m => {
    matchMap[m.id] = m;
  });

  const getTeamFromGroup = (groupId, position) => {
    // Verificar si el grupo tiene sus 6 partidos jugados
    const playedInGroup = groupMatches.filter(
      m => m.group === groupId && m.homeScore !== undefined && m.homeScore !== null
    ).length;
    
    if (playedInGroup < 6) return null; // Grupo no terminado aún
    
    const table = groupTables[groupId];
    return table && table[position] ? table[position].id : null;
  };

  const updateMatchTeams = (matchId, homeTeam, awayTeam) => {
    const m = matchMap[matchId];
    if (!m) return;
    
    let changed = false;
    if (m.home !== homeTeam) {
      m.home = homeTeam;
      changed = true;
    }
    if (m.away !== awayTeam) {
      m.away = awayTeam;
      changed = true;
    }

    if (changed) {
      // Limpiar resultado si cambiaron los equipos del partido
      m.homeScore = null;
      m.awayScore = null;
      m.homePenalties = null;
      m.awayPenalties = null;
      m.scorers = [];
      m.assists = [];
    }
  };

  // 1. Octavos de Final (49 a 56)
  updateMatchTeams(49, getTeamFromGroup('A', 0), getTeamFromGroup('B', 1)); // 1A vs 2B
  updateMatchTeams(50, getTeamFromGroup('C', 0), getTeamFromGroup('D', 1)); // 1C vs 2D
  updateMatchTeams(51, getTeamFromGroup('D', 0), getTeamFromGroup('C', 1)); // 1D vs 2C
  updateMatchTeams(52, getTeamFromGroup('B', 0), getTeamFromGroup('A', 1)); // 1B vs 2A
  updateMatchTeams(53, getTeamFromGroup('E', 0), getTeamFromGroup('F', 1)); // 1E vs 2F
  updateMatchTeams(54, getTeamFromGroup('G', 0), getTeamFromGroup('H', 1)); // 1G vs 2H
  updateMatchTeams(55, getTeamFromGroup('F', 0), getTeamFromGroup('E', 1)); // 1F vs 2E
  updateMatchTeams(56, getTeamFromGroup('H', 0), getTeamFromGroup('G', 1)); // 1H vs 2G

  // 2. Cuartos de Final (57 a 60)
  updateMatchTeams(57, getMatchWinner(matchMap[49]), getMatchWinner(matchMap[50])); // G49 vs G50
  updateMatchTeams(58, getMatchWinner(matchMap[53]), getMatchWinner(matchMap[54])); // G53 vs G54
  updateMatchTeams(59, getMatchWinner(matchMap[51]), getMatchWinner(matchMap[52])); // G51 vs G52
  updateMatchTeams(60, getMatchWinner(matchMap[55]), getMatchWinner(matchMap[56])); // G55 vs G56

  // 3. Semifinales (61 y 62)
  updateMatchTeams(61, getMatchWinner(matchMap[57]), getMatchWinner(matchMap[58])); // G57 vs G58
  updateMatchTeams(62, getMatchWinner(matchMap[59]), getMatchWinner(matchMap[60])); // G59 vs G60

  // 4. Tercer Puesto (63) y Final (64)
  updateMatchTeams(63, getMatchLoser(matchMap[61]), getMatchLoser(matchMap[62])); // P61 vs P62
  updateMatchTeams(64, getMatchWinner(matchMap[61]), getMatchWinner(matchMap[62])); // G61 vs G62
}
