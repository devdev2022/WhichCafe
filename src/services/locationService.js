const locationDao = require("../models/locationDao");
const { customError } = require("../utils/error");

const getNearbyAddress = async (latitude, longitude) => {
  return await locationDao.getNearbyAddress(latitude, longitude);
};

module.exports = {
  getNearbyAddress,
};
