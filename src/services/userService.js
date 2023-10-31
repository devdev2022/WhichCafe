const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userDao = require("../models/userDao");
const { validateAccount, validatePw } = require("../utils/validation");
const { customError } = require("../utils/error");
const {
  getUserIdSchema,
  getUserSchema,
  getFavoritesSchema,
  findFavDataSchema,
  validateResponse,
} = require("../utils/ajvValidation/userValidation");

const duplicationCheck = async (account) => {
  try {
    const user = await userDao.getUserByAccount(account);
    const validationResult = validateResponse(getUserSchema, user);
    if (validationResult) {
      const error = new Error(
        "Validation Error: " + JSON.stringify(validationResult)
      );
      error.statusCode = 500;
      throw error;
    }

    if (user) {
      customError("ACCOUNT ALREADY EXIST", 400);
    }
  } catch (error) {
    throw error;
  }
};

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

    return signUp;
  } catch (error) {
    throw error;
  }
};

const signIn = async (account, password) => {
  try {
    const user = await userDao.getUserByAccount(account);
    const validationResult = validateResponse(getUserSchema, user);
    if (validationResult) {
      const error = new Error(
        "Validation Error: " + JSON.stringify(validationResult)
      );
      error.statusCode = 500;
      throw error;
    }

    if (!user) {
      customError("ACCOUNT DOES NOT EXIST OR INVALID PASSWORD", 400);
    }

    const result = await bcrypt.compare(password, user.password);
    if (!result) {
      customError("ACCOUNT DOES NOT EXIST OR INVALID PASSWORD", 401);
    }

    const accessToken = jwt.sign(
      { account: user.account },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );

    const refreshToken = jwt.sign(
      { account: user.account },
      process.env.JWT_REFRESH_SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );

    const userId = user.id;

    await userDao.addRefreshToken(userId, refreshToken);

    return { accessToken, refreshToken };
  } catch (error) {
    throw error;
  }
};

const logOut = async (userId, refreshToken) => {
  try {
    const findRefreshToken = await userDao.findRefreshToken(
      userId,
      refreshToken
    );
    /*const findRfTokenValidationResult = validateResponse(findRfTokenDataSchema, user);
    if (findRfTokenValidationResult) {
      const error = new Error(
        "Validation Error: " + JSON.stringify(findRfTokenValidationResult)
      );
      error.statusCode = 500;
      throw error;
    }*/

    if (!findRefreshToken) {
      customError("REFRESHTOKEN DOES NOT EXIST", 404);
    }

    const deletedFavoriteId = await userDao.deleteRefreshToken(
      userId,
      refreshToken
    );
    return deletedFavoriteId;
  } catch (error) {
    throw error;
  }
};

const getUserByAccount = async (account) => {
  try {
    const user = await userDao.getUserByAccount(account);
    const validationResult = validateResponse(getUserSchema, user);
    if (validationResult) {
      const error = new Error(
        "Validation Error: " + JSON.stringify(validationResult)
      );
      error.statusCode = 500;
      throw error;
    }

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
    const validationResult = validateResponse(
      getFavoritesSchema,
      userFavorites
    );
    if (validationResult) {
      const error = new Error(
        "Validation Error: " + JSON.stringify(validationResult)
      );
      error.statusCode = 500;
      throw error;
    }

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
    const userAccount = await userDao.getIdByAccount(account);
    const GetIdValidationResult = validateResponse(
      getUserIdSchema,
      userAccount
    );
    if (GetIdValidationResult) {
      const error = new Error(
        "Validation Error: " + JSON.stringify(GetIdValidationResult)
      );
      error.statusCode = 500;
      throw error;
    }

    const findFavData = await userDao.findFavData(userAccount, cafe_id);
    const findFavValidationResult = validateResponse(
      findFavDataSchema,
      findFavData
    );
    if (findFavValidationResult) {
      const error = new Error(
        "Validation Error: " + JSON.stringify(findFavValidationResult)
      );
      error.statusCode = 500;
      throw error;
    }

    if (findFavData) {
      customError("FAVOIRTES ALREADY REGISTERED", 400);
    }

    const addFavorites = await userDao.addFavorites(userAccount, cafe_id);
    return addFavorites;
  } catch (error) {
    throw error;
  }
};

const deleteFavorites = async (account, cafe_id) => {
  try {
    const userAccount = await userDao.getIdByAccount(account);
    const validationResult = validateResponse(getUserIdSchema, user);
    if (validationResult) {
      const error = new Error(
        "Validation Error: " + JSON.stringify(validationResult)
      );
      error.statusCode = 500;
      throw error;
    }

    const findFavData = await userDao.findFavData(userAccount, cafe_id);
    const findFavValidationResult = validateResponse(findFavDataSchema, user);
    if (findFavValidationResult) {
      const error = new Error(
        "Validation Error: " + JSON.stringify(validationResult)
      );
      error.statusCode = 500;
      throw error;
    }

    if (!findFavData) {
      customError("FAVORITES_DATA NOT EXIST", 404);
    }

    const deletedFavoriteId = await userDao.deleteFavorites(
      userAccount,
      cafe_id
    );
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
    const user = await userDao.getUserByAccount(account);
    const validationResult = validateResponse(getUserSchema, user);
    if (validationResult) {
      const error = new Error(
        "Validation Error: " + JSON.stringify(validationResult)
      );
      error.statusCode = 500;
      throw error;
    }

    const { id, password, created_at, ...filteredInfo } = user;
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
          const user = await userDao.getUserByAccount(account);
          const validationResult = validateResponse(getUserSchema, user);
          if (validationResult) {
            const error = new Error(
              "Validation Error: " + JSON.stringify(validationResult)
            );
            error.statusCode = 500;
            throw error;
          }
          if (user.nickname === updateData["nickname"]) {
            customError("YOUR NICKNAME IS SAME WITH CURRENT NICKNAME", 400);
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
    const validationResult = validateResponse(getUserSchema, checkAnswer);
    if (validationResult) {
      const error = new Error(
        "Validation Error: " + JSON.stringify(validationResult)
      );
      error.statusCode = 500;
      throw error;
    }
    if (!checkAnswer || answer !== checkAnswer.question_answer) {
      customError("ANSWER OR ACCOUNT DOES NOT MATCH", 400);
    }
    validatePw(editPassword);

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

const deleteAccount = async (account, deleteMessage) => {
  try {
    if (deleteMessage !== "동의합니다") {
      customError("MESSAGE DOES NOT MATCH", 400);
    }

    const deleteUserAccount = await userDao.deleteAccount(account);
    return deleteUserAccount;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  duplicationCheck,
  signUp,
  signIn,
  logOut,
  getUserByAccount,
  getFavorites,
  addFavorites,
  deleteFavorites,
  getUserInfoByAccount,
  updateUserInfo,
  searchPassword,
  deleteAccount,
};
