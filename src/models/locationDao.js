const { database } = require("./dataSource");

const getNearbyAddress = async (latitude, longitude) => {
  const conn = await database.getConnection();
  const queryResult = 0;
  try {
    const result = await conn.query(
      `
       SELECT cafes.name AS cafe_name,
        photos.url AS cafe_photo,
        cafe_address.address AS cafe_address,
        CONCAT(ROUND(
          6371 * 2 * ASIN(SQRT(
              POWER(SIN((latitude - ?) * pi()/180 / 2), 2) +
              COS(latitude * pi()/180) * COS(? * pi()/180) *
              POWER(SIN((longitude - ?) * pi()/180 / 2), 2)
          )), 1), 'km') AS distance
        FROM cafe_address
        LEFT JOIN cafes ON cafe_address.id = cafes.cafe_address_id
        LEFT JOIN photos ON cafes.photo_id = photos.id
        HAVING distance <= 2
        ORDER BY distance;
       `,
      [latitude, latitude, longitude]
    );
    return result[queryResult];
  } catch (err) {
    throw new Error(`GET_NEARBY_ADDRESS_ERROR`);
  } finally {
    conn.release();
  }
};

module.exports = {
  getNearbyAddress,
};
