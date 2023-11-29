const userService = require("../services/userService");
const { catchAsync } = require("../utils/error");

const duplicationCheck = catchAsync(async (req, res) => {
  const account = req.params.account;

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

const signUp = catchAsync(async (req, res) => {
  const { account, password, nickname, question_answer } = req.body;

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

const signIn = catchAsync(async (req, res) => {
  const { account, password } = req.body;

  if (!account || !password) {
    return res.status(400).json({
      message: "KEY_ERROR",
    });
  }

  const tokens = await userService.signIn(account, password);
  return res.status(200).json(tokens);
});

const logOut = catchAsync(async (req, res) => {
  const account = req.account;

  if (!account) {
    return res.status(400).json({
      message: "KEY_ERROR",
    });
  }

  await userService.logOut(account);
  return res.status(204).send();
});

const reissueAccessToken = catchAsync(async (req, res) => {
  const userInfo = req.account;
  const AccessToken = await userService.reissueAccessToken(userInfo);

  res.cookie("accessToken", AccessToken, {
    maxAge: 3600000,
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });

  return res.status(200).json({ accessToken: AccessToken });
});

const getFavorites = catchAsync(async (req, res) => {
  const account = req.account;
  if (!account) {
    return res.status(400).json({
      message: "KEY_ERROR",
    });
  }

  const favorites = await userService.getFavorites(account);
  return res.status(200).json(favorites);
});

const addFavorites = catchAsync(async (req, res) => {
  const account = req.account;
  const cafe_id = req.params.cafeId;

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

const deleteFavorites = catchAsync(async (req, res) => {
  const account = req.account;
  const cafe_id = req.params.cafeId;

  if (!account || !cafe_id) {
    return res.status(400).json({
      message: "KEY_ERROR",
    });
  }

  await userService.deleteFavorites(account, cafe_id);
  return res.status(204).send();
});

const getUserInfo = catchAsync(async (req, res) => {
  const account = req.account;

  if (!account) {
    return res.status(400).json({
      message: "KEY_ERROR",
    });
  }

  const result = await userService.getUserInfoByAccount(account);
  return res.status(200).json(result);
});

const updateUserInfo = catchAsync(async (req, res) => {
  const account = req.account;
  if (!account) {
    return res.status(400).json({
      message: "KEY_ERROR",
    });
  }

  const updateData = {
    password: req.body.password,
    nickname: req.body.nickname,
  };

  await userService.updateUserInfo(updateData, account);
  return res.status(200).json({ message: "UPDATE_DATA_SUCCESS" });
});

const searchPassword = catchAsync(async (req, res) => {
  const { account, answer, editPassword } = req.body;

  if (!account || !answer || !editPassword) {
    return res.status(400).json({
      message: "KEY_ERROR",
    });
  }

  await userService.searchPassword(account, answer, editPassword);
  return res.status(200).json({ message: "EDIT_PASSWORD_SUCCESS" });
});

const deleteAccount = catchAsync(async (req, res) => {
  const account = req.account;
  const { deleteMessage } = req.body;

  if (!account || !deleteMessage) {
    return res.status(400).json({
      message: "KEY_ERROR",
    });
  }

  await userService.deleteAccount(account, deleteMessage);
  return res.status(204).send();
});

module.exports = {
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
