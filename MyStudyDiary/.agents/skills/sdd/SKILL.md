# SDD — Spec-Driven Development

Flujo del proyecto: la spec manda. No se escribe código hasta que existen
`spec.md` → `plan.md` → `tasks.md`, y cada requisito nuevo vuelve a la spec
en vez de colarse directo al código.

## Fases y comandos

| Fase | Comando | Agente | Escribe código |
|---|---|---|---|
| 0 | `/sdd-constitution` | plan | no |
| 1 | `/sdd-spec` | plan | no |
| 2 | `/sdd-clarify` | plan | no |
| 3 | `/sdd-plan` | plan | no |
| 4 | `/sdd-tasks` | plan | no |
| 5 | `/sdd-implement` | build | sí, UNA tarea |
| 6 | `/sdd-validate` | build | no |
| — | `/sdd-change` | plan | no |
| — | `/sdd-status` | plan | no |

Regla de oro: fases 0-4 y los auxiliares **piensan**; la 5 **hace** y se para;
la 6 **verifica** sin arreglar. Si te piden algo que contradice esta regla,
dilo en vez de improvisar.

## Convención de carpetas

- `specs/NNN-nombre-corto/`
- `$1` en todos los comandos es ese nombre de carpeta (ej. `002-filtros`).
- La numeración es correlativa y de tres dígitos.

---

## Plantilla: `specs/NNN-nombre/spec.md`

```markdown
# Spec NNN — Título corto

Estado: borrador | en revisión | aprobada | implementada

## Contexto y objetivo
Qué hace la app hoy, qué falta y por qué vale la pena. 2-3 párrafos.

## Usuarios
Quién la usa. Si es uso personal de un único usuario, dilo explícitamente.

## Historias de usuario
1. Como <rol>, quiero <capacidad> para <beneficio>.

## Requisitos funcionales

### RF-1: Nombre corto
Una frase con el QUÉ.
**Criterios de aceptación (EARS):**
- **Cuando** ..., el sistema debe ...
- **Si** ..., el sistema debe ...
- **Mientras** ..., el sistema debe ...

### RF-2: Nombre corto
(ídem)

## Requisitos no funcionales
- **RNF-1: <nombre>.** <criterio verificable>
(usa los números en cascada: RNF-1, RNF-2...)

## Casos límite
- **CL-1: <título>.** <escenario y resultado esperado>
(uno por línea, numerados en cascada)

## Fuera de alcance
- Lo que NO se hace en esta versión. Sé explícito.

## Criterios de finalización
- [ ] Lista verificable de "la spec está cumplida".

## Plan de verificación manual
1. <paso>. <qué mirar exactamente>.
```

### EARS (patrones de criterio)

Cada criterio empieza por una de estas palabras en negrita:

| Patrón | Cuándo |
|---|---|
| **Cuando** evento, el sistema debe... | acción del usuario o de recarga |
| **Si** condición, el sistema debe... | comportamiento condicional |
| **Mientras** estado, el sistema debe... | comportamiento sostenido |
| **Dónde** contexto, el sistema debe... | ubicación en la interfaz |
| **Si no** condición, el sistema debe... | alternativa a un "Si" |

Reglas de redacción:

- Un criterio = un comportamiento verificable. Nada de "y también".
- Sin "debería" ni "sería conveniente": o debe, o no está.
- Cada RF lleva su nombre corto y sus criterios debajo.
- Sin stack, sin nombres de archivo, sin pseudocódigo. Eso es del `plan.md`.

---

## Plantilla: `specs/NNN-nombre/plan.md`

```markdown
# Plan técnico — Título corto (Spec NNN)

## Resumen
2-3 frases: qué archivos se tocan y por qué así.

## Archivos
| Archivo | Acción | Responsabilidad |
|---|---|---|
| `js/x.js` | crear | lógica pura de dominio (sin DOM) |
| `js/script.js` | modificar | conecta dominio con interfaz |
| `tests/x.test.js` | crear | tests de la lógica pura |

## Lógica de dominio (funciones puras)
Cada función con: firma, qué devuelve y qué RF cubre.

- `nombre(params) -> retorno` — qué hace. Cubre RF-N.

Regla: estas funciones NO tocan el DOM ni leen `localStorage`, y reciben
"hoy" como parámetro para que los tests sean deterministas.

## Algoritmo (pseudocódigo)
Lenguaje natural estructurado, paso a paso, para la parte de dominio.

## Interfaz
Qué se pinta, dónde, con qué estados. Incluye el caso vacío y el móvil.

## Decisiones técnicas
| Decisión | Alternativa descartada | Motivo |
|---|---|---|

Una fila por decisión no obvia.

## Estrategia de tests
- Qué se testea con `node --test` (lógica pura).
- Qué se verifica en navegador (DOM, responsive) y cómo.
- Casos límite (CL-N) que van a `tests/x.test.js`.

## Cobertura de RF
| RF | Dónde se implementa | Qué test lo cubre |
|---|---|---|
| RF-1 | ... | ... |
```

---

## Plantilla: `specs/NNN-nombre/tasks.md`

```markdown
# Tareas — Título corto (Spec NNN)

## T1: Nombre de la tarea

**Descripción:** Qué hay que hacer, en 2-4 líneas.
- `función()` — qué hace
- `archivo` — qué cambiar

**RF cubiertos:** RF-1, RF-2
**Tests:** `tests/x.test.js` (N tests)
**Hecho cuando:** <frase verificable, sin "funciona bien">

**Estado:** ⬜ Pendiente

---

## T2: ...
```

Reglas de las tareas:

- Máximo ~10 tareas por spec. Si salen más, divide la spec.
- 20-30 minutos cada una, en orden de dependencia.
- Empieza siempre por la lógica pura y sus tests; el DOM va después.
- "Hecho cuando:" tiene que poder comprobarse leyendo el resultado.
- Marca el checkbox y "Estado" al completarla desde `/sdd-implement`.

---

## Plantilla: `docs/constitution.md`

Máximo 15 líneas. 6 principios, cortos y verificables, uno por línea,
cada uno con su número y cómo se comprueba:

```markdown
# Constitución

1. **<Principio>** — <regla>. Se verifica: <cómo>.
2. ...
```

Cubre: simplicidad del stack, relación spec↔código, separación lógica/interfaz,
política de tests, protección de datos del usuario, e idioma del código y los textos.

---

## Lista de verificación de constitución

Antes de dar por buena cualquier fase:

- [ ] ¿Se ha tocado código antes de que la spec estuviera aprobada?
- [ ] ¿La lógica de dominio quedó separada del DOM y recibe "hoy" como parámetro?
- [ ] ¿Los casos límite de la spec (CL-N) están cubiertos por un test?
- [ ] ¿Se usa `new Date(año, mes - 1, día)` y `getFullYear/getMonth/getDate`, nada de UTC?
- [ ] ¿Se toca `localStorage` sin confirmación del usuario?
- [ ] ¿Los textos de la interfaz y los comentarios están en español?
- [ ] ¿Se ha añadido alguna dependencia?