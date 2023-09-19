const { database } = require("./dataSource");

const createUser = async (account, hashedPassword, nickname) => {
  const conn = await database();
  try {
    const result = await conn.query(
      `INSERT INTO users(account, password, nickname) VALUES (?, ?, ?);`,
      [account, hashedPassword, nickname]
    );
    return result;
  } catch (err) {
    throw new Error(`CREATE_USER_ERROR: ${err.message}`);
  } finally {
    conn.end();
  }
};

const getUserById = async (id) => {
  const conn = await database();
  try {
    const [result] = await conn.query(
      `
      SELECT 
        account,
        password,
        nickname
      FROM users
      WHERE id=?`,
      [id]
    );
    return result[0];
  } catch (err) {
    throw new Error(`GET_USER_BY_ID_ERROR: ${err.message}`);
  } finally {
    conn.end();
  }
};

const signIn = async (account) => {
  const conn = await database();
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
    return result[0];
  } catch (err) {
    throw new Error(`SIGN_IN_ERROR: ${err.message}`);
  } finally {
    conn.end();
  }
};

const getUserByAccount = async (account) => {
  const conn = await database();
  const [user] = await conn.query(
    `
      SELECT *
      FROM 
        users AS U
      WHERE
        U.account = ?`,
    [account]
  );
  conn.end();
  return user;
};

const getFavorites = async (account) => {
  const conn = await database();
  try {
    const [result] = await conn.query(
      `
      SELECT 
        C.name,
        CA.address,
        R.score,
        P.url
      FROM 
        users AS U
      JOIN
        favorites AS F ON U.id = F.user_id
      JOIN
        cafes AS C ON F.cafe_id = C.id
      LEFT JOIN
        cafe_address AS CA ON C.cafe_address_id = CA.id
      LEFT JOIN
        photos AS P ON C.photo_id = P.id
      WHERE
        U.account = ?`,
      [account]
    );
    return result;
  } catch (err) {
    throw new Error(`GET_FAVORITES_ERROR: ${err.message}`);
  } finally {
    conn.end();
  }
};

const addFavorites = async (account, cafeId) => {
  const conn = await database();
  try {
    const result = await conn.query(
      `
      INSERT INTO favorites(user_id, cafe_id)
      SELECT 
        U.id, C.id
      FROM 
        users AS U, cafes AS C
      WHERE 
        U.account = ? AND C.name = ?;`,
      [account, cafeId]
    );
    return result;
  } catch (err) {
    throw new Error(`ADD_FAVORITES_ERROR: ${err.message}`);
  } finally {
    conn.end();
  }
};

const deleteFavorites = async (account, cafeId) => {
  const conn = await database();
  try {
    const result = await conn.query(
      `
      DELETE FROM favorites
      WHERE 
        user_id IN (
            SELECT id 
            FROM users 
            WHERE account = ?
        )
      AND 
        cafe_id IN (
            SELECT id 
            FROM cafes 
            WHERE name = ?);
      `,
      [account, cafeId]
    );
    return result;
  } catch (err) {
    throw new Error(`DELETE_FAVORITES_ERROR: ${err.message}`);
  } finally {
    conn.end();
  }
};

module.exports = {
  createUser,
  getUserById,
  signIn,
  getUserByAccount,
  getFavorites,
  addFavorites,
  deleteFavorites,
};
