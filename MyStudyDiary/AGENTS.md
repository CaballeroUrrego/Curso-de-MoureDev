# AGENTS.md

Web estática "Diario de Estudio" para registrar sesiones de estudio y mantener la motivación con una racha de días consecutivos. Sin build, sin servidor, sin dependencias locales.

## Stack y estructura

- HTML5, CSS3, JavaScript (vanilla)
- Bootstrap 5 y Font Awesome vía CDN
- Persistencia en `localStorage`

```
MyStudyDiary/
├── index.html          → Estructura principal, carga CDN de Bootstrap y Font Awesome
├── css/
│   ├── style.css       → Estilos personalizados (tarjeta de racha, botones, lista)
│   └── img/            → Carpeta vacía para futuras imágenes
└── js/
    └── script.js       → Toda la lógica: formulario, racha, localStorage, renderizado
```

## Comandos

```bash
# Ejecutar
# Abrir index.html directamente en el navegador (doble clic)
# No requiere servidor ni instalación

# No hay comandos de build, test, lint ni typecheck
```

## Convenciones

- Todos los textos de la interfaz en español
- Fechas siempre en hora local del usuario (nunca UTC)
- Formato de fecha: `YYYY-MM-DD`
- La racha se mantiene viva si ayer hay sesión (no se rompe hasta que termina el día)
- Nombres de variables y funciones en camelCase
- Comentarios en español

## Patrones que hay que seguir

- **Archivo de referencia:** `js/script.js` — toda la lógica está ahí
- Formulario con `preventDefault()` para evitar recarga
- `localStorage` con clave `study-sessions` (array de objetos `{id, date, topic, minutes}`)
- Fechas formateadas con `formatDateKey()` para comparación como strings
- Renderizado con `innerHTML = ''` + `createElement` (no `dangerouslySetInnerHTML`)

## Reglas de dominio / trampas conocidas

- **Nunca usar UTC** para fechas — siempre `getFullYear()`, `getMonth()`, `getDate()` del objeto `Date` local
- **Racha:** un día cuenta si tiene al menos una sesión; la racha son días consecutivos terminando hoy (o ayer si hoy aún no hay sesión)
- **ID de sesión:** se genera con `Date.now()` — no es 100% único si se crean dos en el mismo milisegundo, pero suficiente para uso personal
- **Orden de la lista:** primero por fecha descendente, luego por `id` descendente (más reciente primero)

## Forma de trabajar

- Cambios pequeños y directos — es una app simple, no necesita planificación compleja
- Al terminar: resumen de 3-4 líneas de lo creado, pasos para probar, y decisiones tomadas que el usuario deba revisar

## Límites

✅ **Siempre:**
- Escribir textos de interfaz en español
- Usar fechas locales (nunca UTC)
- Mantener la estructura de carpetas existente
- Guardar datos en `localStorage` con la clave `study-sessions`

⚠️ **Pregunta antes:**
- Añadir nuevas dependencias o librerías
- Crear archivos nuevos
- Cambiar el formato de datos guardados
- Añadir funcionalidades no solicitadas

🚫 **Nunca:**
- Usar frameworks o librerías sin permiso Solo Bootstrap 5 y Font Awesome vía CDN explicitamente
- Añadir build steps, bundlers o transpiladores
- Romper la compatibilidad con abrir `index.html` directamente
- Borrar datos del usuario sin confirmación

## Verificación

1. Abrir `index.html` en el navegador
2. Registrar una sesión → verificar que la racha sube y aparece en la lista
3. Recargar la página → verificar que los datos persisten
4. Cambiar la fecha a ayer → verificar que la racha se mantiene
5. No registrar hoy ni ayer → verificar que la racha se resetea a 0
