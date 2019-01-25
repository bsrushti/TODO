let { generateCounter } = require("./util");
let itemCounter = generateCounter();

class ToDo {
  constructor(id, title, desc) {
    this.title = title;
    this.desc = desc;
    this.items = {};
    this.id = id;
  }

  _createItem(itemDesc, id) {
    return {
      done: false,
      desc: itemDesc,
      id
    };
  }

  addItem(itemDesc) {
    let id = itemCounter();
    let item = this._createItem(itemDesc, id);
    this.items[id] = item;
  }

  removeItem(id) {
    delete this.items[id];
  }

  editItem(id, newDesc) {
    this.items[id].desc = newDesc;
  }
}

module.exports = ToDo;
