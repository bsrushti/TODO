const chai = require("chai");
const User = require("../entities/user");

describe("user.addToDo", function() {
  let user = new User("dummy user");
  it("should add a new instance of todo to user", function() {
    user.addToDo(3, "firstToDo", "for testing");
    const expectedOutput = {
      toDoLists: {
        "3": {
          desc: "for testing",
          id: 3,
          items: {},
          title: "firstToDo"
        }
      },
      userName: "dummy user"
    };
    chai.assert.deepEqual(user, expectedOutput);
  });
});

describe("user.removeToDo", function() {
  let user = new User("dummy user");
  user.addToDo(2, "secondToDo", "for testing");
  it("should remove a todo for given id", function() {
    user.removeToDo(2);
    chai.assert.deepEqual(user, { userName: "dummy user", toDoLists: {} });
  });
});

describe("user.editTitle", function() {
  let user = new User("dummy user");
  user.addToDo(4, "thirdToDo", "for testing"),
    it("should replace title of todo for given id with new title", function() {
      user.editTitle(4, "fourth ToDo");
      let expectedOutput = {
        toDoLists: {
          "4": {
            desc: "for testing",
            id: 4,
            items: {},
            title: "fourth ToDo"
          }
        },
        userName: "dummy user"
      };
      chai.assert.deepEqual(user, expectedOutput);
    });
});

describe("user.editDesc  ", function() {
  let user = new User("dummy user");
  user.addToDo(5, "fifth todo", "for testing");
  it("should replace the old description with new one", function() {
    user.editDesc(5, "for description testing");
    let expectedOutput = {
      toDoLists: {
        "5": {
          desc: "for description testing",
          id: 5,
          items: {},
          title: "fifth ToDo"
        }
      },
      userName: "dummy user"
    };
    chai.assert.deepEqual();
  });
});
