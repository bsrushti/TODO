const App = require("./express");
const fs = require("fs");
const cookie = require("./cookies");
const credentials = require("./credentials");
const { sendResponse, parseData } = require("./util");
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
    cookie.push(uniqId);
    res.setHeader("Set-Cookie", uniqId);
  }
  fs.writeFile("./credentials.json", JSON.stringify(credentials), err => {});
  fs.writeFile("./cookies.json", JSON.stringify(cookie), err => {});
  res.end();
};

app.use(readBody);
app.post("/loggedIn", getCredentials);
app.use(serveFile);

module.exports = app.handleRequest.bind(app);
