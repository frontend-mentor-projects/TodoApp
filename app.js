const container = document.querySelector(".container");
const toggleBtn = document.getElementById("darkModeToggle");
const todoFormContainer = document.querySelector(".todo-form-container");
const contentContainer = document.querySelector(".content-container");
const filterContainer = document.querySelector(".filter-container");
const footerContainer = document.querySelector(".footer-container");
const todoForm = document.querySelector(".todo-form");
const todoInput = document.querySelector(".todo-input");
const remainingTodos = document.querySelector(".remaining-todos");
const clearCompletedBtn = document.querySelector(".clear-completed");
const filterCompletedBtn = document.querySelector(".filter-completed");
const filterAllBtn = document.querySelector(".filter-all");
const filterButtons = document.querySelectorAll(".filter");
const drag = document.querySelector(".drag");

function displayTodos(todos) {
  const todosToRemove = contentContainer.querySelectorAll(".todo");
  todosToRemove.forEach((todo) => todo.remove());
  todos.forEach((todo, index) => {
    const todoElement = getTodoElement(todo);
    contentContainer.insertAdjacentElement("afterbegin", todoElement);
  });

  updateRemainingTodos();
}

function updateRemainingTodos() {
  const remainingTodosCount = getTodos().filter(
    (todo) => !todo.completed
  ).length;

  remainingTodos.textContent = `${remainingTodosCount} items left`;
}

function getTodoElement(todo) {
  const todoElement = document.createElement("div");
  todoElement.classList.add("todo");
  todoElement.setAttribute("data-id", todo.id);

  todoElement.setAttribute("draggable", "true");

  const circle = document.createElement("div");
  circle.classList.add("circle");

  const iconCheck = document.createElement("img");
  iconCheck.src = "/images/icon-check.svg";
  iconCheck.alt = "icon-check";
  iconCheck.classList.add("icon-check");

  circle.appendChild(iconCheck);

  const todoText = document.createElement("p");
  todoText.classList.add("todo-text");
  todoText.textContent = todo.text;

  const crossBtn = document.createElement("button");
  crossBtn.type = "button";
  crossBtn.classList.add("cross-btn");
  crossBtn.addEventListener("click", (e) => deleteTodo(e));

  const iconCross = document.createElement("img");
  iconCross.src = "/images/icon-cross.svg";
  iconCross.alt = "cross";

  if (todo.completed) {
    circle.classList.add("selected");
    todoText.style.textDecoration = "line-through";
    todoElement.classList.add("completed");
  }

  crossBtn.appendChild(iconCross);

  todoElement.appendChild(circle);
  todoElement.appendChild(todoText);
  todoElement.appendChild(crossBtn);

  addDraggingEventListeners(todoElement);

  return todoElement;
}

function getTodos() {
  let todos = JSON.parse(localStorage.getItem("todos")) ?? [];

  // todos.sort((a, b) => {
  //   if (a.completed === b.completed) {
  //     return b.timestamp - a.timestamp;
  //   }
  //   return a.completed ? -1 : 1;
  // });

  return todos;
}

function addTodo(e) {
  e.preventDefault();
  const todoText = todoInput.value.trim();
  if (!todoText) return;

  let todos = getTodos();
  const newTodo = {
    id: crypto.randomUUID(),
    createdDate: Date.now(),
    text: todoText,
    completed: false,
  };
  todos.push(newTodo);
  localStorage.setItem("todos", JSON.stringify(todos));

  todoForm.reset();

  const todoElement = getTodoElement(newTodo);
  updateRemainingTodos();
  contentContainer.insertAdjacentElement("afterbegin", todoElement);
}

function clearCompletedTodos() {
  let todos = getTodos();
  todos = todos.filter((todo) => !todo.completed);
  localStorage.setItem("todos", JSON.stringify(todos));

  displayTodos(todos);
}

function displayCompletedTodos() {
  let todos = getTodos();

  todos = todos.filter((todo) => todo.completed);

  displayTodos(todos);

  filterButtons.forEach((button) => button.classList.remove("active"));
  filterCompletedBtn.classList.add("active");
}

function displayAllTodos() {
  displayTodos(getTodos());
  filterButtons.forEach((button) => button.classList.remove("active"));
  filterAllBtn.classList.add("active");
}

