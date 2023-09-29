const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const { getUserByAccount } = require("../services/userService");

const validateToken = async (req, res, next) => {
  try {
    const tokenParts = 1;
    const accessToken = req.headers.authorization.split(" ")[tokenParts];

    if (!accessToken) {
      const error = new Error("NEED ACCESS TOKEN");
      error.statusCode = 401;
      throw error;
    }

    const verifyAsync = promisify(jwt.verify);
    const decoded = await verifyAsync(accessToken, process.env.JWT_SECRET_KEY);

    const user = await getUserByAccount(decoded.account);

    req.user = user.account;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token expired. Please refresh token." });
    }
    return res
      .status(500)
      .json({ message: error.message || "Token validation process failed" });
  }
};

module.exports = { validateToken };
