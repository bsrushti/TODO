const {
  OK_200,
  ERROR_404,
  INDEX_PAGE_PATH,
  HOME_PAGE_PATH,
  INVALID_USER_PATH,
  ENCODING,
  CREDENTIALS_PATH,
  COOKIES_PATH,
  USER_DETAILS_PATH,
  DATA_DIR,
  NOT_FOUND,
  INCORRECT_PASSWORD,
  NAME_CONSTANT,
  EXPIRY_DATE,
  EXISTING_USER
} = require("./constants");

const App = require("./express");
const fs = require("fs");
const { sendResponse, parseData } = require("./util");
const { User, Users } = require("../entities/user");
const TODO = require("../entities/todo");
const homeHTML = fs.readFileSync(HOME_PAGE_PATH, ENCODING);
const indexHTML = fs.readFileSync(INDEX_PAGE_PATH, ENCODING);
const invalidUserHTML = fs.readFileSync(INVALID_USER_PATH, ENCODING);

let users = new Users();

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

loadInstances();
const app = new App();

const readBody = (req, res, next) => {
  let content = "";
  req.on("data", chunk => (content += chunk));
  req.on("end", () => {
    req.body = content;
    next();
  });
};

const getPath = url => {
  if (url == "/") return INDEX_PAGE_PATH;
  return `./public/${url}`;
};

const serveFile = (req, res) => {
  let fileName = getPath(req.url);
  fs.readFile(fileName, function(err, contents) {
    if (err) {
      sendResponse(res, NOT_FOUND, ERROR_404);
      return;
    }
    sendResponse(res, contents, OK_200);
  });
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

const setCookie = function(res, userName) {
  let cookie = `${userName}:${new Date().getTime()}`;
  cookies.push(cookie);
  res.setHeader("Set-Cookie", cookie);
  fs.writeFile(COOKIES_PATH, JSON.stringify(cookies), err => {});
};

const login = function(req, res) {
  let parsedCredentials = parseData(req.body);

  if (!isUserValid(parsedCredentials)) {
    sendResponse(res, invalidUserHTML, OK_200);
    return;
  }
  if (!isPasswordCorrect(parsedCredentials)) {
    sendResponse(res, INCORRECT_PASSWORD, OK_200);
    return;
  }
  if (!req.headers.cookie) {
    setCookie(res, parsedCredentials.userName);
  }
  let finalHTML = homeHTML.replace(NAME_CONSTANT, parsedCredentials.userName);
  sendResponse(res, finalHTML, OK_200);
};

const renderLogout = function(req, res) {
  let currCookie = req.headers.cookie;
  cookies.splice(cookies.indexOf(currCookie), 1);
  fs.writeFile(COOKIES_PATH, JSON.stringify(cookies), err => {});
  res.setHeader("Set-Cookie", `${currCookie};${EXPIRY_DATE}`);
  sendResponse(res, indexHTML, OK_200);
};

const saveCredentials = function(parsedCredentials) {
  delete parsedCredentials.confirmPassword;
  credentials.push(parsedCredentials);
  fs.writeFile(CREDENTIALS_PATH, JSON.stringify(credentials), err => {});
  return;
};

const passwordConfirms = parsedCredentials =>
  parsedCredentials.password == parsedCredentials.confirmPassword;

const signUp = function(req, res) {
  let parsedCredentials = parseData(req.body);
  if (!isAlreadyUser(parsedCredentials.userName)) {
    if (passwordConfirms(parsedCredentials)) {
      let user = new User(parsedCredentials.userName);
      users.addUser(user);
      fs.writeFileSync(USER_DETAILS_PATH, JSON.stringify(users.users));
      saveCredentials(parsedCredentials);
      sendResponse(res, indexHTML, OK_200);
      return;
    }
    sendResponse(res, indexHTML, OK_200);
    return;
  }
  sendResponse(res, EXISTING_USER, OK_200);
};

const addToDo = function(req, res) {
  if (req.url == "/userDetail") {
    sendResponse(res, JSON.stringify(users.users), OK_200);
    return;
  }
  let details = JSON.parse(req.body);
  let { name, title, description } = details;
  let todo = new TODO(title, description);
  let user = new User(name, users.users[name]);
  user.addToDo(todo);
  fs.writeFileSync(USER_DETAILS_PATH, JSON.stringify(users.users, null, 2));
  res.end();
};

const addToDoItem = function(req, res) {
  let details = JSON.parse(req.body);
  let { name, toDoId, item } = details;
  let todoItem = { description: item, done: "false" };
  let user = new User(name, users.users[name]);
  user.toDo[toDoId].addItem(todoItem);
  fs.writeFileSync(USER_DETAILS_PATH, JSON.stringify(users.users, null, 2));
  res.end();
};

const saveItems = function(req, res) {
  let { name, id, items } = JSON.parse(req.body);
  let modifiedItems = [];
  items.forEach(item => {
    modifiedItems.push(JSON.parse(item));
  });
  let user = new User(name, users.users[name]);
  user.editToDo(id, modifiedItems);
  fs.writeFileSync(USER_DETAILS_PATH, JSON.stringify(users.users, null, 2));
  res.end();
};

const deleteItem = function(req, res) {
  let { name, toDoId, itemId } = JSON.parse(req.body);
  let user = new User(name, users.users[name]);
  user.toDo[toDoId].deleteItem(itemId);
  fs.writeFileSync(USER_DETAILS_PATH, JSON.stringify(users.users, null, 2));
  res.end();
};

const deleteToDo = function(req, res) {
  let { name, toDoId } = JSON.parse(req.body);
  let user = new User(name, users.users[name]);
  user.removeToDo(toDoId);
  fs.writeFileSync(USER_DETAILS_PATH, JSON.stringify(users.users, null, 2));
  res.end();
};

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
