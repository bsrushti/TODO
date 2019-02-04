const fs = require("fs");

const {
  INDEX_PAGE_PATH,
  HOME_PAGE_PATH,
  ENCODING,
  CREDENTIALS_PATH,
  COOKIES_PATH,
  USER_DETAILS_PATH,
  DATA_DIR,
  INCORRECT_PASSWORD,
  NAME_CONSTANT,
  EXISTING_USER,
  SIGN_UP_PAGE_PATH,
  ERROR_CONSTANT
} = require("./constants");

const { parseData, confirmPassword } = require("./util");

const homeHTML = fs.readFileSync(HOME_PAGE_PATH, ENCODING);
const indexHTML = fs.readFileSync(INDEX_PAGE_PATH, ENCODING);
const signUpHTML = fs.readFileSync(SIGN_UP_PAGE_PATH, ENCODING);

const isDirectoryExists = function(directoryPath) {
  return fs.existsSync(directoryPath);
};

const isFileExists = function(filePath) {
  return fs.existsSync(filePath);
};

const readFile = function(filePath, initialText) {
  if (!isDirectoryExists(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
  }
  if (!isFileExists(filePath)) {
    fs.writeFileSync(filePath, initialText, err => {});
  }
  return JSON.parse(fs.readFileSync(filePath));
};

const credentials = readFile(CREDENTIALS_PATH, "[]");
const cookies = readFile(COOKIES_PATH, "[]");
const userDetail = readFile(USER_DETAILS_PATH, "{}");

const { User, Users } = require("../entities/user");
const TODO = require("../entities/todo");

let users = new Users();

const loadInstances = function() {
  let userAccounts = userDetail;
  Object.keys(userAccounts).forEach(userName => {
    let user = new User(userName);
    userAccounts[userName].forEach(userToDo => {
      let { title, description, items } = userToDo;
      let toDo = new TODO(title, description, items);
      user.addToDo(toDo);
    });
    users.addUser(user);
  });
};

const readBody = (req, res, next) => {
  let content = "";
  req.on("data", chunk => (content += chunk));
  req.on("end", () => {
    req.body = content;
    next();
  });
};

const setCookie = function(res, userName) {
  let cookie = `${userName}:${new Date().getTime()}`;
  cookies.push(cookie);
  res.setHeader("Set-Cookie", cookie);
  fs.writeFile(COOKIES_PATH, JSON.stringify(cookies), err => {});
};

const isUserValid = function(user) {
  return credentials.some(credential => {
    return credential.userName == user.userName;
  });
};

const isAlreadyUser = function(candidateName) {
  return credentials.some(credential => credential.userName == candidateName);
};

const isPasswordCorrect = function(parsedCredentials) {
  let currentUser = credentials.filter(
    credential => credential.userName == parsedCredentials.userName
  )[0];
  return currentUser.password == parsedCredentials.password;
};

const login = function(req, res) {
  let parsedCredentials = parseData(req.body);
  if (!isUserValid(parsedCredentials)) {
    let invalidUserHTML = indexHTML.replace(ERROR_CONSTANT, "Invalid User");
    res.send(invalidUserHTML);
    return;
  }
  if (!isPasswordCorrect(parsedCredentials)) {
    let incorrectPasswordHTML = indexHTML.replace(
      ERROR_CONSTANT,
      "Incorrect password"
    );
    res.send(incorrectPasswordHTML);
    return;
  }
  if (!req.headers.cookie || !cookies.includes(req.headers.cookie)) {
    setCookie(res, parsedCredentials.userName);
  }
  let finalHTML = homeHTML.replace(NAME_CONSTANT, parsedCredentials.userName);
  res.send(finalHTML);
};

const renderLogout = function(req, res) {
  let currCookie = req.headers.cookie;
  cookies.splice(cookies.indexOf(currCookie), 1);
  fs.writeFile(COOKIES_PATH, JSON.stringify(cookies), err => {});
  res.clearCookie(currCookie);
  let indexPage = indexHTML.replace("##errorMessage##", "");
  res.send(indexPage);
};

const saveCredentials = function(parsedCredentials) {
  delete parsedCredentials.confirmPassword;
  credentials.push(parsedCredentials);
  fs.writeFile(CREDENTIALS_PATH, JSON.stringify(credentials), err => {});
  return;
};

const addNewUser = function(credentials) {
  let user = new User(credentials.userName);
  users.addUser(user);
  fs.writeFileSync(USER_DETAILS_PATH, JSON.stringify(users.users));
  saveCredentials(credentials);
  return;
};

const signUp = function(req, res) {
  let parsedCredentials = parseData(req.body);
  if (!isAlreadyUser(parsedCredentials.userName)) {
    if (confirmPassword(parsedCredentials)) {
      addNewUser(parsedCredentials);
      let toRenderHTML = indexHTML.replace(ERROR_CONSTANT, "");
      res.send(toRenderHTML);
      return;
    }
    let incorrectPasswordHTML = signUpHTML.replace(
      ERROR_CONSTANT,
      INCORRECT_PASSWORD
    );
    res.send(incorrectPasswordHTML);
    return;
  }
  let existingUserHTML = signUpHTML.replace(ERROR_CONSTANT, EXISTING_USER);
  res.send(existingUserHTML);
};

const addToDoToUser = function(toDoDetails) {
  let { name, title, description } = toDoDetails;
  let todo = new TODO(title, description);
  let user = new User(name, users.users[name]);
  user.addToDo(todo);
  return;
};

const addToDo = function(req, res) {
  if (req.url == "/userDetail") {
    res.send(JSON.stringify(users.users));
    return;
  }
  let toDoDetails = JSON.parse(req.body);
  addToDoToUser(toDoDetails);
  fs.writeFileSync(USER_DETAILS_PATH, JSON.stringify(users.users, null, 2));
  res.end();
};

const addItemToUserToDo = function(itemDetails) {
  let { name, toDoId, item } = itemDetails;
  let todoItem = { description: item, done: "false" };
  let user = new User(name, users.users[name]);
  user.toDo[toDoId].addItem(todoItem);
  return;
};

const addToDoItem = function(req, res) {
  let itemDetails = JSON.parse(req.body);
  addItemToUserToDo(itemDetails);
  fs.writeFileSync(USER_DETAILS_PATH, JSON.stringify(users.users, null, 2));
  res.end();
};

const saveEditedItemsToUserToDo = function(itemsDetails) {
  let { name, id, items } = itemsDetails;
  let editedItems = items.map(item => JSON.parse(item));
  let user = new User(name, users.users[name]);
  user.editToDo(id, editedItems);
  return;
};

const saveItems = function(req, res) {
  let itemsDetails = JSON.parse(req.body);
  saveEditedItemsToUserToDo(itemsDetails);
  fs.writeFileSync(USER_DETAILS_PATH, JSON.stringify(users.users, null, 2));
  res.end();
};

const deleteItemFromUserTodo = function(itemDetails) {
  let { name, toDoId, itemId } = itemDetails;
  let user = new User(name, users.users[name]);
  user.toDo[toDoId].deleteItem(itemId);
  return;
};

const deleteItem = function(req, res) {
  let itemsDetails = JSON.parse(req.body);
  deleteItemFromUserTodo(itemsDetails);
  fs.writeFileSync(USER_DETAILS_PATH, JSON.stringify(users.users, null, 2));
  res.end();
};

const deleteUserTodo = function(toDoDetails) {
  let { name, toDoId } = toDoDetails;
  let user = new User(name, users.users[name]);
  user.removeToDo(toDoId);
  return;
};

const deleteToDo = function(req, res) {
  let toDoDetails = JSON.parse(req.body);
  deleteUserTodo(toDoDetails);
  fs.writeFileSync(USER_DETAILS_PATH, JSON.stringify(users.users, null, 2));
  res.end();
};

const loginCurrentUser = function(req, res) {
  let currentCookie = req.headers.cookie;
  let userName = currentCookie.split(":")[0];
  let currentUser = credentials.filter(
    credential => credential.userName == userName
  );
  let userPassword = currentUser[0].password;
  let userCredential = `userName=${userName}&password=${userPassword}`;
  req.body = userCredential;
  login(req, res);
};

const handleSession = function(req, res) {
  let currentCookie = req.headers.cookie;
  if (req.headers.cookie && cookies.includes(currentCookie)) {
    loginCurrentUser(req, res);
    return;
  }
  let loginHTML = indexHTML.replace(ERROR_CONSTANT, "");
  res.send(loginHTML);
};

const renderSignUp = function(req, res) {
  let toRenderHTML = signUpHTML.replace(ERROR_CONSTANT, "");
  res.send(toRenderHTML);
};

module.exports = {
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
};
