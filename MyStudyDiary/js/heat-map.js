// Diario de Estudio — Mapa de calor
// Lógica de dominio (funciones puras) + renderizado (único punto de contacto con el DOM)

// ============================================================
// UTILIDADES DE FECHA (locales, nunca UTC)
// ============================================================

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// ============================================================
// FUNCIONES PURAS DE LÓGICA (no tocan el DOM)
// ============================================================

// Verificar que una sesión sea válida para el mapa
function esSesionValida(session, hoy) {
  if (!session || typeof session.date !== "string") return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(session.date)) return false;
  if (typeof session.minutes !== "number" || session.minutes < 0) return false;
  const fecha = parseDateKey(session.date);
  return fecha <= hoy;
}

// Devuelve un Map con clave "YYYY-MM-DD" y valor total de minutos válidos
function getMinutesByDay(sessions, hoy) {
  const minutos = new Map();
  for (const s of sessions) {
    if (!esSesionValida(s, hoy)) continue;
    minutos.set(s.date, (minutos.get(s.date) || 0) + s.minutes);
  }
  return minutos;
}

// Devuelve el nivel de color (0-4) según los minutos y si hay sesión
function getNivelColor(minutos, tieneSesion) {
  if (!tieneSesion) return 0;
  if (minutos <= 30) return 1;
  if (minutos <= 60) return 2;
  if (minutos <= 120) return 3;
  return 4;
}

// Devuelve un array de 84 fechas (Date) desde hoy-83 días hasta hoy
function getDiasRango(hoy) {
  const dias = [];
  for (let i = 83; i >= 0; i--) {
    const d = new Date(hoy);
    d.setDate(d.getDate() - i);
    dias.push(d);
  }
  return dias;
}

// Agrupa las fechas en semanas (lunes a domingo)
function getSemanas(dias) {
  const semanas = [];
  let semanaActual = [];
  for (const dia of dias) {
    const diaSemana = dia.getDay(); // 0 = domingo, 1 = lunes, ...
    if (diaSemana === 1 && semanaActual.length > 0) {
      semanas.push(semanaActual);
      semanaActual = [];
    }
    semanaActual.push(dia);
  }
  if (semanaActual.length > 0) semanas.push(semanaActual);
  return semanas;
}

// Devuelve el texto del tooltip
function formatTooltip(fecha, minutos, tieneSesion) {
  const fechaStr = formatDateKey(fecha).split("-").reverse().join("/");
  return tieneSesion ? `${fechaStr} · ${minutos} min` : `${fechaStr} · Sin sesión`;
}

// Exportar funciones para tests (se ignoran en el navegador)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    esSesionValida,
    getMinutesByDay,
    getNivelColor,
    getDiasRango,
    getSemanas,
    formatTooltip,
  };
}

// ============================================================
// RENDERIZADO (único punto de contacto con el DOM)
// ============================================================

// Inicializar el mapa de calor
function initHeatMap() {
  const sessions = loadSessions();
  const hoy = new Date();
  renderHeatMap(sessions, hoy);
}

// Renderizar el mapa completo
function renderHeatMap(sessions, hoy) {
  const container = document.getElementById("heat-map-container");
  const emptyMessage = document.getElementById("heat-map-empty-message");

  if (!container) return;

  const minutosPorDia = getMinutesByDay(sessions, hoy);
  const dias = getDiasRango(hoy);
  const semanas = getSemanas(dias);

  // Estado vacío
  if (sessions.length === 0) {
    emptyMessage.style.display = "block";
  } else {
    emptyMessage.style.display = "none";
  }

  // Limpiar contenedor
  container.innerHTML = "";

  // Pintar cada semana
  for (const semana of semanas) {
    const columna = document.createElement("div");
    columna.className = "heat-map-week";

    for (let i = 0; i < 7; i++) {
      const dia = semana[i];
      if (!dia) {
        const celdaVacia = document.createElement("div");
        celdaVacia.className = "heat-map-day nivel-0";
        columna.appendChild(celdaVacia);
        continue;
      }

      const dateKey = formatDateKey(dia);
      const minutos = minutosPorDia.get(dateKey) || 0;
      const tieneSesion = minutosPorDia.has(dateKey);
      const nivel = getNivelColor(minutos, tieneSesion);

      const celda = document.createElement("div");
      celda.className = `heat-map-day nivel-${nivel}`;
      celda.setAttribute("data-date", dateKey);
      celda.setAttribute("aria-label", formatTooltip(dia, minutos, tieneSesion));
      celda.setAttribute("tabindex", "0");

      if (dia > hoy) {
        celda.classList.add("future");
      }

      // Eventos de tooltip
      celda.addEventListener("mouseenter", mostrarTooltip);
      celda.addEventListener("mouseleave", ocultarTooltip);
      celda.addEventListener("focus", mostrarTooltip);
      celda.addEventListener("blur", ocultarTooltip);
      celda.addEventListener("touchstart", mostrarTooltip);

      columna.appendChild(celda);
    }

    container.appendChild(columna);
  }
}

// Actualizar el mapa dinámicamente
function updateHeatMap() {
  const sessions = loadSessions();
  const hoy = new Date();
  const minutosPorDia = getMinutesByDay(sessions, hoy);
  const container = document.getElementById("heat-map-container");

  if (!container) return;

  const celdas = container.querySelectorAll(".heat-map-day");
  celdas.forEach((celda) => {
    const dateKey = celda.getAttribute("data-date");
    if (!dateKey) return;

    const minutos = minutosPorDia.get(dateKey) || 0;
    const tieneSesion = minutosPorDia.has(dateKey);
    const nivel = getNivelColor(minutos, tieneSesion);

    celda.className = `heat-map-day nivel-${nivel}`;
    celda.setAttribute("aria-label", formatTooltip(parseDateKey(dateKey), minutos, tieneSesion));
  });
}

// Mostrar tooltip
function mostrarTooltip(event) {
  const celda = event.target;
  const tooltip = document.getElementById("heat-map-tooltip");
  if (!tooltip) return;

  tooltip.textContent = celda.getAttribute("aria-label");
  tooltip.style.display = "block";

  const rect = celda.getBoundingClientRect();
  tooltip.style.left = `${rect.left + window.scrollX}px`;
  tooltip.style.top = `${rect.top + window.scrollY - 30}px`;
}

// Ocultar tooltip
function ocultarTooltip() {
  const tooltip = document.getElementById("heat-map-tooltip");
  if (tooltip) {
    tooltip.style.display = "none";
  }
}
