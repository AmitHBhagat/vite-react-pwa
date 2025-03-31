import httpClient from "../httpClient";
const baseSlug = "/me";

class httpService {
  getProfile() {
    return httpClient.get(`${baseSlug}`);
  }

  updateProfile(data, config = {}) {
    return httpClient.put(`${baseSlug}/update`, data, config);
  }

  updatePassword(data) {
    return httpClient.put(`/password/update`, data);
  }
}

export default new httpService();
