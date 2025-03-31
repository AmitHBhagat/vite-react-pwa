import httpClient from "../httpClient";
const baseSlug = "/admin";

class httpService {
  login(data) {
    return httpClient.post(`${baseSlug}/login`, data);
  }

  getProfile(id) {
    return httpClient.get(`${baseSlug}/profile/${id}`);
  }

  getUsers() {
    return httpClient.get(`${baseSlug}/adminUser`);
  }

  deleteUser(id) {
    return httpClient.delete(`${baseSlug}/adminUser/${id}`);
  }

  getUserById(id) {
    return httpClient.get(`${baseSlug}/adminUser/${id}`);
  }

  updateUser(id, data) {
    return httpClient.put(`${baseSlug}/adminUser/${id}`, data);
  }

  createUser(data) {
    return httpClient.post(`${baseSlug}/adminUser`, data);
  }

  updatePassword(data) {
    return httpClient.put(`${baseSlug}/password/update`, data);
  }

  getMemberUser(societyId) {
    return httpClient.get(`${baseSlug}/users/${societyId}`);
  }
  getUserDetails(userId) {
    return httpClient.get(`${baseSlug}/user/${userId}`);
  }
  updateMemberUser(userId, data) {
    return httpClient.put(`${baseSlug}/user/${userId}`, data);
  }
  createMemberUser(data) {
    return httpClient.post(`${baseSlug}/user/add`, data);
  }
  deleteMemberUser(userId) {
    return httpClient.delete(`${baseSlug}/user/${userId}`);
  }
  uploadUser(userData, config) {
    return httpClient.post(`${baseSlug}/user/upload`, userData, config);
  }

  getUserByMobileNumber(number) {
    return httpClient.get(`${baseSlug}/users/mobile/${number}`);
  }
}

export default new httpService();
