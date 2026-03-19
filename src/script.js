import { getActivities, createActivity, updateActivity, deleteActivity } from './api/client.js';

// ─── Referencias DOM ─────────────────────────────────────────────────────────

// Cabecera
const themeIcon = document.getElementById('theme-toggle-icon');
// Notificación
const notificationContainer = document.querySelector('.notification-container');
const notificationMessage = document.getElementById('notification-message');
// Sidebar
const sidebar = document.getElementById('sidebar');
const sidebarMobileToggle = document.getElementById('sidebar-mobile-toggle');
// Etiquetas (sidebar)
const sidebarTagMenu = document.getElementById('sidebar-tag-menu');
const sidebarTagMenuItemContainer = sidebarTagMenu.parentElement;
const sidebarTagMenuCollapsibleContent = document.getElementById('tag-menu-collapsible');
const sidebarTagMenuIcon = document.getElementById('tag-menu-icon');
const tagForm = document.getElementById('tag-menu-form');
const tagFormText = document.getElementById('new-tag-input');
const tagFormColor = document.getElementById('tag-color-input');
const tagList = document.getElementById('tag-menu-list');
// Compositor
const tagSelector = document.getElementById('activity-tag-selector');
const tagSelectorIcon = document.getElementById('activity-tag-selector-icon');
const tagContainer = document.getElementById('activity-tag-container');
const tagOptions = document.getElementById('activity-tag-options');
const activityComposerForm = document.getElementById('activity-form');
const activityComposerInput = document.getElementById('activity-composer-input');
// Actividades
const activityContainer = document.getElementById('activity-container');
// Filtros
const activitySearch = document.getElementById('activity-filter-search');
const activityFilterCompleted = document.getElementById('activity-filter-completed');
const activityFilterLabel = document.getElementById('activity-filter-completed-label');
const activityStats = document.getElementById('activity-stats');
// Filtro por etiquetas
const activityFilterTagsBtn = document.getElementById('activity-filter-tags');
const activityFilterTagsOptions = document.getElementById('activity-filter-tags-options');

// ─── Estado ───────────────────────────────────────────────────────────────────

/** @type {{ name: string, color: string }[]} Lista de etiquetas persistidas. */
let tags = JSON.parse(localStorage.getItem('tags')) || [];

/** @type {{ id: number, name: string, tags: {name:string,color:string}[], description: string, completed: boolean }[]} Lista de actividades cargadas desde el servidor. */
let activities = [];

/** @type {'all'|'completed'|'pending'} Modo de filtro de estado de actividades. */
let filterMode = 'all';

/** @type {{ name: string, color: string }[]} Etiquetas actualmente seleccionadas en el filtro. */
let filterTags = [];

/** @type {{ name: string, color: string }[]} Etiquetas seleccionadas para la próxima actividad a crear. */
let selectedTagsForNewActivity = [];

/** @type {boolean} Indica si hay una petición al servidor en curso. */
let isLoading = false;

// ─── Notificación ─────────────────────────────────────────────────────────────

/**
 * Mapa de tipos de notificación a sus clases CSS correspondientes.
 * @type {{ success: string, error: string, warning: string }}
 */
const NOTIFICATION_TYPES = {
    success: 'notification--success',
    error: 'notification--error',
    warning: 'notification--warning',
};

/** @type {ReturnType<typeof setTimeout>|null} Temporizador para ocultar la notificación activa. */
let notificationHideTimeout = null;

/**
 * Muestra una notificación flotante durante un número determinado de segundos.
 * Limpia cualquier temporizador previo antes de iniciar uno nuevo.
 *
 * @param {string} message - Texto a mostrar en la notificación.
 * @param {'success'|'error'|'warning'} [type='success'] - Tipo visual de la notificación.
 * @param {number} [seconds=3] - Tiempo en segundos que permanece visible.
 * @returns {void}
 */
function showNotification(message, type = 'success', seconds = 3) {
    if (!notificationContainer || !notificationMessage) return;

    notificationMessage.textContent = message;

    Object.values(NOTIFICATION_TYPES).forEach(cls => notificationContainer.classList.remove(cls));
    notificationContainer.classList.add(NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES.success);
    notificationContainer.classList.add('notification--visible');

    if (notificationHideTimeout) clearTimeout(notificationHideTimeout);
    notificationHideTimeout = setTimeout(() => {
        notificationContainer.classList.remove('notification--visible');
    }, seconds * 1000);
}

