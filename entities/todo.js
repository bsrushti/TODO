class TODO {
  constructor(title, description) {
    this.title = title;
    this.description = description;
    this.items = [];
  }

  addItem(item) {
    this.items.push(item);
  }
}
module.exports = TODO;
