const jwt = require("jsonwebtoken");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const JWT_SECRET = process.env.JWT_SECRET;

const fetchAdmin = async (req, res, next) => {
  if (req.body.oldpwd) {
    next();
  } else {
    //Get the user for jwt token and id to request object
    try {
      const token = await req.header("admin-token");
      const data = jwt.verify(token, JWT_SECRET);
      req.admin = await data.admin;
      next();
    } catch (error) {
      console.log(error.message);
      res
        .status(401)
        .send({ error: "Please authenticate using a valid token" });
    }
  }
};

module.exports = fetchAdmin;
