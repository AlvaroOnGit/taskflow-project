//Header
const themeIcon = document.getElementById('theme-toggle-icon')
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

let tags = JSON.parse(localStorage.getItem('tags')) || [];
let activities = JSON.parse(localStorage.getItem('activities')) || [];

renderUserTags();
renderUserActivities();

/**
 * Handles the button to enable and disable darkmode
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

    themeIcon.addEventListener('click', () => {

        isDark = html.classList.toggle('dark');

        localStorage.setItem('theme', isDark ? 'dark' : 'light');

        updateButtonUI(isDark);
    });
});

/**
 * Handles the functionality for rendering the sidebar on mobile
 */
sidebarMobileToggle.addEventListener('click', () => {

    sidebar.classList.toggle('is-open');
});

// TAGS
/**
 * Handles the functionality for rendering the users tags on the sidebar
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
            <button class="tag-menu-button bg-activity-delete p-0.5 rounded text-xs" 
                    onclick="deleteUserTag(${index})">X</button>
        `;
        tagList.appendChild(li);
    });
}

/**
 * Saves the tag to localStorage and calls for the rendering of the tags
 * It also calls for an update on the tag selector on the activity composer
 */
function saveAndRenderTags() {

    localStorage.setItem('tags', JSON.stringify(tags));
    renderUserTags();
    updateTagSelector();
}

/**
 * Handles the functionality to create tags
 * Fails if the tag name is blank, or it already exists
 * If the tag is valid, it calls for rendering and saving on localStorage
 */
tagForm.addEventListener("submit", (e) => {

    e.preventDefault();

    const tagName = tagFormText.value.trim();
    const tagColor = tagFormColor.value;

    if (tagName === "" || tags.some(t => t.name === tagName)) return;

    const newTag = {
        name: tagName,
        color: tagColor,
    }

    tags.push(newTag);
    saveAndRenderTags();
    tagFormText.value = "";
})

/**
 * Handles the deletion of tags
 * Calls for rendering to update the tag list
 */
window.deleteUserTag = (index) => {

    tags.splice(index, 1);
    saveAndRenderTags();
};

/**
 * Handles the "collapse" of the tag menu
 * It also changes the arrow icon depending on context
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

sidebarTagMenuCollapsibleContent.addEventListener('click', (e) => {
    e.stopPropagation();
});


let selectedTagsForNewActivity = [];

/**
 * Handles the functionality of the activity selector
 * It also changes the arrow icon depending on context
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
 * Handles the arrow icon for the tag selector on the activity composer
 */
document.addEventListener('click', () => {

    tagOptions.classList.add('hidden');

    if (tagSelectorIcon.textContent === 'keyboard_arrow_up') {
        tagSelectorIcon.textContent = 'keyboard_arrow_down';
    }
});

/**
 * Updates the tag selector with the currently available tags
 * Hides already selected tags to avoid duplicates
 */
function updateTagSelector() {

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
 * Renders the currently selected tags below the composer
 * Allows the user to delete selected tags as well
 */
function renderComposerTags() {

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
            renderComposerTags();
            updateTagSelector();
        };

        tagContainer.appendChild(span);
    });
}

/**
 * Handles the addition of tags to the `selectedTagsForNewActivity` array
 * Updates the tag selector afterward
 */
function addTagToSelection(tagName, tagColor) {

    if (tagName && !selectedTagsForNewActivity.some(t => t.name === tagName)) {
        selectedTagsForNewActivity.push({ name: tagName, color: tagColor });
        renderComposerTags();
        updateTagSelector();
    }
}

updateTagSelector();


//Activities
/**
 * Handles the functionality for rendering the users activities
 */
function renderUserActivities(filter = "") {

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
 * Handles the resizing of the textarea to control overflow on runtime
 */
function autoResize(textarea) {

    textarea.style.height = 'auto';
    textarea.style.height = (textarea.scrollHeight) + 'px';
}

/**
 * Handles the functionality for saving user activities to localStorage
 * Calls for the rendering of activities afterward
 */
function saveAndRenderActivities() {

    localStorage.setItem('activities', JSON.stringify(activities));
    renderUserActivities();
}

/**
 * Handles the creation of activities
 * Clears the tag container on the composer after creation
 */
activityComposerForm.addEventListener('submit', (e) => {

    e.preventDefault();

    const activityName = activityComposerInput.value;

    if (activityName === "" || activities.some(a => a.name === activityName)) return;

    const newActivity = {
        name: activityName,
        tags: [...selectedTagsForNewActivity],
        description: '',
    }

    activities.push(newActivity);

    selectedTagsForNewActivity.length = 0
    activityComposerInput.value = "";
    renderComposerTags();
    updateTagSelector();
    saveAndRenderActivities();
})

/**
 * Updates the description value of the activity on localStorage
 * Calls for the rendering of activities afterward
 */
function updateActivityDescription(index, newValue) {

    activities[index].description = newValue;
    saveAndRenderActivities();
}

/**
 * Handles the deletion of activities
 * Calls for the rendering of activities afterward
 */
window.deleteUserActivity = (index) => {

    activities.splice(index, 1);
    saveAndRenderActivities();
};

/**
 * Handles the filtering of activities
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