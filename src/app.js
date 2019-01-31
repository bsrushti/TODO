const {
  readBody,
  renderLogout,
  login,
  signUp,
  addToDo,
  addToDoItem,
  saveItems,
  deleteItem,
  deleteToDo,
  serveFile,
  loadInstances
} = require("./handlers");

const App = require("./express");
loadInstances();
const app = new App();

app.use(readBody);
app.post("/", renderLogout);
app.post("/loggedIn", login);
app.post("/submit", signUp);
app.post("/title", addToDo);
app.post("/userDetail", addToDo);
app.post("/addItem", addToDoItem);
app.post("/saveItems", saveItems);
app.post("/deleteItem", deleteItem);
app.post("/deleteToDo", deleteToDo);
app.use(serveFile);

module.exports = app.handleRequest.bind(app);