/**
 * Cierra la notificación manualmente al hacer clic sobre ella.
 *
 * @listens HTMLElement#click
 */
notificationContainer?.addEventListener('click', () => {
    if (notificationHideTimeout) clearTimeout(notificationHideTimeout);
    notificationContainer.classList.remove('notification--visible');
});

// Exponer en el ámbito global para uso desde HTML inline
window.showNotification = showNotification;

// ─── Tema ─────────────────────────────────────────────────────────────────────

/**
 * Inicializa el tema (oscuro/claro) al cargar el DOM.
 * Lee el valor guardado en `localStorage` bajo la clave `theme`,
 * aplica la clase `dark` en `<html>` si corresponde y registra
 * el evento de clic para alternar el tema.
 *
 * @listens document#DOMContentLoaded
 * @returns {void}
 */
document.addEventListener('DOMContentLoaded', () => {
    const html = document.documentElement;
    const savedTheme = localStorage.getItem('theme');
    let isDark = savedTheme === 'dark';

    if (isDark) html.classList.add('dark');

    /**
     * Actualiza el icono del botón de tema según el modo activo.
     *
     * @param {boolean} dark - `true` si el modo oscuro está activo.
     * @returns {void}
     */
    const updateButtonUI = (dark) => {
        themeIcon.textContent = dark ? 'light_mode' : 'dark_mode';
    };

    updateButtonUI(isDark);

    /**
     * Alterna entre tema oscuro y claro al hacer clic en el icono.
     * Persiste la elección en `localStorage`.
     *
     * @listens HTMLElement#click
     * @returns {void}
     */
    themeIcon.addEventListener('click', () => {
        isDark = html.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateButtonUI(isDark);
    });
});

// ─── Sidebar ──────────────────────────────────────────────────────────────────

/**
 * Alterna la visibilidad del sidebar en dispositivos móviles
 * añadiendo o quitando la clase `is-open`.
 *
 * @listens HTMLElement#click
 * @returns {void}
 */
sidebarMobileToggle.addEventListener('click', () => {
    sidebar.classList.toggle('is-open');
});

/**
 * Expande o colapsa el submenú de etiquetas del sidebar.
 * Alterna `is-active` en el elemento contenedor y actualiza el icono de flecha.
 *
 * @listens HTMLElement#click
 * @returns {void}
 */
sidebarTagMenu.addEventListener('click', () => {
    sidebarTagMenuItemContainer.classList.toggle('is-active');
    sidebarTagMenuIcon.textContent =
        sidebarTagMenuIcon.textContent === 'keyboard_arrow_down'
            ? 'keyboard_arrow_up'
            : 'keyboard_arrow_down';
});

/**
 * Evita que los clics dentro del contenido colapsable propaguen al toggle del menú,
 * impidiendo que se cierre involuntariamente al interactuar con el formulario o la lista.
 *
 * @param {MouseEvent} e - Evento de clic.
 * @listens HTMLElement#click
 * @returns {void}
 */
sidebarTagMenuCollapsibleContent.addEventListener('click', (e) => {
    e.stopPropagation();
});

// ─── Etiquetas (sidebar) ──────────────────────────────────────────────────────

/**
 * Renderiza la lista de etiquetas del usuario en el sidebar.
 * Vacía el contenedor y reconstruye un `<li>` por cada etiqueta en `tags`.
 * También añade o quita el borde inferior del formulario según si hay etiquetas.
 *
 * @returns {void}
 */
function renderUserTags() {
    tagList.innerHTML = '';

    if (tagForm) {
        tagForm.classList.toggle('tag-menu-form--with-border', tags.length > 0);
    }

    tags.forEach((tag, index) => {
        const li = document.createElement('li');
        li.className = 'tag-menu-item flex justify-between items-center gap-2';
        li.innerHTML = `
            <span class="activity-tag flex-1 truncate"
                  style="border-color: ${tag.color}; color: ${tag.color}; background-color: ${tag.color}20">
                ${tag.name}
            </span>
            <button class="tag-menu-button bg-activity-delete p-0.5 rounded text-xs hover:bg-red-500"
                    onclick="deleteUserTag(${index})">X</button>
        `;
        tagList.appendChild(li);
    });
}

