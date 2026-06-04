# Trabajo Final Integrador — Fixture del Mundial 2026 ⚽

Este es el proyecto del **Fixture del Mundial de fútbol 2026 en Tiempo Real** para la materia **Programación III** de la **Tecnicatura en Programación**.

## 👤 Integrante
- **Nombre:** Rodrigo Antunez
- **Legajo:** 63788

---

## 🚀 Descripción del Proyecto
La aplicación es una Single Page Application (SPA) que permite visualizar y actualizar de forma dinámica los resultados y estadísticas del Mundial de fútbol 2026. La app gestiona la progresión completa del torneo desde la fase de grupos hasta la gran final en tiempo real.

### Características Principales:
1. **Lista de Equipos**: Vista completa de las 32 selecciones del Mundial 2026 organizadas en un grid card premium con las banderas oficiales de cada país.
2. **Fase de Grupos**: Tablas de posiciones interactivas que recalculan al instante (puntos, diferencia de gol, goles a favor, etc.) y aplican el orden oficial de desempate FIFA:
   - Mayor cantidad de puntos.
   - Mayor diferencia de goles.
   - Mayor cantidad de goles a favor.
   - Resultado del enfrentamiento directo.
   - Orden alfabético como criterio de desempate por defecto.
3. **Fase Eliminatoria (Playoffs)**: Bracket clásico en forma de árbol que conecta desde los Octavos de Final hasta la Final y Tercer Puesto. Los clasificados se definen y propagan de manera automática al completarse cada grupo.
4. **Fixture Interactivo**: Carga rápida de marcadores con opción de registrar penales en caso de empate en playoffs.
5. **Estadísticas de Goleadores y Asistidores**: Registro en tiempo real de los goleadores y asistidores de cada encuentro. Los tops se actualizan instantáneamente en la barra lateral.
6. **Banderas Reales en Windows**: Integración nativa con [FlagCDN](https://flagcdn.com/) para renderizar imágenes reales de las banderas nacionales en formato PNG de alta calidad, solucionando el problema de falta de renderizado de emojis de banderas característico del sistema operativo Windows.
7. **Conversión de Zona Horaria**: Los partidos están precargados en UTC y la aplicación convierte de manera automática la hora programada a la zona horaria del sistema local de quien visualiza el sitio (ej. GMT-3), mostrando explícitamente el desplazamiento horario.
8. **Persistencia Local**: Uso de `LocalStorage` (bajo la clave `tfi_mundial_2026_state`) para garantizar la persistencia de todos los datos ingresados al actualizar o cerrar la pestaña.
9. **Diseño Premium**: Interfaz oscura profesional tipo dashboard deportivo (estilo ESPN/FIFA) con fondo hexagonal, scorecard en tiempo real, navegación mobile con hamburger menu, y diseño 100% responsivo.

---

## 🛠️ Stack Tecnológico
- **HTML5 Semántico**: Para una estructura robusta y accesible.
- **CSS3 Vanilla**: Estilos personalizados, variables de diseño, sombras dinámicas y conectores del bracket de eliminación directa.
- **JavaScript ES Modules (Vanilla)**: Lógica limpia y modular sin dependencias externas pesadas, permitiendo que la aplicación sea sumamente rápida.
- **Vite (v5.x)**: Herramienta de construcción rápida y servidor de desarrollo para soporte nativo de módulos ES.

---

## ⚙️ Guía de Ejecución Rápida en Windows

1. Descarga o clona el repositorio.
2. Navega a la carpeta del proyecto (`Entregas/Rodrigo_Antunez_TFI`).
3. Haz doble click sobre el archivo **`iniciar.bat`**.
   - Este script instalará automáticamente las dependencias de desarrollo (`npm install`), abrirá tu navegador en `http://localhost:5173/` e iniciará el servidor de desarrollo en la terminal.

Si deseas ejecutarlo manualmente:
1. Abre tu terminal de comandos en la carpeta de este proyecto.
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Inicia la app:
   ```bash
   npm run dev
   ```

---

## 🧠 Decisiones de Diseño y Arquitectura

1. **Separación de Responsabilidades**:
   - `src/data/`: Archivos estáticos de datos de equipos y partidos iniciales del Mundial 2026.
   - `src/logic/`: Funciones puras encargadas del cálculo matemático y ordenamiento de posiciones, propagación de playoffs y cálculo de rankings.
   - `src/ui/`: Módulos de renderizado encargados de inyectar contenido dinámico en el DOM de forma reactiva.
   - `src/main.js`: Controlador principal que coordina el flujo de datos, interactúa con el storage y dispara los repintados.
2. **Propagación en Cascada con Reseteo de Seguridad**:
   Para evitar inconsistencias en el torneo, al modificarse el marcador de un partido que altere el orden de los clasificados de un grupo, el bracket de eliminación recalcula a los nuevos contrincantes de forma automática. Si dichos partidos de playoffs ya habían sido jugados con equipos anteriores, los marcadores posteriores se limpian de forma segura para evitar estados lógicos corruptos (ej. que un equipo aparezca jugando sin haber clasificado).
3. **Autocompletado de Jugadores**:
   Para simplificar el registro de estadísticas, cada equipo cuenta con sus jugadores estrella cargados en el código. Al abrir la carga del marcador para un partido específico, la lista de sugerencias de autocompletado nativo (`<datalist>`) se reconfigura para ofrecer únicamente los jugadores de las dos selecciones en juego, optimizando la experiencia del usuario sin sobrecargar de lógica el cliente.
