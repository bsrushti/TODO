class TODO {
  constructor(title, desc) {
    this.title = title;
    this.desc = desc;
    this.items = [];
  }

  addItem(item) {
    this.items.push(item);
  }
}
module.exports = TODO;
