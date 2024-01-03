import locationDao from "../models/locationDao";
import {
  getNearbyAddressSchema,
  searchCafesSchema,
  validateResponse,
} from "../utils/ajvValidation/locationValidation";

class InternalError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "InternalError";
    this.statusCode = statusCode;
  }
}

const getNearbyAddress = async (latitude: string, longitude: string) => {
  const getNearbyAddress: any = await locationDao.getNearbyAddress(
    latitude,
    longitude
  );
  const validationResult = validateResponse(
    getNearbyAddressSchema,
    getNearbyAddress
  );
  if (validationResult) {
    const error = new InternalError(
      "Validation Error: " + JSON.stringify(validationResult),
      500
    );
    throw error;
  }
  return getNearbyAddress;
};

const searchCafes = async (address: string) => {
  const searchCafes: any = await locationDao.searchCafes(address);
  const validationResult = validateResponse(searchCafesSchema, searchCafes);
  if (validationResult) {
    const error = new InternalError(
      "Validation Error: " + JSON.stringify(validationResult),
      500
    );
    throw error;
  }
  return searchCafes;
};

export default { getNearbyAddress, searchCafes };
