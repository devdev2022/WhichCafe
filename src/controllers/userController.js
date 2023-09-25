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

  const accessToken = await userService.signIn(account, password);
  res.status(200).json({ accessToken: accessToken });
});

const getFavorites = catchAsync(async (req, res) => {
  const { account } = req.body;

  await userService.getFavorites(account);
  return res.status(200).json({
    message: "GET_FAVORITES_SUCCESS",
  });
});

const addFavorites = catchAsync(async (req, res) => {
  const { account, cafeId } = req.body;

  await userService.addFavorites(account, cafeId);
  return res.status(201).json({
    message: "ADD_FAVORITES_SUCCESS",
  });
});

const deleteFavorites = catchAsync(async (req, res) => {
  const { account, cafeId } = req.body;

  await userService.deleteFavorites(account, cafeId);
  return res.status(204).json({
    message: "DELETE_FAVORITES_SUCCESS",
  });
});

const getUserInfo = catchAsync(async (req, res) => {
  const { account } = req.params;

  const [result] = await userService.getUserInfoByAccount(account);
  return res.status(200).json(result);
});

const updateUserInfo = catchAsync(async (req, res) => {
  const { account } = req.params;
  const { password, nickname } = req.body;

  const result = await userService.updateUserInfo(password, nickname, account);
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
