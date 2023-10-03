const locationService = require("../services/locationService");
const { catchAsync } = require("../utils/error");

const getNearbyAddress = catchAsync(async (req, res) => {
  const { latitude, longitude } = req.body;

  if (!latitude || !longitude) {
    return res.status(400).json({ message: "KEY_ERROR" });
  }

  const nearbyAddress = await locationService.getNearbyAddress(
    latitude,
    longitude
  );
  return res.status(200).json({ nearbyAddress });
});

module.exports = { getNearbyAddress };
