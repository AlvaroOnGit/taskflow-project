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

/** @type {{ name: string, tags: {name:string,color:string}[], description: string, completed: boolean }[]} Lista de actividades persistidas. */
let activities = JSON.parse(localStorage.getItem('activities')) || [];

/** @type {'all'|'completed'|'pending'} Modo de filtro de estado de actividades. */
let filterMode = 'all';

/** @type {{ name: string, color: string }[]} Etiquetas actualmente seleccionadas en el filtro. */
let filterTags = [];

/** @type {{ name: string, color: string }[]} Etiquetas seleccionadas para la próxima actividad a crear. */
let selectedTagsForNewActivity = [];

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
        const index = activities.indexOf(activity);

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
                            onclick="toggleActivityComplete(${index})"
                            title="${isCompleted ? 'Marcar como pendiente' : 'Marcar como completada'}"
                        >
                            <span class="material-symbols-outlined">${isCompleted ? 'check_circle' : 'radio_button_unchecked'}</span>
                        </button>
                        <div class="activity-tags">
                            ${activityTags}
                        </div>
                    </div>
                    <h3 onclick="startEditActivityTitle(${index}, this)" class="${isCompleted ? 'line-through opacity-50' : ''}">${activity.name}</h3>
                    <textarea
                        class="activity-description-input"
                        placeholder="Descripción de la actividad...."
                        oninput="autoResize(this)"
                        onblur="updateActivityDescription(${index}, this.value)"
                    >${activity.description || ''}</textarea>
                    <div class="activity-delete group">
                        <div class="activity-delete-background"></div>
                        <button class="activity-delete-button" onclick="deleteUserActivity(${index})">X</button>
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
 * Persiste el array `activities` en `localStorage` y re-renderiza la lista.
 *
 * @returns {void}
 */
function saveAndRenderActivities() {
    localStorage.setItem('activities', JSON.stringify(activities));
    renderUserActivities();
}

/**
 * Crea una nueva actividad a partir del formulario del compositor.
 * Valida que el nombre no esté vacío ni sea duplicado.
 * Tras crear la actividad, resetea las etiquetas seleccionadas y el input.
 *
 * @param {SubmitEvent} e - Evento de submit del formulario.
 * @listens HTMLFormElement#submit
 * @returns {void}
 */
activityComposerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const activityName = activityComposerInput.value.trim();

    if (activityName === '') {
        showNotification('Actividad no puede estar vacía', 'warning', 3);
        return;
    }
    if (activities.some(a => a.name === activityName)) {
        showNotification('Actividad ya existe', 'warning', 3);
        return;
    }

    activities.push({
        name: activityName,
        tags: [...selectedTagsForNewActivity],
        description: '',
        completed: false,
    });

    showNotification('Actividad creada', 'success', 3);
    selectedTagsForNewActivity.length = 0;
    activityComposerInput.value = '';
    syncComposerTagsUI();
    saveAndRenderActivities();
});

/**
 * Actualiza la descripción de una actividad y persiste el cambio.
 *
 * @param {number} index - Índice de la actividad en `activities`.
 * @param {string} newValue - Nuevo texto de descripción.
 * @returns {void}
 */
function updateActivityDescription(index, newValue) {
    activities[index].description = newValue;
    saveAndRenderActivities();
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
 * @param {number} index - Índice de la actividad en `activities`.
 * @param {HTMLElement} titleElement - Elemento `<h3>` que se reemplaza por el input.
 * @returns {void}
 */
window.startEditActivityTitle = (index, titleElement) => {
    const currentName = activities[index]?.name ?? '';
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentName;
    input.className = 'activity-title-input';

    let isCancelled = false;

    const commitChange = () => {
        if (isCancelled) return;

        const trimmedName = input.value.trim();

        if (trimmedName === '') {
            showNotification('Actividad no puede estar vacía', 'warning', 3);
            input.focus();
            return;
        }
        if (activities.some((a, i) => i !== index && a.name === trimmedName)) {
            showNotification('Ya existe otra actividad con ese nombre', 'warning', 3);
            input.focus();
            return;
        }

        activities[index].name = trimmedName;
        saveAndRenderActivities();
        showNotification('Actividad actualizada', 'success', 3);
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
 * Alterna el estado completado/pendiente de una actividad y persiste el cambio.
 * Muestra una notificación informando del nuevo estado.
 *
 * @param {number} index - Índice de la actividad en `activities`.
 * @returns {void}
 */
window.toggleActivityComplete = (index) => {
    activities[index].completed = !activities[index].completed;
    const isNowComplete = activities[index].completed;
    showNotification(
        isNowComplete ? 'Actividad completada ✓' : 'Actividad marcada como pendiente',
        isNowComplete ? 'success' : 'warning',
        2
    );
    saveAndRenderActivities();
};

/**
 * Elimina una actividad por su índice en `activities` y persiste el cambio.
 *
 * @param {number} index - Índice de la actividad a eliminar.
 * @returns {void}
 */
window.deleteUserActivity = (index) => {
    activities.splice(index, 1);
    saveAndRenderActivities();
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

renderUserTags();
syncComposerTagsUI();
syncTagFilterUI();
renderUserActivities();