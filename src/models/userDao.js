const { database } = require("./dataSource");

const createUser = async (account, hashedPassword, nickname) => {
  const pool = database;
  const conn = await pool.getConnection();

  try {
    const result = await conn.query(
      `INSERT INTO users(account, password, nickname) 
       VALUES (?, ?, ?);
       `,
      [account, hashedPassword, nickname]
    );
    return result;
  } catch (err) {
    throw new Error(`CREATE_USER_ERROR: ${err.message}`);
  } finally {
    conn.release();
  }
};

const getUserById = async (id) => {
  const pool = database;
  const conn = await pool.getConnection();

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
    const FIRST_ELEMENT = 0;
    return result[FIRST_ELEMENT];
  } catch (err) {
    throw new Error(`GET_USER_BY_ID_ERROR: ${err.message}`);
  } finally {
    conn.release();
  }
};

const signIn = async (account) => {
  const pool = database;
  const conn = await pool.getConnection();

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
    const FIRST_ELEMENT = 0;
    return result[FIRST_ELEMENT];
  } catch (err) {
    throw new Error(`SIGN_IN_ERROR: ${err.message}`);
  } finally {
    conn.release();
  }
};

const getUserByAccount = async (account) => {
  const pool = database;
  const conn = await pool.getConnection();

  try {
    const [user] = await conn.query(
      `
      SELECT *
      FROM 
        users AS U
      WHERE
        U.account = ?`,
      [account]
    );
    const FIRST_ELEMENT = 0;
    if (user.length > FIRST_ELEMENT) {
      return user[FIRST_ELEMENT];
    } else {
      return null;
    }
  } catch (err) {
    throw new Error(`GET_USER_BY_ACCOUNT_ERROR: ${err.message}`);
  } finally {
    conn.release();
  }
};

const getFavorites = async (account) => {
  const pool = database;
  const conn = await pool.getConnection();

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
      LEFT JOIN
        reviews AS R ON C.id = R.cafe_id
      WHERE
        U.account = ?`,
      [account]
    );
    return result;
  } catch (err) {
    throw new Error(`GET_FAVORITES_ERROR: ${err.message}`);
  } finally {
    conn.release();
  }
};

const getIdByAccount = async (account) => {
  const pool = database;
  const conn = await pool.getConnection();
  try {
    const result = await conn.query(
      `
      SELECT
        id
      FROM 
        users
      WHERE 
        account = ?`,
      [account]
    );

    const column_schema = 0;
    return result[column_schema][0].id;
  } catch (err) {
    throw new Error(`ADD_FAVORITES_ERROR: ${err.message}`);
  } finally {
    conn.release();
  }
};

const findUserId = async (userId) => {
  const pool = database;
  const conn = await pool.getConnection();
  try {
    const result = await conn.query(
      `
      SELECT
        user_id
      FROM 
        favorites
      WHERE 
        user_id = ?`,
      [userId]
    );
    const column_schema = 0;

    if (!result?.[column_schema]?.[0]?.user_id) {
      return null;
    }

    return result[column_schema][0].user_id;
  } catch (err) {
    throw new Error(`ADD_FAVORITES_ERROR: ${err.message}`);
  } finally {
    conn.release();
  }
};

const addFavorites = async (userId, cafe_id) => {
  const pool = database;
  const conn = await pool.getConnection();
  try {
    const result = await conn.query(
      `
      INSERT INTO favorites(user_id, cafe_id) 
      VALUES (?, ?);`,
      [userId, cafe_id]
    );
    return result;
  } catch (err) {
    throw new Error(`ADD_FAVORITES_ERROR: ${err.message}`);
  } finally {
    conn.release();
  }
};

const deleteFavorites = async (userId, cafeId) => {
  const pool = database;
  const conn = await pool.getConnection();
  try {
    const result = await conn.query(
      `
      DELETE FROM favorites
      WHERE 
        user_id=?
      AND
        cafe_id=?
      `,
      [userId, cafeId]
    );
    return result;
  } catch (err) {
    throw new Error(`DELETE_FAVORITES_ERROR: ${err.message}`);
  } finally {
    conn.release();
  }
};

module.exports = {
  createUser,
  getUserById,
  signIn,
  getUserByAccount,
  getFavorites,
  getIdByAccount,
  findUserId,
  addFavorites,
  deleteFavorites,
};
