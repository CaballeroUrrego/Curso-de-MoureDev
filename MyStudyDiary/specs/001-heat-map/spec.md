# Spec 001 — Mapa de calor de estudio

## Contexto y objetivo

El Diario de Estudio registra sesiones con fecha, tema y minutos. Actualmente la información se muestra como una lista cronológica y una tarjeta de racha. El usuario carece de una vista agregada que le permita ver de un vistazo su constancia a lo largo de las semanas.

El objetivo de esta funcionalidad es añadir un **mapa de calor tipo GitHub** que muestre los días estudiados de las últimas 12 semanas, donde la intensidad del color verde refleja la cantidad de minutos estudiados ese día. Esto refuerza la motivación al hacer visible el esfuerzo acumulado.

Esta spec sigue los principios de `docs/constitution.md`: lógica separada de interfaz, verificación manual ejecutable con doble clic, y español en todas partes.

## Usuarios

- **Estudiante autodidacta** (usuario único, uso personal): registra sesiones de estudio diarias y quiere visualizar su constancia sin esfuerzo.
- No hay múltiples roles ni cuentas. Todo es local en el navegador del usuario.

## Historias de usuario

1. Como estudiante, quiero ver un mapa de calor de las últimas 12 semanas para identificar rápidamente qué días estudié y cuáles no.
2. Como estudiante, quiero que el color de cada día refleje los minutos estudiados para comparar visualmente mi esfuerzo entre días.
3. Como estudiante, quiero pasar el ratón sobre un día para ver la fecha exacta y los minutos registrados.
4. Como estudiante, quiero que el mapa se actualice automáticamente al registrar, editar o borrar una sesión sin recargar la página.

## Requisitos funcionales

### RF-1: Renderizado del mapa de calor
El sistema debe renderizar un mapa de calor con las últimas 12 semanas (84 días exactos, contando hacia atrás desde hoy), organizado en columnas por semana y filas por día de la semana (lunes a domingo). Los días futuros dentro de la semana actual se muestran en gris.

**Criterios de aceptación (EARS):**
- **Cuando** la página carga, el sistema debe mostrar el mapa de calor con las últimas 12 semanas (84 días hacia atrás desde hoy).
- **Si** una fecha no tiene sesión registrada, el sistema debe mostrar el día en color gris claro (fondo neutro).
- **Si** una fecha tiene al menos una sesión, el sistema debe mostrar el día en un color verde según el tramo de minutos (ver RF-2).
- **Si** un día es futuro (posterior a hoy), el sistema debe mostrarlo en gris claro.

### RF-2: Escala de color por tramos
El sistema debe aplicar 5 niveles de color según los minutos totales estudiados en el día:

| Tramo (minutos) | Color | Condición |
|-----------------|-------|-----------|
| 0 | Gris claro | Sin sesión registrada |
| 0 – 30 | Verde muy claro | Con sesión (incluye 0 minutos si hay sesión) |
| 31 – 60 | Verde claro | Con sesión |
| 61 – 120 | Verde medio | Con sesión |
| 121+ | Verde intenso | Con sesión |

**Criterios de aceptación (EARS):**
- **Si** el día no tiene ninguna sesión, el sistema debe aplicar gris claro.
- **Si** el día tiene al menos una sesión y el total de minutos está entre 0 y 30, el sistema debe aplicar verde muy claro.
- **Si** el total de minutos del día está entre 31 y 60, el sistema debe aplicar verde claro.
- **Si** el total de minutos del día está entre 61 y 120, el sistema debe aplicar verde medio.
- **Si** el total de minutos del día es 121 o más, el sistema debe aplicar verde intenso.
- **Si** un día tiene múltiples sesiones, el sistema debe sumar los minutos de todas las sesiones antes de asignar el color.

### RF-3: Tooltip al pasar el ratón o con foco
El sistema debe mostrar un tooltip al pasar el ratón sobre cualquier día del mapa o al recibir el foco por teclado.

**Criterios de aceptación (EARS):**
- **Cuando** el usuario pasa el ratón sobre un día o lo enfoca con teclado, el sistema debe mostrar un tooltip con la fecha en formato `DD/MM/YYYY` y los minutos en formato `X min` (o "Sin sesión" si no hay registro).
- **Cuando** el usuario retira el ratón del día o el foco, el sistema debe ocultar el tooltip.
- **Mientras** el usuario mueve el ratón entre días, el sistema debe actualizar el contenido del tooltip sin parpadeos.

### RF-4: Actualización dinámica
El sistema debe actualizar el mapa de calor automáticamente cuando se registra, edita o borra una sesión.

