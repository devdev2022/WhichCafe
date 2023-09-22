const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userDao = require("../models/userDao");
const { validateAccount, validatePw } = require("../utils/validation");
const { customError } = require("../utils/error");

const signUp = async (account, password, nickname) => {
  try {
    validateAccount(account);
    validatePw(password);

    const user = await userDao.getUserByAccount(account);

    if (user > 0) {
      throw customError("DUPLICATED_ACCOUNT", 400);
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
  } catch (error) {
    if (error.message === "DUPLICATED_ACCOUNT") {
      throw new Error("ACCOUNT ALREADY EXIST");
    } else {
      throw error;
    }
  }
};

const signIn = async (account, password) => {
  const user = await userDao.getUserByAccount(account);

  if (!user) {
    throw customError("USER_DOES_NOT_EXIST", 400);
  }

  const result = await bcrypt.compare(password, user.password);

  if (!result) {
    throw customError("INVALID_PASSWORD", 401);
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
    throw customError("USER_ACCOUNT_NOT_PROVIDED", 400);
  }
  const userFavorites = await userDao.getFavorites(account);
  return userFavorites;
};

/*const getIdByAccount = async (account) => {
  if (!id) {
    customError("User not found.", 404);
  }
  const getAccount = await userDao.getIdByAccount(account);
  return getAccount;
};*/

const addFavorites = async (account, cafe_id) => {
  const userId = await userDao.getIdByAccount(account);
  if (!userId) {
    throw customError("USER_NOT_FOUND", 404);
  }

  if (!userId && !cafe_id) {
    throw customError("USER_ACCOUNT_AND_CAFE_ID_NOT_PROVIDED", 400);
  } else if (!userId) {
    throw customError("USER_ACCOUNT_NOT_PROVIDED", 400);
  } else if (!cafe_id) {
    throw customError("CAFE_ID_NOT_PROVIDED", 400);
  }

  const findUserId = await userDao.findUserId(userId);
  if (findUserId) {
    throw customError("FAVOIRTE_ALREADY_REGISTERED", 400);
  }

  const addedFavorites = await userDao.addFavorites(userId, cafe_id);
  return addedFavorites;
};

const deleteFavorites = async (account, cafe_id) => {
  const userId = await userDao.getIdByAccount(account);
  if (!userId) {
    throw customError("USER_NOT_FOUND", 404);
  }

  if (!userId && !cafe_id) {
    throw customError("USER_ACCOUNT_AND_CAFE_ID_NOT_PROVIDED", 400);
  } else if (!userId) {
    throw customError("USER_ACCOUNT_NOT_PROVIDED", 400);
  } else if (!cafe_id) {
    throw customError("CAFE_ID_NOT_PROVIDED", 400);
  }

  const findUserId = await userDao.findUserId(userId);
  if (!findUserId) {
    throw customError("USER_ID_NOT_EXIST", 400);
  }

  const deletedFavoriteId = await userDao.deleteFavorites(userId, cafe_id);
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
