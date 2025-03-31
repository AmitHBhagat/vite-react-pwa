import httpClient from "../httpClient";
const baseSlug = "/admin/bankaccount";

class httpService {
  getBankDetails(societyId) {
    return httpClient.get(`admin/bankaccounts/${societyId}`);
  }

  getBankDetailDetails(bankDetailId) {
    return httpClient.get(`${baseSlug}/${bankDetailId}`);
  }

  createBankDetail(bankDetailData) {
    return httpClient.post(`${baseSlug}`, bankDetailData);
  }

  updateBankDetail(bankDetailId, bankDetailData) {
    return httpClient.put(`${baseSlug}/${bankDetailId}`, bankDetailData);
  }
  deleteBankDetail(bankDetailId) {
    return httpClient.delete(`${baseSlug}/${bankDetailId}`);
  }
}

export default new httpService();
