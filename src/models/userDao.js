const { database } = require("./dataSource");

const createUser = async (account, hashedPassword, nickname) => {
  try {
    return await database.query(
      `INSERT INTO users(
                account, 
                password, 
                name
                ) 
            VALUES (?, ?, ?);
            `,
      [account, hashedPassword, nickname]
    );
  } catch (err) {
    const error = new Error("INVALID_DATA_INPUT");
    error.statusCode = 500;
    throw error;
  }
};

const getUserById = async (id) => {
  const result = await database.query(
    `
		SELECT 
			id,
			name,
			email,
			password
		FROM users
		WHERE id=?`,
    [id]
  );
  return result[0];
};

const signIn = async (account) => {
  try {
    return await database.query(
      `SELECT
        id, 
        account,
        password
      FROM
        users
      WHERE
        account = ?`,
      [account]
    );
  } catch (err) {
    const error = new Error("INVALID_DATA_INPUT");
    error.statusCode = 500;
    throw error;
  }
};

const getUserByAccount = async (account) => {
  const [user] = await database.query(
    `
      SELECT *
      FROM 
        users AS U
      WHERE
        U.account = ?`,
    [account]
  );
  return user;
};

const getFavorites = async (account, cafeId) => {
  const [user] = await database.query(
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
        U.account = ?`
  );
};

const addFavorites = async (account, cafeId) => {
  const [user] = await database.query(
    `
      INSERT INTO favorites(
                  user_id, 
                  cafe_id
                  )
      SELECT 
        U.id, C.id
      FROM 
        users AS U, cafes AS C
      WHERE 
        U.account = ? AND C.name = ?;
            `
  );
};

const deleteFavorites = async (account, cafeId) => {
  const [user] = await database.query(
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
            WHERE name = ?
        );
          `
  );
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
