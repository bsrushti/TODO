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
  app.routes = [];
  it("should return if routes array is empty", function() {
    chai.assert.deepEqual(undefined, app.handleRequest(req, res));
  });
});
