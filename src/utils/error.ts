import { Request, Response, NextFunction } from "express";

interface ErrorStatus extends Error {
  statusCode?: number;
}

const globalErrorHandler = (
  err: ErrorStatus,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack);

  err.statusCode = err.statusCode || 500;
  const errorMessage = err.message || "Internal Server Error";

  res.status(err.statusCode).json({ message: errorMessage });
};

const catchAsync = (
  func: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    func(req, res, next).catch((error) => next(error));
  };
};

const customError = (message: string, statusCode: number) => {
  const err = new Error(message) as ErrorStatus;
  err.statusCode = statusCode;
  throw err;
};

export { catchAsync, globalErrorHandler, customError };
