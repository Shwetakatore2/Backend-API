const fetchAdmin = require("./fetchAdmin");
const fetchUser = require("./fetchuser");

const decideMiddleware = (req, res, next) => {
  if (req.header("auth-token")) {
    return fetchUser(req, res, next);
  } else if (req.header("admin-token")) {
    return fetchAdmin(req, res, next);
  }
};

module.exports = decideMiddleware;
