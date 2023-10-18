const { database } = require("./dataSource");

const getNearbyAddress = async (latitude, longitude) => {
  const conn = await database.getConnection();
  const queryResult = 0;
  try {
    const result = await conn.query(
      `
      SELECT 
       cafes.id                AS cafe_id,
       cafes.name              AS cafe_name,
       cafes.thumbnail         AS cafe_thumbnail,
       cafe_address.address    AS cafe_address,
       reviews.score           AS score,
       cafe_address.latitude   AS cafe_latitude,
       cafe_address.longitude  AS cafe_longitude,
       (CASE 
            WHEN COUNT(photos.url) = 0 THEN JSON_ARRAY(NULL) 
            ELSE JSON_ARRAYAGG(photos.url) 
        END) AS cafe_photos,
       CONCAT(ROUND(St_distance_sphere(Point(cafe_address.longitude, cafe_address.latitude), Point(?, ?)) / 1000,1), 
       'km') AS distance
      FROM   cafe_address
             LEFT JOIN cafes
                    ON cafes.cafe_address_id = cafe_address.id
             LEFT JOIN photos
                    ON cafes.id = photos.cafe_id
             LEFT JOIN reviews
                    ON cafes.id = reviews.cafe_id
      GROUP BY 
            cafes.id,
            cafes.name, 
            cafes.thumbnail, 
            cafe_address.address, 
            cafe_address.latitude, 
            cafe_address.longitude,
            reviews.score
      HAVING distance <= 1
       `,
      [longitude, latitude]
    );
    return result[queryResult];
  } catch (err) {
    console.log(err);
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
       cafes.id                AS cafe_id,
       cafes.name              AS cafe_name,
       cafes.thumbnail         AS cafe_thumbnail,
       cafe_address.address    AS cafe_address,
       reviews.score           AS score, 
       cafe_address.latitude   AS cafe_latitude,
       cafe_address.longitude  AS cafe_longitude,
       (CASE 
            WHEN COUNT(photos.url) = 0 THEN JSON_ARRAY(NULL) 
            ELSE JSON_ARRAYAGG(photos.url) 
        END) AS cafe_photos
      FROM   cafe_address
       LEFT JOIN cafes
              ON cafes.cafe_address_id = cafe_address.id
       LEFT JOIN photos
              ON cafes.id = photos.cafe_id
       LEFT JOIN reviews
              ON cafes.id = reviews.cafe_id
      WHERE  cafe_address.address LIKE CONCAT('%', ?, '%') 
      GROUP BY 
            cafes.id,
            cafes.name, 
            cafes.thumbnail, 
            cafe_address.address, 
            cafe_address.latitude, 
            cafe_address.longitude             
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

  const conn = await database.getConnection();

  try {
    for (const rate of ratesToUpdate) {
      await conn.query(
        `INSERT INTO reviews (cafe_id, score) 
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE score = VALUES(score)`,
        [rate.cafe_id, rate.score]
      );
    }
    return true;
  } catch (err) {
    console.log(err);
    throw new Error(`UPDATE_RATE_ERROR`);
  } finally {
    conn.release();
  }
};

const savePhotoInfo = async (cafeId, htmlAttribution, imageName) => {
  const conn = await database.getConnection();
  try {
    let query = `
    INSERT INTO photos (cafe_id, html_attributions, photo_name) 
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE 
    html_attributions = VALUES(html_attributions),
    photo_name = VALUES(photo_name);
    `;

    const queryParams = [cafeId, htmlAttribution, imageName];

    await conn.query(query, queryParams);
    return true;
  } catch (err) {
    throw new Error(`SAVE_PHOTO_INFO_ERROR`);
  } finally {
    conn.release();
  }
};

module.exports = {
  getNearbyAddress,
  searchCafes,
  getAllCafeData,
  updateRate,
  savePhotoInfo,
};
