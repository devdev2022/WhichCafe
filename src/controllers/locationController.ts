import { Request, Response } from "express";
import locationService from "../services/locationService";
import { catchAsync } from "../utils/error";

const getNearbyAddress = catchAsync(async (req: Request, res: Response) => {
  const { latitude, longitude } = req.query as {
    latitude: string;
    longitude: string;
  };

  if (!latitude || !longitude) {
    return res.status(400).json({
      message: "KEY_ERROR",
    });
  }

  const nearbyAddress = await locationService.getNearbyAddress(
    latitude,
    longitude
  );
  return res.status(200).json(nearbyAddress);
});

const searchCafes = catchAsync(async (req: Request, res: Response) => {
  const { address } = req.query as { address: string };

  if (!address) {
    return res.status(400).json({
      message: "KEY_ERROR",
    });
  }

  const cafeList = await locationService.searchCafes(address);
  return res.status(200).json(cafeList);
});

export { getNearbyAddress, searchCafes };