function toggleCompleteTodo(e) {
  const todoElement = e.target.closest(".todo");
  let todos = getTodos();
  const todoIndex = todos.findIndex(
    (todo) => todo.id === todoElement.dataset.id
  );
  todos[todoIndex].completed = !todos[todoIndex].completed;

  localStorage.setItem("todos", JSON.stringify(todos));

  updateRemainingTodos();

  todoElement.classList.toggle("completed");
  todoElement.querySelector(".circle").classList.toggle("selected");
  todoElement.querySelector(".todo-text").style.textDecoration = todos[
    todoIndex
  ].completed
    ? "line-through"
    : "none";
}

function moveFilterContainer() {
  if (footerContainer.contains(filterContainer)) {
    footerContainer.removeChild(filterContainer);
  }

  if (!container.contains(filterContainer)) {
    container.insertBefore(filterContainer, drag);
  }
}

function restoreFilterContainer() {
  if (container.contains(filterContainer)) {
    container.removeChild(filterContainer);
  }

  if (!footerContainer.contains(filterContainer)) {
    footerContainer.insertBefore(filterContainer, clearCompletedBtn);
  }
}

function deleteTodo(e) {
  const todoElement = e.target.closest(".todo");
  let todos = getTodos();
  todos = todos.filter((todo) => todo.id !== todoElement.dataset.id);
  localStorage.setItem("todos", JSON.stringify(todos));
  displayTodos(todos);
}

function checkWindowWidth() {
  if (window.innerWidth <= 500) {
    moveFilterContainer();
  } else {
    restoreFilterContainer();
  }
}

function addDraggingEventListeners(todo) {
  todo.addEventListener("dragstart", dragStart);
  todo.addEventListener("dragover", dragOver);
  todo.addEventListener("dragleave", dragLeave);
  todo.addEventListener("drop", dragDrop);
}

function dragStart(event) {
  event.dataTransfer.setData("data-id", event.target.dataset.id);
  event.target.classList.add("dragging");
}

function dragOver(event) {
  event.preventDefault();
  const dropZone = event.target.closest(".todo");
  if (dropZone) {
    dropZone.classList.add("highlight");
  }
}

function dragLeave(event) {
  event.preventDefault();

  const dropZone = event.target.closest(".todo");
  if (dropZone) {
    dropZone.classList.remove("highlight");
  }
}

function dragDrop(event) {
  event.preventDefault();

  let id = event.dataTransfer.getData("data-id");

  const dropZone = event.target.closest(".todo");
  dropZone.classList.remove("highlight");

  const todos = getTodos();

  const draggedTodoIndex = todos.findIndex((todo) => todo.id === id);
  const dropZoneIndex = todos.findIndex(
    (todo) => todo.id === dropZone.dataset.id
  );

  const dragged = todos[draggedTodoIndex];
  todos.splice(draggedTodoIndex, 1);
  todos.splice(dropZoneIndex, 0, dragged);

  localStorage.setItem("todos", JSON.stringify(todos));

  displayTodos(todos);

  addDraggingEventListeners();
}

function toggleDarkMode() {
  const body = document.body;

  const isDarkMode = localStorage.getItem("darkMode") === "true";

  if (isDarkMode) {
    body.classList.add("dark-mode");
    todoFormContainer.classList.add("dark-mode");
    footerContainer.classList.add("dark-mode");
    contentContainer.classList.add("dark-mode");
    filterContainer.classList.add("dark-mode");
    toggleBtn.querySelector("img").src = "/images/icon-sun.svg";
  }
}

function addEventListeners() {
  todoForm.addEventListener("submit", (e) => addTodo(e));
  contentContainer.addEventListener("click", (e) => toggleCompleteTodo(e));
  clearCompletedBtn.addEventListener("click", clearCompletedTodos);
  filterCompletedBtn.addEventListener("click", displayCompletedTodos);
  filterAllBtn.addEventListener("click", displayAllTodos);
  window.addEventListener("resize", checkWindowWidth);
  toggleDarkMode();
  toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    todoFormContainer.classList.toggle("dark-mode");
    footerContainer.classList.toggle("dark-mode");
    contentContainer.classList.toggle("dark-mode");
    filterContainer.classList.toggle("dark-mode");

    localStorage.setItem(
      "darkMode",
      localStorage.getItem("darkMode") !== "true"
    );

    toggleBtn.querySelector("img").src =
      localStorage.getItem("darkMode") === "true"
        ? "/images/icon-sun.svg"
        : "/images/icon-moon.svg";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  displayTodos(getTodos());
  addEventListeners();
  checkWindowWidth();
});
