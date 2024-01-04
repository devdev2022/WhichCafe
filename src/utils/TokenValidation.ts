import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { promisify } from "util";
import userService from "../services/userService";
import { customError, catchAsync } from "../utils/error";

interface CustomRequest extends Request {
  account?: string;
  refreshToken?: string;
}

const validateAccessToken = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
      return res
        .status(401)
        .json({ message: "Authorization header is missing" });
    }

    const tokenParts = 1;
    const accessToken: string =
      req.headers.authorization.split(" ")[tokenParts];

    if (!accessToken) {
      customError("NEED ACCESS TOKEN", 401);
    }

    const verifyAsync: any = promisify(jwt.verify);

    try {
      const decoded = await verifyAsync(
        accessToken,
        process.env.JWT_SECRET_KEY
      );
      const userInfo = await userService.getUserByAccount(decoded.account);
      req.account = userInfo.account;
      next();
    } catch (jwtError: any) {
      if (jwtError.name === "TokenExpiredError") {
        customError("Token expired. Please refresh token.", 401);
      }
      const error: Error & { statusCode?: number } = new Error(
        "Token validation process failed"
      );
      error.statusCode = 500;
      throw error;
    }
  }
);

const validateTokens = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
      return res
        .status(401)
        .json({ message: "Authorization header is missing" });
    }

    const refreshToken: string | string[] | undefined =
      req.headers.refreshtoken;
    const tokenParts = 1;
    const accessToken: string =
      req.headers.authorization.split(" ")[tokenParts];

    if (!refreshToken || !accessToken) {
      customError("NEED BOTH ACCESS AND REFRESH TOKEN", 401);
    }

    const verifyAsync: any = promisify(jwt.verify);

    try {
      const decodedRefreshToken = await verifyAsync(
        refreshToken,
        process.env.JWT_REFRESH_SECRET_KEY
      );

      const decodedAccessToken = await verifyAsync(
        accessToken,
        process.env.JWT_SECRET_KEY,
        { ignoreExpiration: true }
      );

      if (decodedRefreshToken.account !== decodedAccessToken.account) {
        customError("Access and Refresh Tokens do not match", 401);
      }

      const userInfo = await userService.getUserByAccount(
        decodedRefreshToken.account
      );

      req.account = userInfo.account;
      req.refreshToken = decodedRefreshToken;
      next();
    } catch (jwtError: any) {
      if (jwtError.name === "TokenExpiredError") {
        customError("RefreshToken expired. Please refresh token.", 401);
      }
      const error: Error & { statusCode?: number } = new Error(
        "Refresh Token validation process failed"
      );
      error.statusCode = 500;
      throw error;
    }
  }
);

export { validateAccessToken, validateTokens };
