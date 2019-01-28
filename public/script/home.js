const generateCounter = function(count = 1) {
  return function() {
    return count++;
  };
};

let counter = generateCounter();

const getElementById = id => document.getElementById(id);

const generateDiv = function(attributes) {
  let div = document.createElement("div");
  div.id = attributes.id;
  div.className = attributes.className;
  div.innerText = attributes.value;
  return div;
};

const getTitleDiv = (id, toDo) =>
  generateDiv({
    id,
    className: "title",
    value: toDo.title
  });

const getDescriptionDiv = (id, toDo) =>
  generateDiv({
    id,
    className: "description",
    value: toDo.description
  });

const getItemDiv = function() {
  let itemDiv = generateDiv({ id: "items", className: "items", value: "" });
  itemDiv.innerHTML =
    "<input type='text' placeHolder='enter task' class='insertItem' id='title'/><button class='plus' id='addItem'>&#x2629</button>";
  return itemDiv;
};

const getTODODiv = () =>
  generateDiv({ id: "todo", className: "TODO", value: "" });

const getAllDivs = function(id, toDo) {
  let titleDiv = getTitleDiv(id, toDo);
  let descriptionDiv = getDescriptionDiv(id, toDo);
  let itemDiv = getItemDiv();
  let TODODiv = getTODODiv();
  return { titleDiv, descriptionDiv, itemDiv, TODODiv };
};

const displayAllTodo = function(toDoList) {
  let titles = getElementById("titles");
  toDoList.forEach(toDo => {
    let id = counter();
    let { titleDiv, descriptionDiv, itemDiv, TODODiv } = getAllDivs(id, toDo);
    TODODiv.appendChild(titleDiv);
    TODODiv.appendChild(descriptionDiv);
    TODODiv.appendChild(itemDiv);
    titles.appendChild(TODODiv);
  });
};

const writeTitle = function(name, title, description) {
  fetch("/title", {
    method: "POST",
    body: `${name}&${title}&${description}`
  }).then(() => {
    return;
  });
};

const addToDo = function() {
  let name = getElementById("name").innerText;
  let titleElement = getElementById("title");
  let descriptionElement = getElementById("description");
  let title = titleElement.value;
  let description = descriptionElement.value;
  titleElement.value = "";
  descriptionElement.value = "";
  writeTitle(name, title, description);
  displayAllTodo([{ title, description }]);
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
