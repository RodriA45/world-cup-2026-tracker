import { teams } from '../data/equipos.js';

export class ScoreForm {
  constructor(onSaveCallback) {
    this.onSave = onSaveCallback;
    this.currentMatch = null;
    
    // Cache de elementos DOM (se asociarán al inicializar)
    this.overlay = null;
    this.modal = null;
    this.title = null;
    this.homeFlag = null;
    this.homeName = null;
    this.awayFlag = null;
    this.awayName = null;
    this.homeInput = null;
    this.awayInput = null;
    
    // Penalties
    this.penaltiesSection = null;
    this.homePenInput = null;
    this.awayPenInput = null;
    
    // Scorers & Assists
    this.scorersList = null;
    this.assistsList = null;
    this.addScorerBtn = null;
    this.addAssistBtn = null;
    
    // Actions
    this.cancelBtn = null;
    this.saveBtn = null;
  }

  init() {
    this.overlay = document.getElementById('score-modal');
    this.modal = this.overlay.querySelector('.modal-content');
    this.title = document.getElementById('modal-match-title');
    this.homeFlag = document.getElementById('modal-home-flag');
    this.homeName = document.getElementById('modal-home-name');
    this.awayFlag = document.getElementById('modal-away-flag');
    this.awayName = document.getElementById('modal-away-name');
    this.homeInput = document.getElementById('modal-home-score');
    this.awayInput = document.getElementById('modal-away-score');
    
    this.penaltiesSection = document.getElementById('modal-penalties-section');
    this.homePenInput = document.getElementById('modal-home-penalties');
    this.awayPenInput = document.getElementById('modal-away-penalties');
    
    this.scorersList = document.getElementById('scorers-list');
    this.assistsList = document.getElementById('assists-list');
    this.addScorerBtn = document.getElementById('add-scorer-btn');
    this.addAssistBtn = document.getElementById('add-assist-btn');
    
    this.cancelBtn = document.getElementById('modal-cancel-btn');
    this.saveBtn = document.getElementById('modal-save-btn');
    
    this.bindEvents();
  }

