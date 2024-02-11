import { PoolConnection } from "mysql2/promise";
import { RowDataPacket, FieldPacket } from "mysql2";
import { database } from "./dataSource";

class InternalError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "InternalError";
    this.statusCode = statusCode;
  }
}

interface User {
  id: Buffer;
  account: string;
  password: string;
  nickname: string;
  question_answer: string;
  created_at: Date;
}

const signUp = async (
  account: string,
  hashedPassword: string,
  nickname: string,
  question_answer: string
) => {
  const conn: PoolConnection = await database.getConnection();

  try {
    const result = (await conn.query(
      `INSERT INTO users(account, password, nickname, question_answer) 
       VALUES (?, ?, ?, ?);
       `,
      [account, hashedPassword, nickname, question_answer]
    )) as any;

    if (result.affectedRows === 0) {
      return null;
    }
    return result;
  } catch (err) {
    throw new InternalError(`SIGN_UP_ERROR`, 500);
  } finally {
    conn.release();
  }
};

const signIn = async (account: string) => {
  const conn: PoolConnection = await database.getConnection();

  try {
    const [result]: any = await conn.query(
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
    throw new InternalError(`SIGN_IN_ERROR`, 500);
  } finally {
    conn.release();
  }
};

const addRefreshToken = async (
  userId: Buffer,
  account: string,
  refreshToken: string,
  expires_at: string
) => {
  const conn: PoolConnection = await database.getConnection();
  try {
    const result: any = await conn.query(
      `
      INSERT INTO refreshtokens(user_id, account, refresh_token, expires_at) 
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      refresh_token = VALUES(refresh_token), expires_at = VALUES(expires_at);`,
      [userId, account, refreshToken, expires_at]
    );
    return result;
  } catch (err) {
    throw new InternalError(`ADD_REFRESHTOKEN_ERROR`, 500);
  } finally {
    conn.release();
  }
};

const findRefreshToken = async (account: string) => {
  const conn: PoolConnection = await database.getConnection();
  try {
    const [result]: any = await conn.query(
      `SELECT *
      FROM 
        refreshtokens AS R
      WHERE
        R.account = ?`,
      [account]
    );
    const queryResult = 0;
    return result[queryResult];
  } catch (err) {
    throw new InternalError(`FIND_REFRESHTOKEN_ERROR`, 500);
  } finally {
    conn.release();
  }
};

const deleteRefreshToken = async (account: string) => {
  const conn: PoolConnection = await database.getConnection();
  try {
    const result: any = await conn.query(
      `
      DELETE FROM refreshtokens
      WHERE 
        account=?
      `,
      [account]
    );
    return result;
  } catch (err) {
    throw new InternalError(`DELETE_REFRESHTOKEN_ERROR`, 500);
  } finally {
    conn.release();
  }
};

const getUserByAccount = async (account: string): Promise<User | null> => {
  const conn: PoolConnection = await database.getConnection();

  try {
    const [result]: [RowDataPacket[], FieldPacket[]] = await conn.query(
      `
      SELECT *
      FROM 
        users AS U
      WHERE
        U.account = ?`,
      [account]
    );
    const users = result as unknown as User[];
    return users.length > 0 ? users[0] : null;
  } catch (err) {
    throw new InternalError(`GET_USER_BY_ACCOUNT_ERROR`, 500);
  } finally {
    conn.release();
  }
};

const getFavorites = async (account: string) => {
  const conn: PoolConnection = await database.getConnection();

  try {
    const result: any = await conn.query(
      `
      SELECT 
        C.id,
        C.name,
        CA.address,
        C.score,
        C.thumbnail
      FROM 
        users AS U
      JOIN
        favorites AS F ON U.id = F.user_id
      JOIN
        cafes AS C ON F.cafe_id = C.id
      LEFT JOIN
        cafe_address AS CA ON C.cafe_address_id = CA.id
      WHERE
        U.account = ?`,
      [account]
    );
    return result.length > 0 ? [result] : null;
  } catch (err) {
    throw new InternalError(`GET_FAVORITES_ERROR`, 500);
  } finally {
    conn.release();
  }
};

const getIdByAccount = async (account: string) => {
  const conn: PoolConnection = await database.getConnection();

  try {
    const [result]: any = await conn.query(
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
    return result[queryResult];
  } catch (err) {
    throw new InternalError(`GET_ID_ERROR`, 500);
  } finally {
    conn.release();
  }
};

const findFavData = async (userIdBuffer: Buffer, cafe_id: string) => {
  const conn: PoolConnection = await database.getConnection();
  try {
    const result: any = await conn.query(
      `
      SELECT
        user_id, cafe_id
      FROM 
        favorites
      WHERE 
        user_id = ? AND cafe_id = ?`,
      [userIdBuffer, cafe_id]
    );
    const queryResult = 0;
    return result.length > 0 ? result[queryResult] : null;
  } catch (err) {
    throw new InternalError(`FIND_FAVORITES_ERROR`, 500);
  } finally {
    conn.release();
  }
};

const addFavorites = async (userPk: Buffer, cafe_id: string) => {
  const conn: PoolConnection = await database.getConnection();
  try {
    const result: any = await conn.query(
      `
      INSERT INTO favorites(user_id, cafe_id) 
      VALUES (?, ?);`,
      [userPk, cafe_id]
    );
    return result;
  } catch (err) {
    throw new InternalError(`ADD_FAVORITES_ERROR`, 500);
  } finally {
    conn.release();
  }
};

const deleteFavorites = async (userPk: Buffer, cafeId: string) => {
  const conn: PoolConnection = await database.getConnection();
  try {
    const result: any = await conn.query(
      `
      DELETE FROM favorites
      WHERE 
        user_id=?
      AND
        cafe_id=?
      `,
      [userPk, cafeId]
    );
    return result;
  } catch (err) {
    throw new InternalError(`DELETE_FAVORITES_ERROR`, 500);
  } finally {
    conn.release();
  }
};

const updateUserInfo = async (
  updateFields: string[],
  values: string[],
  account: string
) => {
  const conn: PoolConnection = await database.getConnection();

  try {
    const result: any = await conn.query(
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
    throw new InternalError(`UPDATE_USERINFO_ERROR`, 500);
  } finally {
    conn.release();
  }
};

const searchPassword = async (
  updateFields: any,
  values: string[],
  account: string
) => {
  const conn: PoolConnection = await database.getConnection();

  try {
    const result: any = await conn.query(
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
    throw new InternalError(`UPDATE_USERINFO_ERROR`, 500);
  } finally {
    conn.release();
  }
};

const deleteAccount = async (account: string) => {
  const conn: PoolConnection = await database.getConnection();
  try {
    const result: any = await conn.query(
      `
      DELETE FROM users
      WHERE 
        account=?
      `,
      [account]
    );
    return result;
  } catch (err) {
    throw new InternalError(`DELETE_ACCOUNT_ERROR`, 500);
  } finally {
    conn.release();
  }
};

export default {
  signUp,
  signIn,
  addRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
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
