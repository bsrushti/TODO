const App = require("./express");
const fs = require("fs");
const logoutHTML = fs.readFileSync("./logout.html");
const indexHTML = fs.readFileSync("./index.html");
const { sendResponse, parseData } = require("./util");

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
  return `./{url}`;
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

const getCredentials = function(req, res) {
  let parsedCredentials = parseData(req.body);
  credentials.push(parsedCredentials);
  if (!req.headers.cookie) {
    let uniqId = new Date().getTime();
    cookies.push(uniqId);
    res.setHeader("Set-Cookie", uniqId);
  }
  fs.writeFile("./credentials.json", JSON.stringify(credentials), err => {});
  fs.writeFile("./cookies.json", JSON.stringify(cookies), err => {});
  sendResponse(res, logoutHTML, 200);
};

const renderLogin = function(req, res) {
  let currCookie = req.headers.cookie;
  cookies.splice(cookies.indexOf(currCookie), 1);
  fs.writeFile("./cookies.json", JSON.stringify(cookies), err => {});
  res.setHeader(
    "Set-Cookie",
    `${currCookie};expires = Thu, 01 Jan 1970 00:00:00 GMT`
  );
  sendResponse(res, indexHTML, 200);
};

app.use(readBody);
app.post("/", renderLogin);
app.post("/loggedIn", getCredentials);
app.use(serveFile);

module.exports = app.handleRequest.bind(app);
