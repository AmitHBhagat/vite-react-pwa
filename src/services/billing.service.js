import httpClient from "../httpClient";
const baseSlug = "/admin/billings";
const baseSlug2 = "/admin/billing";

class httpService {
  getBillsByFlat(societyId, flatId) {
    return httpClient.get(`${baseSlug}/${societyId}/${flatId}`);
  }
  generateBill(payload) {
    return httpClient.post(`${baseSlug2}`, payload);
  }
  getBillsBySocietyId(SocietyId) {
    return httpClient.get(`${baseSlug}/${SocietyId}`);
  }
  notifyMembers(societyId) {
    return httpClient.get(`admin/billings/notifyMembers/${societyId}`);
  }

  getActiveBilling(SocietyId, billingId) {
    return httpClient.get(`${baseSlug}/active/${SocietyId}/${billingId}`);
  }
}

export default new httpService();
