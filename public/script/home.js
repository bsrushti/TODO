const generateCounter = function(count = 1) {
  return function() {
    return count++;
  };
};

let counter = generateCounter();

const displayAllTodo = function(toDoList) {
  let titles = document.getElementById("titles");
  toDoList.forEach(todo => {
    let div = document.createElement("div");
    div.id = counter();
    div.className = "title";
    div.innerText = todo.title;
    titles.appendChild(div);
  });
};

const writeTitle = function(title, name) {
  fetch("/title", { method: "POST", body: `${name}&${title}` })
    .then(data => {
      return data.json();
    })
    .then(toDoList => {
      displayAllTodo(toDoList[name]);
    });
};

const addTitle = function() {
  let div = document.createElement("div");
  let titleElement = document.getElementById("title");
  let titles = document.getElementById("titles");
  let name = document.getElementById("name").innerText;
  div.id = counter();
  div.className = "title";
  let title = titleElement.value;
  div.innerText = title;
  titleElement.value = "";
  titles.appendChild(div);
  writeTitle(title, name);
};

const initialize = function() {
  document.getElementById("add").onclick = addTitle;
};

window.onload = initialize;
