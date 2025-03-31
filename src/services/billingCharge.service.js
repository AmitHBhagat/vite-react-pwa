import httpClient from "../httpClient";
const baseSlug = "/admin/billingCharge";

class httpService {
  getCharges() {
    return httpClient.get(`${baseSlug}`);
  }

  deleteCharge(id) {
    return httpClient.delete(`${baseSlug}/${id}`);
  }

  getBillById(id) {
    return httpClient.get(`${baseSlug}/${id}`);
  }

  updateCharge(id, data) {
    return httpClient.put(`${baseSlug}/${id}`, data);
  }

  createCharge(id, data) {
    return httpClient.post(`${baseSlug}/${id}`, data);
  }

  getChargeById(id) {
    return httpClient.get(`${baseSlug}/${id}`);
  }

  getLabelMappingById(data) {
    return httpClient.post(`${baseSlug}`, data);
  }
}

export default new httpService();
