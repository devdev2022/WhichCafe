const validateAccount = (account: string) => {
  const accountValidation = new RegExp(
    /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{3,30}$/
  );

  if (!accountValidation.test(account)) {
    const err: Error & { statusCode?: number } = new Error("INVALID ACCOUNT");
    err.statusCode = 400;
    throw err;
  }
};

const validatePw = (password: string) => {
  const pwValidation = new RegExp(
    "^(?=.*[A-Za-z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,64})"
  );

  if (!pwValidation.test(password)) {
    const err: Error & { statusCode?: number } = new Error("INVALID PASSWORD");
    err.statusCode = 400;
    throw err;
  }
};

export { validateAccount, validatePw };
