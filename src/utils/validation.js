const validateAccount = (account) => {
  const accountValidation = new RegExp(
    /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{3,30}$/
  );

  if (!accountValidation.test(account)) {
    const err = new Error("INVALID ACCOUNT");
    err.statuseCode = 400;
    throw err;
  }
};

const validatePw = (password) => {
  const pwValidation = new RegExp(
    "^(?=.*[A-Za-z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,64})"
  );

  if (!pwValidation.test(password)) {
    const err = new Error("INVALID PASSWORD");
    err.statuseCode = 400;
    throw err;
  }
};

module.exports = { validateAccount, validatePw };
