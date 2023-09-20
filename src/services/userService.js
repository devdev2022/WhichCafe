const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userDao = require("../models/userDao");
const { validateAccount, validatePw } = require("../utils/validation");
const { customError } = require("../utils/error");

const signUp = async (account, password, nickname) => {
  validateAccount(account);
  validatePw(password);

  const user = await userDao.getUserByAccount(account);

  if (user.length > 0) {
    customError("DUPLICATED_ACCOUNT", 400);
  }

  const hashedPassword = await bcrypt.hash(
    password,
    parseInt(process.env.saltRounds)
  );

  const createUser = await userDao.createUser(
    account,
    hashedPassword,
    nickname
  );

  return createUser;
};

const signIn = async (account, password) => {
  const user = await userDao.getUserByAccount(account);

  if (!user) {
    customError("USER_DOES_NOT_EXIST", 400);
  }

  const result = await bcrypt.compare(password, user.password);

  if (!result) {
    customError("INVALID_PASSWORD", 401);
  }
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "1h",
  });
};

const getUserById = async (id) => {
  return await userDao.getUserById(id);
};

const getFavorites = async (account) => {
  if (!account) {
    customError("USER_ACCOUNT_NOT_PROVIDED", 400);
  }
  const userFavorites = await userDao.getFavorites(account);
  return userFavorites;
};

const addFavorites = async (account, cafeId) => {
  if (!account && !cafeId) {
    customError("USER_ACCOUNT_AND_CAFE_ID_NOT_PROVIDED", 400);
  } else if (!account) {
    customError("USER_ACCOUNT_NOT_PROVIDED", 400);
  } else if (!cafeId) {
    customError("CAFE_ID_NOT_PROVIDED", 400);
  }

  const addedFavorites = await userDao.addFavorites(account, cafeId);
  return addedFavorites;
};

const deleteFavorites = async (account, cafeId) => {
  if (!account && !cafeId) {
    customError("USER_ACCOUNT_AND_CAFE_ID_NOT_PROVIDED", 400);
  } else if (!account) {
    customError("USER_ACCOUNT_NOT_PROVIDED", 400);
  } else if (!cafeId) {
    customError("CAFE_ID_NOT_PROVIDED", 400);
  }

  const deletedFavoriteId = await userDao.deleteFavorites(account, cafeId);
  return deletedFavoriteId;
};

module.exports = {
  signUp,
  signIn,
  getUserById,
  getFavorites,
  addFavorites,
  deleteFavorites,
};
