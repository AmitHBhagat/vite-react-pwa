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
}

export default new httpService();
