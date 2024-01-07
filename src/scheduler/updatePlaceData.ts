import schedule from "node-schedule";
import locationDao from "../models/locationDao";
import { GoogleMapsClient, GeoCalculator, S3ClientModule } from "./helpers";

const googleMapsClient = new GoogleMapsClient();
const geoCalculator = new GeoCalculator();
const s3ClientModule = new S3ClientModule();

interface RateUpdate {
  cafe_id: number;
  score: number;
}

interface Cafe {
  id: number;
  name: string;
  url?: string;
  latitude: string;
  longitude: string;
}

async function main(): Promise<void> {
  try {
    const allCafes = (await locationDao.getAllCafeData()) as Array<Cafe>;
    console.log(allCafes);
    let ratesToUpdate: RateUpdate[] = [];

    const allTasks = allCafes.slice(0, 10).map(async (cafe) => {
      const cafeId: number = cafe.id;
      const cafeName: string = cafe.name;

      let placeId: any;

      try {
        placeId = await googleMapsClient.getPlaceId(cafeName);
        console.log(placeId);

        if (!placeId) {
          console.error(`No location data found for cafe ${cafeName}`);
          return null;
        }
      } catch (err: any) {
        console.error(`getPlaceId Error : ${cafeName}, ${err.message}`);
        return null;
      }

      let placeData: any;

      try {
        placeData = await googleMapsClient.getPlaceDetails(placeId);
        if (!placeData || !placeData.geometry.location) {
          console.error(`getPlaceDetails Error : ${cafeName} is not available`);
          return null;
        }
      } catch (err: any) {
        console.error(err.message);
        return null;
      }

      const googleLocation: { lat: number; lng: number } = {
        lat: placeData.geometry.location.lat,
        lng: placeData.geometry.location.lng,
      };

      const dbLocation: { lat: string; lng: string } = {
        lat: cafe.latitude,
        lng: cafe.longitude,
      };

      const distanceCheckResult: boolean =
        await geoCalculator.checkDataByDistance(
          googleLocation.lat,
          googleLocation.lng,
          parseFloat(dbLocation.lat),
          parseFloat(dbLocation.lng)
        );

      if (!distanceCheckResult) {
        return null;
      }

      if (placeData.rating !== undefined && placeData.rating !== null) {
        ratesToUpdate.push({
          cafe_id: cafeId,
          score: placeData.rating,
        });
      }

      await locationDao.updateRate(ratesToUpdate);

      if (placeData.photos && placeData.photos.length > 0) {
        const maxPhotos: number = Math.min(placeData.photos.length, 3);

        for (let i = 0; i < maxPhotos; i++) {
          const imageName = `${cafeName.replace(/ /g, "_")}${i + 1}.jpg`;

          const excludedCafes: string[] = [
            "만월경",
            "에그카페24",
            "카페일분",
            "데이롱",
            "커피에반하다",
            "카페인24",
          ];

          if (excludedCafes.includes(cafeName)) {
            continue;
          }

          const fileExistsInS3 = await s3ClientModule.checkFileExistenceInS3(
            "s3-hosting-whichcafe",
            imageName
          );

          if (fileExistsInS3) {
            console.log(`File already exists in S3: ${imageName}`);
            continue;
          }

          let imageUrl: any;

          try {
            const imageData: Buffer | null =
              await googleMapsClient.getPlacePhoto(
                placeData.photos[i].photo_reference
              );

            if (imageData) {
              const imageDataString = imageData.toString("base64");
              imageUrl = await s3ClientModule.uploadImageToS3(
                "s3-hosting-whichcafe",
                `EC2 test/${imageName}`,
                imageDataString
              );
            }
          } catch (err: any) {
            console.error(`getPlacePhoto Error : ${cafeName}, ${err.message}`);
            continue;
          }

          try {
            const htmlAttribution: string =
              placeData.photos[i].html_attributions &&
              placeData.photos[i].html_attributions.length > 0
                ? placeData.photos[i].html_attributions[0]
                : null;
            await locationDao.savePhotoInfo(
              cafeId,
              htmlAttribution,
              imageName,
              imageUrl
            );
          } catch (err: any) {
            console.error(`savePhotoInfo Error : ${cafeName}, ${err.message}`);
            return null;
          }
        }
      }
    });

    const results = await Promise.allSettled(allTasks);

    const errors = results.filter(
      (result): result is PromiseRejectedResult => result.status === "rejected"
    );
    for (const error of errors) {
      console.error(error.reason);
    }

    console.log("DB UPDATE COMPLETE");
  } catch (error: any) {
    console.log(
      error.response ? error.response.data.error_message : error.message
    );
  }
}

const scheduledTask = schedule.scheduleJob("00 46 11 7 * *", async function () {
  await main();
});

export default { main, scheduledTask };
