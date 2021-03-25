// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

const categories = retrieveCategoryInfo();

const categorySelect = document.getElementById("category");
const taskSelect = document.getElementById("task");
const submitButton = document.getElementById('submit');

const categoriesByName = new Map();
categories.forEach(c => categoriesByName.set(c.name, c));

initForm();

wireEventListeners();

function retrieveCategoryInfo() {
    const categoryInfoElement = document.getElementById("categoryInfo");
    const categoryInfoJson = categoryInfoElement.innerHTML;
    return JSON.parse(categoryInfoJson);
}

function initForm() {
    categorySelect.options.length = 0; // clear the select
    category.options[0] = new Option('Select...', 'none');
    taskSelect.setAttribute('disabled', '');
    categories.forEach((c, i) => {
        categorySelect.options[i + 1] = new Option(c.name, c.name);
    });
}

function wireEventListeners() {
    categorySelect.addEventListener('change', e => onCategorySelectionChanged(e));
    taskSelect.addEventListener('change', e => updateSubmitButtonDisabledState());
    submitButton.addEventListener('click', e => onSubmitButtonClicked())
}

function updateSubmitButtonDisabledState() {
    const submitButton = document.getElementById('submit');
    if (taskSelect.value != 'none') {
        submitButton.removeAttribute('disabled');
    } else {
        submitButton.setAttribute('disabled', '');
    }
}

function onCategorySelectionChanged(e) {
    const value = event.target.value;

    taskSelect.options.length = 0;
    taskSelect.options[0] = new Option('Select...', 'none');
    if (value != 'none') {
        const category = categoriesByName.get(value);
        category.tasks.forEach((t, i) =>
            taskSelect.options[i + 1] = new Option(t.name, t.name));

    }

    if (value != 'none') {
        taskSelect.removeAttribute('disabled');
    } else {
        taskSelect.setAttribute('disabled', '');
    }

    updateSubmitButtonDisabledState();
}

function onSubmitButtonClicked() {
    alert('Not implemented yet');
}
