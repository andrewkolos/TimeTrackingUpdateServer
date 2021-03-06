// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

const categories = retrieveCategoryInfo();

const categorySelect = document.getElementById("category");
const taskSelect = document.getElementById("task");
const notesText = document.getElementById('notes');
const submitButton = document.getElementById('submit');
const form = document.getElementById('form');

const categoriesByName = new Map();
categories.forEach(c => categoriesByName.set(c.Name, c));

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
    categories.forEach((c, i) => {
        categorySelect.options[i + 1] = new Option(c.Name, c.Name);
    });

    taskSelect.setAttribute('disabled', '');
    taskSelect.selectedIndex = 0;
}

function wireEventListeners() {
    categorySelect.addEventListener('change', e => onCategorySelectionChanged(e));
    taskSelect.addEventListener('change', e => updateSubmitButtonDisabledState());
    submitButton.addEventListener('click', e => onSubmitButtonClicked());

    form.addEventListener('submit', e => {
        e.preventDefault(); // Prevents default behavior, which is to reload the page.
    });
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
        category.Tasks.forEach((t, i) =>
            taskSelect.options[i + 1] = new Option(t.Name, t.Name));

    }

    if (value != 'none') {
        taskSelect.removeAttribute('disabled');
    } else {
        taskSelect.setAttribute('disabled', '');
    }

    updateSubmitButtonDisabledState();
}

function onSubmitButtonClicked() {
    const category = categorySelect.value;
    const task = categorySelect.value;
    const notes = notesText.value;

    fetch('/api/addEntry', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            category,
            task,
            notes,
        }),
    })
        .then(response => { console.log(response); })
        .catch(reason => { console.log(reason); });

    initForm();
}
