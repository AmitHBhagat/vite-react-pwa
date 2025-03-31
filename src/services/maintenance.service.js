import httpClient from "../httpClient";
const baseSlug = "/admin/maintenance";

class httpService {
  getMaintenanceDetails(societyId) {
    return httpClient.get(`${baseSlug}/${societyId}`);
  }
  getSingleMaintenance(societyId, flatId) {
    return httpClient.get(`${baseSlug}/${societyId}/${flatId}`);
  }
}

export default new httpService();
