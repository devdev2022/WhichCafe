const { database } = require("./dataSource");

const signUp = async (account, hashedPassword, nickname, question_answer) => {
  const conn = await database.getConnection();

  try {
    const result = await conn.query(
      `INSERT INTO users(account, password, nickname, question_answer) 
       VALUES (?, ?, ?, ?);
       `,
      [account, hashedPassword, nickname, question_answer]
    );
    if (result.affectedRows === 0) {
      return null;
    }
    return result;
  } catch (err) {
    throw new Error(`SIGN_UP_ERROR`);
  } finally {
    conn.release();
  }
};

const signIn = async (account) => {
  const conn = await database.getConnection();

  try {
    const [result] = await conn.query(
      `SELECT 
        account,
        password
      FROM
        users
      WHERE
        account = ?`,
      [account]
    );
    const queryResult = 0;
    return result[queryResult];
  } catch (err) {
    throw new Error(`SIGN_IN_ERROR`);
  } finally {
    conn.release();
  }
};

const getUserByNickname = async (nickname) => {
  const conn = await database.getConnection();

  try {
    const [result] = await conn.query(
      `
      SELECT *
      FROM 
        users AS U
      WHERE
        U.nickname = ?`,
      [nickname]
    );
    return result.length > 0 ? result[0] : null;
  } catch (err) {
    throw new Error(`GET_USER_BY_NICKNAME_ERROR`);
  } finally {
    conn.release();
  }
};

const getUserByAccount = async (account) => {
  const conn = await database.getConnection();

  try {
    const [result] = await conn.query(
      `
      SELECT *
      FROM 
        users AS U
      WHERE
        U.account = ?`,
      [account]
    );
    return result.length > 0 ? result[0] : null;
  } catch (err) {
    throw new Error(`GET_USER_BY_ACCOUNT_ERROR`);
  } finally {
    conn.release();
  }
};

const getFavorites = async (account) => {
  const conn = await database.getConnection();

  try {
    const [result] = await conn.query(
      `
      SELECT 
        C.name,
        CA.address,
        R.score,
        C.thumbnail
      FROM 
        users AS U
      JOIN
        favorites AS F ON U.id = F.user_id
      JOIN
        cafes AS C ON F.cafe_id = C.id
      LEFT JOIN
        cafe_address AS CA ON C.cafe_address_id = CA.id
      LEFT JOIN
        reviews AS R ON C.id = R.cafe_id
      WHERE
        U.account = ?`,
      [account]
    );
    return result.length > 0 ? result : null;
  } catch (err) {
    throw new Error(`GET_FAVORITES_ERROR`);
  } finally {
    conn.release();
  }
};

const getIdByAccount = async (account) => {
  const conn = await database.getConnection();

  try {
    const [result] = await conn.query(
      `
      SELECT
        id
      FROM 
        users
      WHERE 
        account = ?`,
      [account]
    );
    const queryResult = 0;
    return result[queryResult].id;
  } catch (err) {
    throw new Error(`GET_ID_ERROR`);
  } finally {
    conn.release();
  }
};

const findFavData = async (userAccount, cafe_id) => {
  const conn = await database.getConnection();
  try {
    const [result] = await conn.query(
      `
      SELECT
        user_id, cafe_id
      FROM 
        favorites
      WHERE 
        user_id = ? AND cafe_id = ?`,
      [userAccount, cafe_id]
    );
    const queryResult = 0;
    return result.length > 0 ? result[queryResult] : null;
  } catch (err) {
    throw new Error(`FIND_FAVORITES_ERROR`);
  } finally {
    conn.release();
  }
};

const addFavorites = async (userAccount, cafe_id) => {
  const conn = await database.getConnection();
  try {
    const result = await conn.query(
      `
      INSERT INTO favorites(user_id, cafe_id) 
      VALUES (?, ?);`,
      [userAccount, cafe_id]
    );
    return result;
  } catch (err) {
    throw new Error(`ADD_FAVORITES_ERROR`);
  } finally {
    conn.release();
  }
};

const deleteFavorites = async (userAccount, cafeId) => {
  const conn = await database.getConnection();
  try {
    const result = await conn.query(
      `
      DELETE FROM favorites
      WHERE 
        user_id=?
      AND
        cafe_id=?
      `,
      [userAccount, cafeId]
    );
    return result;
  } catch (err) {
    throw new Error(`DELETE_FAVORITES_ERROR`);
  } finally {
    conn.release();
  }
};

const updateUserInfo = async (updateFields, values, account) => {
  const conn = await database.getConnection();

  try {
    const result = await conn.query(
      `
      UPDATE users
      SET
        ${updateFields.join(", ")}
      WHERE account = ?
      `,
      [...values, account]
    );
    return result;
  } catch (err) {
    throw new Error(`UPDATE_USERINFO_ERROR`);
  } finally {
    conn.release();
  }
};

const searchPassword = async (updateFields, values, account) => {
  const conn = await database.getConnection();

  try {
    const result = await conn.query(
      `
      UPDATE users
      SET
        ${updateFields.join(", ")}
      WHERE account = ?
      `,
      [...values, account]
    );
    return result;
  } catch (err) {
    throw new Error(`UPDATE_USERINFO_ERROR`);
  } finally {
    conn.release();
  }
};

const deleteAccount = async (account) => {
  const conn = await database.getConnection();
  try {
    const result = await conn.query(
      `
      DELETE FROM users
      WHERE 
        account=?
      `,
      [account]
    );
    return result;
  } catch (err) {
    console.log(err);
    throw new Error(`DELETE_ACCOUNT_ERROR`);
  } finally {
    conn.release();
  }
};

module.exports = {
  signUp,
  signIn,
  getUserByNickname,
  getUserByAccount,
  getFavorites,
  getIdByAccount,
  findFavData,
  addFavorites,
  deleteFavorites,
  updateUserInfo,
  searchPassword,
  deleteAccount,
};
