const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const { getUserById } = require("../services/userService");

const validateToken = async (req, res, next) => {
  try {
    const accessToken = req.headers.authorization;

    if (!accessToken) {
      const error = new Error("NEED_ACCESS_TOKEN");
      error.statusCode = 401;
      throw error;
    }

    const decoded = await promisify(jwt.verify)(
      accessToken,
      process.env.secretKey
    );

    const user = await getUserById(decoded.id);

    if (!user) {
      const error = new Error("USER_DOES_NOT_EXIST");
      error.statusCode = 404;
      throw error;
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token expired. Please refresh token." });
    }
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { validateToken };
