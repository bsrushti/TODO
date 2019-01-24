const routeMethodNotEqualToRequestMethod = (req, route) =>
  route.method && req.method != route.method;

const doesRouteURLMatchesToRequestURL = (req, route) =>
  route.url instanceof RegExp && route.url.test(req.url);

const routeURLNotEqualToRequestURL = (req, route) =>
  route.url && req.url != route.url;

const isMatching = (req, route) => {
  if (routeMethodNotEqualToRequestMethod(req, route)) return false;
  if (doesRouteURLMatchesToRequestURL(req, route)) return true;
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
      let current = matchingRoutes[0];
      if (!current) return;
      matchingRoutes = matchingRoutes.slice(1);
      current.handler(req, res, next);
    };
    next();
  }
}

module.exports = App;