/**
 * Persiste el array `tags` en `localStorage` y actualiza
 * todas las partes de la UI que dependen de él:
 * la lista del sidebar, el selector del compositor y el filtro por etiquetas.
 *
 * @returns {void}
 */
function saveAndRenderTags() {
    localStorage.setItem('tags', JSON.stringify(tags));
    renderUserTags();
    syncComposerTagsUI();
    syncTagFilterUI();
}

/**
 * Crea una nueva etiqueta a partir del formulario del sidebar.
 * Valida que el nombre no esté vacío ni sea duplicado.
 * Si es válida, la añade a `tags`, persiste y limpia el input.
 *
 * @param {SubmitEvent} e - Evento de submit del formulario.
 * @listens HTMLFormElement#submit
 * @returns {void}
 */
tagForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const tagName = tagFormText.value.trim();
    const tagColor = tagFormColor.value;

    if (tagName === '') {
        showNotification('Etiqueta no puede estar vacía', 'warning', 3);
        return;
    }
    if (tags.some(t => t.name === tagName)) {
        showNotification('Etiqueta ya existe', 'warning', 3);
        return;
    }

    tags.push({ name: tagName, color: tagColor });
    showNotification('Etiqueta creada', 'success', 3);
    saveAndRenderTags();
    tagFormText.value = '';
});

/**
 * Elimina una etiqueta por su índice en `tags`.
 * Si la etiqueta estaba activa en el filtro, la elimina también de `filterTags`.
 * Persiste los cambios y re-renderiza actividades.
 *
 * @param {number} index - Índice de la etiqueta a eliminar.
 * @returns {void}
 */
window.deleteUserTag = (index) => {
    const deleted = tags[index];
    tags.splice(index, 1);
    filterTags = filterTags.filter(t => t.name !== deleted.name);
    saveAndRenderTags();
    renderUserActivities();
};

// ─── Selector de etiquetas del compositor ─────────────────────────────────────

/**
 * Abre o cierra el desplegable de etiquetas del compositor.
 * Muestra una notificación si no hay etiquetas disponibles para seleccionar.
 * Evita la propagación para que el listener global no lo cierre inmediatamente.
 *
 * @param {MouseEvent} e - Evento de clic.
 * @returns {void}
 */
tagSelector.onclick = (e) => {
    e.stopPropagation();

    if (tags.length === 0) {
        showNotification('Debes crear al menos una etiqueta', 'warning', 3);
        return;
    }
    if (tagOptions.children.length === 0) {
        showNotification('No hay más etiquetas', 'warning', 3);
        return;
    }

    tagOptions.classList.toggle('hidden');
    tagSelectorIcon.textContent =
        tagSelectorIcon.textContent === 'keyboard_arrow_down'
            ? 'keyboard_arrow_up'
            : 'keyboard_arrow_down';
};

/**
 * Cierra todos los desplegables abiertos al hacer clic fuera de ellos:
 * el selector de etiquetas del compositor y el filtro por etiquetas.
 *
 * @listens Document#click
 * @returns {void}
 */
document.addEventListener('click', () => {
    tagOptions.classList.add('hidden');
    if (tagSelectorIcon.textContent === 'keyboard_arrow_up') {
        tagSelectorIcon.textContent = 'keyboard_arrow_down';
    }

    activityFilterTagsOptions.classList.add('hidden');
    activityFilterTagsBtn.classList.remove('activity-filter-toggle--active-dropdown');
});

/**
 * Sincroniza la UI del compositor de actividades con el estado actual:
 * - Renderiza los chips de etiquetas ya seleccionadas (con opción de quitar).
 * - Renderiza las opciones disponibles en el desplegable, excluyendo las ya seleccionadas.
 *
 * @returns {void}
 */
