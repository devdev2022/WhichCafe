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

const item = (itemList: any, limit: any, fnPromise: any) =>
  new Promise(async (resolved, rejected) => {
    if (typeof itemList !== "object" || !("length" in itemList)) {
      return rejected("itemList must be Array");
    }

    limit = parseInt(limit);
    if (limit < 1) {
      return rejected("limit must be greater than zero");
    }

    if (typeof fnPromise !== "function") {
      return rejected("fnPromise must be a function returns Promise");
    }

    const resultList: any = [];

    const itemListLen = itemList.length;
    let taskList = [];
    for (let i = 0; i < limit; i++) {
      if (i >= itemListLen) break;

      taskList.push(
        new Promise(async (resolved, rejected) => {
          while (true) {
            const item = itemList.shift();
            if (!item) {
              return resolved(null);
            }

            try {
              const result = await fnPromise(item);
              resultList.push({ status: "fulfilled", value: result });
            } catch (e) {
              resultList.push({ status: "rejected", reason: e });
            }
          }
        })
      );
    }

    try {
      await Promise.allSettled(taskList);
    } catch (e) {
      return rejected(e);
    }

    return resolved(resultList);
  });

//Google Place API 요청처리
async function processCafe(cafe: any) {
  let ratesToUpdate: RateUpdate[] = [];

  const cafeId: number = cafe.id;
  const cafeName: string = cafe.name;
  const timeMeasurements: { [key: string]: number } = {};

  let placeId: any;

  const startGetPlaceId = process.hrtime.bigint();
  try {
    placeId = await googleMapsClient.getPlaceId(cafeName);

    if (!placeId) {
      console.error(`No location data found for cafe ${cafeName}`);
      return null;
    }
  } catch (err: any) {
    console.error(`getPlaceId Error : ${cafeName}, ${err.message}`);
    return null;
  }

  const endGetPlaceId = process.hrtime.bigint(); // 요청 종료 시간
  timeMeasurements.getPlaceId =
    Number(endGetPlaceId - startGetPlaceId) / 1000000; // 밀리세컨드 단위 변환

  let placeData: any;

  const startGetPlaceDetails = process.hrtime.bigint();
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
  const endGetPlaceDetails = process.hrtime.bigint(); // 요청 종료 시간
  timeMeasurements.getPlaceDetails =
    Number(endGetPlaceDetails - startGetPlaceDetails) / 1000000; // 밀리세컨드 단위 변환

  console.log(`Cafe ${cafe.name}:`);
  console.log(`- getPlaceId took ${timeMeasurements.getPlaceId.toFixed(3)}ms`);
  console.log(
    `- getPlaceDetails took ${timeMeasurements.getPlaceDetails.toFixed(3)}ms`
  );

  const googleLocation: { lat: number; lng: number } = {
    lat: placeData.geometry.location.lat,
    lng: placeData.geometry.location.lng,
  };

  const dbLocation: { lat: string; lng: string } = {
    lat: cafe.latitude,
    lng: cafe.longitude,
  };

  const distanceCheckResult: boolean = await geoCalculator.checkDataByDistance(
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
        const imageData: Buffer | null = await googleMapsClient.getPlacePhoto(
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
}

//시간 측정
/*
(async () => {
  const StopWatch = {
    startTime: null as [number, number] | null,

    start: function () {
      this.startTime = process.hrtime();
    },

    lap: function () {
      if (this.startTime) {
        const diff = process.hrtime(this.startTime);
        return diff[0] * 1000 + diff[1] / 1000000; // Convert to milliseconds
      }
      throw new Error("Stopwatch not started");
    },
  };

  const timeList = [];
  for (let i = 0; i < 10; i++) timeList.push(100);

  StopWatch.start();

  let result = await item(timeList, 3, (time: any) => {
    const started = StopWatch.lap();

    return new Promise((resolved) => {
      setTimeout(() => {
        const ended = StopWatch.lap();
        const took = ended - started;
        return resolved(
          `started: ${started.toFixed(3)}ms, ended: ${ended.toFixed(
            3
          )}ms, took ${took.toFixed(3)}ms`
        );
      }, time);
    });
  });

  console.log("[AsyncLimit.item]");
  (result as any).forEach((r: any) => {
    console.log(r);
  });
})();*/

async function main(): Promise<void> {
  try {
    const allCafes = (await locationDao.getAllCafeData()) as Array<Cafe>;

    const parallelLimit = 100;

    const results: any = await item(allCafes, parallelLimit, processCafe);

    const errors = results.filter(
      (result: any): result is PromiseRejectedResult =>
        result.status === "rejected"
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

let scheduledTask;

if (process.env.NODE_ENV !== "test") {
  scheduledTask = schedule.scheduleJob("15 17 18 21 * *", async function () {
    await main();
  });
}

export default { main, scheduledTask };
