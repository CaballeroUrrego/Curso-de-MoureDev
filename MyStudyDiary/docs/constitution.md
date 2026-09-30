# Constitución — Diario de Estudio

1. **Stack cero dependencias:** HTML + CSS + JS vanilla. Solo Bootstrap 5 y Font Awesome vía CDN. Nada de frameworks, bundlers ni build steps.
2. **Spec primero:** Toda funcionalidad nueva se describe en texto antes de escribir código. El código refleja la spec; si divergen, se actualiza la spec.
3. **Lógica separada de interfaz:** Las funciones de dominio (fechas, racha, minutos) no tocan el DOM. El renderizado es el único punto de contacto con la UI.
4. **Tests sin instalar nada:** Verificación manual documentada en AGENTS.md (pasos numerados, ejecutables con doble clic en index.html). Sin frameworks de test.
5. **Datos del usuario protegidos:** Todo vive en localStorage del navegador. Nunca se borran datos sin confirmación explícita del usuario.
6. **Español en todas partes:** Textos de interfaz, comentarios, nombres de variables y commits en español. Código camelCase, fechas locales (nunca UTC).