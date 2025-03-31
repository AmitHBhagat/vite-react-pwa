import httpClient from "../httpClient";
const baseSlug = "/admin/amenity";

class httpService {
  getAmenityList() {
    return httpClient.get(`${baseSlug}`);
  }

  getAmenityById(id) {
    return httpClient.get(`${baseSlug}/${id}`);
  }
  createAmenity(data) {
    return httpClient.post(`${baseSlug}`, data);
  }

  updateAmenity(id, data) {
    return httpClient.put(`${baseSlug}/${id}`, data);
  }
  deleteAmenity(id) {
    return httpClient.delete(`${baseSlug}/${id}`);
  }
}

export default new httpService();
