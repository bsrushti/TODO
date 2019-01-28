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
  fetch("/title", { method: "POST", body: `${name}&${title}` }).then(() => {
    return;
  });
};

const addTitle = function() {
  let name = document.getElementById("name").innerText;
  let titleElement = document.getElementById("title");
  let title = titleElement.value;
  titleElement.value = "";
  writeTitle(title, name);
  displayAllTodo([{ title }]);
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
