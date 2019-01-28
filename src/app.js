const App = require("./express");
const fs = require("fs");
const homeHTML = fs.readFileSync("./public/home.html", "utf8");
const indexHTML = fs.readFileSync("./public/index.html", "utf8");
const { sendResponse, parseData } = require("./util");
const invalidUserHTML = fs.readFileSync("./public/inValidUser.html", "utf8");
const { User, Users } = require("../entities/user");
let users = new Users();

const readFile = function(filePath, initialText) {
  if (!fs.existsSync("./data")) {
    fs.mkdirSync("./data");
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, initialText, err => {});
  }
  return JSON.parse(fs.readFileSync(filePath));
};

const credentials = readFile("./data/credentials.json", "[]");
const cookies = readFile("./data/cookies.json", "[]");

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
  if (url == "/") return "./public/index.html";
  return `./public/${url}`;
};

const serveFile = (req, res) => {
  let fileName = getPath(req.url);
  fs.readFile(fileName, function(err, contents) {
    if (err) {
      sendResponse(res, "NOT FOUND", 404);
      return;
    }
    sendResponse(res, contents, 200);
  });
};

const isUserValid = function(user) {
  return credentials.some(credential => {
    return (
      credential.userName == user.userName &&
      credential.password == user.password
    );
  });
};

const isAlreadyUser = function(candidateName) {
  return credentials.some(credential => credential.userName == candidateName);
};

const getCredentials = function(req, res) {
  let parsedCredentials = parseData(req.body);
  if (!isUserValid(parsedCredentials)) {
    sendResponse(res, invalidUserHTML, 200);
    return;
  }
  if (!req.headers.cookie) {
    let cookie = `${parsedCredentials.userName}:${new Date().getTime()}`;
    cookies.push(cookie);
    res.setHeader("Set-Cookie", cookie);
  }
  fs.writeFile("./data/cookies.json", JSON.stringify(cookies), err => {});
  let finalHTML = homeHTML.replace("##namehere##", parsedCredentials.userName);
  sendResponse(res, finalHTML, 200);
};

const renderLogout = function(req, res) {
  let currCookie = req.headers.cookie;
  cookies.splice(cookies.indexOf(currCookie), 1);
  fs.writeFile("./data/cookies.json", JSON.stringify(cookies), err => {});
  res.setHeader(
    "Set-Cookie",
    `${currCookie};expires = Thu, 01 Jan 1970 00:00:00 GMT`
  );
  sendResponse(res, indexHTML, 200);
};

const saveCredentials = function(parsedCredentials) {
  delete parsedCredentials.confirmPassword;
  credentials.push(parsedCredentials);
  fs.writeFile(
    "./data/credentials.json",
    JSON.stringify(credentials),
    err => {}
  );
  return;
};

const passwordConfirms = parsedCredentials =>
  parsedCredentials.password == parsedCredentials.confirmPassword;

const signUp = function(users, req, res) {
  let parsedCredentials = parseData(req.body);
  if (!isAlreadyUser(parsedCredentials.userName)) {
    if (passwordConfirms(parsedCredentials)) {
      let user = new User(parsedCredentials.userName);
      console.log(user);
      users.addUser(user);
      fs.writeFileSync("./data/userDetail.json", JSON.stringify(users.users));
      saveCredentials(parsedCredentials);
      sendResponse(res, indexHTML, 200);
      return;
    }
    sendResponse(res, indexHTML, 200);
    return;
  }
  sendResponse(res, "already a user,please login", 200);
};

const addToDo = function(req, res) {
  let userDetail = fs.readFileSync("./data/userDetail.json").toString();
  if (req.url == "/userDetail") {
    sendResponse(res, userDetail, 200);
    return;
  }
  let details = JSON.parse(req.body);
  let { name, title, description } = details;
  let user = JSON.parse(userDetail);
  user[name].push({ title, description });
  fs.writeFileSync("./data/userDetail.json", JSON.stringify(user));
  sendResponse(res, JSON.stringify(user), 200);
};

const addToDoItem = function(req, res) {
  let details = JSON.parse(req.body);
  let { name, toDoId, item } = details;
};

app.use(readBody);
app.post("/", renderLogout);
app.post("/loggedIn", getCredentials);
app.post("/submit", signUp.bind(null, users));
app.post("/title", addToDo);
app.post("/userDetail", addToDo);
app.post("/addItem", addToDoItem);
app.use(serveFile);

module.exports = app.handleRequest.bind(app);
