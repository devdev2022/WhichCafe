const userService = require("../../../src/services/userService");
const userDao = require("../../../src/models/userDao");
const bcrypt = require("bcrypt");
const {
  validateAccount,
  validatePw,
} = require("../../../src/utils/validation");

jest.mock("../../../src/models/userDao");
jest.mock("bcrypt");

describe("User Service - signUp", () => {
  it("should successfully sign up a user", async () => {
    // Mock implementations
    userDao.getUserByAccount.mockResolvedValueOnce(null);
    userDao.signUp.mockResolvedValueOnce(/* expected result */);
    bcrypt.hash.mockResolvedValueOnce("hashedPassword");

    // Test data
    const account = "testuser";
    const password = "Test123!";
    const nickname = "nickname";
    const question_answer = "강남 초등학교";

    // Call function
    const result = await userService.signUp(
      account,
      password,
      nickname,
      question_answer
    );

    // Assertions
    expect(result).toEqual(/* expected result */);
  });

  it("should throw an error for invalid account", async () => {
    const account = "invalidAccount"; // 무효한 계정명
    const password = "Test123!";
    const nickname = "nickname";
    const question_answer = "answer";

    await expect(
      userService.signUp(account, password, nickname, question_answer)
    ).rejects.toThrow("INVALID ACCOUNT");
  });

  it("should throw an error for invalid password", async () => {
    const account = "testuser12";
    const password = "invalidPw"; // 무효한 비밀번호
    const nickname = "nickname";
    const question_answer = "answer";

    await expect(
      userService.signUp(account, password, nickname, question_answer)
    ).rejects.toThrow("INVALID PASSWORD");
  });

  it("should throw an error for duplicated account", async () => {
    userDao.getUserByAccount.mockResolvedValueOnce({
      account: "testuser1",
      password: "Test123!",
      nickname: "nickname",
      question_answer: "answer",
    });

    const account = "testuser1";
    const password = "Test123!";
    const nickname = "nickname";
    const question_answer = "answer";

    await expect(
      userService.signUp(account, password, nickname, question_answer)
    ).rejects.toThrow("DUPLICATED ACCOUNT");
  });

  it("should handle errors from userDao.signUp", async () => {
    userDao.getUserByAccount.mockResolvedValueOnce(null);
    userDao.signUp.mockRejectedValueOnce(new Error("Database Error"));
    const account = "testuser12";
    const password = "Test123!";
    const nickname = "nickname";
    const question_answer = "answer";

    await expect(
      userService.signUp(account, password, nickname, question_answer)
    ).rejects.toThrow("Database Error");
  });
});
