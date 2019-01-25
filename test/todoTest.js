const chai = require("chai");
const ToDo = require("../todo");

describe("todo.addItem", function() {
  let todo = new ToDo("1", "homeWork", "english");
  it("should add item in ToDo", function() {
    todo.addItem(1, "chapter1");
    let expected = {
      title: "homeWork",
      desc: "english",
      items: {
        "1": {
          done: false,
          desc: "chapter1",
          id: 1
        }
      },
      id: "1"
    };
    chai.assert.deepEqual(todo, expected);
  });
});

describe("todo.removeItem", function() {
  let todo = new ToDo("1", "homeWork", "english");
  todo.addItem(1, "chapter1");
  todo.addItem(2, "chapter2");
  it("should add item in ToDo", function() {
    todo.removeItem(2);
    let expected = {
      title: "homeWork",
      desc: "english",
      items: {
        "1": {
          done: false,
          desc: "chapter1",
          id: 1
        }
      },
      id: "1"
    };
    chai.assert.deepEqual(todo, expected);
  });
});

describe("todo.editItem", function() {
  let todo = new ToDo("1", "homeWork", "english");
  todo.addItem(1, "chapter1");
  todo.addItem(2, "chapter2");
  todo.addItem(3, "chapter3");
  it("should add item in ToDo", function() {
    todo.editItem(2, "chapter9");
    let expected = {
      title: "homeWork",
      desc: "english",
      items: {
        "1": {
          done: false,
          desc: "chapter1",
          id: 1
        },
        "2": {
          done: false,
          desc: "chapter9",
          id: 2
        },
        "3": {
          done: false,
          desc: "chapter3",
          id: 3
        }
      },
      id: "1"
    };
    chai.assert.deepEqual(todo, expected);
  });
});
