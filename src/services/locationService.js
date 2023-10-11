const locationDao = require("../models/locationDao");

const getNearbyAddress = async (latitude, longitude) => {
  return await locationDao.getNearbyAddress(latitude, longitude);
};

const searchCafes = async (address) => {
  return await locationDao.searchCafes(address);
};

module.exports = {
  getNearbyAddress,
  searchCafes,
};
