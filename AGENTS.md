# AGENTS.md

## Proyecto

Web estática "Diario de Estudio" — sin build, sin servidor, sin dependencias locales.

## Stack

- HTML5, CSS3, JavaScript (vanilla)
- Bootstrap 5 y Font Awesome vía CDN
- Persistencia en `localStorage`

## Estructura

```
MyStudyDiary/
├── index.html
├── css/
│   ├── style.css
│   └── img/
└── js/
    └── script.js
```

## Cómo ejecutar

Abrir `index.html` directamente en el navegador (doble clic). No requiere servidor ni instalación.

## Convenciones

- Todos los textos de la interfaz en español
- Fechas siempre en hora local del usuario (nunca UTC)
- Formato de fecha: `YYYY-MM-DD`
- La racha se mantiene viva si ayer hay sesión (no se rompe hasta que termina el día)
