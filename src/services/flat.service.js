import httpClient from "../httpClient";
const baseSlug = "/admin/flat";
const baseSlug2 = "/admin/flats";
const baseSlug3 = "/admin";

class httpService {
  getUserFlats(userId) {
    return httpClient.get(`${baseSlug}/${userId}`);
  }

  getFlatsBySocietyId(societyId) {
    return httpClient.get(`${baseSlug2}/${societyId}`);
  }

  uploadFlatExcelFile(flatData, config) {
    return httpClient.post(`${baseSlug}/upload`, flatData);
  }

  createFlat(flatData) {
    return httpClient.post(`${baseSlug}`, flatData);
  }

  updateFlat(id, flatData) {
    return httpClient.put(`${baseSlug}/${id}`, flatData);
  }

  deleteFlat(id) {
    return httpClient.delete(`${baseSlug}/${id}`);
  }

  getFlatById(id) {
    return httpClient.get(`${baseSlug3}/flatById/${id}`);
  }

  updateFlatAssociation(userId, flatId) {
    return httpClient.put(`${baseSlug}/flatassociation/${flatId}`, userId);
  }
  removeFlatAssociation(userId, flatId) {
    return httpClient.put(
      `${baseSlug}/flatassociation/remove/${flatId}`,
      userId
    );
  }
}

export default new httpService();
