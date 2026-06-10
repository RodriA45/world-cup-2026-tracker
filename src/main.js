import { teams } from './data/equipos.js';
import { initialMatches } from './data/partidos.js';
import { initialPlayoffMatches, propagateBracket } from './logic/playoffs.js';
import { calculateGroupTable } from './logic/posiciones.js';
import { calculateTopScorers, calculateTopAssists } from './logic/estadisticas.js';
import { renderGroupsView } from './ui/grupos.js';
import { renderFixtureView } from './ui/fixture.js';
import { renderBracketView } from './ui/bracket.js';
import { ScoreForm } from './ui/scoreForm.js';

// Clave para almacenamiento local
const LOCAL_STORAGE_KEY = 'tfi_mundial_2026_state';

class App {
  constructor() {
    this.groupMatches = [];
    this.playoffMatches = [];
    this.activeTab = 'groups-view';
    this.scoreForm = null;
    this.isSimulating = false;
  }

  start() {
    this.loadState();
    
    // Inicializar el controlador del formulario de carga
    this.scoreForm = new ScoreForm((matchId, scoreData) => this.saveMatchResult(matchId, scoreData));
    this.scoreForm.init();

    this.bindEvents();
    this.initTheme();
    this.initCountdowns();
    this.render();
  }

  /**
   * Inicializa el tema (Claro / Oscuro) basado en la preferencia del usuario.
   */
  initTheme() {
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (!themeBtn) return;
    
    const savedTheme = localStorage.getItem('tfi_mundial_2026_theme') || 'dark';
    if (savedTheme === 'light') {
      document.body.classList.add('light-theme');
      themeBtn.textContent = '🌙 Modo Oscuro';
    } else {
      document.body.classList.remove('light-theme');
      themeBtn.textContent = '☀️ Modo Claro';
    }
  }

