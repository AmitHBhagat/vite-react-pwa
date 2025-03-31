import httpClient from "../httpClient";
const baseSlug = "/admin/maintenanceMaster";

class httpService {
  getMaintenanceById(id) {
    return httpClient.get(`${baseSlug}/${id}`);
  }
  updateMaintenanceById(id, data) {
    return httpClient.put(`${baseSlug}/${id}`, data);
  }

  getFlatDepsBySocietyId(id) {
    return httpClient.get(`${baseSlug}/flatDeps/${id}`);
  }

  // uploadFlatExcelFile(id) {
  //   return httpClient.get(`${baseSlug}/${id}`);
  // }
}

export default new httpService();
