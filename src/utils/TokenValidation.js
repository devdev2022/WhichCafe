const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const { getUserByAccount } = require("../services/userService");
const { customError, catchAsync } = require("../utils/error");

const validateAccessToken = catchAsync(async (req, res, next) => {
  const tokenParts = 1;
  const accessToken = req.headers.authorization.split(" ")[tokenParts];

  if (!accessToken) {
    customError("NEED ACCESS TOKEN", 401);
  }

  const verifyAsync = promisify(jwt.verify);

  try {
    const decoded = await verifyAsync(accessToken, process.env.JWT_SECRET_KEY);
    const userInfo = await getUserByAccount(decoded.account);
    req.account = userInfo.account;
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

const validateTokens = catchAsync(async (req, res, next) => {
  const refreshToken = req.headers.refreshtoken;
  const tokenParts = 1;
  const accessToken = req.headers.authorization.split(" ")[tokenParts];

  if (!refreshToken || !accessToken) {
    customError("NEED BOTH ACCESS AND REFRESH TOKEN", 401);
  }

  const verifyAsync = promisify(jwt.verify);

  try {
    const decodedRefreshToken = await verifyAsync(
      refreshToken,
      process.env.JWT_REFRESH_SECRET_KEY,
      { ignoreExpiration: true }
    );

    const decodedAccessToken = await verifyAsync(
      accessToken,
      process.env.JWT_SECRET_KEY,
      { ignoreExpiration: true }
    );

    if (decodedRefreshToken.account !== decodedAccessToken.account) {
      customError("Access and Refresh Tokens do not match", 401);
    }

    const userInfo = await getUserByAccount(decodedRefreshToken.account);

    req.account = userInfo.account;
    req.refreshToken = decodedRefreshToken;
    next();
  } catch (jwtError) {
    const error = new Error("Refresh Token validation process failed");
    error.statusCode = 500;
    throw error;
  }
});

module.exports = { validateAccessToken, validateTokens };
