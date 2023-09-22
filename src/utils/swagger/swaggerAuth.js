require("dotenv").config();

const API_KEY = process.env.SWAGGER_API_KEY;

const swaggerAuthentication = (req, res, next) => {
  const apiKey = req.header("WhichCafe_API");
  if (!apiKey || apiKey !== API_KEY) {
    return res.status(403).json({ message: "API Access Denied" });
  }
  next();
};

module.exports = {
  swaggerAuthentication,
};
