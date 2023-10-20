const basicAuth = require("basic-auth");

const authMiddleware = (req, res, next) => {
  const user = basicAuth(req);

  const ADMIN_USERNAME = process.env.SWAGGER_USERNAME;
  const ADMIN_PASSWORD = process.env.SWAGGER_PASSWORD;

  if (!user || user.name !== ADMIN_USERNAME || user.pass !== ADMIN_PASSWORD) {
    res.set("WWW-Authenticate", 'Basic realm="example"');
    return res.status(401).send();
  }

  return next();
};

module.exports = { authMiddleware };
