const generateCounter = function(count = 1) {
  return function() {
    return count++;
  };
};

let counter = generateCounter();

const writeTitle = function(title) {
  fetch("/title", { method: "POST", body: title }).then(data => {
    return;
  });
};

const addTitle = function() {
  let div = document.createElement("div");
  let titleElement = document.getElementById("title");
  let titles = document.getElementById("titles");
  div.id = counter();
  div.className = "title";
  let title = titleElement.value;
  div.innerText = title;
  titleElement.value = "";
  titles.appendChild(div);
  writeTitle(title);
};

const initialize = function() {
  document.getElementById("add").onclick = addTitle;
};

window.onload = initialize;