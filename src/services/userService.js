const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userDao = require("../models/userDao");
const { validateAccount, validatePw } = require("../utils/validation");
const { customError } = require("../utils/error");

const signUp = async (account, password, nickname, question_answer) => {
  try {
    validateAccount(account);
    validatePw(password);

    const user = await userDao.getUserByAccount(account);
    if (user) {
      customError("DUPLICATED ACCOUNT", 400);
    }

    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.saltRounds)
    );

    const signUp = await userDao.signUp(
      account,
      hashedPassword,
      nickname,
      question_answer
    );
    if (!signUp) {
      const error = new Error("SIGNUP FAILED");
      error.statusCode = 500;
      throw error;
    }

    return signUp;
  } catch (error) {
    throw error;
  }
};

const signIn = async (account, password) => {
  try {
    const user = await userDao.getUserByAccount(account);

    if (!user) {
      customError("ACCOUNT DOES NOT EXIST OR INVALID PASSWORD", 400);
    }

    const result = await bcrypt.compare(password, user.password);
    if (!result) {
      customError("ACCOUNT DOES NOT EXIST OR INVALID PASSWORD", 401);
    }

    return jwt.sign({ account: user.account }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });
  } catch (error) {
    throw error;
  }
};

const getUserByAccount = async (account) => {
  try {
    const user = await userDao.getUserByAccount(account);

    if (!user) {
      const error = new Error("USER DOES NOT EXIST");
      error.statusCode = 404;
      throw error;
    }
    return user;
  } catch (error) {
    throw error;
  }
};

const getFavorites = async (account) => {
  try {
    const userFavorites = await userDao.getFavorites(account);

    if (!userFavorites) {
      customError("FAVORITES DOES NOT EXIST", 400);
    }
    return userFavorites;
  } catch (error) {
    throw error;
  }
};

const addFavorites = async (account, cafe_id) => {
  try {
    const userId = await userDao.getIdByAccount(account);
    if (!userId) {
      customError("USER ID DOES NOT EXIST", 400);
    }

    if (!cafe_id) {
      customError("CAFE ID NOT PROVIDED", 400);
    }

    const findFavData = await userDao.findFavData(userId, cafe_id);
    if (findFavData) {
      customError("FAVOIRTES ALREADY REGISTERED", 400);
    }

    const addFavorites = await userDao.addFavorites(userId, cafe_id);
    return addFavorites;
  } catch (error) {
    throw error;
  }
};

const deleteFavorites = async (account, cafe_id) => {
  try {
    const userId = await userDao.getIdByAccount(account);

    const findFavData = await userDao.findFavData(userId, cafe_id);
    if (!findFavData) {
      customError("FAVORITES_DATA NOT EXIST", 400);
    }

    const deletedFavoriteId = await userDao.deleteFavorites(userId, cafe_id);
    return deletedFavoriteId;
  } catch (error) {
    throw error;
  }
};

const getUserInfoByAccount = async (account) => {
  try {
    if (!account) {
      throw new Error("USER_ACCOUNT NOT PROVIDED");
    }
    const userInfo = await userDao.getUserByAccount(account);
    const { id, password, created_at, ...filteredInfo } = userInfo;
    return filteredInfo;
  } catch (error) {
    throw error;
  }
};

const updateUserInfo = async (updateData, account) => {
  try {
    let updateFields = [];
    let values = [];
    const validFields = ["password", "nickname"];

    for (let field of validFields) {
      if (updateData[field]) {
        if (field === "nickname") {
          const checkNickname = await userDao.getUserByAccount(account);
          if (checkNickname.nickname === updateData["nickname"]) {
            customError("YOUR NICKNAME IS SAME WITH CURRENT NICKNAME", 400);
          }

          const checkNicknameDup = await userDao.getUserByNickname(
            updateData["nickname"]
          );
          if (checkNicknameDup) {
            customError("DUPLICATED NICKNAME", 400);
          }
        }

        if (field === "password") {
          const hashedPassword = await bcrypt.hash(
            updateData[field],
            parseInt(process.env.saltRounds)
          );
          values.push(hashedPassword);
        } else {
          values.push(updateData[field]);
        }
        updateFields.push(`${field} = ?`);
      }
    }

    if (updateFields.length === 0) {
      customError("NO UPDATE_DATA PROVIDED", 400);
    }

    const updateInfo = await userDao.updateUserInfo(
      updateFields,
      values,
      account
    );
    return updateInfo;
  } catch (error) {
    throw error;
  }
};

const searchPassword = async (account, answer, editPassword) => {
  try {
    const checkAnswer = await userDao.getUserByAccount(account);
    if (!checkAnswer || answer !== checkAnswer.question_answer) {
      customError("ANSWER OR ACCOUNT DOES NOT MATCH", 400);
    }

    const updateFields = [];
    const values = [];

    const hashedPassword = await bcrypt.hash(
      editPassword,
      parseInt(process.env.saltRounds)
    );

    updateFields.push("password = ?");
    values.push(hashedPassword);

    const updatePassword = await userDao.updateUserInfo(
      updateFields,
      values,
      account
    );
    return updatePassword;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  signUp,
  signIn,
  getUserByAccount,
  getFavorites,
  addFavorites,
  deleteFavorites,
  getUserInfoByAccount,
  updateUserInfo,
  searchPassword,
};
