import { calculateGroupTable } from '../logic/posiciones.js';

export function renderGroupsView(container, teamsList, matchesList) {
  container.innerHTML = '';

  // 1. Crear Título y Contenedor de la Lista de Equipos (Requisito 2.1)
  const teamsHeader = document.createElement('h2');
  teamsHeader.className = 'view-title';
  teamsHeader.style.marginBottom = '1.5rem';
  teamsHeader.style.fontSize = '1.4rem';
  teamsHeader.style.color = 'var(--accent-gold)';
  teamsHeader.innerHTML = '🛡️ Equipos Participantes';
  container.appendChild(teamsHeader);

  const teamsGrid = document.createElement('div');
  teamsGrid.className = 'teams-list-tab';
  teamsGrid.style.marginBottom = '3rem';

  // Mostrar todos los equipos
  teamsList.forEach(t => {
    const card = document.createElement('div');
    card.className = 'team-display-card';
    card.innerHTML = `
      <img src="${t.flag}" class="flag-img" alt="${t.name}">
      <div class="team-display-info">
        <span class="team-display-name">${t.name}</span>
        <span class="team-display-group">Grupo ${t.group}</span>
      </div>
    `;
    teamsGrid.appendChild(card);
  });
  container.appendChild(teamsGrid);

  // 2. Crear Título y Contenedor para las Tablas de Grupos (Requisito 2.2)
  const groupsHeader = document.createElement('h2');
  groupsHeader.className = 'view-title';
  groupsHeader.style.marginBottom = '1.5rem';
  groupsHeader.style.fontSize = '1.4rem';
  groupsHeader.style.color = 'var(--accent-gold)';
  groupsHeader.innerHTML = '📊 Tablas de Posiciones de Grupos';
  container.appendChild(groupsHeader);

  const groupsGrid = document.createElement('div');
  groupsGrid.className = 'groups-grid';

  const groupNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  groupNames.forEach(groupName => {
    const groupCard = document.createElement('div');
    groupCard.className = 'group-card';
    
    // Encabezado del grupo
    const header = document.createElement('div');
    header.className = 'group-header';
    header.innerHTML = `
      <span>Grupo ${groupName}</span>
      <span style="font-size: 0.8rem; color: var(--text-muted)">Mundial 2026</span>
    `;
    groupCard.appendChild(header);

    // Calcular la tabla ordenada del grupo
    const tableData = calculateGroupTable(groupName, teamsList, matchesList);

    // Crear la tabla
    const tableResp = document.createElement('div');
    tableResp.className = 'table-responsive';
    
    const table = document.createElement('table');
    table.className = 'positions-table';
    table.innerHTML = `
      <thead>
        <tr>
          <th style="text-align: left; padding-left: 0.5rem;">Equipo</th>
          <th>PJ</th>
          <th>PG</th>
          <th>PE</th>
          <th>PP</th>
          <th>GF</th>
          <th>GC</th>
          <th>DG</th>
          <th class="points">PTS</th>
        </tr>
      </thead>
      <tbody>
        ${tableData.map(row => `
          <tr>
            <td class="team-cell">
              <img src="${row.flag}" class="flag-img" alt="${row.name}">
              <span class="team-name-text">${row.name}</span>
            </td>
            <td>${row.pj}</td>
            <td>${row.pg}</td>
            <td>${row.pe}</td>
            <td>${row.pp}</td>
            <td>${row.gf}</td>
            <td>${row.gc}</td>
            <td>${row.dg > 0 ? `+${row.dg}` : row.dg}</td>
            <td class="points">${row.pts}</td>
          </tr>
        `).join('')}
      </tbody>
    `;
    
    tableResp.appendChild(table);
    groupCard.appendChild(tableResp);
    groupsGrid.appendChild(groupCard);
  });

  container.appendChild(groupsGrid);
}
