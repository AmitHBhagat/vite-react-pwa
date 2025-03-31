import httpClient from "../httpClient";
const baseSlug = "/admin";

class httpService {
  getUserNotifications(userid) {
    return httpClient.get(`${baseSlug}/notification/user/${userid}`);
  }

  update(id, payload) {
    return httpClient.put(`${baseSlug}/notification/${id}`, payload);
  }
}

export default new httpService();
