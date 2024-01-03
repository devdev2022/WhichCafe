import basicAuth from "basic-auth";
import { Request, Response, NextFunction } from "express";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const user = basicAuth(req);

  const ADMIN_USERNAME = process.env.SWAGGER_USERNAME;
  const ADMIN_PASSWORD = process.env.SWAGGER_PASSWORD;

  if (!user || user.name !== ADMIN_USERNAME || user.pass !== ADMIN_PASSWORD) {
    res.set("WWW-Authenticate", 'Basic realm="example"');
    return res.status(401).send();
  }

  return next();
};

export { authMiddleware };
