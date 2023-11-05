const { signUp } = require("../../../src/controllers/userController");
const userService = require("../../../src/services/userService");
const httpMocks = require("node-mocks-http");

jest.mock("../../../src/services/userService");
jest.mock("bcrypt");

/*
//duplicationCheck
describe("User Controller - duplicationCheck", () => {
  it("should return 200 and DUPLICATION_CHECK_PASS when duplicationCheck is successful", async () => {
    const mockAccount = "testuser";

    const req = httpMocks.createRequest({
      method: "GET",
      params: {
        account: mockAccount,
      },
    });

    const res = httpMocks.createResponse();
    const next = jest.fn();

    userService.duplicationCheck.mockResolvedValueOnce();

    await duplicationCheck(req, res, next);

    expect(res.statusCode).toBe(201);
    expect(res._getJSONData()).toEqual({ message: "DUPLICATION_CHECK_PASS" });
  });
});*/

//signUp
describe("User Controller - signUp", () => {
  it("should return 201 and SIGNUP_SUCCESS when signup is successful", async () => {
    const mockUser = {
      account: "testuser",
      password: "Test123!",
      nickname: "nickname",
      question_answer: "answer",
    };

    const req = httpMocks.createRequest({
      method: "POST",
      body: mockUser,
    });

    const res = httpMocks.createResponse();
    const next = jest.fn();

    userService.signUp.mockResolvedValueOnce();

    await signUp(req, res, next);

    expect(res.statusCode).toBe(201);
    expect(res._getJSONData()).toEqual({ message: "SIGNUP_SUCCESS" });
  });
});

//signIn

//logOut

//reissueAccessToken

//getFavorites

//addFavorites

//deleteFavorites

//getUserInfo

//updateUserInfo

//searchPassword

//deleteAccount
