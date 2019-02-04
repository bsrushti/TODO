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
  loadInstances,
  handleSession,
  renderSignUp
} = require("./handlers");

const express = require("express");
loadInstances();
const app = new express();

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
app.get("/signUp", renderSignUp);
app.use(express.static("public"));

module.exports = app;