function syncComposerTagsUI() {
    // Chips de etiquetas seleccionadas
    tagContainer.innerHTML = '';
    selectedTagsForNewActivity.forEach((tag, index) => {
        const span = document.createElement('span');
        span.className = 'activity-tag cursor-pointer hover:!bg-red-500/50 hover:!border-red-500 hover:!text-red-500 transition-opacity border p-0.5 rounded-lg text-xs font-bold';
        span.style.color = tag.color;
        span.style.borderColor = tag.color;
        span.style.backgroundColor = `color-mix(in srgb, ${tag.color} 15%, transparent)`;
        span.textContent = tag.name;
        span.onclick = () => {
            selectedTagsForNewActivity.splice(index, 1);
            syncComposerTagsUI();
        };
        tagContainer.appendChild(span);
    });

    // Opciones disponibles en el desplegable
    tagOptions.innerHTML = '';
    const available = tags.filter(tag =>
        !selectedTagsForNewActivity.some(s => s.name === tag.name)
    );

    available.forEach((tag) => {
        const li = document.createElement('li');
        li.className = 'tag-menu-item flex justify-between items-center gap-0.5 p-0.5 cursor-pointer hover:bg-white/5 transition-colors rounded-lg';
        li.innerHTML = `
            <span class="activity-tag flex-1 truncate"
                  style="border-color: ${tag.color}; color: ${tag.color}; background-color: ${tag.color}20">
                ${tag.name}
            </span>`;
        li.onclick = () => {
            addTagToSelection(tag.name, tag.color);
            tagOptions.classList.add('hidden');
        };
        tagOptions.appendChild(li);
    });
}

/**
 * Añade una etiqueta a `selectedTagsForNewActivity` si no estaba ya incluida.
 * Actualiza la UI del compositor tras la adición.
 *
 * @param {string} tagName - Nombre de la etiqueta a añadir.
 * @param {string} tagColor - Color CSS de la etiqueta (normalmente hex).
 * @returns {void}
 */
function addTagToSelection(tagName, tagColor) {
    if (tagName && !selectedTagsForNewActivity.some(t => t.name === tagName)) {
        selectedTagsForNewActivity.push({ name: tagName, color: tagColor });
        syncComposerTagsUI();
    }
}

// ─── Filtro por etiquetas ─────────────────────────────────────────────────────

/**
 * Sincroniza la UI del filtro por etiquetas:
 * - Actualiza el label del botón con el nombre de la etiqueta o el número de activas.
 * - Marca el botón como activo si hay etiquetas seleccionadas.
 * - Reconstruye el desplegable con las etiquetas disponibles y, si procede,
 *   una opción para limpiar todos los filtros activos.
 *
 * @returns {void}
 */
function syncTagFilterUI() {
    const label = document.getElementById('activity-filter-tags-label');

    if (filterTags.length === 0) {
        label.textContent = 'Etiquetas';
        activityFilterTagsBtn.classList.remove('activity-filter-toggle--active');
    } else {
        label.textContent = filterTags.length === 1
            ? filterTags[0].name
            : `${filterTags.length} etiquetas`;
        activityFilterTagsBtn.classList.add('activity-filter-toggle--active');
    }

    activityFilterTagsOptions.innerHTML = '';

    // Opción para limpiar filtros activos
    if (filterTags.length > 0) {
        const clearLi = document.createElement('li');
        clearLi.className = 'tag-menu-item flex items-center gap-0.5 p-0.5 cursor-pointer hover:bg-white/5 transition-colors rounded-lg text-xs opacity-60';
        clearLi.innerHTML = `<span class="flex-1 truncate px-0.5">✕ Limpiar</span>`;
        clearLi.onclick = (e) => {
            e.stopPropagation();
            filterTags = [];
            syncTagFilterUI();
            renderUserActivities();
            activityFilterTagsOptions.classList.add('hidden');
        };
        activityFilterTagsOptions.appendChild(clearLi);

        // Separador visual
        const sep = document.createElement('li');
        sep.className = 'border-t border-border-primary mx-0.5';
        activityFilterTagsOptions.appendChild(sep);
    }

    const available = tags.filter(t => !filterTags.some(f => f.name === t.name));

    if (available.length === 0 && filterTags.length === 0) {
        const li = document.createElement('li');
        li.className = 'p-1 text-xs opacity-50 text-center';
        li.textContent = 'No hay etiquetas creadas';
        activityFilterTagsOptions.appendChild(li);
        return;
    }

    if (available.length === 0) {
        const li = document.createElement('li');
        li.className = 'p-1 text-xs opacity-50 text-center';
        li.textContent = 'Todas seleccionadas';
        activityFilterTagsOptions.appendChild(li);
        return;
    }

    available.forEach(tag => {
        const li = document.createElement('li');
        li.className = 'tag-menu-item flex items-center gap-0.5 p-0.5 cursor-pointer hover:bg-white/5 transition-colors rounded-lg';
        li.innerHTML = `
            <span class="activity-tag flex-1 truncate text-xs"
                  style="border-color:${tag.color}; color:${tag.color}; background-color:${tag.color}20">
                ${tag.name}
            </span>`;
        li.onclick = (e) => {
            e.stopPropagation();
            filterTags.push(tag);
            syncTagFilterUI();
            renderUserActivities();
            activityFilterTagsOptions.classList.add('hidden');
        };
        activityFilterTagsOptions.appendChild(li);
    });
}

