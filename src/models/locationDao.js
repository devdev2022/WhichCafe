const { database } = require("./dataSource");

const getNearbyAddress = async (latitude, longitude) => {
  const conn = await database.getConnection();
  const queryResult = 0;
  try {
    const result = await conn.query(
      `
      SELECT 
       cafes.id               AS cafe_id,
       cafes.NAME             AS cafe_name,
       photos.url             AS cafe_photo,
       cafe_address.address   AS cafe_address,
       cafe_address.latitude  AS cafe_latitude,
       cafe_address.longitude AS cafe_longitude,
       CONCAT(ROUND(St_distance_sphere(Point(cafe_address.longitude, cafe_address.latitude), Point(?, ?)) / 1000,1), 
       'km') AS distance
      FROM   cafe_address
             LEFT JOIN cafes
                    ON cafe_address.id = cafes.cafe_address_id
             LEFT JOIN photos
                    ON cafes.photo_id = photos.id
      HAVING distance <= 2
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
       cafes.id               AS cafe_id,
       cafes.name             AS cafe_name,
       photos.url             AS cafe_photo,
       cafe_address.address   AS cafe_address,
       cafe_address.latitude  AS cafe_latitude,
       cafe_address.longitude AS cafe_longitude
      FROM   cafe_address
             LEFT JOIN cafes
                    ON cafe_address.id = cafes.cafe_address_id
             LEFT JOIN photos
                    ON cafes.photo_id = photos.id
      WHERE cafe_address.address LIKE CONCAT('%', ?, '%')              
       `,
      [address]
    );
    return result[queryResult];
  } catch (err) {
    console.log(err);
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
       cafes.id
       cafes.name             
       photos.url             
       cafe_address.latitude  
       cafe_address.longitude 
      FROM   cafe_address
             LEFT JOIN cafes
                    ON cafe_address.id = cafes.cafe_address_id
             LEFT JOIN photos
                    ON cafes.photo_id = photos.id
       `
    );
    return result[queryResult];
  } catch (err) {
    console.log(err);
    throw new Error(`SEARCH_CAFES_ERROR`);
  } finally {
    conn.release();
  }
};

const updateRate = async (ratesToUpdate) => {
  const conn = await database.getConnection();
  try {
    for (let rate of ratesToUpdate) {
      await conn.query(
        `
        UPDATE reviews
        SET 
           score = ?
        WHERE 
           cafes_id = ?
        `,
        [rate.score, rate.cafes_id]
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

const updateImgHtml = async (htmlAttributions, cafeId) => {
  const conn = await database.getConnection();
  try {
    for (let rate of ratesToUpdate) {
      await conn.query(
        `
        UPDATE photos
        SET 
           html_attributions = ?
        WHERE 
           cafes_id = ?
        `,
        [htmlAttributions, cafeId]
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

module.exports = {
  getNearbyAddress,
  searchCafes,
  getAllCafeData,
  updateRate,
  updateImgHtml,
};
