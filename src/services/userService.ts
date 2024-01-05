import jwt from "jsonwebtoken";
import moment from "moment";
import bcrypt from "bcrypt";
import userDao from "../models/userDao";
import { validateAccount, validatePw } from "../utils/validation";
import { customError } from "../utils/error";
import {
  getUserIdSchema,
  getUserSchema,
  getFavoritesSchema,
  findFavDataSchema,
  findRefreshTokenSchema,
  validateResponse,
} from "../utils/ajvValidation/userValidation";

class InternalError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "InternalError";
    this.statusCode = statusCode;
  }
}

interface UpdateData {
  [key: string]: string | undefined;
  password?: string;
  nickname?: string;
}

interface User {
  id: string;
  account: string;
  password: string;
  nickname: string;
  question_answer: string;
  created_at: Date;
}

const duplicationCheck = async (account: string) => {
  try {
    const user = await userDao.getUserByAccount(account);
    const validationResult = validateResponse(getUserSchema, user);

    if (validationResult) {
      const error = new InternalError(
        "getUserValidation Error: " + JSON.stringify(validationResult),
        500
      );
      throw error;
    }

    if (user) {
      customError("ACCOUNT ALREADY EXIST", 400);
    }
  } catch (error) {
    throw error;
  }
};

const signUp = async (
  account: string,
  password: string,
  nickname: string,
  question_answer: string
) => {
  try {
    validateAccount(account);
    validatePw(password);

    const user = await userDao.getUserByAccount(account);

    const validationResult = validateResponse(getUserSchema, user);

    if (validationResult) {
      const error = new InternalError(
        "getUserValidation Error: " + JSON.stringify(validationResult),
        500
      );
      throw error;
    }

    if (user) {
      customError("DUPLICATED ACCOUNT", 400);
    }

    if (!process.env.SALT_ROUNDS) {
      throw new Error("SALT_ROUNDS DOES NOT EXIST");
    }

    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.SALT_ROUNDS)
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

const signIn = async (account: string, password: string) => {
  try {
    const user: any = await userDao.getUserByAccount(account);
    const validationResult = validateResponse(getUserSchema, user);

    if (validationResult) {
      const error = new InternalError(
        "getUserValidation Error: " + JSON.stringify(validationResult),
        500
      );
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
      process.env.JWT_SECRET_KEY as string,
      {
        expiresIn: "1h",
      }
    );

    const expiresIn = "14d";
    const refreshToken = jwt.sign(
      { account: user.account },
      process.env.JWT_REFRESH_SECRET_KEY as string,
      { expiresIn }
    );

    const expirationArray = expiresIn.split("");
    const expirationNumber = parseInt(expirationArray[0], 10);
    const expirationUnit = expirationArray[1];

    const unitMapping: { [unit: string]: string } = {
      d: "days",
      h: "hours",
      m: "minutes",
    };

    const expires_at = moment()
      .add(
        expirationNumber,
        unitMapping[expirationUnit] as moment.unitOfTime.DurationConstructor
      )
      .format("YYYY-MM-DD HH:mm:ss");

    const userId = user.id;

    await userDao.addRefreshToken(userId, account, refreshToken, expires_at);

    return { accessToken, refreshToken };
  } catch (error) {
    throw error;
  }
};

const logOut = async (account: string) => {
  try {
    const findRefreshToken = await userDao.findRefreshToken(account);
    const refreshTokenvalidationResult = validateResponse(
      findRefreshTokenSchema,
      findRefreshToken
    );

    if (refreshTokenvalidationResult) {
      const error = new InternalError(
        "refreshTokenValidation Error: " +
          JSON.stringify(refreshTokenvalidationResult),
        500
      );
      throw error;
    }

    if (!findRefreshToken) {
      customError("REFRESHTOKEN DOES NOT EXIST", 400);
    }

    const deletedFavoriteId = await userDao.deleteRefreshToken(account);
    return deletedFavoriteId;
  } catch (error) {
    throw error;
  }
};

const reissueAccessToken = async (userInfo: string) => {
  try {
    const user = await userDao.getUserByAccount(userInfo);
    const validationResult = validateResponse(getUserSchema, user);

    if (validationResult) {
      const error = new InternalError(
        "getUserValidation Error: " + JSON.stringify(validationResult),
        500
      );
      throw error;
    }

    if (!user) {
      customError("USER DOES NOT EXIST", 400);
    }

    const storedRefreshToken = await userDao.findRefreshToken(userInfo);
    const refreshTokenvalidationResult = validateResponse(
      findRefreshTokenSchema,
      storedRefreshToken
    );

    if (refreshTokenvalidationResult) {
      const error = new InternalError(
        "refreshTokenValidation Error: " +
          JSON.stringify(refreshTokenvalidationResult),
        500
      );
      throw error;
    }

    if (!storedRefreshToken) {
      customError("INVALID REFRESH TOKEN", 401);
    }

    const newAccessToken = jwt.sign(
      { account: (user as any).account },
      process.env.JWT_SECRET_KEY as string,
      {
        expiresIn: "1h",
      }
    );

    return newAccessToken;
  } catch (error) {
    throw error;
  }
};

const getUserByAccount = async (account: string) => {
  try {
    const user = await userDao.getUserByAccount(account);
    const validationResult = validateResponse(getUserSchema, user);

    if (validationResult) {
      const error = new InternalError(
        "getUserValidation Error: " + JSON.stringify(validationResult),
        500
      );
      throw error;
    }

    if (!user) {
      const error = new InternalError("USER DOES NOT EXIST ", 404);
      throw error;
    }

    return user;
  } catch (error) {
    throw error;
  }
};

const getFavorites = async (account: string) => {
  try {
    let userFavorites: any = await userDao.getFavorites(account);
    if (Array.isArray(userFavorites) && userFavorites.length > 0) {
      userFavorites = userFavorites[0][0];
    } else {
      throw new Error("Invalid data structure");
    }
    const validationResult = validateResponse(
      getFavoritesSchema,
      userFavorites
    );

    if (validationResult) {
      const error = new InternalError(
        "getFavValidation Error: " + JSON.stringify(validationResult),
        500
      );
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

const addFavorites = async (account: string, cafe_id: string) => {
  try {
    const userId = await userDao.getIdByAccount(account);
    const GetIdValidationResult = validateResponse(getUserIdSchema, userId);

    if (GetIdValidationResult) {
      const error = new InternalError(
        "getIdValidation Error: " + JSON.stringify(GetIdValidationResult),
        500
      );
      throw error;
    }

    let findFavData = await userDao.findFavData(userId, cafe_id);

    if (Array.isArray(findFavData) && findFavData.length > 0) {
      findFavData = findFavData[0];

      const findFavValidationResult = validateResponse(
        findFavDataSchema,
        findFavData
      );
      if (findFavValidationResult) {
        const error = new InternalError(
          "findFavValidation Error: " + JSON.stringify(findFavValidationResult),
          500
        );
        throw error;
      }

      if (findFavData) {
        customError("FAVOIRTES ALREADY REGISTERED", 400);
      }
    } else if (Array.isArray(findFavData) && findFavData.length === 0) {
      const addFavorites = await userDao.addFavorites(userId, cafe_id);
      return addFavorites;
    }
  } catch (error) {
    throw error;
  }
};

const deleteFavorites = async (account: string, cafe_id: string) => {
  try {
    const userId = await userDao.getIdByAccount(account);
    const GetIdValidationResult = validateResponse(getUserIdSchema, userId);

    if (GetIdValidationResult) {
      const error = new InternalError(
        "getIdValidation Error: " + JSON.stringify(GetIdValidationResult),
        500
      );
      throw error;
    }

    let findFavData = await userDao.findFavData(userId, cafe_id);

    if (Array.isArray(findFavData) && findFavData.length > 0) {
      findFavData = findFavData[0];
      const findFavValidationResult = validateResponse(
        findFavDataSchema,
        findFavData
      );

      if (findFavValidationResult) {
        const error = new InternalError(
          "findFavValidation Error: " + JSON.stringify(findFavValidationResult),
          500
        );
        throw error;
      }

      const deletedFavoriteId = await userDao.deleteFavorites(userId, cafe_id);
      return deletedFavoriteId;
    } else if (Array.isArray(findFavData) && findFavData.length === 0) {
      customError("FAVORITES_DATA NOT EXIST", 404);
    }
  } catch (error) {
    throw error;
  }
};

const getUserInfoByAccount = async (account: string) => {
  try {
    const user = await userDao.getUserByAccount(account);
    const validationResult = validateResponse(getUserSchema, user);

    if (validationResult) {
      const error = new InternalError(
        "getUserValidation Error: " + JSON.stringify(validationResult),
        500
      );
      throw error;
    }

    if (!user) {
      customError("USER DOES NOT EXIST", 400);
    }

    const { id, password, created_at, ...filteredInfo } = user as User;
    return filteredInfo;
  } catch (error) {
    throw error;
  }
};

const updateUserInfo = async (updateData: UpdateData, account: string) => {
  try {
    const updateFields: string[] = [];
    const values: string[] = [];
    const validFields = ["password", "nickname"];

    for (let field of validFields) {
      if (updateData[field]) {
        if (field === "nickname") {
          const user: User | null = await userDao.getUserByAccount(account);
          if (!user) {
            customError("USER DOES NOT EXIST", 400);
          }

          const validationResult = validateResponse(getUserSchema, user);

          if (validationResult) {
            const error = new InternalError(
              "getUserValidation Error: " + JSON.stringify(validationResult),
              500
            );
            throw error;
          }

          if (user!.nickname === updateData["nickname"]) {
            customError("YOUR NICKNAME IS SAME WITH CURRENT NICKNAME", 400);
          }
        }

        if (field === "password" && updateData[field] !== undefined) {
          if (!process.env.SALT_ROUNDS) {
            throw new Error("SALT_ROUNDS DOES NOT EXIST");
          }

          const hashedPassword = await bcrypt.hash(
            updateData[field] as string,
            parseInt(process.env.SALT_ROUNDS)
          );
          values.push(hashedPassword);
        } else if (updateData[field] !== undefined) {
          values.push(updateData[field] as string);
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

const searchPassword = async (
  account: string,
  answer: string,
  editPassword: string
) => {
  try {
    const checkAnswer: any = await userDao.getUserByAccount(account);
    const validationResult = validateResponse(getUserSchema, checkAnswer);

    if (validationResult) {
      const error = new InternalError(
        "getUserValidation Error: " + JSON.stringify(validationResult),
        500
      );
      throw error;
    }

    if (!checkAnswer || answer !== checkAnswer.question_answer) {
      customError("ANSWER OR ACCOUNT DOES NOT MATCH", 400);
    }
    validatePw(editPassword);

    const updateFields: string[] = [];
    const values: string[] = [];

    if (!process.env.SALT_ROUNDS) {
      throw new Error("SALT_ROUNDS DOES NOT EXIST");
    }

    const hashedPassword = await bcrypt.hash(
      editPassword,
      parseInt(process.env.SALT_ROUNDS)
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

const deleteAccount = async (account: string, deleteMessage: string) => {
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

export default {
  duplicationCheck,
  signUp,
  signIn,
  logOut,
  reissueAccessToken,
  getUserByAccount,
  getFavorites,
  addFavorites,
  deleteFavorites,
  getUserInfoByAccount,
  updateUserInfo,
  searchPassword,
  deleteAccount,
};
