import httpClient from "../httpClient";

const baseSlug = "/admin/visitor";

class VisitorService {
  getSocietyVisitors(societyId) {
    return httpClient.get(`${baseSlug}/society/${societyId}`);
  }

  getSocietyVisitorflatwise(societyId, data) {
    return httpClient.post(`${baseSlug}/society/${societyId}`, data);
  }

  createSocietyVisitors(societyId, data) {
    return httpClient.post(`${baseSlug}/society/${societyId}`, data);
  }

  getFlatVisitors(flatId, dateRange) {
    return httpClient.post(`${baseSlug}/flat/${flatId}`, dateRange);
  }

  createFlatVisitors(flatId, data) {
    return httpClient.post(`${baseSlug}/flat/${flatId}`, data);
  }

  addVisitorImage(image, config) {
    return httpClient.post(`${baseSlug}/images/`, image, config);
  }

  getSingleVisitor(id) {
    return httpClient.get(`${baseSlug}/${id}`);
  }

  updateVisitor(id, data) {
    return httpClient.put(`${baseSlug}/${id}`, data);
  }

  deleteVisitor(id) {
    return httpClient.delete(`${baseSlug}/${id}`);
  }

  getAllVisitors() {
    return httpClient.get(`${baseSlug}`);
  }

  createVisitor(data) {
    return httpClient.post(`${baseSlug}`, data);
  }
}

export default new VisitorService();
