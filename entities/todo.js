class TODO {
  constructor(title, description, items = []) {
    this.title = title;
    this.description = description;
    this.items = items;
  }

  addItem(item) {
    this.items.push(item);
  }

  deleteItem(id) {
    this.items.splice(id, 1);
  }
}
module.exports = TODO;
