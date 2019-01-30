const ToDo = require("./todo");

class User {
  constructor(userName, userToDo = []) {
    this.userName = userName;
    this.toDo = userToDo;
  }

  addToDo(userToDo) {
    this.toDo.push(userToDo);
  }

  removeToDo(id) {
    this.toDo.splice(id, 1);
  }

  editToDo(id, toDo) {
    this.toDo[id].items = toDo;
  }
}

class Users {
  constructor() {
    this.users = {};
  }

  set(users) {
    this.users = users;
  }

  addUser(user) {
    this.users[user.userName] = user.toDo;
  }
}

module.exports = { User, Users };
