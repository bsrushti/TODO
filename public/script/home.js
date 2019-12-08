const generateCounter = function(count = 0) {
  return function() {
    return count++;
  };
};

let toDoCounter = generateCounter();
let itemCounter = generateCounter();

const getElementById = id => document.getElementById(id);

const generateDiv = function(attributes) {
 const div = document.createElement("div");
  div.id = attributes.id;
  div.className = attributes.className;
  div.innerText = attributes.value;
  return div;
};

const getTitleDiv = (id, title) =>
  generateDiv(setAttributes(`title_${id}`, "title", title));

const getDescriptionDiv = (id, description) =>
  generateDiv(setAttributes(`description_${id}`, "description", description));

const getTaskListDiv = function(id) {
  return generateDiv(setAttributes(`taskList_${id}`, "task-list", ""));
};

const setAttributes = function(id, className, value = "") {
  return { id, className, value };
};

const createButton = function(className, id, innerHTML) {
 const button = document.createElement("BUTTON");
  button.className = className;
  button.id = id;
  button.innerHTML = innerHTML;
  return button;
};

const createInput = function(id, type, className) {
 const input = document.createElement("input");
  input.type = type;
  input.className = className;
  input.id = id;
  return input;
};

const getAddItemDiv = function(id) {
 const addItemDiv = generateDiv(setAttributes("items", "items"));
 const input = createInput(`addTask_${id}`, "text", "insertItem");
  input.setAttribute("placeHolder", "enter task");
  addItemDiv.appendChild(input);
 const button = createButton("plus", "addItem", `&plus;`);
  button.onclick = addItem;
  addItemDiv.appendChild(button);
  return addItemDiv;
};

const generateItemDiv = function(id, description) {
 const attributes = setAttributes(id, "task", description);
 const itemDiv = generateDiv(attributes);
  itemDiv.setAttribute("contenteditable", "true");
  return itemDiv;
};

const getDeleteButton = function(id, className) {
 const deleteButton = document.createElement("i");
  deleteButton.id = id;
  deleteButton.className = `fas fa-trash-alt ${className}`;
  return deleteButton;
};

const appendItemDiv = function(parentDiv, item, id) {
 const itemDiv = generateItemDiv(id, item.description);
 const deleteButton = getDeleteButton(id, "deleteItem");
  deleteButton.onclick = deleteItem;
  deleteButton.setAttribute("contenteditable", "false");
 const input = createInput(id, "checkbox", "checkbox");
  if (item.done == "true") {
    input.checked = true;
  }
  itemDiv.appendChild(deleteButton);
  itemDiv.appendChild(input);
  parentDiv.appendChild(itemDiv);
};

const getItemsDiv = function(id, items) {
 const parentDiv = getTaskListDiv(id);
 const counter = generateCounter();
  items.forEach(item => {
    appendItemDiv(parentDiv, item, counter());
  });
  return parentDiv;
};

const getTODODiv = id => generateDiv({ id, className: "TODO", value: "" });

const getAllDivs = function(id, toDo) {
 const titleDiv = getTitleDiv(id, toDo.title);
 const descriptionDiv = getDescriptionDiv(id, toDo.description);
 const itemsDiv = getItemsDiv(id, toDo.items);
 const addItemDiv = getAddItemDiv(id);
 const TODODiv = getTODODiv(id);
  return {
    titleDiv,
    descriptionDiv,
    itemsDiv,
    addItemDiv,
    TODODiv
  };
};

const deleteToDo = function(event) {
 const toDo = event.target.parentElement;
 const name = getElementById("name").innerText;
 const toDoId = toDo.id;
 const content = { name, toDoId };
  writeContentToFile("/deleteToDo", JSON.stringify(content));
  toDo.style.display = "none";
};

