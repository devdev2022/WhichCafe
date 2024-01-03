import { Request, Response } from "express";
import userService from "../services/userService";
import { catchAsync } from "../utils/error";

interface CustomRequest extends Request {
  account?: string;
}

const duplicationCheck = catchAsync(async (req: Request, res: Response) => {
  const account: string = req.params.account;

  if (!account) {
    return res.status(400).json({
      message: "KEY_ERROR",
    });
  }

  await userService.duplicationCheck(account);
  return res.status(200).json({
    message: "DUPLICATION_CHECK_PASS",
  });
});

const signUp = catchAsync(async (req: Request, res: Response) => {
  const { account, password, nickname, question_answer } = req.body as {
    account: string;
    password: string;
    nickname: string;
    question_answer: string;
  };

  if (!account || !password || !nickname || !question_answer) {
    return res.status(400).json({
      message: "KEY_ERROR",
    });
  }

  await userService.signUp(account, password, nickname, question_answer);
  return res.status(201).json({
    message: "SIGNUP_SUCCESS",
  });
});

const signIn = catchAsync(async (req: Request, res: Response) => {
  const { account, password } = req.body as {
    account: string;
    password: string;
  };

  if (!account || !password) {
    return res.status(400).json({
      message: "KEY_ERROR",
    });
  }

  const tokens = await userService.signIn(account, password);
  return res.status(200).json(tokens);
});

const logOut = catchAsync(async (req: CustomRequest, res: Response) => {
  const account = req.account;

  if (!account) {
    return res.status(400).json({
      message: "KEY_ERROR",
    });
  }

  await userService.logOut(account);
  return res.status(204).send();
});

const reissueAccessToken = catchAsync(
  async (req: CustomRequest, res: Response) => {
    if (typeof req.account !== "string") {
      throw new Error("Account information is required");
    }
    const userInfo: string = req.account;
    const AccessToken = await userService.reissueAccessToken(userInfo);

    return res.status(200).json({ accessToken: AccessToken });
  }
);

const getFavorites = catchAsync(async (req: CustomRequest, res: Response) => {
  const account = req.account;
  if (!account) {
    return res.status(400).json({
      message: "KEY_ERROR",
    });
  }

  const favorites = await userService.getFavorites(account);
  return res.status(200).json(favorites);
});

const addFavorites = catchAsync(async (req: CustomRequest, res: Response) => {
  const account = req.account;
  const cafe_id: string = req.params.cafeId;

  if (!account || !cafe_id) {
    return res.status(400).json({
      message: "KEY_ERROR",
    });
  }

  await userService.addFavorites(account, cafe_id);
  return res.status(201).json({
    message: "ADD_FAVORITES_SUCCESS",
  });
});

const deleteFavorites = catchAsync(
  async (req: CustomRequest, res: Response) => {
    const account = req.account;
    const cafe_id: string = req.params.cafeId;

    if (!account || !cafe_id) {
      return res.status(400).json({
        message: "KEY_ERROR",
      });
    }

    await userService.deleteFavorites(account, cafe_id);
    return res.status(204).send();
  }
);

const getUserInfo = catchAsync(async (req: CustomRequest, res: Response) => {
  const account = req.account;

  if (!account) {
    return res.status(400).json({
      message: "KEY_ERROR",
    });
  }

  const result = await userService.getUserInfoByAccount(account);
  return res.status(200).json(result);
});

const updateUserInfo = catchAsync(async (req: CustomRequest, res: Response) => {
  const account = req.account;
  if (!account) {
    return res.status(400).json({
      message: "KEY_ERROR",
    });
  }

  const updateData = {
    password: req.body.password,
    nickname: req.body.nickname,
  } as { password: string; nickname: string };

  await userService.updateUserInfo(updateData, account);
  return res.status(200).json({ message: "UPDATE_DATA_SUCCESS" });
});

const searchPassword = catchAsync(async (req: Request, res: Response) => {
  const { account, answer, editPassword } = req.body as {
    account: string;
    answer: string;
    editPassword: string;
  };

  if (!account || !answer || !editPassword) {
    return res.status(400).json({
      message: "KEY_ERROR",
    });
  }

  await userService.searchPassword(account, answer, editPassword);
  return res.status(200).json({ message: "EDIT_PASSWORD_SUCCESS" });
});

const deleteAccount = catchAsync(async (req: CustomRequest, res: Response) => {
  const account = req.account;
  const { deleteMessage } = req.body as { deleteMessage: string };

  if (!account || !deleteMessage) {
    return res.status(400).json({
      message: "KEY_ERROR",
    });
  }

  await userService.deleteAccount(account, deleteMessage);
  return res.status(204).send();
});

export default {
  duplicationCheck,
  signUp,
  signIn,
  logOut,
  reissueAccessToken,
  getFavorites,
  addFavorites,
  deleteFavorites,
  getUserInfo,
  updateUserInfo,
  searchPassword,
  deleteAccount,
};