**Criterios de aceptación (EARS):**
- **Cuando** el usuario registra una nueva sesión, el sistema debe recalcular el color del día correspondiente sin recargar la página.
- **Cuando** el usuario edita una sesión (cambiando fecha o minutos), el sistema debe recalcular el color del día origen y el día destino sin recargar.
- **Cuando** el usuario borra una sesión, el sistema debe recalcular el color del día correspondiente sin recargar.
- **Si** la sesión afectada corresponde a una fecha dentro de las últimas 12 semanas, el sistema debe actualizar ese día en el mapa.
- **Si** la sesión afectada corresponde a una fecha fuera del rango de 12 semanas, el sistema no debe modificar el mapa.

### RF-5: Ubicación en la página
El sistema debe mostrar el mapa de calor en la sección principal de la página, debajo del formulario de nueva sesión y encima de la lista de sesiones.

**Criterios de aceptación (EARS):**
- **Cuando** la página carga, el sistema debe mostrar el mapa de calor entre el formulario y la lista de sesiones.
- **Si** la pantalla es estrecha (móvil), el sistema debe comprimir el mapa para que sea legible sin scroll horizontal.

### RF-6: Estado vacío
El sistema debe mostrar un mensaje alternativo cuando no hay sesiones registradas.

**Criterios de aceptación (EARS):**
- **Si** no hay ninguna sesión registrada en localStorage, el sistema debe mostrar el mapa con todos los días en gris y un texto indicando "Aún no hay sesiones registradas".
- **Cuando** el usuario registra su primera sesión, el sistema debe ocultar el mensaje de estado vacío y mostrar el mapa normal.
- **Si** hay sesiones pero ninguna en las últimas 12 semanas, el sistema debe mostrar el mapa todo en gris sin mensaje especial.

### RF-7: Etiquetas de mes y día
El sistema debe mostrar etiquetas de mes en la parte superior del mapa y etiquetas de día de la semana (L, M, X, J, V, S, D) en el lado izquierdo.

**Criterios de aceptación (EARS):**
- **Cuando** la página carga, el sistema debe mostrar las etiquetas de mes correspondientes a las semanas visibles.
- **Cuando** la página carga, el sistema debe mostrar las etiquetas de día de la semana en español.

## Requisitos no funcionales

- **RNF-1: Sin dependencias nuevas.** Solo HTML, CSS y JS vanilla. No se añaden librerías ni frameworks.
- **RNF-2: Rendimiento.** El mapa debe renderizarse en menos de 100 ms con hasta 500 sesiones registradas en un dispositivo de gama media (ej. móvil de 2020 o superior).
- **RNF-3: Accesibilidad.** Cada día debe tener un atributo `aria-label` con la fecha y los minutos. El tooltip debe ser accesible por teclado (focus).
- **RNF-4: Responsive.** El mapa debe adaptarse a pantallas de 320 px de ancho sin scroll horizontal.
- **RNF-5: Fechas locales.** Todos los cálculos de fecha deben usar hora local del usuario (nunca UTC).
- **RNF-6: Persistencia.** El mapa se renderiza a partir de los datos en localStorage con clave `study-sessions`. No requiere recarga para reflejar cambios (registrar, editar o borrar).
- **RNF-7: Separación lógica/UI.** El cálculo de minutos por día y la asignación de color deben ser funciones de dominio separadas del DOM, siguiendo la constitución 3.

## Casos límite

