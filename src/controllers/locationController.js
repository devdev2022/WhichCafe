const locationService = require("../services/locationService");
const { catchAsync } = require("../utils/error");

const getNearbyAddress = catchAsync(async (req, res) => {
  const { latitude, longitude } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({
      error: "KEY_ERROR",
      message: "필수 데이터가 전송되지 않았습니다.",
    });
  }

  const nearbyAddress = await locationService.getNearbyAddress(
    latitude,
    longitude
  );
  return res.status(200).json({ nearbyAddress });
});

const searchCafes = catchAsync(async (req, res) => {
  const { address } = req.query;

  if (!address) {
    return res.status(400).json({
      error: "KEY_ERROR",
      message: "필수 데이터가 전송되지 않았습니다.",
    });
  }

  const cafeList = await locationService.searchCafes(address);
  return res.status(200).json({ cafeList });
});

module.exports = { getNearbyAddress, searchCafes };
