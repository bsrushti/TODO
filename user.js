const { generateCounter } = require("./util");

let listCounter = generateCounter();

class User {
  constructor(userName) {
    this.userName = userName;
    this.toDoLists = {};
  }

  addToDo(title, desc) {
    let id = listCounter();
    this.toDoLists[id] = new ToDo(id, title, desc);
  }

  removeToDo(id) {
    delete this.toDoLists[id];
  }

  editTitle(id, newTitle) {
    this.toDoLists[id].title = newTitle;
  }

  editDesc(id, newDesc) {
    this.toDoLists[id].desc = newDesc;
  }
}

module.exports = User;
