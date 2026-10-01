// Tests unitarios del mapa de calor
// Ejecutar con: node --test tests/heat-map.test.js

import { test } from "node:test";
import assert from "node:assert";
import {
  esSesionValida,
  getMinutesByDay,
  getNivelColor,
  getDiasRango,
  getSemanas,
  formatTooltip,
} from "../js/heat-map.js";

// ============================================================
// RF-2: Escala de color
// ============================================================

test("getNivelColor devuelve 0 sin sesión", () => {
  assert.equal(getNivelColor(0, false), 0);
  assert.equal(getNivelColor(100, false), 0);
});

test("getNivelColor devuelve 1 para 0-30 min con sesión", () => {
  assert.equal(getNivelColor(0, true), 1);
  assert.equal(getNivelColor(15, true), 1);
  assert.equal(getNivelColor(30, true), 1);
});

test("getNivelColor devuelve 2 para 31-60 min", () => {
  assert.equal(getNivelColor(31, true), 2);
  assert.equal(getNivelColor(45, true), 2);
  assert.equal(getNivelColor(60, true), 2);
});

test("getNivelColor devuelve 3 para 61-120 min", () => {
  assert.equal(getNivelColor(61, true), 3);
  assert.equal(getNivelColor(90, true), 3);
  assert.equal(getNivelColor(120, true), 3);
});

test("getNivelColor devuelve 4 para 121+ min", () => {
  assert.equal(getNivelColor(121, true), 4);
  assert.equal(getNivelColor(500, true), 4);
});

// ============================================================
// RF-1: Minutos por día
// ============================================================

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

test("getMinutesByDay maneja array vacío", () => {
  const hoy = new Date(2026, 8, 30);
  const result = getMinutesByDay([], hoy);
  assert.equal(result.size, 0);
});

// ============================================================
// RF-1: Rango de días
// ============================================================

test("getDiasRango devuelve 84 días", () => {
  const hoy = new Date(2026, 8, 30);
  const dias = getDiasRango(hoy);
  assert.equal(dias.length, 84);
});

test("getDiasRango termina en hoy", () => {
  const hoy = new Date(2026, 8, 30);
  const dias = getDiasRango(hoy);
  const ultimo = dias[dias.length - 1];
  const fechaStr = ultimo.toISOString().split("T")[0];
  assert.equal(fechaStr, "2026-09-30");
});

test("getDiasRango empieza en hoy-83", () => {
  const hoy = new Date(2026, 8, 30);
  const dias = getDiasRango(hoy);
  const primero = dias[0];
  const fechaStr = primero.toISOString().split("T")[0];
  assert.equal(fechaStr, "2026-07-09");
});

// ============================================================
// RF-1: Semanas
// ============================================================

test("getSemanas agrupa en semanas de 7 días", () => {
  const hoy = new Date(2026, 8, 30);
  const dias = getDiasRango(hoy);
  const semanas = getSemanas(dias);
  assert.equal(semanas.length, 13); // 84 días = 12 semanas + 1 día extra
  assert.equal(semanas[0].length, 4); // Jueves a domingo (4 días)
});

test("getSemanas maneja semana incompleta", () => {
  const hoy = new Date(2026, 8, 30); // Miércoles
  const dias = getDiasRango(hoy);
  const semanas = getSemanas(dias);
  const ultimaSemana = semanas[semanas.length - 1];
  assert.equal(ultimaSemana.length, 3); // Lunes a miércoles (3 días)
});

// ============================================================
// RF-3: Tooltip
// ============================================================

test("formatTooltip muestra minutos con sesión", () => {
  const fecha = new Date(2026, 8, 30);
  assert.equal(formatTooltip(fecha, 45, true), "30/09/2026 · 45 min");
});

test("formatTooltip muestra 'Sin sesión' sin sesión", () => {
  const fecha = new Date(2026, 8, 30);
  assert.equal(formatTooltip(fecha, 0, false), "30/09/2026 · Sin sesión");
});

// ============================================================
// CL-6: Año bisiesto
// ============================================================

test("getDiasRango maneja año bisiesto", () => {
  const hoy = new Date(2024, 1, 29); // 29 de febrero de 2024
  const dias = getDiasRango(hoy);
  assert.equal(dias.length, 84);
});

// ============================================================
// CL-10/11/14: Validación de sesiones
// ============================================================

test("esSesionValida rechaza sesión con minutos negativos", () => {
  const session = { date: "2026-09-30", minutes: -5 };
  const hoy = new Date(2026, 8, 30);
  assert.equal(esSesionValida(session, hoy), false);
});

test("esSesionValida rechaza sesión con fecha futura", () => {
  const session = { date: "2026-10-01", minutes: 30 };
  const hoy = new Date(2026, 8, 30);
  assert.equal(esSesionValida(session, hoy), false);
});

test("esSesionValida rechaza sesión con fecha malformada", () => {
  const session = { date: "30-09-2026", minutes: 30 };
  const hoy = new Date(2026, 8, 30);
  assert.equal(esSesionValida(session, hoy), false);
});

test("esSesionValida acepta sesión válida", () => {
  const session = { date: "2026-09-30", minutes: 30 };
  const hoy = new Date(2026, 8, 30);
  assert.equal(esSesionValida(session, hoy), true);
});

test("esSesionValida acepta sesión con 0 minutos", () => {
  const session = { date: "2026-09-30", minutes: 0 };
  const hoy = new Date(2026, 8, 30);
  assert.equal(esSesionValida(session, hoy), true);
});
