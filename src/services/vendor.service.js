import httpClient from "../httpClient";
const baseSlug = "/admin/vendor";

class HttpService {
  createVendor(vendorData) {
    return httpClient.post(baseSlug, vendorData);
  }

  getAllVendors(societyId) {
    return httpClient.get(`/admin/vendors/${societyId}`);
  }

  getVendorsByGroup(societyId) {
    return httpClient.get(`/admin/vendors/groupby/${societyId}`);
  }

  getVendorById(vendorId) {
    return httpClient.get(`${baseSlug}/${vendorId}`);
  }

  updateVendor(vendorId, updatedData) {
    return httpClient.put(`${baseSlug}/${vendorId}`, updatedData);
  }

  deleteVendor(vendorId) {
    return httpClient.delete(`${baseSlug}/${vendorId}`);
  }
}

export default new HttpService();
