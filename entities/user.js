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

  set(users) {
    this.users = users;
  }

  addUser(user) {
    this.users[user.userName] = [];
  }
}

module.exports = { User, Users };
