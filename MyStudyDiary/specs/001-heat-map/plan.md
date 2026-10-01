# Plan de implementación — Mapa de calor (Spec 001)

## 1. Archivos a crear o modificar

### 1.1 `js/heat-map.js` (nuevo) — **RF-1, RF-2, RF-3, RF-4, RF-6, RF-7, RNF-7**

**Responsabilidad:** Contener toda la lógica de dominio del mapa de calor (funciones puras) y el renderizado del mapa (único punto de contacto con el DOM).

**Contenido:**
- Funciones puras de lógica (sección 2).
- Funciones de renderizado del mapa, tooltip y etiquetas.
- Escuchadores de eventos (hover, focus, touch) para el tooltip.
- Función de inicialización `initHeatMap()`.

### 1.2 `index.html` (modificar) — **RF-5**

**Responsabilidad:** Añadir el contenedor del mapa de calor entre el formulario y la lista de sesiones.

**Cambios:**
- Añadir `<section id="heat-map-section">` con:
  - `<div id="heat-map-container">` (aquí se pinta el mapa).
  - `<div id="heat-map-tooltip">` (tooltip flotante).
  - `<p id="heat-map-empty-message">Aún no hay sesiones registradas</p>` (estado vacío).
- Añadir `<script src="js/heat-map.js"></script>` antes de `js/script.js`.

### 1.3 `css/style.css` (modificar) — **RF-1, RF-2, RF-5, RNF-4**

**Responsabilidad:** Estilos del mapa de calor, tooltip y responsive.

**Cambios:**
- Clases para el contenedor del mapa, celdas y tooltip.
- Colores de los 5 tramos (gris, verde muy claro, verde claro, verde medio, verde intenso).
- Media queries para responsive (320 px).

### 1.4 `js/script.js` (modificar) — **RF-4, RF-6**

**Responsabilidad:** Llamar a `initHeatMap()` al cargar y actualizar el mapa tras registrar, editar o borrar sesiones.

**Cambios:**
- En `DOMContentLoaded`: llamar a `initHeatMap()`.
- En `saveEdit()` y `deleteSession()`: llamar a `updateHeatMap()` después de `renderSessions()`.
- En el submit del formulario: llamar a `updateHeatMap()` después de `renderSessions()`.

### 1.5 `tests/heat-map.test.js` (nuevo) — **RF-1, RF-2, RF-3, RF-4, RF-6, RNF-7**

**Responsabilidad:** Tests unitarios de las funciones puras con `node --test`.

---

## 2. Funciones puras de lógica (con "hoy" como parámetro)

Todas estas funciones van en `js/heat-map.js` y **no tocan el DOM** (RNF-7). Reciben `hoy` como parámetro `Date` para facilitar tests.

### 2.1 `getMinutesByDay(sessions, hoy)` — **RF-1, RF-2, CL-1, CL-10, CL-11, CL-17**

```javascript
// Devuelve un Map con clave "YYYY-MM-DD" y valor total de minutos válidos.
// Ignora sesiones con fecha malformada, minutos negativos o fecha futura.
function getMinutesByDay(sessions, hoy) {
  const minutos = new Map();
  for (const s of sessions) {
    if (!esSesionValida(s, hoy)) continue;
    minutos.set(s.date, (minutos.get(s.date) || 0) + s.minutes);
  }
  return minutos;
}
```

### 2.2 `esSesionValida(session, hoy)` — **CL-10, CL-11, CL-14**

```javascript
// Verifica que la sesión tenga fecha válida "YYYY-MM-DD", minutos >= 0 y fecha <= hoy.
function esSesionValida(session, hoy) {
  if (!session || typeof session.date !== "string") return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(session.date)) return false;
  if (typeof session.minutes !== "number" || session.minutes < 0) return false;
  const fecha = parseDateKey(session.date);
  return fecha <= hoy;
}
```

### 2.3 `getNivelColor(minutos, tieneSesion)` — **RF-2, CL-2**

```javascript
// Devuelve el nivel de color (0-4) según los minutos y si hay sesión.
// 0 = gris (sin sesión), 1 = verde muy claro, 2 = verde claro, 3 = verde medio, 4 = verde intenso.
function getNivelColor(minutos, tieneSesion) {
  if (!tieneSesion) return 0;
  if (minutos <= 30) return 1;
  if (minutos <= 60) return 2;
  if (minutos <= 120) return 3;
  return 4;
}
```

### 2.4 `getDiasRango(hoy)` — **RF-1, CL-6, CL-18**

```javascript
// Devuelve un array de 84 fechas (Date) desde hoy-83 días hasta hoy, en orden cronológico.
function getDiasRango(hoy) {
  const dias = [];
  for (let i = 83; i >= 0; i--) {
    const d = new Date(hoy);
    d.setDate(d.getDate() - i);
    dias.push(d);
  }
  return dias;
}
```

