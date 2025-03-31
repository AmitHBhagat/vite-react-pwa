import httpClient from "../httpClient";
const baseSlug = "/admin/expense";

class httpService {
  getExpenses(societyId) {
    return httpClient.get(`admin/expenses/${societyId}`);
  }

  getExpenseDetails(expId) {
    return httpClient.get(`${baseSlug}/${expId}`);
  }

  createExpense(Data) {
    return httpClient.post(`${baseSlug}`, Data);
  }

  updateExpense(expId, expense) {
    return httpClient.put(`${baseSlug}/${expId}`, expense);
  }
  deleteExpense(expId) {
    return httpClient.delete(`${baseSlug}/${expId}`);
  }
}

export default new httpService();
