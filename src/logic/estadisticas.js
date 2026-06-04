/**
 * Calcula el ranking de goleadores del torneo a partir de todos los partidos.
 * Retorna un arreglo ordenado descendientemente por cantidad de goles.
 */
export function calculateTopScorers(groupMatches, playoffMatches) {
  const scorerMap = {};

  const addGoals = (scorersList) => {
    if (!scorersList) return;
    scorersList.forEach(s => {
      if (!s || !s.player) return;
      const playerTrimmed = s.player.trim();
      if (!playerTrimmed) return;
      
      const key = `${playerTrimmed}_${s.team}`;
      if (!scorerMap[key]) {
        scorerMap[key] = { player: playerTrimmed, team: s.team, count: 0 };
      }
      scorerMap[key].count += 1;
    });
  };

  // Procesar fase de grupos y eliminatorias
  groupMatches.forEach(m => {
    if (m.homeScore !== null && m.homeScore !== undefined) {
      addGoals(m.scorers);
    }
  });
  
  playoffMatches.forEach(m => {
    if (m.homeScore !== null && m.homeScore !== undefined) {
      addGoals(m.scorers);
    }
  });

  return Object.values(scorerMap).sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }
    return a.player.localeCompare(b.player);
  });
}

/**
 * Calcula el ranking de asistidores del torneo a partir de todos los partidos.
 * Retorna un arreglo ordenado descendientemente por cantidad de asistencias.
 */
export function calculateTopAssists(groupMatches, playoffMatches) {
  const assistMap = {};

  const addAssists = (assistsList) => {
    if (!assistsList) return;
    assistsList.forEach(a => {
      if (!a || !a.player) return;
      const playerTrimmed = a.player.trim();
      if (!playerTrimmed) return;
      
      const key = `${playerTrimmed}_${a.team}`;
      if (!assistMap[key]) {
        assistMap[key] = { player: playerTrimmed, team: a.team, count: 0 };
      }
      assistMap[key].count += 1;
    });
  };

  // Procesar fase de grupos y eliminatorias
  groupMatches.forEach(m => {
    if (m.homeScore !== null && m.homeScore !== undefined) {
      addAssists(m.assists);
    }
  });
  
  playoffMatches.forEach(m => {
    if (m.homeScore !== null && m.homeScore !== undefined) {
      addAssists(m.assists);
    }
  });

  return Object.values(assistMap).sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }
    return a.player.localeCompare(b.player);
  });
}
