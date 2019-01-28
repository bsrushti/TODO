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
  generateDiv({
    id: `title_${id}`,
    className: "title",
    value: title
  });

const getDescriptionDiv = (id, description) =>
  generateDiv({
    id: `description_${id}`,
    className: "description",
    value: description
  });

const getTaskListDiv = function(id) {
  return generateDiv({
    id: `taskList_${id}`,
    className: "taskList",
    value: ""
  });
};

const getItemDiv = function(id) {
  let addItemDiv = generateDiv({ id: "items", className: "items", value: "" });
  addItemDiv.innerHTML = `<input type='text' placeHolder='enter task' class='insertItem' id='addTask_${id}'/><button class='plus' id='addItem' onclick='addItem(event)'>&#x2629</button>`;
  return addItemDiv;
};

const getTODODiv = id => generateDiv({ id, className: "TODO", value: "" });

const getAllDivs = function(id, toDo) {
  let titleDiv = getTitleDiv(id, toDo.title);
  let descriptionDiv = getDescriptionDiv(id, toDo.description);
  let addItemDiv = getItemDiv(id);
  let taskListDiv = getTaskListDiv(id);
  let TODODiv = getTODODiv(id);
  return { titleDiv, descriptionDiv, addItemDiv, taskListDiv, TODODiv };
};

const displayAllTodo = function(toDoList) {
  let titles = getElementById("titles");
  toDoList.forEach(toDo => {
    let id = toDoCounter();
    let {
      titleDiv,
      descriptionDiv,
      addItemDiv,
      taskListDiv,
      TODODiv
    } = getAllDivs(id, toDo);
    TODODiv.appendChild(titleDiv);
    TODODiv.appendChild(descriptionDiv);
    TODODiv.appendChild(addItemDiv);
    TODODiv.appendChild(taskListDiv);
    titles.appendChild(TODODiv);
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

const addToDo = function() {
  let name = getElementById("name").innerText;
  let titleElement = getElementById("title");
  let descriptionElement = getElementById("description");
  let title = titleElement.value;
  let description = descriptionElement.value;
  titleElement.value = "";
  descriptionElement.value = "";
  let content = `{"name":"${name}","title":"${title}","description":"${description}"}`;
  writeContentToFile("/title", content);
  displayAllTodo([{ title, description }]);
};

const addItem = function(event) {
  let name = getElementById("name").innerText;
  let parentId = event.target.parentElement.parentElement.id;
  let item = getElementById(`addTask_${parentId}`).value;
  let content = `{"name":"${name}","toDoId":"${parentId}","item":"${item}"}`;
  writeContentToFile("/addItem", content);
  let addItemDiv = generateDiv({
    id: itemCounter(),
    className: "task",
    value: item
  });
  getElementById(`taskList_${parentId}`).appendChild(addItemDiv);
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
