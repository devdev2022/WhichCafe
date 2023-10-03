const locationService = require("../services/locationService");
const { catchAsync } = require("../utils/error");

const getNearbyAddress = catchAsync(async (req, res) => {
  const { latitude, longitude } = req.body;
  const nearbyAddress = await locationService.getNearbyAddress(
    latitude,
    longitude
  );
  return res.status(200).json({ nearbyAddress });
});

module.exports = { getNearbyAddress };