  /**
   * Inicializa las cuentas regresivas del Mundial y del debut de Argentina.
   */
  initCountdowns() {
    const WORLD_CUP_START_DATE = new Date('2026-06-11T17:00:00Z').getTime(); // MEX vs RSA
    const ARGENTINA_DEBUT_DATE = new Date('2026-06-16T15:00:00Z').getTime(); // ARG vs ALG

    const updateTimers = () => {
      const now = new Date().getTime();

      // 1. Contador Mundial
      const wcDistance = WORLD_CUP_START_DATE - now;
      const wcTimerEl = document.getElementById('world-cup-timer');
      
      if (wcDistance < 0) {
        if (wcTimerEl) {
          wcTimerEl.innerHTML = `<div style="font-size: 1.35rem; font-weight: 800; color: #22c55e; width: 100%; text-align: center; letter-spacing: 0.5px;">¡EL MUNDIAL HA COMENZADO! ⚽</div>`;
        }
      } else {
        const days = Math.floor(wcDistance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((wcDistance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((wcDistance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((wcDistance % (1000 * 60)) / 1000);

        const dEl = document.getElementById('wc-days');
        const hEl = document.getElementById('wc-hours');
        const mEl = document.getElementById('wc-minutes');
        const sEl = document.getElementById('wc-seconds');

        if (dEl) dEl.textContent = String(days).padStart(2, '0');
        if (hEl) hEl.textContent = String(hours).padStart(2, '0');
        if (mEl) mEl.textContent = String(minutes).padStart(2, '0');
        if (sEl) sEl.textContent = String(seconds).padStart(2, '0');
      }

      // 2. Contador Argentina
      const argDistance = ARGENTINA_DEBUT_DATE - now;
      const argTimerEl = document.getElementById('argentina-timer');
      
      if (argDistance < 0) {
        if (argTimerEl) {
          argTimerEl.innerHTML = `<div style="font-size: 0.95rem; font-weight: 800; color: #60a5fa; width: 100%; text-align: center;">¡ARGENTINA JUGANDO! 🇦🇷</div>`;
        }
      } else {
        const days = Math.floor(argDistance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((argDistance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((argDistance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((argDistance % (1000 * 60)) / 1000);

        const dEl = document.getElementById('arg-days');
        const hEl = document.getElementById('arg-hours');
        const mEl = document.getElementById('arg-minutes');
        const sEl = document.getElementById('arg-seconds');

        if (dEl) dEl.textContent = String(days).padStart(2, '0');
        if (hEl) hEl.textContent = String(hours).padStart(2, '0');
        if (mEl) mEl.textContent = String(minutes).padStart(2, '0');
        if (sEl) sEl.textContent = String(seconds).padStart(2, '0');
      }
    };

    // Ejecutar inmediatamente y luego cada segundo
    updateTimers();
    setInterval(updateTimers, 1000);
  }

  /**
   * Carga el estado del torneo desde LocalStorage o inicia uno nuevo.
   */
  loadState() {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.groupMatches = parsed.groupMatches || [];
        this.playoffMatches = parsed.playoffMatches || [];
        
        // Robustez: verificar si se cargaron listas vacías por error
        if (this.groupMatches.length === 0 || this.playoffMatches.length === 0) {
          this.initNewState();
        }
      } catch (e) {
        console.error("Error al parsear LocalStorage. Reiniciando estado...", e);
        this.initNewState();
      }
    } else {
      this.initNewState();
    }
  }

  initNewState() {
    // Clonar profundamente los datos iniciales
    this.groupMatches = JSON.parse(JSON.stringify(initialMatches));
    this.playoffMatches = JSON.parse(JSON.stringify(initialPlayoffMatches));
    this.saveState();
  }

  saveState() {
    const state = {
      groupMatches: this.groupMatches,
      playoffMatches: this.playoffMatches
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }

  bindEvents() {
    // Scroll suave para botón del Hero y la flecha hacia abajo
    const exploreBtn = document.getElementById('explore-btn');
    const scrollArrow = document.getElementById('scroll-down-arrow');
    
    const scrollToDashboard = () => {
      const dashboardHeader = document.querySelector('header');
      if (dashboardHeader) {
        dashboardHeader.scrollIntoView({ behavior: 'smooth' });
      }
    };

    if (exploreBtn) exploreBtn.addEventListener('click', scrollToDashboard);
    if (scrollArrow) scrollArrow.addEventListener('click', scrollToDashboard);

    // Scroll suave para enlaces internos (como ver sedes)
    document.querySelectorAll('.btn-hero-secondary, a[href^="#stadiums-section"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Manejo de Navegación por pestañas
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        if (this.isSimulating) return; // Bloquear interacción durante simulación
        
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const target = tab.getAttribute('data-target');
        this.activeTab = target;

        // Cambiar visibilidad de secciones
        const sections = document.querySelectorAll('.view-section');
        sections.forEach(sec => {
          if (sec.id === target) {
            sec.classList.add('active');
          } else {
            sec.classList.remove('active');
          }
        });

        this.render();
      });
    });

    // Alternar tema Claro / Oscuro
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        if (document.body.classList.contains('light-theme')) {
          document.body.classList.remove('light-theme');
          localStorage.setItem('tfi_mundial_2026_theme', 'dark');
          themeBtn.textContent = '☀️ Modo Claro';
          this.showToast('Modo Oscuro premium activado 🌙', 'info');
        } else {
          document.body.classList.add('light-theme');
          localStorage.setItem('tfi_mundial_2026_theme', 'light');
          themeBtn.textContent = '🌙 Modo Oscuro';
          this.showToast('Modo Claro limpio activado ☀️', 'info');
        }
      });
    }

    // Botón Simular Pendientes
    const simulateBtn = document.getElementById('simulate-matches-btn');
    if (simulateBtn) {
      simulateBtn.addEventListener('click', () => {
        this.showConfirm(
          '¿Deseas simular aleatoriamente todos los partidos que aún no tienen marcador?',
          () => this.simulatePendingMatches()
        );
      });
    }

    // Botón Exportar Reporte
    const exportBtn = document.getElementById('export-report-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportTournamentReport();
      });
    }

    // Evento del botón Reiniciar (con null-guard por seguridad)
    const resetBtn = document.getElementById('reset-tournament-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.showConfirm(
          '¿Estás seguro de que quieres reiniciar todos los resultados del Mundial? Esta acción no se puede deshacer.',
          () => {
            this.initNewState();
            this.render();
            this.showToast('Se han restablecido todos los partidos del fixture 🔄', 'warning');
          }
        );
      });
    }

    // Botón Exportar JSON
    const exportJsonBtn = document.getElementById('export-json-btn');
    if (exportJsonBtn) {
      exportJsonBtn.addEventListener('click', () => this.exportJSON());
    }

    // Botón Importar JSON
    const importJsonInput = document.getElementById('import-json-input');
    if (importJsonInput) {
      importJsonInput.addEventListener('change', (e) => this.importJSON(e));
    }
    const importJsonBtn = document.getElementById('import-json-btn');
    if (importJsonBtn) {
      importJsonBtn.addEventListener('click', () => importJsonInput && importJsonInput.click());
    }

    // Búsqueda en tiempo real — Goleadores
    const scorersSearch = document.getElementById('scorers-search');
    if (scorersSearch) {
      scorersSearch.addEventListener('input', (e) => {
        this.renderFilteredStats('scorers', e.target.value.trim());
      });
    }

    // Búsqueda en tiempo real — Asistidores
    const assistsSearch = document.getElementById('assists-search');
    if (assistsSearch) {
      assistsSearch.addEventListener('input', (e) => {
        this.renderFilteredStats('assists', e.target.value.trim());
      });
    }

    // Vincular FAB Móvil
    const mobileFab = document.getElementById('mobile-fab');
    const fabTrigger = mobileFab ? mobileFab.querySelector('.fab-trigger') : null;
    
    if (fabTrigger) {
      fabTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        mobileFab.classList.toggle('active');
      });

      // Clics en ítems de menú flotante
      document.getElementById('fab-simulate').addEventListener('click', (e) => {
        e.stopPropagation();
        mobileFab.classList.remove('active');
        simulateBtn.click();
      });

      document.getElementById('fab-export').addEventListener('click', (e) => {
        e.stopPropagation();
        mobileFab.classList.remove('active');
        exportBtn.click();
      });

      document.getElementById('fab-reset').addEventListener('click', (e) => {
        e.stopPropagation();
        mobileFab.classList.remove('active');
        document.getElementById('reset-tournament-btn').click();
      });

      // Cerrar menú al hacer click fuera
      document.addEventListener('click', () => {
        mobileFab.classList.remove('active');
      });
    }

    // ── HAMBURGER MENU MOBILE ──
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileNavDrawer = document.getElementById('mobile-nav-drawer');
    const activeTabLabel = document.getElementById('active-tab-label');

    if (hamburgerBtn && mobileNavDrawer) {
      // Toggle drawer
      hamburgerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = mobileNavDrawer.classList.toggle('open');
        hamburgerBtn.classList.toggle('open', isOpen);
        hamburgerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        mobileNavDrawer.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      });

      // Cerrar drawer al hacer click fuera
      document.addEventListener('click', (e) => {
        if (!mobileNavDrawer.contains(e.target) && e.target !== hamburgerBtn) {
          mobileNavDrawer.classList.remove('open');
          hamburgerBtn.classList.remove('open');
          hamburgerBtn.setAttribute('aria-expanded', 'false');
          mobileNavDrawer.setAttribute('aria-hidden', 'true');
        }
      });

      // Items del drawer — cambiar de vista
      const mobileNavItems = mobileNavDrawer.querySelectorAll('.mobile-nav-item');
      const TAB_LABELS = {
        'groups-view':  'Grupos',
        'fixture-view': 'Fixture',
        'bracket-view': 'Eliminatorias'
      };

      mobileNavItems.forEach(item => {
        item.addEventListener('click', () => {
          const target = item.getAttribute('data-target');

          // Activar el tab correspondiente del desktop nav
          document.querySelectorAll('.tab-btn').forEach(t => {
            t.classList.toggle('active', t.getAttribute('data-target') === target);
          });

          // Activar sección
          document.querySelectorAll('.view-section').forEach(sec => {
            sec.classList.toggle('active', sec.id === target);
          });

          // Marcar item activo en el drawer
          mobileNavItems.forEach(i => i.classList.remove('active'));
          item.classList.add('active');

          // Actualizar label
          if (activeTabLabel) activeTabLabel.textContent = TAB_LABELS[target] || '';

          // Cerrar drawer
          mobileNavDrawer.classList.remove('open');
          hamburgerBtn.classList.remove('open');
          hamburgerBtn.setAttribute('aria-expanded', 'false');
          mobileNavDrawer.setAttribute('aria-hidden', 'true');

          // Actualizar estado y re-renderizar
          this.activeTab = target;
          this.render();
        });
      });
    }

    // Sync label cuando se usan los tabs del desktop
    document.querySelectorAll('.tab-btn').forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-target');
        const labels = { 'groups-view': 'Grupos', 'fixture-view': 'Fixture', 'bracket-view': 'Eliminatorias' };
        const el = document.getElementById('active-tab-label');
        if (el) el.textContent = labels[target] || '';
        // Sync drawer items
        document.querySelectorAll('.mobile-nav-item').forEach(i => {
          i.classList.toggle('active', i.getAttribute('data-target') === target);
        });
      });
    });

    // Efecto Parallax interactivo sutil en los globos de luz del fondo
    if (!this._parallaxHandler) {
      this._parallaxHandler = (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 40;
        const y = (e.clientY / window.innerHeight - 0.5) * 40;
        const wrapper1 = document.querySelector('.glow-wrapper-1');
        const wrapper2 = document.querySelector('.glow-wrapper-2');
        if (wrapper1) wrapper1.style.transform = `translate(${x}px, ${y}px)`;
        if (wrapper2) wrapper2.style.transform = `translate(${-x}px, ${-y}px)`;
      };
      document.addEventListener('mousemove', this._parallaxHandler);
    }
  }

  /**
   * Modal de confirmación personalizado — reemplaza confirm() del navegador.
   */
  showConfirm(message, onAccept) {
    const modal = document.getElementById('confirm-modal');
    const msgEl = document.getElementById('confirm-modal-message');
    const acceptBtn = document.getElementById('confirm-modal-accept');
    const cancelBtn = document.getElementById('confirm-modal-cancel');
    if (!modal || !msgEl || !acceptBtn || !cancelBtn) {
      // Fallback si no existe el modal en el HTML
      if (window.confirm(message)) onAccept();
      return;
    }
    msgEl.textContent = message;
    modal.classList.add('active');

    const cleanup = () => modal.classList.remove('active');

    const onAcceptOnce = () => { cleanup(); onAccept(); acceptBtn.removeEventListener('click', onAcceptOnce); cancelBtn.removeEventListener('click', onCancelOnce); };
    const onCancelOnce = () => { cleanup(); acceptBtn.removeEventListener('click', onAcceptOnce); cancelBtn.removeEventListener('click', onCancelOnce); };

    acceptBtn.addEventListener('click', onAcceptOnce);
    cancelBtn.addEventListener('click', onCancelOnce);
    modal.addEventListener('click', (e) => { if (e.target === modal) onCancelOnce(); }, { once: true });
  }

  /**
   * Muestra una notificación Toast animada y fluida
   */
  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = '💡';
    if (type === 'success') icon = '🏆';
    else if (type === 'error') icon = '❌';
    else if (type === 'info') icon = '⚡';
    else if (type === 'warning') icon = '🔄';

    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-text">${message}</span>
      <button class="toast-close" type="button">&times;</button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.classList.add('toast-fade-out');
      toast.addEventListener('animationend', () => toast.remove());
    });

    container.appendChild(toast);

    // Auto-eliminar en 4 segundos
    setTimeout(() => {
      if (toast.parentElement) {
        toast.classList.add('toast-fade-out');
        toast.addEventListener('animationend', () => toast.remove());
      }
    }, 4000);
  }

  /**
   * Dibuja los skeleton loaders en la pestaña activa durante la carga.
   */
  renderSkeletons() {
    const mainContainer = document.getElementById(this.activeTab);
    if (!mainContainer) return;

    if (this.activeTab === 'groups-view') {
      mainContainer.innerHTML = `
        <h2 class="view-title shimmer-text" style="width: 250px; height: 28px; background: rgba(255,255,255,0.05); border-radius: 4px; margin-bottom: 1.5rem;"></h2>
        <div class="teams-list-tab" style="margin-bottom: 3rem;">
          ${Array(8).fill(0).map(() => `
            <div class="team-display-card skeleton-card">
              <div class="skeleton-shimmer skeleton-flag"></div>
              <div class="team-display-info" style="gap: 6px; width: 100%;">
                <div class="skeleton-shimmer skeleton-line-title"></div>
                <div class="skeleton-shimmer skeleton-line-subtitle"></div>
              </div>
            </div>
          `).join('')}
        </div>
        <h2 class="view-title shimmer-text" style="width: 320px; height: 28px; background: rgba(255,255,255,0.05); border-radius: 4px; margin-bottom: 1.5rem;"></h2>
        <div class="groups-grid">
          ${Array(8).fill(0).map(() => `
            <div class="group-card skeleton-card">
              <div class="skeleton-shimmer skeleton-header-bar" style="height: 24px; margin-bottom: 1rem;"></div>
              <div class="skeleton-shimmer skeleton-table-body" style="height: 140px;"></div>
            </div>
          `).join('')}
        </div>
      `;
    } else if (this.activeTab === 'fixture-view') {
      mainContainer.innerHTML = `
        <div class="filters-bar skeleton-card" style="height: 60px; margin-bottom: 1.5rem;">
          <div class="skeleton-shimmer" style="width: 100%; height: 100%; border-radius: 8px;"></div>
        </div>
        <div class="matches-list">
          ${Array(6).fill(0).map(() => `
            <div class="match-card skeleton-card" style="height: 140px;">
              <div class="skeleton-shimmer skeleton-match-top" style="height: 20px; margin-bottom: 1rem; border-radius: 4px;"></div>
              <div class="skeleton-shimmer skeleton-match-mid" style="height: 40px; margin-bottom: 1rem; border-radius: 4px;"></div>
              <div class="skeleton-shimmer skeleton-match-bot" style="height: 24px; border-radius: 4px;"></div>
            </div>
          `).join('')}
        </div>
      `;
    } else if (this.activeTab === 'bracket-view') {
      mainContainer.innerHTML = `
        <div class="bracket-container">
          ${Array(4).fill(0).map(() => `
            <div class="bracket-round">
              <div class="skeleton-shimmer" style="margin: 0 auto 1.25rem auto; width: 120px; height: 18px; border-radius: 4px;"></div>
              ${Array(2).fill(0).map(() => `
                <div class="bracket-match-wrapper">
                  <div class="bracket-match skeleton-card" style="height: 90px; width: 240px; border-radius: 12px; padding: 0.75rem;">
                    <div class="skeleton-shimmer" style="height: 12px; width: 60px; margin-bottom: 8px; border-radius: 2px;"></div>
                    <div class="skeleton-shimmer" style="height: 16px; width: 100%; margin-bottom: 6px; border-radius: 3px;"></div>
                    <div class="skeleton-shimmer" style="height: 16px; width: 100%; border-radius: 3px;"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          `).join('')}
        </div>
      `;
    }
  }

  /**
   * Simula aleatoriamente los resultados que siguen pendientes.
   */
  simulatePendingMatches() {
    this.isSimulating = true;
    this.renderSkeletons();

    // Pequeño delay de 800ms para visualizar el skeleton shimmer loader (SaaS style)
    setTimeout(() => {
      // 1. Simular Fase de Grupos
      this.groupMatches.forEach(m => {
        const isPlayed = m.homeScore !== null && m.homeScore !== undefined;
        if (!isPlayed) {
          const hs = Math.floor(Math.random() * 4); // 0 a 3
          const as = Math.floor(Math.random() * 4); // 0 a 3
          m.homeScore = hs;
          m.awayScore = as;
          m.scorers = [];
          m.assists = [];

          // Generar goleadores y asistentes de local
          const homeTeamObj = teams.find(t => t.id === m.home);
          if (homeTeamObj && homeTeamObj.players) {
            for (let i = 0; i < hs; i++) {
              const p = homeTeamObj.players[Math.floor(Math.random() * homeTeamObj.players.length)];
              m.scorers.push({ team: m.home, player: p });
              if (Math.random() < 0.65) {
                const possibleAssisters = homeTeamObj.players.filter(x => x !== p);
                const assister = possibleAssisters[Math.floor(Math.random() * possibleAssisters.length)];
                m.assists.push({ team: m.home, player: assister });
              }
            }
          }

          // Generar goleadores y asistentes de visitante
          const awayTeamObj = teams.find(t => t.id === m.away);
          if (awayTeamObj && awayTeamObj.players) {
            for (let i = 0; i < as; i++) {
              const p = awayTeamObj.players[Math.floor(Math.random() * awayTeamObj.players.length)];
              m.scorers.push({ team: m.away, player: p });
              if (Math.random() < 0.65) {
                const possibleAssisters = awayTeamObj.players.filter(x => x !== p);
                const assister = possibleAssisters[Math.floor(Math.random() * possibleAssisters.length)];
                m.assists.push({ team: m.away, player: assister });
              }
            }
          }
        }
      });

      // 2. Simular Playoffs en cascada sucesiva (ronda tras ronda)
      let simulatedAny = true;
      while (simulatedAny) {
        simulatedAny = false;

        // Recalcular posiciones y propagar equipos en llaves
        const groupTables = {};
        const groupNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        groupNames.forEach(g => {
          groupTables[g] = calculateGroupTable(g, teams, this.groupMatches);
        });
        propagateBracket(this.playoffMatches, groupTables, this.groupMatches);

        // Buscar el primer partido con contrincantes listos que no se haya jugado
        const pendingPlayoff = this.playoffMatches.find(
          m => m.home !== null && m.away !== null && m.homeScore === null
        );

        if (pendingPlayoff) {
          const hs = Math.floor(Math.random() * 4);
          const as = Math.floor(Math.random() * 4);
          pendingPlayoff.homeScore = hs;
          pendingPlayoff.awayScore = as;
          pendingPlayoff.scorers = [];
          pendingPlayoff.assists = [];

          if (hs === as) {
            // Desempate por penales obligatorio
            const homeWins = Math.random() < 0.5;
            const scoreWin = Math.floor(Math.random() * 3) + 4; // 4 a 6
            const scoreLose = scoreWin - (Math.floor(Math.random() * 2) + 1); // menor
            pendingPlayoff.homePenalties = homeWins ? scoreWin : scoreLose;
            pendingPlayoff.awayPenalties = homeWins ? scoreLose : scoreWin;
          } else {
            pendingPlayoff.homePenalties = null;
            pendingPlayoff.awayPenalties = null;
          }

          // Goleadores/asistentes playoffs local
          const homeTeamObj = teams.find(t => t.id === pendingPlayoff.home);
          if (homeTeamObj && homeTeamObj.players) {
            for (let i = 0; i < hs; i++) {
              const p = homeTeamObj.players[Math.floor(Math.random() * homeTeamObj.players.length)];
              pendingPlayoff.scorers.push({ team: pendingPlayoff.home, player: p });
              if (Math.random() < 0.65) {
                const possibleAssisters = homeTeamObj.players.filter(x => x !== p);
                const assister = possibleAssisters[Math.floor(Math.random() * possibleAssisters.length)];
                pendingPlayoff.assists.push({ team: pendingPlayoff.home, player: assister });
              }
            }
          }

          // Goleadores/asistentes playoffs visitante
          const awayTeamObj = teams.find(t => t.id === pendingPlayoff.away);
          if (awayTeamObj && awayTeamObj.players) {
            for (let i = 0; i < as; i++) {
              const p = awayTeamObj.players[Math.floor(Math.random() * awayTeamObj.players.length)];
              pendingPlayoff.scorers.push({ team: pendingPlayoff.away, player: p });
              if (Math.random() < 0.65) {
                const possibleAssisters = awayTeamObj.players.filter(x => x !== p);
                const assister = possibleAssisters[Math.floor(Math.random() * possibleAssisters.length)];
                pendingPlayoff.assists.push({ team: pendingPlayoff.away, player: assister });
              }
            }
          }

          simulatedAny = true;
        }
      }

      this.saveState();
      this.isSimulating = false;
      this.render();
      this.showToast('Partidos simulados con éxito y llaves completadas 🎲', 'success');
    }, 800);
  }

  /**
   * Genera y descarga un reporte visual en formato PDF o Impresión.
   */
  exportTournamentReport() {
    const printContainer = document.getElementById('print-section');
    if (!printContainer) return;

    let html = `
      <div class="print-report">
        <header class="print-header">
          <span class="print-logo-icon">⚽</span>
          <div class="print-header-text">
            <h1>REPORTE OFICIAL DEL MUNDIAL 2026</h1>
            <p class="print-meta">Estudiante: Rodrigo Antunez &bull; Generado el: ${new Date().toLocaleString()}</p>
          </div>
        </header>

        <section class="print-section-content">
          <h2 class="print-section-title">📊 Tablas de Posiciones de Grupos</h2>
          <div class="print-groups-grid">
    `;

    const groupNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    groupNames.forEach(g => {
      const table = calculateGroupTable(g, teams, this.groupMatches);
      html += `
        <div class="print-group-card">
          <h3>Grupo ${g}</h3>
          <table class="print-table">
            <thead>
              <tr>
                <th>Pos</th>
                <th style="text-align: left;">Equipo</th>
                <th>PJ</th>
                <th>PG</th>
                <th>PE</th>
                <th>PP</th>
                <th>GF</th>
                <th>GC</th>
                <th>DG</th>
                <th>PTS</th>
              </tr>
            </thead>
            <tbody>
      `;
      table.forEach((row, i) => {
        const teamObj = teams.find(t => t.id === row.id);
        const flag = teamObj ? teamObj.flag : '';
        const isQualifying = i < 2;
        html += `
          <tr class="${isQualifying ? 'print-qualifying' : ''}">
            <td style="font-weight: bold;">${i + 1}</td>
            <td style="text-align: left; font-weight: 500;">
              ${flag ? `<img src="${flag}" class="flag-img" style="width: 16px; height: 11px; margin-right: 4px; vertical-align: middle;">` : ''}
              ${row.name}
            </td>
            <td>${row.pj}</td>
            <td>${row.pg}</td>
            <td>${row.pe}</td>
            <td>${row.pp}</td>
            <td>${row.gf}</td>
            <td>${row.gc}</td>
            <td>${row.dg >= 0 ? `+${row.dg}` : row.dg}</td>
            <td style="font-weight: bold; color: #b45309;">${row.pts}</td>
          </tr>
        `;
      });
      html += `
            </tbody>
          </table>
        </div>
      `;
    });

    html += `
          </div>
        </section>

        <div class="print-page-break"></div>

        <section class="print-section-content">
          <h2 class="print-section-title">🏆 Cuadro de Fase Eliminatoria (Playoffs)</h2>
          <div class="print-playoffs-list">
    `;

    const playoffRounds = {
      'octavos': 'Octavos de Final',
      'cuartos': 'Cuartos de Final',
      'semifinales': 'Semifinales',
      'tercer-puesto': 'Partido por el 3° Puesto',
      'final': 'Gran Final'
    };

    for (const [roundKey, roundName] of Object.entries(playoffRounds)) {
      const matches = this.playoffMatches.filter(m => m.round === roundKey);
      html += `
        <div class="print-round-block">
          <h3 class="print-round-title">${roundName}</h3>
          <div class="print-matches-grid">
      `;
      matches.forEach(m => {
        const homeObj = m.home ? teams.find(t => t.id === m.home) : null;
        const awayObj = m.away ? teams.find(t => t.id === m.away) : null;
        
        const homeName = homeObj ? homeObj.name : m.homePlaceholder;
        const homeFlag = homeObj ? homeObj.flag : '';
        const awayName = awayObj ? awayObj.name : m.awayPlaceholder;
        const awayFlag = awayObj ? awayObj.flag : '';

        const homeScore = m.homeScore !== null ? m.homeScore : '-';
        const awayScore = m.awayScore !== null ? m.awayScore : '-';
        const penalties = m.homePenalties !== null ? `(Pen: ${m.homePenalties}-${m.awayPenalties})` : '';

        const isHomeWinner = m.homeScore !== null && (m.homeScore > m.awayScore || (m.homeScore === m.awayScore && m.homePenalties > m.awayPenalties));
        const isAwayWinner = m.awayScore !== null && (m.awayScore > m.homeScore || (m.homeScore === m.awayScore && m.awayPenalties > m.homePenalties));

        html += `
          <div class="print-match-card">
            <div class="print-match-id">${m.name}</div>
            <div class="print-match-teams">
              <div class="print-match-team ${isHomeWinner ? 'winner' : ''}">
                ${homeFlag ? `<img src="${homeFlag}" class="flag-img" style="width: 14px; height: 10px; margin-right: 4px; vertical-align: middle;">` : ''}
                <span class="team-name">${homeName}</span>
                <span class="score-val">${homeScore}</span>
              </div>
              <div class="print-match-team ${isAwayWinner ? 'winner' : ''}">
                ${awayFlag ? `<img src="${awayFlag}" class="flag-img" style="width: 14px; height: 10px; margin-right: 4px; vertical-align: middle;">` : ''}
                <span class="team-name">${awayName}</span>
                <span class="score-val">${awayScore}</span>
              </div>
            </div>
            ${penalties ? `<div class="print-penalties">${penalties}</div>` : ''}
          </div>
        `;
      });
      html += `
          </div>
        </div>
      `;
    }

    html += `
          </div>
        </section>

        <div class="print-page-break"></div>

        <section class="print-section-content">
          <h2 class="print-section-title">🔥 Líderes de Estadísticas</h2>
          <div class="print-stats-columns">
            
            <div class="print-stats-col">
              <h3>Top Goleadores</h3>
              <table class="print-stats-table">
                <thead>
                  <tr>
                    <th>Pos</th>
                    <th>Jugador</th>
                    <th>Equipo</th>
                    <th style="text-align: right;">Goles</th>
                  </tr>
                </thead>
                <tbody>
    `;

    const topScorers = calculateTopScorers(this.groupMatches, this.playoffMatches);
    if (topScorers.length === 0) {
      html += `<tr><td colspan="4" style="text-align: center; font-style: italic; padding: 1rem;">No hay goles registrados aún.</td></tr>`;
    } else {
      topScorers.slice(0, 10).forEach((item, index) => {
        const teamObj = teams.find(t => t.id === item.team);
        const flag = teamObj ? teamObj.flag : '';
        const teamName = teamObj ? teamObj.name : item.team;
        html += `
          <tr>
            <td style="font-weight: bold; width: 30px;">${index + 1}</td>
            <td style="font-weight: 600;">${item.player}</td>
            <td>
              ${flag ? `<img src="${flag}" class="flag-img" style="width: 14px; height: 10px; margin-right: 4px; vertical-align: middle;">` : ''}
              ${teamName}
            </td>
            <td style="font-weight: bold; text-align: right; color: #2563eb;">${item.count}</td>
          </tr>
        `;
      });
    }

    html += `
                </tbody>
              </table>
            </div>

            <div class="print-stats-col">
              <h3>Top Asistidores</h3>
              <table class="print-stats-table">
                <thead>
                  <tr>
                    <th>Pos</th>
                    <th>Jugador</th>
                    <th>Equipo</th>
                    <th style="text-align: right;">Asistencias</th>
                  </tr>
                </thead>
                <tbody>
    `;

    const topAssists = calculateTopAssists(this.groupMatches, this.playoffMatches);
    if (topAssists.length === 0) {
      html += `<tr><td colspan="4" style="text-align: center; font-style: italic; padding: 1rem;">No hay asistencias registradas aún.</td></tr>`;
    } else {
      topAssists.slice(0, 10).forEach((item, index) => {
        const teamObj = teams.find(t => t.id === item.team);
        const flag = teamObj ? teamObj.flag : '';
        const teamName = teamObj ? teamObj.name : item.team;
        html += `
          <tr>
            <td style="font-weight: bold; width: 30px;">${index + 1}</td>
            <td style="font-weight: 600;">${item.player}</td>
            <td>
              ${flag ? `<img src="${flag}" class="flag-img" style="width: 14px; height: 10px; margin-right: 4px; vertical-align: middle;">` : ''}
              ${teamName}
            </td>
            <td style="font-weight: bold; text-align: right; color: #059669;">${item.count}</td>
          </tr>
        `;
      });
    }

    html += `
                </tbody>
              </table>
            </div>

          </div>
        </section>

      </div>
    `;

    printContainer.innerHTML = html;
    window.print();
    
    // Limpiamos el DOM 3 segundos después para no interrumpir la generación del PDF
    setTimeout(() => {
      printContainer.innerHTML = '';
    }, 3000);

    this.showToast('Reporte generado en PDF y enviado a impresión 📥', 'success');
  }

  /**
   * Exporta el estado del torneo como archivo JSON descargable.
   */
  exportJSON() {
    const state = { groupMatches: this.groupMatches, playoffMatches: this.playoffMatches };
    const json = JSON.stringify(state, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fixture_mundial_2026_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('Estado del torneo exportado como JSON 💾', 'success');
  }

  /**
   * Importa el estado del torneo desde un archivo JSON.
   */
  importJSON(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!parsed.groupMatches || !parsed.playoffMatches) throw new Error('Formato inválido');
        this.groupMatches = parsed.groupMatches;
        this.playoffMatches = parsed.playoffMatches;
        this.saveState();
        this.render();
        this.showToast('Estado del torneo importado correctamente ✅', 'success');
      } catch (err) {
        this.showToast('Error al importar: archivo JSON inválido ❌', 'error');
      }
      // Reset input para permitir reimportar el mismo archivo
      event.target.value = '';
    };
    reader.readAsText(file);
  }

  /**
   * Guarda el resultado cargado por el modal y recalcula el torneo.
   */
  saveMatchResult(matchId, scoreData) {
    let match = null;

    if (matchId <= 48) {
      // Fase de grupos
      match = this.groupMatches.find(m => m.id === matchId);
    } else {
      // Playoffs
      match = this.playoffMatches.find(m => m.id === matchId);
    }

    if (match) {
      match.homeScore = scoreData.homeScore;
      match.awayScore = scoreData.awayScore;
      match.homePenalties = scoreData.homePenalties;
      match.awayPenalties = scoreData.awayPenalties;
      match.scorers = scoreData.scorers;
      match.assists = scoreData.assists;

      this.saveState();
      this.render();

      this.showToast(`Partido ${matchId} actualizado: ${scoreData.homeScore} - ${scoreData.awayScore} ⚽`, 'success');
    }
  }

  /**
   * Recalcula posiciones, propaga llaves y dibuja la interfaz.
   */
  render() {
    if (this.isSimulating) return;

    // 1. Recalcular posiciones de grupos
    const groupTables = {};
    const groupNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    groupNames.forEach(g => {
      groupTables[g] = calculateGroupTable(g, teams, this.groupMatches);
    });

    // 2. Propagar resultados en cascada
    propagateBracket(this.playoffMatches, groupTables, this.groupMatches);
    this.saveState();

    // 3. Renderizar resumen del torneo
    this.renderSummary();

    // 4. Renderizar la vista activa
    const mainContainer = document.getElementById(this.activeTab);
    if (this.activeTab === 'groups-view') {
      renderGroupsView(mainContainer, teams, this.groupMatches);
    } else if (this.activeTab === 'fixture-view') {
      renderFixtureView(mainContainer, this.groupMatches, (m) => this.scoreForm.open(m));
    } else if (this.activeTab === 'bracket-view') {
      renderBracketView(mainContainer, this.playoffMatches, (m) => this.scoreForm.open(m));
    }

    // 5. Actualizar sidebar
    this.renderStatsSidebar();
    this.renderNextMatches();
  }

  /**
   * Renderiza el scorecard de resumen del torneo.
   */
  renderSummary() {
    const playedGroup = this.groupMatches.filter(m => m.homeScore !== null && m.homeScore !== undefined).length;
    const totalGroup = this.groupMatches.length;
    const playedPlayoff = this.playoffMatches.filter(m => m.homeScore !== null && m.homeScore !== undefined).length;
    const totalPlayed = playedGroup + playedPlayoff;
    const totalMatches = totalGroup + this.playoffMatches.length;
    const pct = Math.round((totalPlayed / totalMatches) * 100);

    const totalGoals = [
      ...this.groupMatches.filter(m => m.homeScore !== null),
      ...this.playoffMatches.filter(m => m.homeScore !== null)
    ].reduce((sum, m) => sum + (m.homeScore || 0) + (m.awayScore || 0), 0);

    // Determinar fase actual
    let phase = 'Fase de Grupos';
    if (playedGroup === totalGroup) {
      const playedOctavos = this.playoffMatches.filter(m => m.round === 'octavos' && m.homeScore !== null).length;
      const playedCuartos = this.playoffMatches.filter(m => m.round === 'cuartos' && m.homeScore !== null).length;
      const playedSemis = this.playoffMatches.filter(m => m.round === 'semifinales' && m.homeScore !== null).length;
      const playedFinal = this.playoffMatches.filter(m => m.round === 'final' && m.homeScore !== null).length;
      if (playedFinal > 0) phase = '🏆 Finalizado';
      else if (playedSemis > 0) phase = 'Final / 3er Puesto';
      else if (playedCuartos > 0) phase = 'Semifinales';
      else if (playedOctavos > 0) phase = 'Cuartos de Final';
      else phase = 'Octavos de Final';
    }

    const elPlayed = document.getElementById('summary-played');
    const elGoals = document.getElementById('summary-goals');
    const elPct = document.getElementById('summary-pct');
    const elPhase = document.getElementById('summary-phase');
    const elBar = document.getElementById('summary-progress-bar');

    if (elPlayed) elPlayed.textContent = `${totalPlayed}/${totalMatches}`;
    if (elGoals) elGoals.textContent = totalGoals;
    if (elPct) elPct.textContent = `${pct}%`;
    if (elPhase) elPhase.textContent = phase;
    if (elBar) elBar.style.width = `${pct}%`;
  }

  /**
   * Renderiza el widget de próximos partidos en el sidebar.
   */
  renderNextMatches() {
    const container = document.getElementById('next-matches-list');
    if (!container) return;

    const allMatches = [
      ...this.groupMatches.map(m => ({ ...m, isPlayoff: false })),
      ...this.playoffMatches.map(m => ({ ...m, isPlayoff: true }))
    ];

    const pending = allMatches
      .filter(m => (m.homeScore === null || m.homeScore === undefined) && m.home && m.away)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 3);

    if (pending.length === 0) {
      container.innerHTML = `<div class="stats-empty">🏁 Todos los partidos finalizados</div>`;
      return;
    }

    container.innerHTML = pending.map(m => {
      const homeTeam = teams.find(t => t.id === m.home);
      const awayTeam = teams.find(t => t.id === m.away);
      const date = new Date(m.date);
      const label = m.isPlayoff ? (m.name || 'Playoff') : `Grupo ${m.group}`;
      const dateStr = date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
      const timeStr = date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });

      return `
        <div class="next-match-item">
          <div class="next-match-header">
            <span class="next-match-label">${label}</span>
            <span class="next-match-date">📅 ${dateStr} ${timeStr}</span>
          </div>
          <div class="next-match-teams">
            <span class="next-match-team">
              ${homeTeam ? `<img src="${homeTeam.flag}" class="flag-img" alt="">` : ''}
              ${homeTeam ? homeTeam.name : m.homePlaceholder || '?'}
            </span>
            <span class="next-match-vs">VS</span>
            <span class="next-match-team">
              ${awayTeam ? `<img src="${awayTeam.flag}" class="flag-img" alt="">` : ''}
              ${awayTeam ? awayTeam.name : m.awayPlaceholder || '?'}
            </span>
          </div>
        </div>
      `;
    }).join('');
  }

  renderStatsSidebar() {
    const scorersContainer = document.getElementById('top-scorers-list');
    const assistsContainer = document.getElementById('top-assists-list');

    const topScorers = calculateTopScorers(this.groupMatches, this.playoffMatches);
    const topAssists = calculateTopAssists(this.groupMatches, this.playoffMatches);

    // Guardar datos para el buscador
    this._topScorers = topScorers;
    this._topAssists = topAssists;

    this.renderFilteredStats('scorers', '');
    this.renderFilteredStats('assists', '');
  }

  /**
   * Renderiza goleadores o asistidores filtrados por texto de búsqueda.
   */
  renderFilteredStats(type, query) {
    const isScorers = type === 'scorers';
    const container = document.getElementById(isScorers ? 'top-scorers-list' : 'top-assists-list');
    if (!container) return;

    const data = (isScorers ? this._topScorers : this._topAssists) || [];
    const filtered = query
      ? data.filter(item => item.player.toLowerCase().includes(query.toLowerCase()) ||
          (teams.find(t => t.id === item.team)?.name || '').toLowerCase().includes(query.toLowerCase()))
      : data;

    if (filtered.length === 0) {
      container.innerHTML = `<div class="stats-empty">${query ? '🔍 Sin resultados para "' + query + '"' : (isScorers ? '⚽ No hay goles registrados aún.' : '👟 No hay asistencias registradas aún.')}</div>`;
      return;
    }

    container.innerHTML = filtered.map((item, index) => {
      const teamObj = teams.find(t => t.id === item.team);
      const flag = teamObj ? teamObj.flag : '';
      const teamName = teamObj ? teamObj.name : item.team;
      let medal = '';
      if (!query) {
        if (index === 0) medal = '🥇 ';
        else if (index === 1) medal = '🥈 ';
        else if (index === 2) medal = '🥉 ';
      }
      const countLabel = isScorers
        ? `${item.count} ${item.count === 1 ? 'gol' : 'goles'}`
        : `${item.count} ${item.count === 1 ? 'asistencia' : 'asistencias'}`;
      return `
        <div class="stats-item bounce-in" style="animation-delay: ${index * 40}ms">
          <div class="stats-player-info">
            <span class="stats-player-name">${medal}${item.player}</span>
            <span class="stats-player-team">${flag ? `<img src="${flag}" class="flag-img" alt="${teamName}">` : ''} ${teamName}</span>
          </div>
          <span class="stats-count">${countLabel}</span>
        </div>
      `;
    }).join('');
  }
}

// Iniciar aplicación
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.start();
});
