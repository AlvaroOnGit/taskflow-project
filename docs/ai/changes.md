### Refactor de gestión de etiquetas en el *composer* de actividades (versión actual)
#### Contexto
Antes del cambio, la UI de etiquetas del *composer* se gestionaba mediante varias funciones que se llamaban entre sí:
- Pintado de etiquetas seleccionadas debajo del *composer*.
- Construcción de las opciones del desplegable de etiquetas disponibles.
- Lógica para añadir/eliminar etiquetas y refrescar la UI.
Esto provocaba:
- Duplicación de lógica de renderizado.
- Llamadas encadenadas entre funciones para mantener la UI consistente.
- Mayor dificultad de mantenimiento al tocar la UI del *composer*.
---
### Cambio realizado
Se ha introducido una **única función orquestadora** para la UI del *composer*:
- **`syncComposerTagsUI`**
  - **Responsabilidad**: sincronizar la sección de etiquetas del *composer* en base al estado actual `selectedTagsForNewActivity` y `tags`.
  - **Funcionalidad**:
    - Renderiza las etiquetas seleccionadas debajo del *composer* (`tagContainer`), permitiendo deseleccionarlas con un clic.
    - Renderiza las opciones disponibles en el selector (`tagOptions`), excluyendo las etiquetas ya seleccionadas.
    - Se invoca siempre que cambia el estado de etiquetas (p. ej. se añade o se borra una etiqueta seleccionada) y en la inicialización.
Las funciones que afectan al estado de etiquetas delegan toda la parte de UI en `syncComposerTagsUI`:
- **`saveAndRenderTags`**
  - Antes: guardaba `tags`, repintaba el menú del sidebar y llamaba a `updateTagSelector`.
  - Ahora: tras guardar `tags` y repintar el sidebar, llama directamente a `syncComposerTagsUI()` para actualizar opciones del selector en el *composer*.
- **`addTagToSelection(tagName, tagColor)`**
  - Antes: añadía la etiqueta a `selectedTagsForNewActivity` y luego llamaba a `renderComposerTags()` y `updateTagSelector()`.
  - Ahora:
    - Añade la etiqueta a `selectedTagsForNewActivity` (si no existe).
    - Llama una sola vez a `syncComposerTagsUI()`.
- **Submit del *composer* (`activityComposerForm`)**
  - Tras crear la nueva actividad:
    - Vacía `selectedTagsForNewActivity`.
    - Limpia el input de texto.
    - Llama a `syncComposerTagsUI()` para dejar vacías las etiquetas seleccionadas y recomputar las opciones del selector.
- **Inicialización del *composer***
  - Al arrancar la aplicación, se llama una vez a `syncComposerTagsUI()` para que el selector y el contenedor de etiquetas queden consistentes respecto al estado inicial.
Además, se han eliminado las funciones intermedias antiguas (`renderComposerTags`, `updateTagSelector`) para que toda la lógica de UI del *composer* viva en un único punto.
---
### Beneficios
- **Menos duplicación de código**: el renderizado de *spans* (etiquetas seleccionadas) y *lis* (opciones del selector) vive en una sola función (`syncComposerTagsUI`).
- **Responsabilidad clara**: la función expresa directamente cómo debe verse la sección de etiquetas del *composer* según el estado actual.
- **Menos acoplamiento entre funciones**: ya no hace falta recordar llamar a dos funciones distintas después de cambiar el estado; basta con invocar `syncComposerTagsUI()`.
- **Mantenimiento más sencillo**: cambios de estilos o estructura HTML de las etiquetas del *composer* solo requieren modificar una función en vez de varias.