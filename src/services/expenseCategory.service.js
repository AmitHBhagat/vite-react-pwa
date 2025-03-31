import httpClient from "../httpClient";
const baseSlug = "/admin/expenseCategory";

class httpService {
  getExpenseCategories(societyId) {
    return httpClient.get(`admin/expenseCategorys/${societyId}`);
  }

  getExpenseCategoryDetails(categoryId) {
    return httpClient.get(`${baseSlug}/${categoryId}`);
  }

  createExpenseCategory(categoryData) {
    return httpClient.post(`${baseSlug}`, categoryData);
  }

  updateExpenseCategory(categoryId, category) {
    return httpClient.put(`${baseSlug}/${categoryId}`, category);
  }
  deleteExpenseCategory(categoryId) {
    return httpClient.delete(`${baseSlug}/${categoryId}`);
  }
}

export default new httpService();