/**
 * Abre o cierra el desplegable del filtro por etiquetas.
 * Sincroniza la UI antes de mostrarlo para reflejar el estado actual.
 * Evita la propagación para que el listener global no lo cierre inmediatamente.
 *
 * @param {MouseEvent} e - Evento de clic.
 * @listens HTMLElement#click
 * @returns {void}
 */
activityFilterTagsBtn.addEventListener('click', (e) => {
    e.stopPropagation();

    syncTagFilterUI();
    activityFilterTagsOptions.classList.toggle('hidden');
});

// ─── Estados de carga ─────────────────────────────────────────────────────────

/**
 * Activa o desactiva el estado de carga global.
 * Deshabilita el formulario compositor y muestra el estado en la lista.
 *
 * @param {boolean} loading
 * @returns {void}
 */
function setLoading(loading) {
    isLoading = loading;
    activityComposerForm.querySelectorAll('input, button, textarea').forEach(el => {
        el.disabled = loading;
    });
}

/**
 * Muestra el estado de carga en el contenedor de actividades.
 *
 * @returns {void}
 */
function renderLoadingState() {
    activityContainer.innerHTML = `
        <li class="activity-state-container">
            <span class="activity-state-spinner"></span>
            <p class="activity-state-text">Cargando actividades...</p>
        </li>
    `;
}

/**
 * Muestra el estado de error en el contenedor de actividades con opción de reintentar.
 *
 * @param {string} [message='No se pudieron cargar las actividades']
 * @returns {void}
 */
function renderErrorState(message = 'No se pudieron cargar las actividades') {
    activityContainer.innerHTML = `
        <li class="activity-state-container">
            <span class="material-symbols-outlined activity-state-icon activity-state-icon--error">wifi_off</span>
            <p class="activity-state-text">${message}</p>
            <button class="activity-state-retry" onclick="fetchActivities()">Reintentar</button>
        </li>
    `;
}

// ─── API: actividades ─────────────────────────────────────────────────────────

/**
 * Carga todas las actividades desde el servidor y re-renderiza la lista.
 * Gestiona los estados de carga y error visualmente.
 *
 * @returns {Promise<void>}
 */
async function fetchActivities() {
    setLoading(true);
    renderLoadingState();
    try {
        activities = await getActivities();
        renderUserActivities();
    } catch (e) {
        renderErrorState();
        showNotification('No se pudieron cargar las actividades', 'error', 4);
    } finally {
        setLoading(false);
    }
}

/**
 * Envía un PATCH al servidor para actualizar campos concretos de una actividad.
 * Recarga la lista desde el servidor tras el cambio.
 *
 * @param {number} id - ID de la actividad a actualizar.
 * @param {Partial<{name:string, description:string, completed:boolean}>} data - Campos a actualizar.
 * @returns {Promise<boolean>} `true` si la operación tuvo éxito.
 */
async function patchActivity(id, data) {
    setLoading(true);
    renderLoadingState();
    try {
        await updateActivity(id, data);
        await fetchActivities();
        return true;
    } catch (e) {
        showNotification(e.message || 'Error al actualizar', 'error', 3);
        renderUserActivities();
        return false;
    } finally {
        setLoading(false);
    }
}

// ─── Actividades ──────────────────────────────────────────────────────────────

/**
 * Renderiza las actividades en el contenedor principal aplicando todos los filtros activos:
 * búsqueda por texto, filtro de estado (`filterMode`) y filtro por etiquetas (`filterTags`).
 * Actualiza también el contador de estadísticas visible al usuario.
 *
 * @returns {void}
 */
