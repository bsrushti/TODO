const generateCounter = function(count = 1) {
  return function() {
    return count++;
  };
};

let counter = generateCounter();

const writeTitle = function(title, name) {
  fetch("/title", { method: "POST", body: `${name}&${title}` }).then(data => {
    return;
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
