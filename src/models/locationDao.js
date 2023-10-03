const { database } = require("./dataSource");

const getNearbyAddress = async (latitude, longitude) => {
  const conn = await database.getConnection();
  const queryResult = 0;
  try {
    const result = await conn.query(
      `
      SELECT cafes.NAME
       AS
       cafe_name,
       photos.url
       AS cafe_photo,
       cafe_address.address
       AS cafe_address,
       CONCAT(ROUND(St_distance_sphere(Point(longitude, latitude), Point(?, ?)) / 1000,
       1), 'km') AS distance
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
    throw new Error(`GET_NEARBY_ADDRESS_ERROR`);
  } finally {
    conn.release();
  }
};

module.exports = {
  getNearbyAddress,
};