### 2.5 `getSemanas(dias)` — **RF-1, CL-7**

```javascript
// Agrupa las fechas en semanas (lunes a domingo).
// Devuelve un array de semanas, cada semana es un array de 7 fechas (o null para días fuera del rango).
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
```

### 2.6 `formatTooltip(fecha, minutos, tieneSesion)` — **RF-3**

```javascript
// Devuelve el texto del tooltip en formato "DD/MM/YYYY · X min" o "DD/MM/YYYY · Sin sesión".
function formatTooltip(fecha, minutos, tieneSesion) {
  const fechaStr = formatDateKey(fecha).split("-").reverse().join("/");
  return tieneSesion ? `${fechaStr} · ${minutos} min` : `${fechaStr} · Sin sesión`;
}
```

---

## 3. Algoritmo del mapa en pseudocódigo

### 3.1 Renderizado inicial (RF-1, RF-2, RF-6)

```
FUNCION renderHeatMap(sessions, hoy):
  minutosPorDia = getMinutesByDay(sessions, hoy)
  dias = getDiasRango(hoy)
  semanas = getSemanas(dias)
  
  SI sessions.length == 0:
    mostrarMensajeEstadoVacio()
  SINO:
    ocultarMensajeEstadoVacio()
  
  limpiarContenedor()
  PARA CADA semana en semanas:
    pintarSemana(semana, minutosPorDia, hoy)
```

### 3.2 Pintar semana (RF-1, RF-2)

```
FUNCION pintarSemana(semana, minutosPorDia, hoy):
  columna = crearElemento("div", "heat-map-week")
  PARA i = 0 HASTA 6:
    dia = semana[i]
    SI dia == null:
      celda = crearCeldaVacia()
    SINO:
      dateKey = formatDateKey(dia)
      minutos = minutosPorDia.get(dateKey) || 0
      tieneSesion = minutosPorDia.has(dateKey)
      nivel = getNivelColor(minutos, tieneSesion)
      celda = crearCelda(dia, minutos, tieneSesion, nivel, hoy)
    columna.appendChild(celda)
  contenedor.appendChild(columna)
```

### 3.3 Crear celda (RF-1, RF-2, RF-3, RNF-3)

```
FUNCION crearCelda(dia, minutos, tieneSesion, nivel, hoy):
  celda = crearElemento("div", "heat-map-day")
  celda.classList.add("nivel-" + nivel)
  celda.setAttribute("data-date", formatDateKey(dia))
  celda.setAttribute("aria-label", formatTooltip(dia, minutos, tieneSesion))
  celda.setAttribute("tabindex", "0")  // Accesibilidad por teclado
  
  SI dia > hoy:
    celda.classList.add("future")
  
  celda.addEventListener("mouseenter", mostrarTooltip)
  celda.addEventListener("mouseleave", ocultarTooltip)
  celda.addEventListener("focus", mostrarTooltip)
  celda.addEventListener("blur", ocultarTooltip)
  celda.addEventListener("touchstart", mostrarTooltip)  // CL-16
  
  RETURN celda
```

### 3.4 Actualización dinámica (RF-4)

```
FUNCION updateHeatMap(sessions, hoy):
  minutosPorDia = getMinutesByDay(sessions, hoy)
  PARA CADA celda en contenedor:
    dateKey = celda.getAttribute("data-date")
    minutos = minutosPorDia.get(dateKey) || 0
    tieneSesion = minutosPorDia.has(dateKey)
    nivel = getNivelColor(minutos, tieneSesion)
    celda.className = "heat-map-day nivel-" + nivel
    celda.setAttribute("aria-label", formatTooltip(parseDateKey(dateKey), minutos, tieneSesion))
```

---

## 4. Cómo se pinta en la interfaz

### 4.1 Estructura HTML (RF-5)

```html
<section id="heat-map-section" class="mb-5">
  <h2 class="section-title"><i class="fas fa-th"></i> Mapa de calor</h2>
  <div id="heat-map-container"></div>
  <p id="heat-map-empty-message" class="text-muted">Aún no hay sesiones registradas</p>
</section>
```

### 4.2 CSS (RF-1, RF-2, RF-5, RNF-4)

```css
#heat-map-container {
  display: flex;
  gap: 2px;
  overflow-x: auto;
}

.heat-map-week {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.heat-map-day {
  width: 10px;
  height: 10px;
  border-radius: 1px;
  cursor: pointer;
}

.heat-map-day.nivel-0 { background-color: #ebedf0; }
.heat-map-day.nivel-1 { background-color: #9be9a8; }
.heat-map-day.nivel-2 { background-color: #40c463; }
.heat-map-day.nivel-3 { background-color: #30a14e; }
.heat-map-day.nivel-4 { background-color: #216e39; }
.heat-map-day.future { opacity: 0.3; }

#heat-map-tooltip {
  position: absolute;
  background: #333;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  pointer-events: none;
  display: none;
  z-index: 1000;
}

@media (max-width: 320px) {
  .heat-map-day { width: 7px; height: 7px; }
}
```

