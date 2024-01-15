import dotenv from 'dotenv';
dotenv.config();

import request from "supertest";
import { database } from "../../src/models/dataSource";
import { createApp } from "../../app";


describe("Performance Tuning", () => {
  let app: any;
  beforeAll(async () => {
    app = createApp();
    database;

    // 유저 데이터 삽입
    for (let i = 0; i < 2; i++) {
      await request(app)
        .post("/users/signup")
        .send({
          account: `testaccount${i}`,
          password: "testPassword123!",
          nickname: `testNickname${i}`,
          question_answer: "강남 초등학교",
        });
    }
  }, 800000);
  
  afterAll(async () => {
    await database.destroy();
  });

  test("User Data Query Performance", async () => {
    const startTime = performance.now();
    await request(app).get(`/users/duplicationCheck/testaccount0`);
    const endTime = performance.now();

    console.log(`Execution time: ${endTime - startTime} ms`);
  });
});
