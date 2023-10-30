const locationDao = require("../models/locationDao");
const {
  getNearbyAddressSchema,
  searchCafesSchema,
  validateResponse,
} = require("../utils/ajvValidation/locationValidation");

const getNearbyAddress = async (latitude, longitude) => {
  const getNearbyAddress = await locationDao.getNearbyAddress(
    latitude,
    longitude
  );
  const validationResult = validateResponse(
    getNearbyAddressSchema,
    getNearbyAddress
  );
  if (validationResult) {
    const error = new Error(
      "Validation Error: " + JSON.stringify(validationResult)
    );
    error.statusCode = 500;
    throw error;
  }
  return getNearbyAddress;
};

const searchCafes = async (address) => {
  const searchCafes = await locationDao.searchCafes(address);
  const validationResult = validateResponse(searchCafesSchema, searchCafes);
  if (validationResult) {
    const error = new Error(
      "Validation Error: " + JSON.stringify(validationResult)
    );
    error.statusCode = 500;
    throw error;
  }
  return searchCafes;
};

module.exports = {
  getNearbyAddress,
  searchCafes,
};
