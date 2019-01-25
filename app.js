const App = require("./express");
const fs = require("fs");
const homeHTML = fs.readFileSync("./home.html");
const indexHTML = fs.readFileSync("./index.html");
const signUpHTML = fs.readFileSync("./signUp.html");
const { sendResponse, parseData } = require("./util");
const invalidUserHTML = fs.readFileSync("./inValidUser.html");

const readFile = function(filePath) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]", err => {});
  }
  return JSON.parse(fs.readFileSync(filePath));
};

const credentials = readFile("./credentials.json");
const cookies = readFile("./cookies.json");

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
  if (url == "/") return "./index.html";
  return `./${url}`;
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
  credentials.push(parsedCredentials);
  if (!req.headers.cookie) {
    let uniqId = new Date().getTime();
    cookies.push(uniqId);
    res.setHeader("Set-Cookie", uniqId);
  }
  fs.writeFile("./cookies.json", JSON.stringify(cookies), err => {});
  sendResponse(res, homeHTML, 200);
};

const renderLogout = function(req, res) {
  let currCookie = req.headers.cookie;
  cookies.splice(cookies.indexOf(currCookie), 1);
  fs.writeFile("./cookies.json", JSON.stringify(cookies), err => {});
  res.setHeader(
    "Set-Cookie",
    `${currCookie};expires = Thu, 01 Jan 1970 00:00:00 GMT`
  );
  sendResponse(res, indexHTML, 200);
};

const saveCredentials = function(parsedCredentials) {
  delete parsedCredentials.confirmPassword;
  credentials.push(parsedCredentials);
  fs.writeFile("./credentials.json", JSON.stringify(credentials), err => {});
  return;
};

const passwordConfirms = parsedCredentials =>
  parsedCredentials.password == parsedCredentials.confirmPassword;

const signUp = function(req, res) {
  let parsedCredentials = parseData(req.body);
  if (!isAlreadyUser(parsedCredentials.userName)) {
    if (passwordConfirms(parsedCredentials)) {
      saveCredentials(parsedCredentials);
      sendResponse(res, indexHTML, 200);
      return;
    }
    sendResponse(res, signUpHTML, 200);
    return;
  }
  sendResponse(res, "already a user,please login", 200);
};

app.use(readBody);
app.post("/", renderLogout);
app.post("/loggedIn", getCredentials);
app.post("/submit", signUp);
app.use(serveFile);

module.exports = app.handleRequest.bind(app);
