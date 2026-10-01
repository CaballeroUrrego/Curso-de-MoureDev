# Tareas — Mapa de calor (Spec 001)

## T1: Lógica de dominio pura (funciones sin DOM)

**Descripción:** Implementar las funciones puras de lógica en `js/heat-map.js`:
- `formatDateKey(date)` — formatea fecha a "YYYY-MM-DD"
- `parseDateKey(dateKey)` — parsea "YYYY-MM-DD" a Date
- `esSesionValida(session, hoy)` — valida sesión
- `getMinutesByDay(sessions, hoy)` — suma minutos por día
- `getNivelColor(minutos, tieneSesion)` — devuelve nivel 0-4
- `getDiasRango(hoy)` — devuelve 84 fechas
- `getSemanas(dias)` — agrupa en semanas
- `formatTooltip(fecha, minutos, tieneSesion)` — texto del tooltip

**RF cubiertos:** RF-1, RF-2, RF-3, RNF-5, RNF-7

**Tests:** `tests/heat-map.test.js` (23 tests)

**Estado:** ✅ Completado

---

## T2: Renderizado del mapa en el DOM

**Descripción:** Implementar las funciones de renderizado en `js/heat-map.js`:
- `renderHeatMap(sessions, hoy)` — pinta el mapa completo
- `updateHeatMap()` — actualiza dinámicamente
- `mostrarTooltip(event)` / `ocultarTooltip()` — tooltip
- `initHeatMap()` — inicialización

**RF cubiertos:** RF-1, RF-2, RF-3, RF-4, RF-6

**Tests:** Verificación manual (no hay tests unitarios para DOM)

**Estado:** ✅ Completado

---

## T3: Integración con la interfaz existente

**Descripción:** Conectar el mapa con la interfaz:
- Modificar `index.html` — añadir sección del mapa
- Modificar `css/style.css` — estilos del mapa
- Modificar `js/script.js` — llamadas a `initHeatMap()` y `updateHeatMap()`

**RF cubiertos:** RF-4, RF-5, RNF-4

**Tests:** Verificación manual (17 pasos en spec.md)

**Estado:** ✅ Completado
