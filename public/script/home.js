const generateCounter = function(count = 1) {
  return function() {
    return count++;
  };
};

let counter = generateCounter();

const generateDiv = function(attributes) {
  let div = document.createElement("div");
  div.id = attributes.id;
  div.className = attributes.className;
  div.innerText = attributes.value;
  return div;
};

const displayAllTodo = function(toDoList) {
  let titles = document.getElementById("titles");
  toDoList.forEach(toDo => {
    let id = counter();
    let titleDiv = generateDiv({
      id,
      className: "title",
      value: toDo.title
    });
    let descriptionDiv = generateDiv({
      id,
      className: "description",
      value: toDo.description
    });
    titles.appendChild(titleDiv);
    titles.appendChild(descriptionDiv);
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

const addTitle = function() {
  let name = document.getElementById("name").innerText;
  let titleElement = document.getElementById("title");
  let descriptionElement = document.getElementById("description");
  let title = titleElement.value;
  let description = descriptionElement.value;
  titleElement.value = "";
  descriptionElement.value = "";
  writeTitle(name, title, description);
  displayAllTodo([{ title, description }]);
};

const initialize = function() {
  let name = document.getElementById("name").innerText;
  fetch("/userDetail", { method: "POST" })
    .then(data => {
      return data.json();
    })
    .then(toDoList => {
      displayAllTodo(toDoList[name]);
    });
  document.getElementById("add").onclick = addTitle;
};

window.onload = initialize;
