const globalErrorHandler = (err, req, res, next) => {
  console.error(err.stack);

  err.statusCode = err.statusCode || 500;
  const errorMessage = err.message || "Internal Server Error";

  res.status(err.statusCode).json({ message: errorMessage });
};

const catchAsync = (func) => {
  return (req, res, next) => {
    func(req, res, next).catch((error) => next(error));
  };
};

const customError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  throw err;
};

module.exports = { catchAsync, globalErrorHandler, customError };
