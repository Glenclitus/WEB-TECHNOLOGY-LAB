// Online Art Supplies Store - Art Project Task Tracker (EXP_6)

// 1. Application State
let tasks = JSON.parse(localStorage.getItem("artTasks")) || [
    { id: 1, text: "Buy oil paint starter pack", done: false },
    { id: 2, text: "Sketch portrait outline on canvas", done: true },
    { id: 3, text: "Clean acrylic brushes with solvent", done: false }
];
let currentFilter = "all"; // 'all', 'open', or 'finished'

// DOM Elements
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const counter = document.getElementById("counter");
const filterButtons = document.querySelectorAll(".filter-btn");

// 2. Declaring small, single-purpose functions

// Creates a new task object
function createTask(text) {
    return {
        id: Date.now(),
        text: text,
        done: false
    };
}

// Adds a task to the state
function addTask(text) {
    tasks.push(createTask(text));
    saveAndRender();
}

// Toggles completion status using map()
function toggleTask(id) {
    tasks = tasks.map(t => 
        t.id === id ? { ...t, done: !t.done } : t
    );
    saveAndRender();
}

// Deletes a task using filter()
function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveAndRender();
}

// Optional Bonus Function: Edit task text
function editTask(id, newText) {
    tasks = tasks.map(t =>
        t.id === id ? { ...t, text: newText } : t
    );
    saveAndRender();
}

// Shared helper: Persists to localStorage and redraws
function saveAndRender() {
    localStorage.setItem("artTasks", JSON.stringify(tasks));
    renderTasks();
}

// 3. Filtering and Counting Helpers (Higher-Order Functions & Callbacks)

// Callback tester functions
const isOpen = t => !t.done;
const isFinished = t => t.done;

// Counts pending tasks using filter()
function countOpen() {
    return tasks.filter(isOpen).length;
}

// Returns filtered tasks according to current filter
function getVisible() {
    if (currentFilter === "open") {
        return tasks.filter(isOpen);
    }
    if (currentFilter === "finished") {
        return tasks.filter(isFinished);
    }
    return tasks; // 'all'
}

// 4. Drawing the Screen

// Builds a single task DOM row
function taskItem(t) {
    const li = document.createElement("li");
    li.className = `task-row ${t.done ? "completed" : ""}`;

    // Checkbox toggle
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = t.done;
    checkbox.addEventListener("change", () => toggleTask(t.id));

    // Task text span
    const span = document.createElement("span");
    span.className = "task-text";
    span.textContent = t.text;

    // Action button group
    const actions = document.createElement("div");
    actions.className = "task-actions";

    // Edit button
    const editBtn = document.createElement("button");
    editBtn.className = "btn-icon btn-edit";
    editBtn.innerHTML = "✎";
    editBtn.title = "Edit task";
    editBtn.addEventListener("click", () => {
        const updated = prompt("Edit art task:", t.text);
        if (updated !== null && updated.trim() !== "") {
            editTask(t.id, updated.trim());
        }
    });

    // Delete button
    const delBtn = document.createElement("button");
    delBtn.className = "btn-icon btn-delete";
    delBtn.innerHTML = "×";
    delBtn.title = "Delete task";
    delBtn.addEventListener("click", () => deleteTask(t.id));

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(actions);

    return li;
}

// Redraws the list and counter
function renderTasks() {
    taskList.innerHTML = "";
    const visibleList = getVisible();

    if (visibleList.length === 0) {
        const emptyMsg = document.createElement("li");
        emptyMsg.className = "empty-message";
        emptyMsg.textContent = "No tasks found in this view.";
        taskList.appendChild(emptyMsg);
    } else {
        visibleList.forEach(t => {
            taskList.appendChild(taskItem(t));
        });
    }

    const openCount = countOpen();
    counter.textContent = `${openCount} ${openCount === 1 ? "task" : "tasks"} left`;
}

// 5. Event Handlers

function handleSubmit(event) {
    event.preventDefault();
    const text = taskInput.value.trim();
    if (text !== "") {
        addTask(text);
    }
    taskInput.value = "";
}

// Filter button click handler
function setFilter(filterType) {
    currentFilter = filterType;
    filterButtons.forEach(btn => {
        btn.classList.toggle("active", btn.dataset.filter === filterType);
    });
    renderTasks();
}

// 6. Initialization
document.addEventListener("DOMContentLoaded", () => {
    taskForm.addEventListener("submit", handleSubmit);

    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => setFilter(btn.dataset.filter));
    });

    renderTasks(); // Initial render
});

