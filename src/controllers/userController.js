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
  const account = req.user.account;
  const favorites = await userService.getFavorites(account);
  res.status(200).json(favorites);
});

const addFavorites = catchAsync(async (req, res) => {
  const { account, cafe_id } = req.body;

  await userService.addFavorites(account, cafe_id);
  return res.status(201).json({
    message: "ADD_FAVORITES_SUCCESS",
  });
});

const deleteFavorites = catchAsync(async (req, res) => {
  const { account, cafe_id } = req.body;

  await userService.deleteFavorites(account, cafe_id);
  return res.status(204).json({
    message: "DELETE_FAVORITES_SUCCESS",
  });
});

module.exports = {
  signIn,
  signUp,
  getFavorites,
  addFavorites,
  deleteFavorites,
};
