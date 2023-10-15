const { database } = require("./dataSource");

const getNearbyAddress = async (latitude, longitude) => {
  const conn = await database.getConnection();
  const queryResult = 0;
  try {
    const result = await conn.query(
      `
      SELECT 
       cafes.id               AS cafe_id,
       cafes.name             AS cafe_name,
       cafes.thumbnail        AS cafe_thumbnail,
       cafe_address.address   AS cafe_address,
       cafe_address.latitude  AS cafe_latitude,
       cafe_address.longitude AS cafe_longitude,
       photos.url             AS cafe_photos,
       CONCAT(ROUND(St_distance_sphere(Point(cafe_address.longitude, cafe_address.latitude), Point(?, ?)) / 1000,1), 
       'km') AS distance
      FROM   cafe_address
             LEFT JOIN cafes
                    ON cafes.cafe_address_id = cafe_address.id
             LEFT JOIN photos
                    ON cafes.id = photos.cafe_id
      HAVING distance <= 1
       `,
      [longitude, latitude]
    );
    return result[queryResult];
  } catch (err) {
    throw new Error(`GET_NEARBY_ADDRESS_ERROR`);
  } finally {
    conn.release();
  }
};

const searchCafes = async (address) => {
  const conn = await database.getConnection();
  const queryResult = 0;
  try {
    const result = await conn.query(
      `
      SELECT 
       cafes.id               AS cafe_id,
       cafes.name             AS cafe_name,
       cafes.thumbnail        AS cafe_thumbnail,
       cafe_address.address   AS cafe_address,
       cafe_address.latitude  AS cafe_latitude,
       cafe_address.longitude AS cafe_longitude
      FROM   cafe_address
             LEFT JOIN cafes
                    ON cafe_address.id = cafes.cafe_address_id
             LEFT JOIN photos
                    ON photos.cafe_id = cafes.id
      WHERE cafe_address.address LIKE CONCAT('%', ?, '%')              
       `,
      [address]
    );
    return result[queryResult];
  } catch (err) {
    throw new Error(`SEARCH_CAFES_ERROR`);
  } finally {
    conn.release();
  }
};

const getAllCafeData = async () => {
  const conn = await database.getConnection();
  const queryResult = 0;
  try {
    const result = await conn.query(
      `
      SELECT 
       cafes.id,
       cafes.name,             
       photos.url,
       cafe_address.latitude, 
       cafe_address.longitude 
      FROM   cafe_address
             LEFT JOIN cafes
                    ON cafe_address.id = cafes.cafe_address_id
             LEFT JOIN photos
                    ON photos.cafe_id = cafes.id
       `
    );
    return result[queryResult];
  } catch (err) {
    throw new Error(`SEARCH_CAFES_ERROR`);
  } finally {
    conn.release();
  }
};

const updateRate = async (ratesToUpdate) => {
  if (ratesToUpdate.length === 0) {
    return true;
  }

  /* 지울코드(예상)
  const placeholders = ratesToUpdate.map(() => "(?, ?)").join(", ");
  const values = ratesToUpdate.flatMap((rate) => [rate.cafe_id, rate.score]);*/

  const conn = await database.getConnection();
  try {
    for (const rate of ratesToUpdate) {
      const [rows] = await conn.query(
        "SELECT 1 FROM reviews WHERE cafe_id = ?",
        [rate.cafe_id]
      );
      if (rows.length === 0) {
        await conn.query("INSERT INTO reviews (cafe_id, score) VALUES (?, ?)", [
          rate.cafe_id,
          rate.score,
        ]);
      } else {
        await conn.query("UPDATE reviews SET score = ? WHERE cafe_id = ?", [
          rate.score,
          rate.cafe_id,
        ]);
      }
    }
    return true;
  } catch (err) {
    throw new Error(`UPDATE_RATE_ERROR`);
  } finally {
    conn.release();
  }
};

const updateImgHtml = async (htmlAttributions, cafeId) => {
  const conn = await database.getConnection();
  try {
    let query = `
    UPDATE photos
    SET html_attributions = ?
    WHERE cafe_id = ?
    `;

    const queryParams = [htmlAttributions, cafeId];

    await conn.query(query, queryParams);
    return true;
  } catch (err) {
    throw new Error(`UPDATE_RATE_ERROR`);
  } finally {
    conn.release();
  }
};

module.exports = {
  getNearbyAddress,
  searchCafes,
  getAllCafeData,
  updateRate,
  updateImgHtml,
};
