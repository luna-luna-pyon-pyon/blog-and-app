const STORAGE_KEY = "memo_todo_items_v1";

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const clearDoneBtn = document.getElementById("clear-done");

let items = loadItems();
render();

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  items.unshift({
    id: crypto.randomUUID(),
    text,
    done: false,
  });

  saveAndRender();
  input.value = "";
  input.focus();
});

clearDoneBtn.addEventListener("click", () => {
  items = items.filter((item) => !item.done);
  saveAndRender();
});

function loadItems() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

function saveAndRender() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  render();
}

function render() {
  list.replaceChildren();

  for (const item of items) {
    const li = document.createElement("li");
    li.className = `todo-item ${item.done ? "done" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = item.done;
    checkbox.addEventListener("change", () => {
      item.done = checkbox.checked;
      saveAndRender();
    });

    const label = document.createElement("span");
    label.className = "label";
    label.textContent = item.text;

    const del = document.createElement("button");
    del.className = "icon-btn";
    del.textContent = "削除";
    del.addEventListener("click", () => {
      items = items.filter((x) => x.id !== item.id);
      saveAndRender();
    });

    li.append(checkbox, label, del);
    list.appendChild(li);
  }
}
