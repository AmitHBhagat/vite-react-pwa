import httpClient from "../httpClient";
const baseSlug = "/admin/vendorType";

class httpService {
  getTypes(societyId) {
    return httpClient.get(`${baseSlug}s/${societyId}`);
  }

  getTypeDetails(id) {
    return httpClient.get(`${baseSlug}s/${id}`);
  }

  createType(data) {
    return httpClient.post(`${baseSlug}`, data);
  }

  updateType(queryId, queryData) {
    return httpClient.put(`${baseSlug}/${queryId}`, queryData);
  }

  deleteType(queryId) {
    return httpClient.delete(`${baseSlug}/${queryId}`);
  }
}

export default new httpService();
