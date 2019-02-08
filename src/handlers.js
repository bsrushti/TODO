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
  const userAccounts = userDetail;
  Object.keys(userAccounts).forEach(userName => {
    const user = new User(userName);
    userAccounts[userName].forEach(userToDo => {
      const { title, description, items } = userToDo;
      const toDo = new TODO(title, description, items);
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
  const cookie = `${userName}:${new Date().getTime()}`;
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
  const currentUser = credentials.filter(
    credential => credential.userName == parsedCredentials.userName
  )[0];
  return currentUser.password == parsedCredentials.password;
};

const login = function(req, res) {
  const parsedCredentials = parseData(req.body);
  if (!isUserValid(parsedCredentials)) {
    const invalidUserHTML = indexHTML.replace(ERROR_CONSTANT, "Invalid User");
    res.send(invalidUserHTML);
    return;
  }
  if (!isPasswordCorrect(parsedCredentials)) {
    const incorrectPasswordHTML = indexHTML.replace(
      ERROR_CONSTANT,
      "Incorrect password"
    );
    res.send(incorrectPasswordHTML);
    return;
  }
  if (!req.headers.cookie || !cookies.includes(req.headers.cookie)) {
    setCookie(res, parsedCredentials.userName);
  }
  const finalHTML = homeHTML.replace(NAME_CONSTANT, parsedCredentials.userName);
  res.send(finalHTML);
};

const renderLogout = function(req, res) {
  const currCookie = req.headers.cookie;
  cookies.splice(cookies.indexOf(currCookie), 1);
  fs.writeFile(COOKIES_PATH, JSON.stringify(cookies), err => {});
  res.clearCookie(currCookie);
  const indexPage = indexHTML.replace("##errorMessage##", "");
  res.send(indexPage);
};

const saveCredentials = function(parsedCredentials) {
  delete parsedCredentials.confirmPassword;
  credentials.push(parsedCredentials);
  fs.writeFile(CREDENTIALS_PATH, JSON.stringify(credentials), err => {});
  return;
};

const addNewUser = function(credentials) {
  const user = new User(credentials.userName);
  users.addUser(user);
  fs.writeFileSync(USER_DETAILS_PATH, JSON.stringify(users.users));
  saveCredentials(credentials);
  return;
};

const signUp = function(req, res) {
  const parsedCredentials = parseData(req.body);
  if (!isAlreadyUser(parsedCredentials.userName)) {
    if (confirmPassword(parsedCredentials)) {
      addNewUser(parsedCredentials);
      const toRenderHTML = indexHTML.replace(ERROR_CONSTANT, "");
      res.send(toRenderHTML);
      return;
    }
    const incorrectPasswordHTML = signUpHTML.replace(
      ERROR_CONSTANT,
      INCORRECT_PASSWORD
    );
    res.send(incorrectPasswordHTML);
    return;
  }
  const existingUserHTML = signUpHTML.replace(ERROR_CONSTANT, EXISTING_USER);
  res.send(existingUserHTML);
};

const addToDoToUser = function(toDoDetails) {
  const { name, title, description } = toDoDetails;
  const todo = new TODO(title, description);
  const user = new User(name, users.users[name]);
  user.addToDo(todo);
  return;
};

const addToDo = function(req, res) {
  if (req.url == "/userDetail") {
    res.send(JSON.stringify(users.users));
    return;
  }
  const toDoDetails = JSON.parse(req.body);
  addToDoToUser(toDoDetails);
  fs.writeFileSync(USER_DETAILS_PATH, JSON.stringify(users.users, null, 2));
  res.end();
};

const addItemToUserToDo = function(itemDetails) {
  const { name, toDoId, item } = itemDetails;
  const todoItem = { description: item, done: "false" };
  const user = new User(name, users.users[name]);
  user.toDo[toDoId].addItem(todoItem);
  return;
};

const addToDoItem = function(req, res) {
  const itemDetails = JSON.parse(req.body);
  addItemToUserToDo(itemDetails);
  fs.writeFileSync(USER_DETAILS_PATH, JSON.stringify(users.users, null, 2));
  res.end();
};

const saveEditedItemsToUserToDo = function(itemsDetails) {
  const { name, id, items } = itemsDetails;
  const editedItems = items.map(item => JSON.parse(item));
  const user = new User(name, users.users[name]);
  user.editToDo(id, editedItems);
  return;
};

const saveItems = function(req, res) {
  const itemsDetails = JSON.parse(req.body);
  saveEditedItemsToUserToDo(itemsDetails);
  fs.writeFileSync(USER_DETAILS_PATH, JSON.stringify(users.users, null, 2));
  res.end();
};

const deleteItemFromUserTodo = function(itemDetails) {
  const { name, toDoId, itemId } = itemDetails;
  const user = new User(name, users.users[name]);
  user.toDo[toDoId].deleteItem(itemId);
  return;
};

const deleteItem = function(req, res) {
  const itemsDetails = JSON.parse(req.body);
  deleteItemFromUserTodo(itemsDetails);
  fs.writeFileSync(USER_DETAILS_PATH, JSON.stringify(users.users, null, 2));
  res.end();
};

const deleteUserTodo = function(toDoDetails) {
  const { name, toDoId } = toDoDetails;
  const user = new User(name, users.users[name]);
  user.removeToDo(toDoId);
  return;
};

const deleteToDo = function(req, res) {
  const toDoDetails = JSON.parse(req.body);
  deleteUserTodo(toDoDetails);
  fs.writeFileSync(USER_DETAILS_PATH, JSON.stringify(users.users, null, 2));
  res.end();
};

const loginCurrentUser = function(req, res) {
  const currentCookie = req.headers.cookie;
  const userName = currentCookie.split(":")[0];
  const currentUser = credentials.filter(
    credential => credential.userName == userName
  );
  const userPassword = currentUser[0].password;
  const userCredential = `userName=${userName}&password=${userPassword}`;
  req.body = userCredential;
  login(req, res);
};

const handleSession = function(req, res) {
  const currentCookie = req.headers.cookie;
  if (req.headers.cookie && cookies.includes(currentCookie)) {
    loginCurrentUser(req, res);
    return;
  }
  const loginHTML = indexHTML.replace(ERROR_CONSTANT, "");
  res.send(loginHTML);
};

const renderSignUp = function(req, res) {
  const toRenderHTML = signUpHTML.replace(ERROR_CONSTANT, "");
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
