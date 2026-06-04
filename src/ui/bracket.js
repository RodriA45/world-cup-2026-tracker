import { teams } from '../data/equipos.js';
import { getMatchWinner } from '../logic/playoffs.js';

export function renderBracketView(container, playoffMatches, onEditMatch) {
  container.innerHTML = '';

  const bracketWrapper = document.createElement('div');
  bracketWrapper.className = 'bracket-container';

  // Agrupar los partidos por ronda de visualización
  const rounds = {
    octavos: playoffMatches.filter(m => m.round === 'octavos'),
    cuartos: playoffMatches.filter(m => m.round === 'cuartos'),
    semifinales: playoffMatches.filter(m => m.round === 'semifinales'),
    finales: playoffMatches.filter(m => m.round === 'final' || m.round === 'tercer-puesto')
  };

  const roundTitles = {
    octavos: 'Octavos de Final',
    cuartos: 'Cuartos de Final',
    semifinales: 'Semifinales',
    finales: 'Final y 3er Puesto'
  };

  const roundKeys = ['octavos', 'cuartos', 'semifinales', 'finales'];

  roundKeys.forEach(key => {
    const roundCol = document.createElement('div');
    roundCol.className = 'bracket-round';
    roundCol.setAttribute('data-round', key);

    const roundTitle = document.createElement('h3');
    roundTitle.style.textAlign = 'center';
    roundTitle.style.fontSize = '0.9rem';
    roundTitle.style.color = 'var(--text-muted)';
    roundTitle.style.marginBottom = '1.25rem';
    roundTitle.style.textTransform = 'uppercase';
    roundTitle.style.letterSpacing = '1px';
    roundTitle.textContent = roundTitles[key];
    roundCol.appendChild(roundTitle);

    rounds[key].forEach(m => {
      const matchWrapper = document.createElement('div');
      matchWrapper.className = 'bracket-match-wrapper';

      const matchDiv = document.createElement('div');
      matchDiv.className = 'bracket-match';
      matchDiv.setAttribute('data-match-id', m.id);

      const homeTeam = m.home ? teams.find(t => t.id === m.home) : null;
      const awayTeam = m.away ? teams.find(t => t.id === m.away) : null;

      const isPlayed = m.homeScore !== null && m.homeScore !== undefined;
      const winnerId = isPlayed ? getMatchWinner(m) : null;

      const getTeamRowHTML = (team, placeholder, isHome) => {
        if (!team) {
          return `
            <div class="bracket-team-row">
              <span class="bracket-team-info placeholder-team">❓ ${placeholder}</span>
              <span class="bracket-score">-</span>
            </div>
          `;
        }
        
        const isWinner = winnerId === team.id;
        const isLoser = winnerId && winnerId !== team.id;
        const score = isHome ? m.homeScore : m.awayScore;
        const pens = isHome ? m.homePenalties : m.awayPenalties;
        
        let rowClass = 'bracket-team-row';
        if (isWinner) rowClass += ' winner';
        if (isLoser) rowClass += ' loser';

        // Mostrar penales si corresponde
        const pensText = (pens !== null && pens !== undefined) 
          ? `<span style="font-size: 0.7rem; color: var(--accent-gold); font-weight: bold; margin-left: 4px;">(${pens})</span>` 
          : '';

        return `
          <div class="${rowClass}">
            <span class="bracket-team-info">
              <img src="${team.flag}" class="flag-img" alt="${team.name}">
              <span class="bracket-team-name">${team.name}</span>
            </span>
            <span class="bracket-score">${score}${pensText}</span>
          </div>
        `;
      };

      const matchLabel = m.round === 'tercer-puesto' ? 'Tercer Puesto 🥉' : m.round === 'final' ? 'Final 🏆' : `${m.name}`;

      matchDiv.innerHTML = `
        <div class="bracket-match-info">
          <span>${matchLabel}</span>
          <span>${isPlayed ? '✓ Finalizado' : '⏳ Pendiente'}</span>
        </div>
        ${getTeamRowHTML(homeTeam, m.homePlaceholder, true)}
        ${getTeamRowHTML(awayTeam, m.awayPlaceholder, false)}
      `;

      // Abrir modal solo si los equipos están definidos
      matchDiv.addEventListener('click', () => {
        if (m.home && m.away) {
          onEditMatch(m);
        } else {
          alert(`Este partido se definirá al clasificar los equipos correspondientes de la ronda previa (${m.homePlaceholder} y ${m.awayPlaceholder}).`);
        }
      });

      matchWrapper.appendChild(matchDiv);
      roundCol.appendChild(matchWrapper);
    });

    bracketWrapper.appendChild(roundCol);
  });

  container.appendChild(bracketWrapper);
}
