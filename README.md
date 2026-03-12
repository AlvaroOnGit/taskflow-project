# Taskflow

Aplicación web de gestión de actividades con soporte de etiquetas, filtros y persistencia local. Construida con HTML, CSS (Tailwind v4) y JavaScript vanilla.

---

## ✨ Características

- **Gestión de actividades** — Crea, edita el título y la descripción, y elimina actividades.
- **Estados** — Marca actividades como completadas o pendientes con retroalimentación visual.
- **Etiquetas personalizadas** — Crea etiquetas con nombre y color libre; asígnalas a cada actividad.
- **Filtros combinables** — Filtra por texto, estado (todas / completadas / pendientes) y por una o varias etiquetas.
- **Persistencia local** — Los datos se guardan automáticamente en `localStorage`; no requiere backend.
- **Tema claro / oscuro** — Preferencia guardada entre sesiones.
- **Notificaciones** — Mensajes de éxito, advertencia y error flotantes con auto-cierre.
- **Responsive** — Sidebar adaptable: menú desplegable en móvil, fijo en escritorio (`lg:`).

---

## 🗂️ Estructura del proyecto
```
taskflow/
├── index.html       # Marcado principal
├── input.css        # Estilos fuente (Tailwind v4 + componentes personalizados)
├── output.css       # CSS compilado (generado, no editar a mano)
└── script.js        # Lógica completa de la aplicación
```

---

## 🚀 Instalación y uso

### Prerrequisitos

- [Node.js](https://nodejs.org/) ≥ 18
- [Tailwind CSS CLI](https://tailwindcss.com/docs/installation) v4

### Pasos
```bash
# 1. Clona el repositorio
git clone https://github.com/tu-usuario/taskflow.git
cd taskflow

# 2. Instala Tailwind CSS (si no lo tienes)
npm install tailwindcss @tailwindcss/cli

# 3. Compila los estilos en modo watch
npx @tailwindcss/cli -i ./input.css -o ./output.css --watch
```

Abre `index.html` en el navegador. No se necesita servidor adicional.

---

## 🧩 Arquitectura

La aplicación sigue un patrón **estado → render**:

| Módulo | Descripción |
|---|---|
| **Estado** | Variables globales `tags`, `activities`, `filterMode`, `filterTags`, `selectedTagsForNewActivity` |
| **Persistencia** | `localStorage` para `tags`, `activities` y `theme` |
| **Render** | `renderUserTags()`, `renderUserActivities()`, `syncComposerTagsUI()`, `syncTagFilterUI()` |
| **Notificaciones** | `showNotification(message, type, seconds)` — tipos: `success`, `error`, `warning` |

Cada modificación de estado llama a `saveAndRender*()`, que persiste y re-renderiza la vista afectada.

---

## ⌨️ Atajos de edición

| Acción | Comportamiento |
|---|---|
| Clic en el título de una actividad | Activa modo edición inline |
| `Enter` | Confirma el cambio de título |
| `Escape` | Cancela la edición y restaura el título original |
| Clic fuera del input | Confirma el cambio (blur) |

---

## 💾 Almacenamiento local

| Clave | Contenido |
|---|---|
| `tags` | `Array<{ name: string, color: string }>` |
| `activities` | `Array<{ name, tags, description, completed }>` |
| `theme` | `"dark"` \| `"light"` |

---

## 🛠️ Tecnologías

- **HTML5** semántico
- **Tailwind CSS v4** con tema personalizado y variante `dark`
- **JavaScript ES2020+** — sin frameworks, sin dependencias de runtime
- **Google Fonts — Material Symbols** para iconografía

---

## 📄 Licencia

MIT © 2025