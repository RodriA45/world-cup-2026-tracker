/**
 * Calcula la tabla de posiciones de un grupo basado en los partidos jugados.
 * 
 * Criterios de desempate (FIFA):
 * 1. Puntos (PTS)
 * 2. Diferencia de goles (DG)
 * 3. Goles a favor (GF)
 * 4. Enfrentamiento directo (Resultado del partido entre ambos)
 * 5. Criterio de desempate alfabético por nombre
 */
export function calculateGroupTable(groupName, teamsList, matchesList) {
  const groupTeams = teamsList.filter(t => t.group === groupName);
  
  // Inicializar filas de la tabla
  const table = groupTeams.map(t => ({
    id: t.id,
    name: t.name,
    flag: t.flag,
    pj: 0,
    pg: 0,
    pe: 0,
    pp: 0,
    gf: 0,
    gc: 0,
    dg: 0,
    pts: 0
  }));
  
  const teamMap = {};
  table.forEach(row => {
    teamMap[row.id] = row;
  });
  
  // Filtrar los partidos jugados de este grupo
  const groupMatches = matchesList.filter(
    m => m.group === groupName && m.homeScore !== undefined && m.homeScore !== null
  );
  
  // Procesar partidos
  groupMatches.forEach(m => {
    const homeRow = teamMap[m.home];
    const awayRow = teamMap[m.away];
    
    if (homeRow && awayRow) {
      const hs = m.homeScore;
      const as = m.awayScore;
      
      homeRow.pj += 1;
      awayRow.pj += 1;
      homeRow.gf += hs;
      homeRow.gc += as;
      awayRow.gf += as;
      awayRow.gc += hs;
      
      if (hs > as) {
        homeRow.pts += 3;
        homeRow.pg += 1;
        awayRow.pp += 1;
      } else if (hs < as) {
        awayRow.pts += 3;
        awayRow.pg += 1;
        homeRow.pp += 1;
      } else {
        homeRow.pts += 1;
        awayRow.pts += 1;
        homeRow.pe += 1;
        awayRow.pe += 1;
      }
    }
  });
  
  // Calcular diferencia de goles
  table.forEach(row => {
    row.dg = row.gf - row.gc;
  });
  
  // Ordenar la tabla según criterios FIFA
  table.sort((a, b) => {
    // 1. Puntos
    if (b.pts !== a.pts) return b.pts - a.pts;
    
    // 2. Diferencia de goles
    if (b.dg !== a.dg) return b.dg - a.dg;
    
    // 3. Goles a favor
    if (b.gf !== a.gf) return b.gf - a.gf;
    
    // 4. Enfrentamiento directo
    const directMatch = groupMatches.find(m => 
      (m.home === a.id && m.away === b.id) || 
      (m.home === b.id && m.away === a.id)
    );
    
    if (directMatch) {
      const isHomeA = directMatch.home === a.id;
      const hs = directMatch.homeScore;
      const as = directMatch.awayScore;
      
      if (hs !== as) {
        if (isHomeA) {
          return hs > as ? -1 : 1; // Si ganó A de local, A va arriba (-1)
        } else {
          return as > hs ? -1 : 1; // Si ganó A de visitante, A va arriba (-1)
        }
      }
    }
    
    // 5. Criterio por defecto: Alfabético
    return a.name.localeCompare(b.name);
  });
  
  return table;
}
