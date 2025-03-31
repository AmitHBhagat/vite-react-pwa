import httpClient from "../httpClient";
const baseSlug = "/admin/report";

class httpService {
  getRentedReport(societyId) {
    return httpClient.get(`${baseSlug}/rented/${societyId}`);
  }

  getLedgerReportBySocietyId(societyId, payload) {
    return httpClient.post(`${baseSlug}/ledger/${societyId}`, payload);
  }

  getExpenseLedgerReportBySocietyId(societyId, payload) {
    return httpClient.post(`${baseSlug}/expense/${societyId}`, payload);
  }

  getOutstanding(societyId) {
    return httpClient.get(`${baseSlug}/groupbyFlat/${societyId}`);
  }
  getIncomeExpenditures(societyId, data) {
    return httpClient.post(`${baseSlug}/incomeexpense/${societyId}`, data);
  }

  // (id) {
  // 	return httpClient.get(`${baseSlug}//${id}`);
  // }

  // (id, data) {
  // 	return httpClient.put(`${baseSlug}//${id}`, data);
  // }
}

export default new httpService();
