const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const { getUserByAccount } = require("../services/userService");
const { customError, catchAsync } = require("../utils/error");

const validateToken = catchAsync(async (req, res, next) => {
  const tokenParts = 1;
  const accessToken = req.headers.authorization.split(" ")[tokenParts];

  if (!accessToken) {
    customError("NEED ACCESS TOKEN", 401);
  }

  const verifyAsync = promisify(jwt.verify);

  try {
    const decoded = await verifyAsync(accessToken, process.env.JWT_SECRET_KEY);
    const user = await getUserByAccount(decoded.account);
    req.user = user.account;
    next();
  } catch (jwtError) {
    if (jwtError.name === "TokenExpiredError") {
      customError("Token expired. Please refresh token.", 401);
    }
    const error = new Error("Token validation process failed");
    error.statusCode = 500;
    throw error;
  }
});

module.exports = { validateToken };
