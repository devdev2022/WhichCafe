const userService = require("../services/userService");
const { catchAsync } = require("../utils/error");

const signUp = catchAsync(async (req, res) => {
  const { account, password, nickname } = req.body;

  if (!account || !password || !nickname) {
    return res.status(400).json({ message: "KEY_ERROR" });
  }

  await userService.signUp(account, password, nickname);
  return res.status(201).json({
    message: "SIGNUP_SUCCESS",
  });
});

const signIn = catchAsync(async (req, res) => {
  const { account, password } = req.body;

  if (!account || !password) {
    return res.status(400).json({ message: "KEY_ERROR" });
  }

  const accessToken = await userService.signIn(account, password);
  return res.status(200).json({ accessToken: accessToken });
});

const getFavorites = catchAsync(async (req, res) => {
  const account = req.user;
  if (!account) {
    return res.status(400).json({ message: "KEY_ERROR" });
  }

  const favorites = await userService.getFavorites(account);
  return res.status(200).json(favorites);
});

const addFavorites = catchAsync(async (req, res) => {
  const account = req.user;
  const cafe_id = req.params.cafeId;

  if (!account || !cafe_id) {
    return res.status(400).json({ message: "KEY_ERROR" });
  }

  await userService.addFavorites(account, cafe_id);
  return res.status(201).json({
    message: "ADD_FAVORITES_SUCCESS",
  });
});

const deleteFavorites = catchAsync(async (req, res) => {
  const account = req.user;
  const cafe_id = req.params.cafeId;

  if (!account || !cafe_id) {
    return res.status(400).json({ message: "KEY_ERROR" });
  }

  await userService.deleteFavorites(account, cafe_id);
  return res.status(204).send();
});

const getUserInfo = catchAsync(async (req, res) => {
  const account = req.user;

  const result = await userService.getUserInfoByAccount(account);
  return res.status(200).json(result);
});

const updateUserInfo = catchAsync(async (req, res) => {
  const account = req.user;
  if (!account) {
    return res.status(400).json({ message: "KEY_ERROR" });
  }

  const updateData = {
    password: req.body.password,
    nickname: req.body.nickname,
  };

  const result = await userService.updateUserInfo(updateData, account);
  return res.status(201).json({ message: result });
});

module.exports = {
  signIn,
  signUp,
  getFavorites,
  addFavorites,
  deleteFavorites,
  getUserInfo,
  updateUserInfo,
};
