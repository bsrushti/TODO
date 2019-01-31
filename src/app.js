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
  loadInstances,
  handleSession
} = require("./handlers");

const App = require("./express");
loadInstances();
const app = new App();

app.use(readBody);
app.get("/", handleSession);
app.post("/", renderLogout);
app.post("/myToDo", login);
app.post("/submit", signUp);
app.post("/addToDo", addToDo);
app.post("/userDetail", addToDo);
app.post("/addItem", addToDoItem);
app.post("/saveItems", saveItems);
app.post("/deleteItem", deleteItem);
app.post("/deleteToDo", deleteToDo);
app.use(serveFile);

module.exports = app.handleRequest.bind(app);
