import httpClient from "../httpClient";
const baseSlug = "/admin/society";

class httpService {
  getSociety() {
    return httpClient.get(`${baseSlug}/valid`);
  }
  getSocietyList() {
    return httpClient.get(`${baseSlug}`);
  }

  getSocietyById(id) {
    return httpClient.get(`${baseSlug}/${id}`);
  }

  createSociety(data) {
    return httpClient.post(`${baseSlug}`, data);
  }

  updateSociety(id, data) {
    return httpClient.put(`${baseSlug}/${id}`, data);
  }

  deleteSociety(id) {
    return httpClient.delete(`${baseSlug}/${id}`);
  }

  createSocietyImage(societyId, societyImageData, config) {
    return httpClient.post(
      `${baseSlug}/images/${societyId}`,
      societyImageData,
      config
    );
  }
  deleteSocietyImage(societyId, imageId) {
    return httpClient.delete(
      `${baseSlug}/images/delete/${societyId}/${imageId}`
    );
  }

  deleteSocietyContact(societyId, contactId) {
    return httpClient.delete(
      `${baseSlug}/contacts/delete/${societyId}/${contactId}`
    );
  }

  createSocietyContact(societyId, societyContactData) {
    return httpClient.post(
      `${baseSlug}/contacts/${societyId}`,
      societyContactData
    );
  }

  updateSocietyContact(societyId, contactId, societyContactData) {
    return httpClient.put(
      `${baseSlug}/contacts/${societyId}/${contactId}`,
      societyContactData
    );
  }

  changeStatus(id, data) {
    return httpClient.put(`${baseSlug}/status/${id}`, data);
  }
}

export default new httpService();
