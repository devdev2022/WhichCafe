class GeoCalculator {
  constructor() {
    this.R = 6371;
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius, km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance, km
    return distance * 1000; // Convert to meter
  }

  async checkDataByDistance(lat1, lon1, lat2, lon2, limit = 20) {
    return new Promise((resolve) => {
      const distance = this.getDistance(lat1, lon1, lat2, lon2);
      resolve(distance <= limit);
    });
  }
}

module.exports = { GeoCalculator };
