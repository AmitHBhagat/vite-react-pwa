import httpClient from "../httpClient";
const baseSlug = "/payment/process";
const baseSlug2 = "/admin/paymentDetails";
const baseSlug3 = "/admin/paymentDetail";
const baseSlug4 = "/admin/paymentReceipt";
const baseSlug5 = "/admin/paymentReceipts";

class httpService {
  generatePaymentOrder(data) {
    return httpClient.post(`${baseSlug}`, data);
  }

  updatePaymentOrder(orderId, data) {
    return httpClient.put(`${baseSlug}/${orderId}`, data);
  }

  getPaymentsByFlat(societyId, flatId) {
    return httpClient.get(`${baseSlug2}/${societyId}/${flatId}`);
  }

  getPayments(societyId) {
    return httpClient.get(`${baseSlug2}/${societyId}`);
  }

  getPaymentDetails(paymentId) {
    return httpClient.get(`${baseSlug3}/${paymentId}`);
  }

  updatePaymentDetail(paymentId, payload) {
    return httpClient.put(`${baseSlug3}/${paymentId}`, payload);
  }

  addPaymentDetails(payload) {
    return httpClient.post(`${baseSlug3}`, payload);
  }

  deletePaymentDetails(paymentId) {
    return httpClient.delete(`${baseSlug3}/${paymentId}`);
  }
  generatePaymentReceipt(payload) {
    return httpClient.post(`${baseSlug4}`, payload);
  }

  getAllPaymentReceipt(societyId) {
    return httpClient.get(`${baseSlug5}/${societyId}`);
  }
}

export default new httpService();
