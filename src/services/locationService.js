const locationDao = require("../models/locationDao");

const getNearbyAddress = async (latitude, longitude) => {
  return await locationDao.getNearbyAddress(latitude, longitude);
};

module.exports = {
  getNearbyAddress,
};
