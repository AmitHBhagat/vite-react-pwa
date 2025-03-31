import httpClient from "../httpClient";
const baseSlug = "/user";

class httpService {
  sendOTP(mobileNo) {
    return httpClient.get(`${baseSlug}/${mobileNo}`);
  }

  verifyOTP(data) {
    return httpClient.post(`${baseSlug}/verify`, data);
  }

  login(data) {
    return httpClient.post(`${baseSlug}/login`, data);
  }

  getProfile(id) {
    return httpClient.get(`${baseSlug}/profile/${id}`);
  }

  updateProfile(profileData, config) {
    return httpClient.put(`${baseSlug}/profile`, profileData, config);
  }

  getUsers() {
    return httpClient.get(`${baseSlug}/list`);
  }

  getUserById(id) {
    return httpClient.get(`${baseSlug}/${id}`);
  }

  deleteUser(id, data) {
    return httpClient.put(`${baseSlug}/delete/${id}`, data);
  }

  changePassword(data) {
    return httpClient.put(`${baseSlug}/changePassword`, data);
  }

  forgotPassword(email) {
    return httpClient.put(`${baseSlug}/forgotPassword`, email);
  }

  createPassword(password, token) {
    return httpClient.put(`${baseSlug}/createPassword/${token}`, {
      password,
    });
  }

  changeStatus(id, data) {
    return httpClient.put(`${baseSlug}/status/${id}`, data);
  }

  getUserByToken(id) {
    return httpClient.get(`${baseSlug}/byToken/${id}`);
  }
}

export default new httpService();