function renderUserActivities() {
    activityContainer.innerHTML = '';

    const searchTerm = activitySearch.value.toLowerCase();

    const filtered = activities.filter(activity => {
        const matchesSearch = activity.name.toLowerCase().includes(searchTerm);
        const matchesFilter =
            filterMode === 'all' ? true :
                filterMode === 'completed' ? activity.completed :
                    !activity.completed;
        const matchesTags = filterTags.length === 0 ||
            filterTags.every(ft => activity.tags.some(t => t.name === ft.name));
        return matchesSearch && matchesFilter && matchesTags;
    });

    const totalVisible = filtered.length;
    const completedVisible = filtered.filter(a => a.completed).length;
    activityStats.textContent = `${totalVisible} actividades · ${completedVisible} completadas`;

    filtered.forEach((activity) => {
        const li = document.createElement('li');
        const isCompleted = activity.completed || false;

        const activityTags = activity.tags.map(tag => `
            <span class="activity-tag"
                  style="border-color: ${tag.color}; color: ${tag.color}; background-color: ${tag.color}20">
                ${tag.name}
            </span>
        `).join('');

        li.innerHTML = `
            <article class="activity-item${isCompleted ? ' activity-item--completed' : ''}">
                <div class="activity-data">
                    <div class="activity-info">
                        <button
                            class="activity-complete-button${isCompleted ? ' activity-complete-button--done' : ''}"
                            onclick="toggleActivityComplete(${activity.id})"
                            title="${isCompleted ? 'Marcar como pendiente' : 'Marcar como completada'}"
                        >
                            <span class="material-symbols-outlined">${isCompleted ? 'check_circle' : 'radio_button_unchecked'}</span>
                        </button>
                        <div class="activity-tags">
                            ${activityTags}
                        </div>
                    </div>
                    <h3 onclick="startEditActivityTitle(${activity.id}, this)" class="${isCompleted ? 'line-through opacity-50' : ''}">${activity.name}</h3>
                    <textarea
                        class="activity-description-input"
                        placeholder="Descripción de la actividad...."
                        oninput="autoResize(this)"
                        onblur="updateActivityDescription(${activity.id}, this.value)"
                    >${activity.description || ''}</textarea>
                    <div class="activity-delete group">
                        <div class="activity-delete-background"></div>
                        <button class="activity-delete-button" onclick="deleteUserActivity(${activity.id})">X</button>
                    </div>
                </div>
            </article>
        `;

        activityContainer.appendChild(li);
    });
}

/**
 * Ajusta dinámicamente la altura de un `<textarea>` a su contenido
 * para evitar barras de scroll internas.
 *
 * @param {HTMLTextAreaElement} textarea - Elemento cuyo alto se ajusta.
 * @returns {void}
 */
function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

/**
 * Crea una nueva actividad enviando un POST al servidor.
 * Valida que el nombre no esté vacío antes de enviar.
 * Tras crear la actividad, resetea las etiquetas seleccionadas y el input.
 *
 * @param {SubmitEvent} e - Evento de submit del formulario.
 * @listens HTMLFormElement#submit
 * @returns {Promise<void>}
 */
activityComposerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const activityName = activityComposerInput.value.trim();

    if (activityName === '') {
        showNotification('Actividad no puede estar vacía', 'warning', 3);
        return;
    }
    if (activityName.length <= 3) {
        showNotification('El título debe contener mínimo 3 caracteres', 'warning', 3);
        return;
    }
    if (activityName.length > 50) {
        showNotification('El título no puede superar los 50 caracteres', 'warning', 3);
        return;
    }

    setLoading(true);
    renderLoadingState();
    try {
        await createActivity(activityName, [...selectedTagsForNewActivity]);
        await fetchActivities();
        showNotification('Actividad creada', 'success', 3);
        selectedTagsForNewActivity.length = 0;
        activityComposerInput.value = '';
        syncComposerTagsUI();
    } catch (e) {
        showNotification(e.message || 'Error al crear actividad', 'error', 3);
        renderUserActivities();
    } finally {
        setLoading(false);
    }
});

/**
 * Actualiza la descripción de una actividad enviando un PATCH al servidor.
 *
 * @param {number} id - ID de la actividad.
 * @param {string} newValue - Nuevo texto de descripción.
 * @returns {Promise<void>}
 */
async function updateActivityDescription(id, newValue) {
    await patchActivity(id, { description: newValue });
}

