const generateCounter = function(count = 0) {
  return function() {
    return count++;
  };
};

let toDoCounter = generateCounter();
let itemCounter = generateCounter();

const getElementById = id => document.getElementById(id);

const generateDiv = function(attributes) {
  let div = document.createElement("div");
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
  return generateDiv(setAttributes(`taskList_${id}`, "taskList", ""));
};

const setAttributes = function(id, className, value = "") {
  return { id, className, value };
};

const createButton = function(className, id, innerHTML) {
  let button = document.createElement("BUTTON");
  button.className = className;
  button.id = id;
  button.innerHTML = innerHTML;
  return button;
};

const createInput = function(id, type, placeHolder, className) {
  let input = document.createElement("input");
  input.type = type;
  input.placeHolder = placeHolder;
  input.className = className;
  input.id = id;
  return input;
};

const getAddItemDiv = function(id) {
  let addItemDiv = generateDiv(setAttributes("items", "items"));
  let input = createInput(`addTask_${id}`, "text", "enter task", "insertItem");
  addItemDiv.appendChild(input);
  let button = createButton("plus", "addItem", "&#x2629");
  button.onclick = addItem;
  addItemDiv.appendChild(button);
  return addItemDiv;
};

const appendItemDiv = function(parentDiv, item, id) {
  let attributes = setAttributes(id, "task", item.description);
  let itemDiv = generateDiv(attributes);
  itemDiv.setAttribute("contenteditable", "true");
  let input = createInput(id, "checkbox", "enter task", "checkbox");
  if (item.done == "true") {
    input.checked = true;
  }
  itemDiv.appendChild(input);
  parentDiv.appendChild(itemDiv);
};

const getItemsDiv = function(id, items) {
  let parentDiv = getTaskListDiv(id);
  let counter = generateCounter();
  items.forEach(item => {
    appendItemDiv(parentDiv, item, counter());
  });
  return parentDiv;
};

const getTODODiv = id => generateDiv({ id, className: "TODO", value: "" });

const getAllDivs = function(id, toDo) {
  let titleDiv = getTitleDiv(id, toDo.title);
  let descriptionDiv = getDescriptionDiv(id, toDo.description);
  let itemsDiv = getItemsDiv(id, toDo.items);
  let addItemDiv = getAddItemDiv(id);
  let TODODiv = getTODODiv(id);
  return {
    titleDiv,
    descriptionDiv,
    itemsDiv,
    addItemDiv,
    TODODiv
  };
};

const displayToDo = function(toDo, TODOs) {
  let id = toDoCounter();
  let { titleDiv, descriptionDiv, itemsDiv, addItemDiv, TODODiv } = getAllDivs(
    id,
    toDo
  );
  let saveButton = createButton("saveButton", "", "Save");
  saveButton.onclick = save;
  TODODiv.appendChild(titleDiv);
  TODODiv.appendChild(descriptionDiv);
  TODODiv.appendChild(addItemDiv);
  TODODiv.appendChild(itemsDiv);
  TODODiv.appendChild(saveButton);
  TODOs.appendChild(TODODiv);
};

const getItemsValue = function(event) {
  let name = getElementById("name").innerText;
  let id = event.target.parentElement.id;
  let items = getElementById(`taskList_${id}`);
  return { name, id, items };
};

const getModifiedItems = function(items) {
  let itemList = items.innerText.split("\n");
  let modifiedItems = [];
  for (let index = 0; index < items.childNodes.length; index++) {
    let itemAttributes = { description: itemList[index], done: "false" };
    if (items.childNodes[index].lastChild.checked) {
      itemAttributes.done = "true";
    }
    modifiedItems.push(JSON.stringify(itemAttributes));
  }
  return modifiedItems;
};

const save = function(event) {
  let { name, id, items } = getItemsValue(event);
  let modifiedItems = getModifiedItems(items);
  let content = { name: name, id: id, items: modifiedItems };
  writeContentToFile("/saveItems", JSON.stringify(content));
};

const displayAllTodo = function(toDoList) {
  const TODOs = getElementById("TODOs");
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
  let nameElement = getElementById("name");
  let titleElement = getElementById("title");
  let descriptionElement = getElementById("description");
  return { nameElement, titleElement, descriptionElement };
};

const getToDoValues = function(elements) {
  const { nameElement, titleElement, descriptionElement } = elements;
  let name = nameElement.innerText;
  let title = titleElement.value;
  let description = descriptionElement.value;
  titleElement.value = "";
  descriptionElement.value = "";
  return { name, title, description };
};

const addToDo = function() {
  let elements = getElements();
  let { name, title, description } = getToDoValues(elements);
  let content = { name: name, title: title, description: description };
  writeContentToFile("/title", JSON.stringify(content));
  let items = [{ description: "" }];
  displayAllTodo([{ title, description, items }]);
};

const getItemAttributes = function(event) {
  let name = getElementById("name").innerText;
  let id = event.target.parentElement.parentElement.id;
  let item = getElementById(`addTask_${id}`).value;
  return { name, id, item };
};

const addItem = function(event) {
  let { name, id, item } = getItemAttributes(event);
  let content = { name: name, toDoId: id, item: item };
  writeContentToFile("/addItem", JSON.stringify(content));
  let addItemDiv = generateDiv(setAttributes(itemCounter(), "task", item));
  let input = createInput(id, "checkbox", "", "checkbox");
  addItemDiv.setAttribute("contenteditable", "true");
  addItemDiv.appendChild(input);
  getElementById(`taskList_${id}`).appendChild(addItemDiv);
  getElementById(`addTask_${id}`).value = "";
};

const initialize = function() {
  let name = getElementById("name").innerText;
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
