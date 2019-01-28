const ToDo = require("./todo");

class User {
  constructor(userName) {
    this.userName = userName;
    this.toDo = new ToDo("1", "newTitle", "nothing");
  }
}

class Users {
  constructor() {
    this.users = {};
  }

  addUser(user) {
    this.users[user.userName] = [];
  }
}

module.exports = { User, Users };