  bindEvents() {
    // Cerrar modal
    this.overlay.querySelector('.modal-close-btn').addEventListener('click', () => this.close());
    this.cancelBtn.addEventListener('click', () => this.close());
    
    // Cerrar al hacer click fuera del modal
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    // Detectar empates en tiempo real para mostrar penales
    const checkPenaltiesCondition = () => {
      if (!this.currentMatch) return;
      
      const isPlayoff = this.currentMatch.id > 48;
      const hScore = this.homeInput.value;
      const aScore = this.awayInput.value;
      
      if (isPlayoff && hScore !== '' && aScore !== '' && Number(hScore) === Number(aScore)) {
        this.penaltiesSection.classList.add('active');
        this.homePenInput.required = true;
        this.awayPenInput.required = true;
      } else {
        this.penaltiesSection.classList.remove('active');
        this.homePenInput.required = false;
        this.awayPenInput.required = false;
      }
    };

    this.homeInput.addEventListener('input', checkPenaltiesCondition);
    this.awayInput.addEventListener('input', checkPenaltiesCondition);

    // Agregar goleador / asistidor
    this.addScorerBtn.addEventListener('click', () => this.addScorerRow());
    this.addAssistBtn.addEventListener('click', () => this.addAssistRow());

    // Guardar formulario
    this.overlay.querySelector('form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSave();
    });
  }

  open(match) {
    this.currentMatch = match;
    const homeTeam = teams.find(t => t.id === match.home);
    const awayTeam = teams.find(t => t.id === match.away);

    if (!homeTeam || !awayTeam) {
      alert("Este partido aún no tiene los equipos definidos.");
      return;
    }

    // Configurar Datalist para autocompletar jugadores
    this.setupPlayersDatalist(homeTeam, awayTeam);

    // Setear Info de los equipos
    this.title.textContent = match.id > 48 ? `Eliminatorias — Partido ${match.id}` : `Grupo ${match.group} — Partido ${match.id}`;
    
    // Inyectar etiquetas de imágenes para banderas
    this.homeFlag.innerHTML = `<img src="${homeTeam.flag}" class="flag-img" style="width: 48px; height: 32px; object-fit: cover; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.4);" alt="${homeTeam.name}">`;
    this.homeName.textContent = homeTeam.name;
    this.awayFlag.innerHTML = `<img src="${awayTeam.flag}" class="flag-img" style="width: 48px; height: 32px; object-fit: cover; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.4);" alt="${awayTeam.name}">`;
    this.awayName.textContent = awayTeam.name;

    // Cargar marcadores previos
    this.homeInput.value = match.homeScore !== null ? match.homeScore : '';
    this.awayInput.value = match.awayScore !== null ? match.awayScore : '';
    
    // Penalties previos
    this.homePenInput.value = match.homePenalties !== null ? match.homePenalties : '';
    this.awayPenInput.value = match.awayPenalties !== null ? match.awayPenalties : '';

    // Mostrar / Ocultar sección de penales
    const isPlayoff = match.id > 48;
    if (isPlayoff && match.homeScore !== null && match.awayScore !== null && Number(match.homeScore) === Number(match.awayScore)) {
      this.penaltiesSection.classList.add('active');
    } else {
      this.penaltiesSection.classList.remove('active');
    }

    // Limpiar listas de goles y asistencias
    this.scorersList.innerHTML = '';
    this.assistsList.innerHTML = '';

    // Cargar goleadores previos
    if (match.scorers && match.scorers.length > 0) {
      match.scorers.forEach(s => this.addScorerRow(s.player, s.team));
    }
    
    // Cargar asistidores previos
    if (match.assists && match.assists.length > 0) {
      match.assists.forEach(a => this.addAssistRow(a.player, a.team));
    }

    // Activar modal
    this.overlay.classList.add('active');
  }

  close() {
    this.overlay.classList.remove('active');
    this.currentMatch = null;
  }

  setupPlayersDatalist(homeTeam, awayTeam) {
    // Buscar datalists o crearlos
    let datalist = document.getElementById('players-datalist');
    if (!datalist) {
      datalist = document.createElement('datalist');
      datalist.id = 'players-datalist';
      document.body.appendChild(datalist);
    }
    
    datalist.innerHTML = '';
    
    // Combinar jugadores sugeridos
    const homePlayers = homeTeam.players || [];
    const awayPlayers = awayTeam.players || [];
    
    homePlayers.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p;
      datalist.appendChild(opt);
    });
    
    awayPlayers.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p;
      datalist.appendChild(opt);
    });
  }

  addScorerRow(playerName = '', teamId = '') {
    const row = document.createElement('div');
    row.className = 'event-row';
    
    const select = document.createElement('select');
    select.className = 'select-input team-select';
    select.required = true;
    
    const optHome = document.createElement('option');
    optHome.value = this.currentMatch.home;
    optHome.textContent = teams.find(t => t.id === this.currentMatch.home).name;
    
    const optAway = document.createElement('option');
    optAway.value = this.currentMatch.away;
    optAway.textContent = teams.find(t => t.id === this.currentMatch.away).name;
    
    select.appendChild(optHome);
    select.appendChild(optAway);
    if (teamId) select.value = teamId;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'select-input player-input';
    input.placeholder = 'Nombre del goleador';
    input.setAttribute('list', 'players-datalist');
    input.required = true;
    input.value = playerName;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-event-btn';
    removeBtn.innerHTML = '✕';
    removeBtn.addEventListener('click', () => row.remove());

    row.appendChild(select);
    row.appendChild(input);
    row.appendChild(removeBtn);
    this.scorersList.appendChild(row);
  }

  addAssistRow(playerName = '', teamId = '') {
    const row = document.createElement('div');
    row.className = 'event-row';
    
    const select = document.createElement('select');
    select.className = 'select-input team-select';
    select.required = true;
    
    const optHome = document.createElement('option');
    optHome.value = this.currentMatch.home;
    optHome.textContent = teams.find(t => t.id === this.currentMatch.home).name;
    
    const optAway = document.createElement('option');
    optAway.value = this.currentMatch.away;
    optAway.textContent = teams.find(t => t.id === this.currentMatch.away).name;
    
    select.appendChild(optHome);
    select.appendChild(optAway);
    if (teamId) select.value = teamId;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'select-input player-input';
    input.placeholder = 'Nombre del asistidor';
    input.setAttribute('list', 'players-datalist');
    input.required = true;
    input.value = playerName;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-event-btn';
    removeBtn.innerHTML = '✕';
    removeBtn.addEventListener('click', () => row.remove());

    row.appendChild(select);
    row.appendChild(input);
    row.appendChild(removeBtn);
    this.assistsList.appendChild(row);
  }

  handleSave() {
    const homeScoreVal = this.homeInput.value;
    const awayScoreVal = this.awayInput.value;

    if (homeScoreVal === '' || awayScoreVal === '') {
      alert("Por favor ingrese marcadores válidos.");
      return;
    }

    const homeScore = Number(homeScoreVal);
    const awayScore = Number(awayScoreVal);
    
    let homePenalties = null;
    let awayPenalties = null;
    
    const isPlayoff = this.currentMatch.id > 48;
    if (isPlayoff && homeScore === awayScore) {
      const hPen = this.homePenInput.value;
      const aPen = this.awayPenInput.value;
      
      if (hPen === '' || aPen === '') {
        alert("En fases de eliminación directa debe definirse un ganador por penales en caso de empate.");
        return;
      }
      
      homePenalties = Number(hPen);
      awayPenalties = Number(aPen);
      
      if (homePenalties === awayPenalties) {
        alert("No puede haber empate en la tanda de penales.");
        return;
      }
    }

    // Recolectar goleadores y asistidores
    const scorers = [];
    this.scorersList.querySelectorAll('.event-row').forEach(row => {
      const team = row.querySelector('.team-select').value;
      const player = row.querySelector('.player-input').value;
      if (player.trim()) {
        scorers.push({ team, player: player.trim() });
      }
    });

    const assists = [];
    this.assistsList.querySelectorAll('.event-row').forEach(row => {
      const team = row.querySelector('.team-select').value;
      const player = row.querySelector('.player-input').value;
      if (player.trim()) {
        assists.push({ team, player: player.trim() });
      }
    });

    const scoreData = {
      homeScore,
      awayScore,
      homePenalties,
      awayPenalties,
      scorers,
      assists
    };

    this.onSave(this.currentMatch.id, scoreData);
    this.close();
  }
}
