const chai = require("chai");
const { parseData, sendResponse, generateCounter } = require("../src/util");

describe("parseData", function() {
  it("should return object when single key value pair provided", function() {
    let actual = parseData("name=pqr");
    let expected = { name: "pqr" };
    chai.assert.deepEqual(actual, expected);
  });

  it("should return object of provided credentials", function() {
    let actual = parseData("name=abc&password=1234");
    let expected = { name: "abc", password: "1234" };
    chai.assert.deepEqual(actual, expected);

    actual = parseData("name=abc&password=1234&confirmPassword=1234");
    expected = { name: "abc", password: "1234", confirmPassword: "1234" };
    chai.assert.deepEqual(actual, expected);
  });
});

describe("sendResponse", function() {
  it("should return ", function() {
    let res = {
      statusCode: 200,
      write: () => {},
      end: () => {
        return;
      }
    };
    let content = "abc";
    let status = 404;
    sendResponse(res, content, status);
    chai.assert.deepEqual(res.statusCode, 404);
  });
});

describe("generateCounter", function() {
  let counter = generateCounter();
  it("should return one as counter starts from one", function() {
    let actual = counter();
    let expected = 1;
    chai.assert.equal(actual, expected);
  });

  it("should return two after single function call", function() {
    let actual = counter();
    let expected = 2;
    chai.assert.equal(actual, expected);
  });
});
