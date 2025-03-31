import httpClient from "../httpClient";
const baseSlug = "/admin/billAdjustment";
const baseSlug2 = "admin/billAdjustments";

class httpService {
  getAllBillAdjustments(societyId) {
    return httpClient.get(`${baseSlug2}/${societyId}`);
  }

  getBillAdjustmentById(id) {
    return httpClient.get(`${baseSlug}/${id}`);
  }

  getBillsGroupedByFlat(societyId) {
    return httpClient.get(`${baseSlug}s/groupbyFlat/${societyId}`);
  }

  getBillsGroupedByFlatByMonth(societyId, month) {
    return httpClient.get(
      `${baseSlug}s/groupbyFlat/${societyId}/month/${month}`
    );
  }

  getUserFlatBillAdjustments(flatId) {
    return httpClient.get(`${baseSlug}s/flat/${flatId}`);
  }

  createBillAdjustment(data) {
    return httpClient.post(`${baseSlug}`, data);
  }

  deleteBillAdjustment(id) {
    return httpClient.delete(`${baseSlug}/${id}`);
  }
}

export default new httpService();
