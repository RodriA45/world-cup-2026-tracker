import { teams } from '../data/equipos.js';

/**
 * Formatea una fecha UTC en la zona horaria local del usuario indicando el GMT.
 */
export function formatMatchDate(dateString) {
  const d = new Date(dateString);
  
  // Opciones de formato local
  const options = { 
    day: '2-digit', 
    month: 'short', 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false
  };
  const dateFormatted = d.toLocaleString(undefined, options);
  
  // Obtener desplazamiento GMT
  const offset = d.getTimezoneOffset();
  const absOffset = Math.abs(offset);
  const hours = Math.floor(absOffset / 60);
  const minutes = absOffset % 60;
  const sign = offset <= 0 ? '+' : '-';
  const offsetStr = `GMT${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  
  return `${dateFormatted} (${offsetStr})`;
}

export function renderFixtureView(container, matchesList, onEditMatch) {
  // Crear filtros si no existen en el contenedor
  let filtersBar = container.querySelector('.filters-bar');
  let matchesGrid = container.querySelector('.matches-list');

  if (!filtersBar) {
    container.innerHTML = '';
    
    // Crear barra de filtros
    filtersBar = document.createElement('div');
    filtersBar.className = 'filters-bar';
    
    filtersBar.innerHTML = `
      <div class="filter-group">
        <label class="filter-label" for="filter-group-select">Grupo:</label>
        <select id="filter-group-select" class="select-input">
          <option value="ALL">Todos</option>
          <option value="A">Grupo A</option>
          <option value="B">Grupo B</option>
          <option value="C">Grupo C</option>
          <option value="D">Grupo D</option>
          <option value="E">Grupo E</option>
          <option value="F">Grupo F</option>
          <option value="G">Grupo G</option>
          <option value="H">Grupo H</option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label" for="filter-matchday-select">Jornada:</label>
        <select id="filter-matchday-select" class="select-input">
          <option value="ALL">Todas</option>
          <option value="1">Jornada 1</option>
          <option value="2">Jornada 2</option>
          <option value="3">Jornada 3</option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label" for="filter-status-select">Estado:</label>
        <select id="filter-status-select" class="select-input">
          <option value="ALL">Todos</option>
          <option value="PLAYED">Jugados</option>
          <option value="PENDING">Pendientes</option>
        </select>
      </div>
    `;
    
    container.appendChild(filtersBar);

    // Crear grilla de partidos
    matchesGrid = document.createElement('div');
    matchesGrid.className = 'matches-list';
    container.appendChild(matchesGrid);

    // Eventos de filtros
    const applyFilters = () => {
      const selectedGroup = document.getElementById('filter-group-select').value;
      const selectedMatchday = document.getElementById('filter-matchday-select').value;
      const selectedStatus = document.getElementById('filter-status-select').value;

      const filteredMatches = matchesList.filter(m => {
        const matchesGroup = selectedGroup === 'ALL' || m.group === selectedGroup;
        const matchesMatchday = selectedMatchday === 'ALL' || String(m.matchday) === selectedMatchday;
        
        const isPlayed = m.homeScore !== null && m.homeScore !== undefined;
        const matchesStatus = selectedStatus === 'ALL' || 
          (selectedStatus === 'PLAYED' && isPlayed) || 
          (selectedStatus === 'PENDING' && !isPlayed);

        return matchesGroup && matchesMatchday && matchesStatus;
      });

      renderMatches(matchesGrid, filteredMatches, onEditMatch);
    };

    filtersBar.querySelectorAll('select').forEach(select => {
      select.addEventListener('change', applyFilters);
    });
  }

  // Render inicial / re-render: leer filtros del DOM si existen, sino usar defaults
  const groupSelect = document.getElementById('filter-group-select');
  const matchdaySelect = document.getElementById('filter-matchday-select');
  const statusSelect = document.getElementById('filter-status-select');

  // Valores por defecto seguros (por si aún no existen en el DOM)
  const activeGroup = groupSelect ? groupSelect.value : 'ALL';
  const activeMatchday = matchdaySelect ? matchdaySelect.value : 'ALL';
  const activeStatus = statusSelect ? statusSelect.value : 'ALL';

  const currentFiltered = matchesList.filter(m => {
    const matchesGroup = activeGroup === 'ALL' || m.group === activeGroup;
    const matchesMatchday = activeMatchday === 'ALL' || String(m.matchday) === activeMatchday;
    const isPlayed = m.homeScore !== null && m.homeScore !== undefined;
    const matchesStatus = activeStatus === 'ALL' ||
      (activeStatus === 'PLAYED' && isPlayed) ||
      (activeStatus === 'PENDING' && !isPlayed);
    return matchesGroup && matchesMatchday && matchesStatus;
  });

  renderMatches(matchesGrid, currentFiltered, onEditMatch);
}

function renderMatches(gridContainer, matches, onEditMatch) {
  gridContainer.innerHTML = '';

  if (matches.length === 0) {
    gridContainer.innerHTML = `
      <div class="stats-empty" style="grid-column: 1 / -1; padding: 3rem 0;">
        No se encontraron partidos para los filtros seleccionados.
      </div>
    `;
    return;
  }

  matches.forEach(m => {
    const homeTeam = teams.find(t => t.id === m.home);
    const awayTeam = teams.find(t => t.id === m.away);

    const isPlayed = m.homeScore !== null && m.homeScore !== undefined;

    const card = document.createElement('div');
    card.className = 'match-card';
    card.setAttribute('data-match-id', m.id);

    const formattedDate = formatMatchDate(m.date);

    card.innerHTML = `
      <div class="match-info-top">
        <span class="match-stage-badge">Grupo ${m.group} — Fecha ${m.matchday}</span>
        <span class="match-date">${formattedDate}</span>
      </div>
      <div class="match-teams-row">
        <div class="match-team home-team">
          <span class="match-team-name">${homeTeam.name}</span>
          <img src="${homeTeam.flag}" class="flag-img" alt="${homeTeam.name}">
        </div>
        <div class="match-score-display">
          <span>${isPlayed ? m.homeScore : '-'}</span>
          <span class="score-divider">:</span>
          <span>${isPlayed ? m.awayScore : '-'}</span>
        </div>
        <div class="match-team away-team">
          <img src="${awayTeam.flag}" class="flag-img" alt="${awayTeam.name}">
          <span class="match-team-name">${awayTeam.name}</span>
        </div>
      </div>
      <div class="match-card-actions">
        <span class="played-status ${isPlayed ? 'played' : 'pending'}">
          ${isPlayed ? 'Finalizado' : 'Pendiente'}
        </span>
        <button class="edit-score-btn">
          ${isPlayed ? 'Editar Marcador' : 'Cargar Marcador'}
        </button>
      </div>
    `;

    // Asignar evento al botón de editar
    card.querySelector('.edit-score-btn').addEventListener('click', () => {
      onEditMatch(m);
    });

    gridContainer.appendChild(card);
  });
}