### 4.3 Tooltip (RF-3)

```javascript
function mostrarTooltip(event) {
  const celda = event.target;
  const tooltip = document.getElementById("heat-map-tooltip");
  tooltip.textContent = celda.getAttribute("aria-label");
  tooltip.style.display = "block";
  posicionarTooltip(celda, tooltip);
}

function ocultarTooltip() {
  document.getElementById("heat-map-tooltip").style.display = "none";
}
```

---

## 5. Decisiones técnicas justificadas

### 5.1 Mapa de días con `Map` en lugar de objeto literal

**Decisión:** Usar `Map` para almacenar minutos por día.

**Justificación:** `Map` es más eficiente para inserciones y consultas frecuentes, y evita problemas con claves que coinciden con propiedades del prototipo (ej. `"constructor"`).

**Alternativa descartada:** Objeto literal `{}` — menos seguro y más lento para este caso de uso.

### 5.2 Renderizado con `createElement` en lugar de `innerHTML`

**Decisión:** Usar `createElement` y `appendChild` para construir el mapa.

**Justificación:** Evita problemas de inyección de código y sigue el patrón existente en `js/script.js` (AGENTS.md).

**Alternativa descartada:** `innerHTML` con template strings — más propenso a errores de escapado y menos seguro.

### 5.3 Tooltip con `position: absolute` y posicionamiento manual

**Decisión:** Tooltip flotante posicionado con JavaScript.

**Justificación:** Más flexible que los tooltips nativos de Bootstrap, y permite posicionamiento preciso sobre la celda.

**Alternativa descartada:** Tooltip de Bootstrap — requiere más configuración y es menos preciso para elementos pequeños.

### 5.4 Funciones puras con `hoy` como parámetro

**Decisión:** Todas las funciones de lógica reciben `hoy` como parámetro.

**Justificación:** Facilita tests unitarios (no dependen de la fecha real) y sigue el principio de funciones puras (RNF-7).

**Alternativa descartada:** Usar `new Date()` dentro de las funciones — imposible de testear de forma determinista.

### 5.5 Actualización dinámica solo de celdas afectadas

**Decisión:** `updateHeatMap()` recalcula todas las celdas (simplicidad) pero solo cambia las que difieren.

**Justificación:** Con 84 días, el coste es despreciable (< 1 ms) y el código es más simple.

**Alternativa descartada:** Calcular solo las celdas afectadas por la sesión editada/borrada — más complejo y propenso a errores.

### 5.6 Colores fijos en CSS en lugar de variables dinámicas

**Decisión:** Definir los 5 colores como clases CSS fijas.

**Justificación:** Más simple y rendible; no requiere cálculo dinámico de colores.

**Alternativa descartada:** Calcular colores dinámicamente con HSL — más flexible pero innecesario para 5 tramos fijos.

---

## 6. Estrategia de tests con `node --test`

### 6.1 Archivo de tests: `tests/heat-map.test.js`

**RF cubiertos:** RF-1, RF-2, RF-3, RF-4, RF-6, RNF-7

### 6.2 Tests unitarios de funciones puras