const displayToDo = function(toDo, TODOs) {
 const id = toDoCounter();
 const  {
    titleDiv,
    descriptionDiv,
    itemsDiv,
    addItemDiv,
    TODODiv
  } = getAllDivs(id, toDo);
 const deleteButton = getDeleteButton(id, "deleteToDo");
  deleteButton.onclick = deleteToDo;
 const saveButton = createButton("saveButton", "", "Save");
  saveButton.onclick = save;
  TODODiv.appendChild(titleDiv);
  TODODiv.appendChild(descriptionDiv);
  TODODiv.appendChild(addItemDiv);
  TODODiv.appendChild(itemsDiv);
  TODODiv.appendChild(deleteButton);
  TODODiv.appendChild(saveButton);
  TODOs.appendChild(TODODiv);
};

const getItemsValue = function(event) {
 const name = getElementById("name").innerText;
 const id = event.target.parentElement.id;
 const items = getElementById(`taskList_${id}`);
  return { name, id, items };
};

const getModifiedItems = function(items) {
 const modifiedItems = [];
  items.childNodes.forEach(childNode => {
    if (childNode.style.display == "") {
     const itemAttributes = { description: childNode.innerText, done: "false" };
      if (childNode.lastChild.checked) {
        itemAttributes.done = "true";
      }
      modifiedItems.push(JSON.stringify(itemAttributes));
    }
  });
  return modifiedItems;
};

const save = function(event) {
 const  { name, id, items } = getItemsValue(event);
 const modifiedItems = getModifiedItems(items);
 const content = { name: name, id: id, items: modifiedItems };
  writeContentToFile("/saveItems", JSON.stringify(content));
};

const displayAllTodo = function(toDoList) {
 const  TODOs = getElementById("TODOs");
  toDoList.forEach(toDo => {
    displayToDo(toDo, TODOs);
  });
};

const writeContentToFile = function(url, content) {
  fetch(url, {
    method: "POST",
    body: content
  }).then(() => {
    return;
  });
};

const getElements = function() {
 const nameElement = getElementById("name");
 const titleElement = getElementById("title");
 const descriptionElement = getElementById("description");
  return { nameElement, titleElement, descriptionElement };
};

const getToDoValues = function(elements) {
 const  { nameElement, titleElement, descriptionElement } = elements;
 const name = nameElement.innerText;
 const title = titleElement.value;
 const description = descriptionElement.value;
  titleElement.value = "";
  descriptionElement.value = "";
  return { name, title, description };
};

const addToDo = function() {
 const elements = getElements();
 const  { name, title, description } = getToDoValues(elements);
 const content = { name: name, title: title, description: description };
  writeContentToFile("/addToDo", JSON.stringify(content));
 const items = [];
  displayAllTodo([{ title, description, items }]);
};

const getItemAttributes = function(event) {
 const name = getElementById("name").innerText;
 const id = event.target.parentElement.parentElement.id;
 const item = getElementById(`addTask_${id}`).value;
  return { name, id, item };
};

const deleteItem = function(event) {
 const parentElement = event.target.parentElement;
  parentElement.style.display = "none";
};

const generateAddItemDiv = function(id, item) {
 const itemId = getElementById(`taskList_${id}`).childNodes.length;
 const addItemDiv = generateDiv(setAttributes(itemId, "task", item));
 const deleteButton = getDeleteButton(id, "deleteItem");
  deleteButton.onclick = deleteItem;
 const input = createInput(id, "checkbox", "checkbox");
  addItemDiv.setAttribute("contenteditable", "true");
  addItemDiv.appendChild(deleteButton);
  addItemDiv.appendChild(input);
  return addItemDiv;
};

const addItem = function(event) {
 const  { name, id, item } = getItemAttributes(event);
 const content = { name: name, toDoId: id, item: item };
  writeContentToFile("/addItem", JSON.stringify(content));
 const addItemDiv = generateAddItemDiv(id, item);
  getElementById(`taskList_${id}`).appendChild(addItemDiv);
  getElementById(`addTask_${id}`).value = "";
};

const initialize = function() {
 const name = getElementById("name").innerText;
  fetch("/userDetail", { method: "POST" })
    .then(data => {
      return data.json();
    })
    .then(toDoList => {
      displayAllTodo(toDoList[name]);
    });
  getElementById("addTitle").onclick = addToDo;
};

window.onload = initialize;
