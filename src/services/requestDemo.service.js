import httpClient from "../httpClient";
const baseSlug = "/admin";

class httpService {
  getRequestDemos() {
    return httpClient.get(`${baseSlug}/requestDemos`);
  }

  getRequestDemoById(id) {
    return httpClient.get(`${baseSlug}/requestDemo/${id}`);
  }

  updateRequestDemo(id, data) {
    return httpClient.put(`${baseSlug}/requestDemo/${id}`, data);
  }

  sendRequestDemo(payload) {
    return httpClient.post(`${baseSlug}/requestDemo/`, payload);
  }
}

export default new httpService();
