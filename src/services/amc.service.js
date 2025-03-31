import httpClient from "../httpClient";
const baseSlug = "/admin/amc";
const baseSlug2 = "/admin/amcs";

class httpService {
  getAmcs(societyId) {
    return httpClient.get(`${baseSlug2}/${societyId}`);
  }

  getAmcDetails(amcId) {
    return httpClient.get(`${baseSlug}/${amcId}`);
  }

  createAmc(Data) {
    return httpClient.post(`${baseSlug}`, Data);
  }

  updateAmc(amcId, amc) {
    return httpClient.put(`${baseSlug}/${amcId}`, amc);
  }
  deleteAmc(amcId) {
    return httpClient.delete(`${baseSlug}/${amcId}`);
  }
}

export default new httpService();
