//Header
const themeIcon = document.getElementById('theme-toggle-icon')
//Notification
const notificationContainer = document.querySelector('.notification-container');
const notificationMessage = document.getElementById('notification-message');
//Sidebar
const sidebar = document.getElementById('sidebar');
const sidebarMobileToggle = document.getElementById('sidebar-mobile-toggle');
//Tags
const sidebarTagMenu = document.getElementById('sidebar-tag-menu');
const sidebarTagMenuItemContainer = sidebarTagMenu.parentElement;
const sidebarTagMenuCollapsibleContent = document.getElementById('tag-menu-collapsible');
const sidebarTagMenuIcon = document.getElementById('tag-menu-icon');
const tagForm = document.getElementById('tag-menu-form');
const tagFormText = document.getElementById('new-tag-input');
const tagFormColor = document.getElementById('tag-color-input');
const tagList = document.getElementById("tag-menu-list")
//Composer
const tagSelector = document.getElementById('activity-tag-selector');
const tagSelectorIcon = document.getElementById('activity-tag-selector-icon');
const tagContainer = document.getElementById('activity-tag-container');
const tagOptions = document.getElementById('activity-tag-options');
const activityComposerForm = document.getElementById('activity-form');
const activityComposerInput = document.getElementById('activity-composer-input');
//Activities
const activityContainer = document.getElementById('activity-container');
//Filters
const activitySearch = document.getElementById('activity-filter-search');

const NOTIFICATION_TYPES = {
    success: 'notification--success',
    error: 'notification--error',
    warning: 'notification--warning',
};

let notificationHideTimeout = null;

/**
 * Muestra una notificación durante X segundos.
 *
 * @param {string} message Texto a mostrar.
 * @param {'success'|'error'|'warning'} [type='success'] Tipo de notificación.
 * @param {number} [seconds=3] Segundos visibles.
 * @returns {void}
 */
function showNotification(message, type = 'success', seconds = 3) {

    if (!notificationContainer || !notificationMessage) return;

    notificationMessage.textContent = message;

    Object.values(NOTIFICATION_TYPES).forEach(cls => {
        notificationContainer.classList.remove(cls);
    });
    const typeClass = NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES.success;
    notificationContainer.classList.add(typeClass);

    notificationContainer.classList.add('notification--visible');

    if (notificationHideTimeout) clearTimeout(notificationHideTimeout);

    notificationHideTimeout = setTimeout(() => {
        notificationContainer.classList.remove('notification--visible');
    }, seconds * 1000);
}

/**
 * Permite cerrar manualmente la notificación con el botón de dismiss.
 */
if (notificationContainer) {

    notificationContainer.addEventListener('click', () => {

        if (notificationHideTimeout) clearTimeout(notificationHideTimeout);
        notificationContainer.classList.remove('notification--visible');
    });
}

// Exponer helper de notificación globalmente
window.showNotification = showNotification;

let tags = JSON.parse(localStorage.getItem('tags')) || [];
let activities = JSON.parse(localStorage.getItem('activities')) || [];

renderUserTags();
renderUserActivities();

/**
 * Inicializa el tema (dark/light) cuando el DOM está listo.
 * - Lee el tema guardado en `localStorage` (clave: `theme`)
 * - Aplica/elimina la clase `dark` en `<html>`
 * - Actualiza el icono del botón de tema y registra el clic para alternarlo
 *
 * @listens document#DOMContentLoaded
 * @returns {void}
 */
