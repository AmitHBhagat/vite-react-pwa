import httpClient from "../httpClient";
const baseSlug = "/admin/queriess";
const baseSlug2 = "/admin/queries";

class httpService {
  getQueries(societyId) {
    return httpClient.get(`${baseSlug}/${societyId}`);
  }

  getQueryDetails(id) {
    return httpClient.get(`${baseSlug2}/${id}`);
  }

  createQuery(data) {
    return httpClient.post(`${baseSlug2}`, data);
  }

  updateRequestQuery(queryId, queryData) {
    return httpClient.put(`${baseSlug2}/${queryId}`, queryData);
  }

  deleteRequestQuery(queryId) {
    return httpClient.delete(`${baseSlug2}/${queryId}`);
  }
}

export default new httpService();