- **CL-1: Día con múltiples sesiones.** Si un día tiene 3 sesiones de 20 min cada una, el total es 60 min → verde claro.
- **CL-2: Sesión de 0 minutos.** Si una sesión tiene 0 minutos, el día cuenta como estudiado (tiene sesión) → verde muy claro (tramo 0–30 con sesión).
- **CL-3: Fecha futura.** Los días futuros dentro de las 12 semanas se muestran en gris (no hay sesión posible).
- **CL-4: Cambio de zona horaria.** Si el usuario cambia de zona horaria, el mapa debe seguir mostrando las fechas registradas sin desplazamientos.
- **CL-5: Datos corruptos en localStorage.** Si `study-sessions` contiene objetos inválidos, el sistema debe ignorarlos y renderizar el mapa con los días válidos.
- **CL-6: Año bisiesto.** El mapa debe manejar correctamente el 29 de febrero en años bisiestos.
- **CL-7: Primera semana incompleta.** Si hoy es miércoles, la primera columna (semana actual) solo tiene 3 días con datos; los días futuros se muestran en gris.
- **CL-8: Edición de fecha.** Si el usuario edita una sesión y la mueve a otra fecha dentro del rango, el sistema debe actualizar el color del día origen y el día destino.
- **CL-9: Borrado de sesión.** Si el usuario borra la única sesión de un día, el sistema debe recalcular ese día a gris.
- **CL-10: Minutos negativos en localStorage.** Si una sesión tiene minutos negativos, el sistema debe ignorarla en el cálculo del mapa.
- **CL-11: Fecha malformada en localStorage.** Si `s.date` no es un string válido `YYYY-MM-DD`, el sistema debe ignorar esa sesión.
- **CL-12: Horario de verano (DST).** Los cálculos de fecha deben ser robustos ante cambios de horario de verano.
- **CL-13: Cambio de reloj del sistema.** Si el usuario cambia la fecha del sistema, el mapa debe recalcularse correctamente al recargar.
- **CL-14: Sesiones con fecha futura.** Si una sesión tiene fecha futura (por error o cambio de reloj), el sistema debe ignorarla en el mapa.
- **CL-15: localStorage no disponible o lleno.** Si `localStorage` está deshabilitado o lleno, el sistema debe mostrar el mapa en gris con un mensaje de error.
- **CL-16: Dispositivos táctiles.** En dispositivos sin hover, el tooltip debe aparecer al tocar el día.
- **CL-17: Sesiones duplicadas (mismo `id`).** Si hay dos sesiones con el mismo `id`, el sistema debe sumarlas normalmente (no es un caso especial).
- **CL-18: Exactamente 12 semanas de datos.** El mapa muestra exactamente 84 días hacia atrás desde hoy, independientemente de si hay datos o no.

## Fuera de alcance

- No se incluye exportación del mapa como imagen.
- No hay vista anual (52 semanas).
- No hay filtros por tema o etiqueta.
- No hay comparación entre usuarios ni estadísticas agregadas (promedio, tendencia).
- No hay notificaciones ni recordadores.
- No hay interacción de clic para ver detalle de sesiones (solo tooltip).
- No hay modo oscuro específico para el mapa (hereda los estilos globales).

## Plan de verificación manual

1. **Renderizado inicial:** Abrir `index.html` en el navegador. Verificar que el mapa de calor aparece debajo del formulario y encima de la lista de sesiones.
2. **Días sin sesión:** Verificar que los días sin sesión se muestran en gris claro.
3. **Registrar sesión de 15 min:** Registrar una sesión de 15 minutos hoy. Verificar que el día de hoy cambia a verde muy claro sin recargar.
4. **Registrar sesión de 45 min:** Registrar otra sesión de 45 minutos hoy. Verificar que el día cambia a verde claro (total 60 min).
5. **Registrar sesión de 90 min:** Registrar una sesión de 90 minutos en una fecha de ayer. Verificar que ayer cambia a verde medio.
6. **Registrar sesión de 150 min:** Registrar una sesión de 150 minutos en una fecha de hace 3 días. Verificar que el día cambia a verde intenso.
7. **Tooltip:** Pasar el ratón sobre un día con sesión. Verificar que aparece el tooltip con fecha `DD/MM/YYYY` y minutos en formato `X min`. Retirar el ratón y verificar que desaparece.
8. **Tooltip en día sin sesión:** Pasar el ratón sobre un día gris. Verificar que el tooltip muestra "Sin sesión".
9. **Múltiples sesiones en un día:** Registrar 3 sesiones de 20 min en el mismo día. Verificar que el color corresponde a 60 min (verde claro).
10. **Estado vacío:** Cerrar el navegador, abrir las herramientas de desarrollador (F12), ir a Application → Local Storage, eliminar la clave `study-sessions`. Recargar y verificar que aparece el mensaje "Aún no hay sesiones registradas".
11. **Persistencia:** Registrar una sesión, recargar la página y verificar que el mapa muestra los colores correctos.
12. **Responsive:** Redimensionar la ventana del navegador a 320 px de ancho. Verificar que el mapa es legible sin scroll horizontal.
13. **Accesibilidad:** Navegar por el mapa con la tecla Tab. Verificar que cada día es focusable y muestra el tooltip con `aria-label`.
14. **Edición de sesión:** Registrar una sesión, luego editarla cambiando la fecha a otro día dentro del rango. Verificar que ambos días actualizan su color.
15. **Borrado de sesión:** Registrar una sesión, luego borrarla. Verificar que el día vuelve a gris.
16. **Días futuros:** Verificar que los días futuros de la semana actual se muestran en gris.
17. **Etiquetas:** Verificar que las etiquetas de mes y día de la semana aparecen en español.
