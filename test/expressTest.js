const chai = require("chai");
const App = require("../express");

const handleUSEEvents = (req, res, next) => {
  next();
};
const handleEvents = function(req, res) {
  return;
};

describe("app.use ", function() {
  const app = new App();
  app.use(handleUSEEvents);
  it("should push the object with handler only", function() {
    chai.assert.deepEqual(app.routes, [{ handler: handleUSEEvents }]);
  });
});

describe("app.get", function() {
  const app = new App();
  app.get("/", handleEvents);
  it("should push the object with method get and handler", function() {
    chai.assert.deepEqual(app.routes, [
      { method: "GET", url: "/", handler: handleEvents }
    ]);
  });
});

describe("app.post", function() {
  const app = new App();
  app.post("/", handleEvents);
  it("should push the object with method get and handler", function() {
    chai.assert.deepEqual(app.routes, [
      { method: "POST", url: "/", handler: handleEvents }
    ]);
  });
});

describe("app.error", function() {
  const app = new App();
  app.error(handleEvents);
  it("should return the error handler as error route", function() {
    chai.assert.deepEqual(app.errorRoute, handleEvents);
  });
});

describe("handleRequest", function() {
  const app = new App();
  let req = {};
  let res = {};
  it("should return if routes array is empty", function() {
    app.routes = [];
    app.handleRequest(req, res);
    chai.assert.deepEqual(app.routes, []);
  });

  it("should return an array of object when given the method GET", function() {
    app.routes = [{ method: "GET", url: "/", handler: handleEvents }];
    app.handleRequest(req, res);
    chai.assert.deepEqual(app.routes, [
      { method: "GET", url: "/", handler: handleEvents }
    ]);
  });

  it("should return an array of routes when route url is equal to req url and route method is equal to req method", function() {
    app.routes = [{ method: "GET", url: "/", handler: handleEvents }];
    let req = { method: "GET", url: "/", handler: handleEvents };
    app.handleRequest(req, res);
    chai.assert.deepEqual(app.routes, [
      { method: "GET", url: "/", handler: handleEvents }
    ]);
  });

  it("should return an array of routes when route url is not equal to req url", function() {
    app.routes = [{ method: "POST", url: "/hello/", handler: handleEvents }];
    let req = { method: "POST", url: "hello", handler: handleEvents };
    app.handleRequest(req, res);
    chai.assert.deepEqual(app.routes, [
      { method: "POST", url: "/hello/", handler: handleEvents }
    ]);
  });
});
