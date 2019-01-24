const routeMethodNotEqualToRequestMethod = (req, route) =>
  route.method && req.method != route.method;

const routeURLNotEqualToRequestURL = (req, route) =>
  route.url && req.url != route.url;

const isMatching = (req, route) => {
  if (routeMethodNotEqualToRequestMethod(req, route)) return false;
  if (routeURLNotEqualToRequestURL(req, route)) return false;
  return true;
};

class App {
  constructor() {
    this.routes = [];
  }

  use(handler) {
    this.routes.push({ handler });
  }

  get(url, handler) {
    this.routes.push({ method: "GET", url, handler });
  }

  post(url, handler) {
    this.routes.push({ method: "POST", url, handler });
  }

  error(handler) {
    this.errorRoute = handler;
  }

  handleRequest(req, res) {
    let matchingRoutes = this.routes.filter(r => isMatching(req, r));
    let next = () => {
      console.log(matchingRoutes.length);
      let current = matchingRoutes[0];
      if (!current) return;
      matchingRoutes = matchingRoutes.slice(1);
      current.handler(req, res, next);
    };
    next();
  }
}

module.exports = App;