```javascript
import { test } from "node:test";
import assert from "node:assert";
import {
  getMinutesByDay,
  getNivelColor,
  getDiasRango,
  getSemanas,
  formatTooltip,
  esSesionValida,
} from "../js/heat-map.js";

// RF-2: Escala de color
test("getNivelColor devuelve 0 sin sesión", () => {
  assert.equal(getNivelColor(0, false), 0);
});

test("getNivelColor devuelve 1 para 0-30 min con sesión", () => {
  assert.equal(getNivelColor(0, true), 1);
  assert.equal(getNivelColor(15, true), 1);
  assert.equal(getNivelColor(30, true), 1);
});

test("getNivelColor devuelve 2 para 31-60 min", () => {
  assert.equal(getNivelColor(31, true), 2);
  assert.equal(getNivelColor(60, true), 2);
});

test("getNivelColor devuelve 3 para 61-120 min", () => {
  assert.equal(getNivelColor(61, true), 3);
  assert.equal(getNivelColor(120, true), 3);
});

test("getNivelColor devuelve 4 para 121+ min", () => {
  assert.equal(getNivelColor(121, true), 4);
  assert.equal(getNivelColor(500, true), 4);
});

// RF-1: Minutos por día
test("getMinutesByDay suma minutos del mismo día", () => {
  const sessions = [
    { date: "2026-09-30", minutes: 20 },
    { date: "2026-09-30", minutes: 40 },
  ];
  const hoy = new Date(2026, 8, 30);
  const result = getMinutesByDay(sessions, hoy);
  assert.equal(result.get("2026-09-30"), 60);
});

test("getMinutesByDay ignora sesiones con minutos negativos", () => {
  const sessions = [{ date: "2026-09-30", minutes: -10 }];
  const hoy = new Date(2026, 8, 30);
  const result = getMinutesByDay(sessions, hoy);
  assert.equal(result.size, 0);
});

test("getMinutesByDay ignora sesiones con fecha futura", () => {
  const sessions = [{ date: "2026-10-01", minutes: 30 }];
  const hoy = new Date(2026, 8, 30);
  const result = getMinutesByDay(sessions, hoy);
  assert.equal(result.size, 0);
});

test("getMinutesByDay ignora sesiones con fecha malformada", () => {
  const sessions = [{ date: "30-09-2026", minutes: 30 }];
  const hoy = new Date(2026, 8, 30);
  const result = getMinutesByDay(sessions, hoy);
  assert.equal(result.size, 0);
});

// RF-1: Rango de días
test("getDiasRango devuelve 84 días", () => {
  const hoy = new Date(2026, 8, 30);
  const dias = getDiasRango(hoy);
  assert.equal(dias.length, 84);
});

test("getDiasRango termina en hoy", () => {
  const hoy = new Date(2026, 8, 30);
  const dias = getDiasRango(hoy);
  const ultimo = dias[dias.length - 1];
  assert.equal(formatDateKey(ultimo), "2026-09-30");
});

// RF-1: Semanas
test("getSemanas agrupa en semanas de 7 días", () => {
  const hoy = new Date(2026, 8, 30);
  const dias = getDiasRango(hoy);
  const semanas = getSemanas(dias);
  assert.equal(semanas.length, 12);
  assert.equal(semanas[0].length, 7);
});

// RF-3: Tooltip
test("formatTooltip muestra minutos con sesión", () => {
  const fecha = new Date(2026, 8, 30);
  assert.equal(formatTooltip(fecha, 45, true), "30/09/2026 · 45 min");
});

test("formatTooltip muestra 'Sin sesión' sin sesión", () => {
  const fecha = new Date(2026, 8, 30);
  assert.equal(formatTooltip(fecha, 0, false), "30/09/2026 · Sin sesión");
});

// CL-6: Año bisiesto
test("getDiasRango maneja año bisiesto", () => {
  const hoy = new Date(2024, 1, 29); // 29 de febrero de 2024
  const dias = getDiasRango(hoy);
  assert.equal(dias.length, 84);
});
```

### 6.3 Ejecución de tests

```bash
node --test tests/heat-map.test.js
```

**Nota:** `js/heat-map.js` debe incluir `export` en las funciones puras para que `node --test` pueda importarlas. En el navegador, los `exports` se ignoran (no afectan al funcionamiento).

### 6.4 Cobertura de RF por tests

| RF | Tests |
|----|-------|
| RF-1 | `getMinutesByDay`, `getDiasRango`, `getSemanas` |
| RF-2 | `getNivelColor` (5 tramos) |
| RF-3 | `formatTooltip` |
| RF-4 | `updateHeatMap` (tests de integración manual) |
| RF-6 | `getMinutesByDay` con array vacío |
| RNF-7 | Todas las funciones son puras (no tocan DOM) |

---

## 7. Resumen de cobertura de RF

| RF | Archivo | Función/Sección |
|----|---------|-----------------|
| RF-1 | `js/heat-map.js` | `getMinutesByDay`, `getDiasRango`, `getSemanas`, `renderHeatMap` |
| RF-2 | `js/heat-map.js` | `getNivelColor` |
| RF-3 | `js/heat-map.js` | `formatTooltip`, `mostrarTooltip`, `ocultarTooltip` |
| RF-4 | `js/script.js` | Llamadas a `updateHeatMap()` en submit, edit y delete |
| RF-5 | `index.html` | `<section id="heat-map-section">` entre formulario y lista |
| RF-6 | `js/heat-map.js` | `renderHeatMap` con mensaje de estado vacío |
| RF-7 | — | Eliminado en la revisión (diseño minimalista) |
| RNF-1 | — | Solo HTML, CSS, JS vanilla |
| RNF-2 | `js/heat-map.js` | Algoritmo O(n) con n = 84 días |
| RNF-3 | `js/heat-map.js` | `aria-label`, `tabindex`, eventos de focus |
| RNF-4 | `css/style.css` | Media queries para 320 px |
| RNF-5 | `js/heat-map.js` | `formatDateKey`, `parseDateKey` (hora local) |
| RNF-6 | `js/script.js` | `loadSessions()` desde localStorage |
| RNF-7 | `js/heat-map.js` | Funciones puras separadas del DOM |
