//Sidebar
const sidebar = document.getElementById('sidebar');
const sidebarMobileToggle = document.getElementById('sidebar-mobile-toggle');
//Tags
const sidebarTagMenu = document.querySelector('.sidebar-tag-menu');
const sidebarTagMenuItemContainer = sidebarTagMenu.parentElement;
const sidebarTagMenuCollapsibleContent = document.getElementById('tag-menu-collapsible');
const sidebarTagMenuIcon = document.getElementById('tag-menu-icon');
const tagForm = document.querySelector(".tag-menu-form");
const tagFormText = document.getElementById("new-tag-input");
const tagFormColor = document.getElementById("tag-color-input");
const tagList = document.getElementById("tag-menu-list")
//Composer
const tagSelector = document.getElementById('activity-tag-selector');
const tagSelectorIcon = document.getElementById('activity-tag-selector-icon');
const tagContainer = document.getElementById('activity-tag-container');
const tagOptions = document.getElementById('activity-tag-options');


let tags = JSON.parse(localStorage.getItem('tags')) || [];
let activities = JSON.parse(localStorage.getItem('activities')) || [];

renderUserTags();

/**
 * Handles the button to enable and disable darkmode
 */
document.addEventListener("DOMContentLoaded", event => {
    const html = document.documentElement;
    const themeButton = document.getElementById("button-toggle-theme");

    themeButton.addEventListener('click', () => {
        const isDark = html.classList.toggle('dark');

        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    if (localStorage.getItem('theme') === 'dark') {
        html.classList.add('dark');
    }
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
                    onclick="deleteUserTag(${index})">x</button>
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

document.addEventListener('click', () => {
    tagOptions.classList.add('hidden');
    if (tagSelectorIcon.textContent === 'keyboard_arrow_down') {
        tagSelectorIcon.textContent = 'keyboard_arrow_up';
    }
    else {
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

        span.className = 'activity-tag cursor-pointer hover:opacity-80 transition-opacity border p-1 rounded-lg text-xs font-bold';

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