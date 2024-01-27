import dotenv from "dotenv";
dotenv.config({ path: "./tests/.env.test" });

import updatePlaceData from "../../src/scheduler/updatePlaceData";
import { database } from "../../src/models/dataSource";
import { createApp } from "../../app";

describe("Total Execution Time of main Function", () => {
  let app: any;
  beforeAll(async () => {
    app = createApp();
    database;
  }, 80000);

  afterAll(async () => {
    await database.end();
  });

  it("should measure the time taken to complete all tasks in main", async () => {
    const startTime = Date.now();

    await updatePlaceData.main();

    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    console.log(`Total Execution Time: ${totalDuration}ms`);

    expect(totalDuration).toBeLessThan(30000); 
  }, 30000);
});

