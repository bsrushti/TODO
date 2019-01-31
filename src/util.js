const { PUBLIC_DIR_PATH, INDEX_PAGE_PATH } = require("./constants");

const sendResponse = function(res, content, status) {
  res.statusCode = status;
  res.write(content);
  res.end();
};

const parseData = text => {
  let args = {};
  const splitKeyValue = pair => pair.split("=");
  const assignKeyValueToArgs = ([key, value]) => (args[key] = value);
  text
    .split("&")
    .map(splitKeyValue)
    .forEach(assignKeyValueToArgs);
  return args;
};

const getPath = url => {
  if (url == "/") return INDEX_PAGE_PATH;
  return PUBLIC_DIR_PATH + url;
};

const confirmPassword = parsedCredentials =>
  parsedCredentials.password == parsedCredentials.confirmPassword;

module.exports = {
  sendResponse,
  parseData,
  getPath,
  confirmPassword
};