/**
 * Permite editar el título de una actividad haciendo clic en él.
 * Sustituye el `<h3>` por un `<input>` de texto y gestiona tres eventos:
 * - `blur`: confirma el cambio.
 * - `Enter`: confirma el cambio.
 * - `Escape`: cancela y restaura el título original.
 *
 * Valida que el nuevo nombre no esté vacío ni sea duplicado.
 *
 * @param {number} id - ID de la actividad.
 * @param {HTMLElement} titleElement - Elemento `<h3>` que se reemplaza por el input.
 * @returns {void}
 */
window.startEditActivityTitle = (id, titleElement) => {
    const activity = activities.find(a => a.id === id);
    const currentName = activity?.name ?? '';
    const input = document.createElement('input');
    input.maxLength = 50;
    input.type = 'text';
    input.value = currentName;
    input.className = 'activity-title-input';

    let isCancelled = false;

    const commitChange = async () => {
        if (isCancelled) return;

        const trimmedName = input.value.trim();

        if (trimmedName === '') {
            showNotification('Actividad no puede estar vacía', 'warning', 3);
            input.focus();
            return;
        }
        if (trimmedName.length > 50) {
            showNotification('El título no puede superar los 50 caracteres', 'warning', 3);
            input.focus();
            return;
        }

        const ok = await patchActivity(id, { name: trimmedName });
        if (ok) showNotification('Actividad actualizada', 'success', 3);
    };

    const cancelChange = () => {
        isCancelled = true;
        renderUserActivities();
    };

    input.addEventListener('blur', commitChange);
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') { event.preventDefault(); commitChange(); }
        else if (event.key === 'Escape') { event.preventDefault(); cancelChange(); }
    });

    titleElement.replaceWith(input);
    input.focus();
    input.select();
};

/**
 * Alterna el estado completado/pendiente de una actividad enviando un PATCH al servidor.
 * Muestra una notificación informando del nuevo estado.
 *
 * @param {number} id - ID de la actividad.
 * @returns {Promise<void>}
 */
window.toggleActivityComplete = async (id) => {
    const activity = activities.find(a => a.id === id);
    const isNowComplete = !activity.completed;
    const ok = await patchActivity(id, { completed: isNowComplete });
    if (ok) {
        showNotification(
            isNowComplete ? 'Actividad completada ✓' : 'Actividad marcada como pendiente',
            isNowComplete ? 'success' : 'warning',
            2
        );
    }
};

/**
 * Elimina una actividad enviando un DELETE al servidor.
 *
 * @param {number} id - ID de la actividad a eliminar.
 * @returns {Promise<void>}
 */
window.deleteUserActivity = async (id) => {
    setLoading(true);
    renderLoadingState();
    try {
        await deleteActivity(id);
        await fetchActivities();
        showNotification('Actividad eliminada', 'success', 3);
    } catch (e) {
        showNotification(e.message || 'Error al eliminar actividad', 'error', 3);
        renderUserActivities();
    } finally {
        setLoading(false);
    }
};

// ─── Filtro: completadas / pendientes ─────────────────────────────────────────

/**
 * Re-renderiza las actividades al escribir en el campo de búsqueda.
 *
 * @listens HTMLInputElement#input
 * @returns {void}
 */
activitySearch.addEventListener('input', () => renderUserActivities());

/**
 * Cicla el modo de filtro de estado entre `all`, `completed` y `pending`.
 * Actualiza el label del botón y su clase activa en cada transición.
 *
 * @listens HTMLElement#click
 * @returns {void}
 */
activityFilterCompleted.addEventListener('click', () => {
    if (filterMode === 'all') {
        filterMode = 'completed';
        activityFilterLabel.textContent = 'Completadas';
        activityFilterCompleted.classList.add('activity-filter-toggle--active');
    } else if (filterMode === 'completed') {
        filterMode = 'pending';
        activityFilterLabel.textContent = 'Pendientes';
    } else {
        filterMode = 'all';
        activityFilterLabel.textContent = 'Todas';
        activityFilterCompleted.classList.remove('activity-filter-toggle--active');
    }
    renderUserActivities();
});

// ─── Inicialización ───────────────────────────────────────────────────────────

window.fetchActivities = fetchActivities;
renderUserTags();
syncComposerTagsUI();
syncTagFilterUI();
fetchActivities();