document.addEventListener("DOMContentLoaded", () => {

    const html = document.documentElement;

    const savedTheme = localStorage.getItem('theme');
    let isDark = savedTheme === 'dark';

    if (isDark) {
        html.classList.add('dark');
    }

    const updateButtonUI = (dark) => {
        themeIcon.textContent = dark ? 'light_mode' : 'dark_mode';
    };

    updateButtonUI(isDark);


    /**
    * Alterna el tema entre oscuro y claro.
    * - Alterna la clase `dark` en `<html>`
    * - Persiste el valor en `localStorage` (clave: `theme`)
    * - Actualiza el icono del botón
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

/**
 * Alterna la visibilidad del sidebar en móvil.
 * Agrega o quita la clase `is-open` en el elemento `#sidebar`.
 *
 * @listens HTMLElement#click
 * @returns {void}
 */
sidebarMobileToggle.addEventListener('click', () => {

    sidebar.classList.toggle('is-open');
});

/**
 * Renderiza las etiquetas del usuario en el menú del sidebar.
 * Usa el estado global `tags` y repinta el contenedor `#tag-menu-list`.
 *
 * @returns {void}
 */
function renderUserTags() {

    tagList.innerHTML = '';

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
 * Guarda `tags` en `localStorage` y actualiza la UI relacionada.
 * - Persiste `tags` bajo la clave `tags`
 * - Re-renderiza la lista del sidebar
 * - Re-renderiza las opciones del selector de etiquetas del composer
 *
 * @returns {void}
 */
function saveAndRenderTags() {

    localStorage.setItem('tags', JSON.stringify(tags));
    renderUserTags();
    syncComposerTagsUI();
}

/**
 * Crea una nueva etiqueta desde el formulario del sidebar.
 * Reglas:
 * - No permite nombre vacío
 * - No permite duplicados por nombre
 *
 * Si es válida:
 * - Añade `{ name, color }` a `tags`
 * - Persiste y re-renderiza con `saveAndRenderTags()`
 * - Limpia el input de nombre
 *
 * @param {SubmitEvent} e Evento de submit del formulario.
 * @listens HTMLFormElement#submit
 * @returns {void}
 */
tagForm.addEventListener("submit", (e) => {

    e.preventDefault();

    const tagName = tagFormText.value.trim();
    const tagColor = tagFormColor.value;

    if (tagName === ""){
        showNotification('Etiqueta no puede estar vacía', 'warning', 3);
        return;
    }
    else if (tags.some(t => t.name === tagName)) {
        showNotification('Etiqueta ya existe', 'warning', 3);
        return;
    }

    const newTag = {
        name: tagName,
        color: tagColor,
    }

    tags.push(newTag);
    showNotification('Etiqueta creada', 'success', 3);
    saveAndRenderTags();
    tagFormText.value = "";
})

/**
 * Elimina una etiqueta por índice del array `tags` y actualiza persistencia/UI.
 *
 * @param {number} index Índice de la etiqueta a borrar.
 * @returns {void}
 */
window.deleteUserTag = (index) => {

    tags.splice(index, 1);
    saveAndRenderTags();
};

/**
 * Alterna el colapso del menú de etiquetas del sidebar.
 * - Alterna la clase `is-active` en el item contenedor
 * - Cambia el icono entre `keyboard_arrow_down` y `keyboard_arrow_up`
 *
 * @listens HTMLElement#click
 * @returns {void}
 */
sidebarTagMenu.addEventListener('click', () => {

    sidebarTagMenuItemContainer.classList.toggle('is-active');

    if (sidebarTagMenuIcon.textContent === 'keyboard_arrow_down') {
        sidebarTagMenuIcon.textContent = 'keyboard_arrow_up';
    }
    else {
        sidebarTagMenuIcon.textContent = 'keyboard_arrow_down';
    }
});

/**
 * Evita que los clics dentro del contenido colapsable propaguen al toggle del menú.
 *
 * @param {MouseEvent} e Evento de clic.
 * @listens HTMLElement#click
 * @returns {void}
 */
sidebarTagMenuCollapsibleContent.addEventListener('click', (e) => {
    e.stopPropagation();
});


let selectedTagsForNewActivity = [];

/**
 * Abre/cierra el selector de etiquetas del composer.
 * - Evita propagación para que el clic no dispare el cierre global del documento
 * - Alterna la clase `hidden` en `#activity-tag-options`
 * - Actualiza el icono del selector
 *
 * @param {MouseEvent} e Evento de clic.
 * @returns {void}
 */
tagSelector.onclick = (e) => {

    e.stopPropagation();

    tagOptions.classList.toggle('hidden');
    if (tagSelectorIcon.textContent === 'keyboard_arrow_down') {
        tagSelectorIcon.textContent = 'keyboard_arrow_up';
    }
    else {
        tagSelectorIcon.textContent = 'keyboard_arrow_down';
    }
};

/**
 * Cierra el desplegable del selector de etiquetas cuando se hace clic fuera.
 * También restablece el icono a `keyboard_arrow_down` si estaba abierto.
 *
 * @listens Document#click
 * @returns {void}
 */
document.addEventListener('click', () => {

    tagOptions.classList.add('hidden');

    if (tagSelectorIcon.textContent === 'keyboard_arrow_up') {
        tagSelectorIcon.textContent = 'keyboard_arrow_down';
    }
});

/**
 * Sincroniza la UI del *composer* de actividades con el estado actual:
 * - Renderiza las etiquetas seleccionadas debajo del composer
 * - Renderiza las opciones disponibles en el selector, excluyendo las ya seleccionadas
 *
 * @returns {void}
 */
function syncComposerTagsUI() {

    // Etiquetas seleccionadas debajo del composer
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

    // Opciones disponibles en el selector
    tagOptions.innerHTML = '';

    const availableTags = tags.filter(tag =>
        !selectedTagsForNewActivity.some(selected => selected.name === tag.name)
    );

    availableTags.forEach((tag) => {
        const li = document.createElement('li');

        li.className = 'tag-menu-item flex justify-between items-center gap-0.5 p-0.5 cursor-pointer hover:bg-white/5 transition-colors rounded-lg';

        li.innerHTML = `
            <span class= "activity-tag flex-1 truncate" style="border-color: ${tag.color}; color: ${tag.color}; background-color: ${tag.color}20">
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
 * Añade una etiqueta a `selectedTagsForNewActivity` si no estaba ya seleccionada.
 * Luego actualiza la UI del composer y las opciones del selector.
 *
 * @param {string} tagName Nombre de la etiqueta.
 * @param {string} tagColor Color CSS asociado a la etiqueta (normalmente hex).
 * @returns {void}
 */
function addTagToSelection(tagName, tagColor) {

    if (tagName && !selectedTagsForNewActivity.some(t => t.name === tagName)) {
        selectedTagsForNewActivity.push({ name: tagName, color: tagColor });
        syncComposerTagsUI();
    }
}

syncComposerTagsUI();

/**
 * Renderiza la lista de actividades en `#activity-container`.
 * Cada actividad muestra:
 * - Título (`activity.name`)
 * - Etiquetas (`activity.tags`)
 * - Textarea de descripción (con autoresize y persistencia onBlur)
 *
 * Nota: `filter` existe, pero actualmente no se usa dentro de la función.
 *
 * @returns {void}
 */
function renderUserActivities() {

    activityContainer.innerHTML = '';

    activities.forEach((activity, index) => {

        const li = document.createElement('li');

        const activityTags = activity.tags.map(tag => `
            <span class="activity-tag" 
                  style="border-color: ${tag.color}; color: ${tag.color}; background-color: ${tag.color}20">
                ${tag.name}
            </span>
        `).join('');

        li.innerHTML = `
            <article class="activity-item">
                <div class="activity-data">
                    <div class="activity-info">
                        <h3>${activity.name}</h3>
                        <div class="activity-tags">
                            ${activityTags}
                        </div>
                    </div>
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
 * Ajusta automáticamente la altura de un `<textarea>` al contenido para evitar overflow.
 *
 * @param {HTMLTextAreaElement} textarea Textarea cuyo alto se ajusta.
 * @returns {void}
 */
function autoResize(textarea) {

    textarea.style.height = 'auto';
    textarea.style.height = (textarea.scrollHeight) + 'px';
}

/**
 * Guarda el array `activities` en `localStorage` y repinta la lista.
 *
 * @returns {void}
 */
function saveAndRenderActivities() {

    localStorage.setItem('activities', JSON.stringify(activities));
    renderUserActivities();
}

/**
 * Crea una nueva actividad desde el formulario del composer.
 * Reglas:
 * - No permite nombre vacío
 * - No permite duplicados por nombre
 *
 * Si es válida:
 * - Crea `{ name, tags, description }`
 * - Resetea `selectedTagsForNewActivity` y limpia el input
 * - Re-renderiza tags del composer y opciones del selector
 * - Persiste y repinta actividades
 *
 * @param {SubmitEvent} e Evento de submit del formulario.
 * @listens HTMLFormElement#submit
 * @returns {void}
 */
activityComposerForm.addEventListener('submit', (e) => {

    e.preventDefault();

    const activityName = activityComposerInput.value;

    if (activityName === "") {
        showNotification('Actividad no puede estar vacía', 'warning', 3);
        return;
    }
    else if (activities.some(a => a.name === activityName)) {
        showNotification('Actividad ya existe', 'warning', 3);
        return;
    }

    const newActivity = {
        name: activityName,
        tags: [...selectedTagsForNewActivity],
        description: '',
    }

    activities.push(newActivity);
    showNotification('Actividad creada', 'success', 3);

    selectedTagsForNewActivity.length = 0
    activityComposerInput.value = "";
    syncComposerTagsUI();
    saveAndRenderActivities();
})

/**
 * Actualiza la descripción de una actividad por índice y persiste el cambio.
 *
 * @param {number} index Índice de la actividad en `activities`.
 * @param {string} newValue Nuevo valor de descripción.
 * @returns {void}
 */
function updateActivityDescription(index, newValue) {

    activities[index].description = newValue;
    saveAndRenderActivities();
}

/**
 * Elimina una actividad por índice del array `activities` y actualiza persistencia/UI.
 *
 * @param {number} index Índice de la actividad a borrar.
 * @returns {void}
 */
window.deleteUserActivity = (index) => {

    activities.splice(index, 1);
    saveAndRenderActivities();
};

/**
 * Filtra visualmente las actividades ya renderizadas según el texto de búsqueda.
 * Recorre los `<li>` y compara el término con el título (`.activity-info h3`),
 * ocultando/mostrando cada item mediante `li.style.display`.
 *
 * @listens HTMLInputElement#input
 * @returns {void}
 */
activitySearch.addEventListener('input', () => {

    const activityList = document.querySelectorAll('.activity-container li');

    const searchTerm = activitySearch.value.toLowerCase();

    activityList.forEach(li => {

        const titleElement = li.querySelector('.activity-info h3');

        if (titleElement) {

            const title = titleElement.textContent.toLowerCase();

            li.style.display = title.includes(searchTerm) ? 'block' : 'none';
        }
    })
});